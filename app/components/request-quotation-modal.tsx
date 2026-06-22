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

const PRODUCT_OPTIONS = [
  { value: "opp-plastic-bag", label: "OPP Plastic Bag" },
  { value: "printed-opp", label: "Printed OPP Packaging" },
  { value: "garment-packaging", label: "Garment Packaging" },
  { value: "food-packaging", label: "Food Packaging" },
  { value: "other", label: "Other" },
] as const;

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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.fullName,
            phone: data.phoneNumber,
            email: data.email || null,
            company: data.companyName || "-",
            notes: buildLeadNotes(data),
          }),
        });
      } catch (error) {
        console.error("Failed to save lead:", error); // silent — jangan block WA
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
                <Label htmlFor="productType">
                  Product Type <span className="text-error">*</span>
                </Label>
                <Select
                  value={formData.productType || undefined}
                  onValueChange={(value) => {
                    setField("productType", value);
                    setFieldTouched("productType");
                  }}
                >
                  <SelectTrigger
                    id="productType"
                    aria-invalid={Boolean(showError("productType"))}
                    aria-describedby={
                      showError("productType") ? "productType-error" : undefined
                    }
                    className={cn(showError("productType") && "border-error")}
                  >
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div id="productType-error">
                  <FieldError message={showError("productType")} />
                </div>
              </div>

              <div className="min-w-0 space-y-2 md:col-span-2">
                <Label htmlFor="estimatedQuantity">
                  Estimated Quantity <span className="text-error">*</span>
                </Label>
                <Input
                  id="estimatedQuantity"
                  name="estimatedQuantity"
                  placeholder="e.g. 10,000 pcs / month"
                  value={formData.estimatedQuantity}
                  onChange={(event) =>
                    setField("estimatedQuantity", event.target.value)
                  }
                  onBlur={() => setFieldTouched("estimatedQuantity")}
                  aria-invalid={Boolean(showError("estimatedQuantity"))}
                  aria-describedby={
                    showError("estimatedQuantity")
                      ? "estimatedQuantity-error"
                      : undefined
                  }
                  className={cn(
                    showError("estimatedQuantity") && "border-error",
                  )}
                />
                <div id="estimatedQuantity-error">
                  <FieldError message={showError("estimatedQuantity")} />
                </div>
              </div>

              <fieldset className="min-w-0 space-y-3 md:col-span-2">
                <legend className="text-sm font-medium text-text">
                  Custom Printing
                </legend>
                <RadioGroup
                  value={formData.customPrinting}
                  onValueChange={(value) =>
                    setField("customPrinting", value as "yes" | "no")
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
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  placeholder="Size, thickness, printing details, delivery location, etc."
                  value={formData.additionalNotes}
                  onChange={(event) =>
                    setField("additionalNotes", event.target.value)
                  }
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
