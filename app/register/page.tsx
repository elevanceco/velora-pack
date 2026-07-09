import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Footer } from "@/app/components/footer";
import { Navbar } from "@/app/components/navbar";
import { QuotationModalProvider } from "@/app/components/quotation-modal-provider";
import { RegisterForm } from "@/app/components/auth/register-form";
import { SectionTag } from "@/app/components/section-tag";

export const metadata: Metadata = {
  title: "Create Account | Velora Pack",
  description:
    "Register for a Velora Pack customer account to request quotations and manage your packaging inquiries.",
};

export default function RegisterPage() {
  return (
    <QuotationModalProvider>
      <div className="flex min-h-full flex-col bg-background font-sans text-text">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-8 text-center">
                <Link
                  href="/"
                  className="relative mx-auto mb-6 inline-block h-10 w-32 sm:h-11 sm:w-36"
                >
                  <Image
                    src="/images/logo-simplified2.png"
                    alt="Velora Pack"
                    fill
                    className="object-contain"
                    sizes="144px"
                    priority
                  />
                </Link>
                <SectionTag>Customer Account</SectionTag>
                <h1 className="mt-2 text-2xl font-bold text-velora-navy sm:text-3xl">
                  Create your account
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-text/70 sm:text-base">
                  Register to request quotations and keep your company details
                  ready for future packaging inquiries.
                </p>
              </div>

              <RegisterForm />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </QuotationModalProvider>
  );
}
