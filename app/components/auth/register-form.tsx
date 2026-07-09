"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type RegisterFormData = {
  fullName: string;
  companyName: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  referralCode: string;
};

type RegisterFormField = keyof RegisterFormData;

type RegisterFormErrors = Partial<Record<RegisterFormField, string>>;

const INITIAL_FORM: RegisterFormData = {
  fullName: "",
  companyName: "",
  phoneNumber: "",
  email: "",
  password: "",
  confirmPassword: "",
  referralCode: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="text-xs font-medium text-error" role="alert">
      {message}
    </p>
  );
}

function validateForm(data: RegisterFormData): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  if (!data.fullName.trim()) {
    errors.fullName = "Full name is required.";
  }

  if (!data.companyName.trim()) {
    errors.companyName = "Company name is required.";
  }

  if (!data.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required.";
  }

  if (!data.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_PATTERN.test(data.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!data.password) {
    errors.password = "Password is required.";
  } else if (data.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export function RegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<RegisterFormField, boolean>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const setField = useCallback(
    <K extends RegisterFormField>(field: K, value: RegisterFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const setFieldTouched = useCallback((field: RegisterFormField) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const showError = (field: RegisterFormField) =>
    touched[field] || errors[field] ? errors[field] : undefined;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setTouched({
      fullName: true,
      companyName: true,
      phoneNumber: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    const nextErrors = validateForm(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!BACKEND_URL) {
      setErrors({
        email: "Registration service is not configured yet.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.fullName.trim(),
          companyName: formData.companyName.trim(),
          phone: formData.phoneNumber.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          referralCode: formData.referralCode.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const backendErrors = result.errors ?? {};

        setErrors({
          fullName: backendErrors.name?.[0],
          companyName: backendErrors.companyName?.[0],
          phoneNumber: backendErrors.phone?.[0],
          email: backendErrors.email?.[0],
          password: backendErrors.password?.[0],
          confirmPassword: backendErrors.confirmPassword?.[0],
          referralCode: backendErrors.referralCode?.[0],
        });

        return;
      }

      setIsSuccess(true);
    } catch (error) {
      console.error("Registration request failed:", error);

      setErrors({
        email:
          "Unable to connect to the registration service. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterAnother = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setTouched({});
    setIsSuccess(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15">
          <CheckCircle2 className="h-7 w-7 text-success" aria-hidden />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-velora-navy">
            Account created successfully
          </h2>
          <p className="text-sm leading-relaxed text-text/70">
            Your Velora Pack account is ready. You can now sign in and submit a
            quotation request.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/login" className="w-full">
            <Button type="button" className="w-full">
              Sign in to your account
            </Button>
          </Link>
          <p className="text-sm text-text/70">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-velora-blue transition-colors hover:text-velora-navy"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
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

      <div className="space-y-2">
        <Label htmlFor="companyName">
          Company Name <span className="text-error">*</span>
        </Label>
        <Input
          id="companyName"
          name="companyName"
          autoComplete="organization"
          placeholder="Company / brand name"
          value={formData.companyName}
          onChange={(event) => setField("companyName", event.target.value)}
          onBlur={() => setFieldTouched("companyName")}
          aria-invalid={Boolean(showError("companyName"))}
          aria-describedby={
            showError("companyName") ? "companyName-error" : undefined
          }
          className={cn(showError("companyName") && "border-error")}
        />
        <div id="companyName-error">
          <FieldError message={showError("companyName")} />
        </div>
      </div>

      <div className="space-y-2">
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
          onChange={(event) => setField("phoneNumber", event.target.value)}
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

      <div className="space-y-2">
        <Label htmlFor="email">
          Email Address <span className="text-error">*</span>
        </Label>
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
          aria-describedby={showError("email") ? "email-error" : undefined}
          className={cn(showError("email") && "border-error")}
        />
        <div id="email-error">
          <FieldError message={showError("email")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Password <span className="text-error">*</span>
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={(event) => setField("password", event.target.value)}
            onBlur={() => setFieldTouched("password")}
            aria-invalid={Boolean(showError("password"))}
            aria-describedby={
              showError("password") ? "password-error" : undefined
            }
            className={cn("pr-10", showError("password") && "border-error")}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text/50 transition-colors hover:text-text/80"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
        <div id="password-error">
          <FieldError message={showError("password")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          Confirm Password <span className="text-error">*</span>
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={(event) =>
              setField("confirmPassword", event.target.value)
            }
            onBlur={() => setFieldTouched("confirmPassword")}
            aria-invalid={Boolean(showError("confirmPassword"))}
            aria-describedby={
              showError("confirmPassword") ? "confirmPassword-error" : undefined
            }
            className={cn(
              "pr-10",
              showError("confirmPassword") && "border-error",
            )}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text/50 transition-colors hover:text-text/80"
            onClick={() => setShowConfirmPassword((visible) => !visible)}
            aria-label={
              showConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
        <div id="confirmPassword-error">
          <FieldError message={showError("confirmPassword")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="referralCode">Referral Code</Label>
        <Input
          id="referralCode"
          name="referralCode"
          autoComplete="off"
          placeholder="Optional sales referral code"
          value={formData.referralCode}
          onChange={(event) => setField("referralCode", event.target.value)}
        />
        <p className="text-xs text-text/60">
          Optional. Enter a sales referral code if you have one.
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>

      <p className="text-center text-sm text-text/70">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-velora-blue transition-colors hover:text-velora-navy"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
