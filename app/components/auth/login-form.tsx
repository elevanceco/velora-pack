"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UserRole = "OWNER" | "ADMIN" | "SALES" | "CUSTOMER";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);

    if (!email.trim() || !password) {
      setError("Enter your email address and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      const sessionResponse = await fetch("/api/auth/session", {
        cache: "no-store",
      });

      const session = await sessionResponse.json();
      const role = session?.user?.role as UserRole | undefined;

      if (!role) {
        setError("Unable to determine your account access.");
        return;
      }

      if (role === "CUSTOMER") {
        router.push("/");
        router.refresh();
        return;
      }

      if (role === "ADMIN" || role === "OWNER") {
        const dashboardUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        if (!dashboardUrl) {
          setError("Dashboard URL is not configured.");
          return;
        }

        window.location.href = `${dashboardUrl}/admin`;
        return;
      }

      const dashboardUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      if (!dashboardUrl) {
        setError("Dashboard URL is not configured.");
        return;
      }

      window.location.href = `${dashboardUrl}/admin`;
    } catch (error) {
      console.error("Login failed:", error);
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
            required
            className="pr-11"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((current) => !current)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-text/50 transition-colors hover:text-velora-navy"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-velora-navy text-white hover:bg-velora-navy/90"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <p className="text-center text-sm text-text/70">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-velora-blue hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
