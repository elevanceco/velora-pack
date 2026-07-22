"use client";

import { Loader2, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuotationForm } from "@/hooks/use-quotation-form";
import {
  buildLeadNotes,
  buildQuotationWhatsAppMessage,
  openWhatsAppWithMessage,
} from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuotationModal } from "./quotation-modal-provider"; // untuk get selectedProductId dari context

const TRUST_INDICATORS = [
  "Response within 24 hours",
  "Free packaging consultation",
  "Custom sizes available",
  "MOQ starts from 5,000 pcs",
] as const;

type RequestQuotationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="text-xs font-medium text-error" role="alert">
      {message}
    </p>
  );
}

export function RequestQuotationModal({
  open,
  onOpenChange,
}: RequestQuotationModalProps) {
  const {
    formData,
    errors,
    touched,
    isSubmitting,
    setField,
    setFieldTouched,
    resetForm,
    submit,
  } = useQuotationForm();

  const { data: session, status } = useSession();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [products, setProducts] = useState<Product[]>([]);

  const { selectedProductId } = useQuotationModal();

  // use effect to prefill the productId field if selectedProductId is available
  useEffect(() => {
    if (!open) return;

    if (!selectedProductId) return;

    setField("productId", selectedProductId);
  }, [open, selectedProductId, setField]);

  // use effect to fetch product options from backend
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");

        if (!res.ok) return;

        const result = await res.json();

        setProducts(result.products);
      } catch (err) {
        console.error(err);
      }
    }

    loadProducts();
  }, []);
  // use effect to prefill the form with user data if logged in
  useEffect(() => {
    if (!open) return;
    if (status !== "authenticated") return;
    if (!session?.user?.accessToken) return;
    if (!backendUrl) return;

    let cancelled = false;

    async function loadCustomerProfile() {
      try {
        const response = await fetch(
          `${backendUrl}/api/public/customer-profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session?.user.accessToken}`,
            },
            cache: "no-store",
          },
        );

        if (!response.ok || cancelled) {
          return;
        }

        const result = await response.json();

        if (!result.success || !result.data || cancelled) {
          return;
        }

        const customer = result.data;
        const profile = customer.profile;

        setField("fullName", customer.name ?? "");
        setField("email", customer.email ?? "");

        if (profile?.companyName) {
          setField("companyName", profile.companyName);
        }

        if (profile?.phone) {
          setField("phoneNumber", profile.phone);
        }
      } catch (error) {
        console.error("Failed to autofill customer profile:", error);
      }
    }

    void loadCustomerProfile();

    return () => {
      cancelled = true;
    };
  }, [open, status, session?.user?.accessToken, backendUrl, setField]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const success = await submit(async (data) => {
      try {
        await fetch("/api/leads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.fullName,
            phone: data.phoneNumber,
            email: data.email || null,
            company: data.companyName || "-",

            productId: data.productId || null,
            estimatedQty: data.estimatedQty || null,
            customPrinting: data.customPrinting,
            notes: data.notes || null,

            customerId: session?.user?.id ?? null,
          }),
        });
      } catch (error) {
        console.error("Failed to save lead:", error);
      }

      const message = buildQuotationWhatsAppMessage(data);

      openWhatsAppWithMessage(message);

      resetForm();
      onOpenChange(false);
    });

    if (!success) return;
  };

  const showError = (field: keyof typeof formData) =>
    touched[field] ? errors[field] : undefined;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        aria-describedby="quotation-modal-description"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader className="flex flex-col gap-1.5 pr-12">
          <DialogTitle>Request Quotation</DialogTitle>
          <DialogDescription id="quotation-modal-description">
            Share your packaging requirements and our sales team will respond
            with pricing, MOQ, and lead time.
          </DialogDescription>
          <DialogCloseButton />
        </DialogHeader>

        <DialogBody>
          <form
            className="space-y-4 sm:space-y-5"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="grid min-w-0 gap-4 md:grid-cols-2">
              <div className="min-w-0 space-y-2 md:col-span-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-error">*</span>
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={(event) => setField("fullName", event.target.value)}
                  onBlur={() => setFieldTouched("fullName")}
                  aria-invalid={Boolean(showError("fullName"))}
                  aria-describedby={
                    showError("fullName") ? "fullName-error" : undefined
                  }
                  className={cn(showError("fullName") && "border-error")}
                />
                <div id="fullName-error">
                  <FieldError message={showError("fullName")} />
                </div>
              </div>

              <div className="min-w-0 space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  autoComplete="organization"
                  placeholder="Company / brand name"
                  value={formData.companyName}
                  onChange={(event) =>
                    setField("companyName", event.target.value)
                  }
                />
              </div>

              <div className="min-w-0 space-y-2">
                <Label htmlFor="phoneNumber">
                  Phone Number <span className="text-error">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  placeholder="08xx xxxx xxxx"
                  value={formData.phoneNumber}
                  onChange={(event) =>
                    setField("phoneNumber", event.target.value)
                  }
                  onBlur={() => setFieldTouched("phoneNumber")}
                  aria-invalid={Boolean(showError("phoneNumber"))}
                  aria-describedby={
                    showError("phoneNumber") ? "phoneNumber-error" : undefined
                  }
                  className={cn(showError("phoneNumber") && "border-error")}
                />
                <div id="phoneNumber-error">
                  <FieldError message={showError("phoneNumber")} />
                </div>
              </div>

              <div className="min-w-0 space-y-2 md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(event) => setField("email", event.target.value)}
                  onBlur={() => setFieldTouched("email")}
                  aria-invalid={Boolean(showError("email"))}
                  aria-describedby={
                    showError("email") ? "email-error" : undefined
                  }
                  className={cn(showError("email") && "border-error")}
                />
                <div id="email-error">
                  <FieldError message={showError("email")} />
                </div>
              </div>

              <div className="min-w-0 space-y-2 md:col-span-2">
                <Label htmlFor="productId">
                  Product Type <span className="text-error">*</span>
                </Label>
                <Select
                  value={formData.productId || undefined}
                  onValueChange={(value) => {
                    setField("productId", value);
                    setFieldTouched("productId");
                  }}
                >
                  <SelectTrigger
                    id="productId"
                    aria-invalid={Boolean(showError("productId"))}
                    aria-describedby={
                      showError("productId") ? "productId-error" : undefined
                    }
                    className={cn(showError("productId") && "border-error")}
                  >
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div id="productId-error">
                  <FieldError message={showError("productId")} />
                </div>
              </div>

              <div className="min-w-0 space-y-2 md:col-span-2">
                <Label htmlFor="estimatedQty">
                  Estimated Quantity <span className="text-error">*</span>
                </Label>
                <Input
                  id="estimatedQty"
                  name="estimatedQty"
                  placeholder="e.g. 10,000 pcs / month"
                  value={formData.estimatedQty}
                  onChange={(event) =>
                    setField("estimatedQty", event.target.value)
                  }
                  onBlur={() => setFieldTouched("estimatedQty")}
                  aria-invalid={Boolean(showError("estimatedQty"))}
                  aria-describedby={
                    showError("estimatedQty") ? "estimatedQty-error" : undefined
                  }
                  className={cn(showError("estimatedQty") && "border-error")}
                />
                <div id="estimatedQty-error">
                  <FieldError message={showError("estimatedQty")} />
                </div>
              </div>

              <fieldset className="min-w-0 space-y-3 md:col-span-2">
                <legend className="text-sm font-medium text-text">
                  Custom Printing
                </legend>
                <RadioGroup
                  value={
                    formData.customPrinting === null
                      ? ""
                      : formData.customPrinting
                        ? "yes"
                        : "no"
                  }
                  onValueChange={(value) =>
                    setField("customPrinting", value === "yes")
                  }
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="custom-printing-yes" />
                    <Label
                      htmlFor="custom-printing-yes"
                      className="cursor-pointer font-normal"
                    >
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="custom-printing-no" />
                    <Label
                      htmlFor="custom-printing-no"
                      className="cursor-pointer font-normal"
                    >
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </fieldset>

              <div className="min-w-0 space-y-2 md:col-span-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Size, thickness, printing details, delivery location, etc."
                  value={formData.notes}
                  onChange={(event) => setField("notes", event.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <ul
              className="grid gap-2 rounded-lg border border-border bg-background p-3 sm:grid-cols-2 sm:p-4"
              aria-label="Service guarantees"
            >
              {TRUST_INDICATORS.map((item) => (
                <li
                  key={item}
                  className="flex min-w-0 items-start gap-2 text-xs leading-snug text-text/80 sm:text-sm"
                >
                  <span
                    className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success/15 text-success"
                    aria-hidden
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="sticky bottom-0 -mx-4 border-t border-border bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:-mx-6 sm:px-6">
              <Button
                type="submit"
                size="lg"
                className="w-full bg-[#25D366] text-white hover:bg-[#1ebe57]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Opening WhatsApp...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4" aria-hidden />
                    Send via WhatsApp
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
