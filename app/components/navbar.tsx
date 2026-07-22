"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { signOut, useSession } from "next-auth/react";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";

import { QuotationLink } from "./quotation-trigger";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#products", label: "Products" },
  { href: "#capabilities", label: "Capabilities" },
  { href: "#about", label: "About Us" },
  { href: "#certifications", label: "Certifications" },
  { href: "#contact", label: "Contact" },
] as const;

type UserRole = "OWNER" | "ADMIN" | "SALES" | "CUSTOMER";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const { data: session, status } = useSession();

  const role = session?.user?.role as UserRole | undefined;
  const isLoggedIn = status === "authenticated";
  const isInternalUser =
    role === "OWNER" || role === "ADMIN" || role === "SALES";

  const firstName = session?.user?.name?.split(" ")[0] ?? "Account";
  const initial = firstName.charAt(0).toUpperCase();
  const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    setAccountOpen(false);
    closeMenu();

    await signOut({
      callbackUrl: "/",
    });
  };

  return (
    <>
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="fixed inset-x-0 top-0 z-50 border-b border-border/80 bg-white/95 backdrop-blur-md"
      >
        <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="relative h-10 w-28 shrink-0 sm:h-11 sm:w-32 md:w-36"
            onClick={closeMenu}
          >
            <Image
              src="/images/logo-simplified2.png"
              alt="Velora Pack"
              fill
              className="object-contain object-left"
              sizes="(max-width: 640px) 112px, 144px"
              priority
            />
          </Link>

          <ul className="hidden flex-1 items-center justify-center gap-7 lg:flex xl:gap-9">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="whitespace-nowrap text-sm font-medium text-text/65 transition-colors hover:text-velora-navy"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2.5">
            {status !== "loading" && !isLoggedIn && (
              <>
                <Link
                  href="/login"
                  className="hidden px-2 py-2 text-sm font-semibold text-velora-navy transition-colors hover:text-velora-blue md:inline-flex"
                >
                  Sign in
                </Link>

                <Link
                  href="/register"
                  className="hidden rounded-lg border border-velora-navy/20 px-3.5 py-2 text-sm font-semibold text-velora-navy transition-colors hover:border-velora-navy hover:bg-velora-navy hover:text-white md:inline-flex"
                >
                  Create account
                </Link>
              </>
            )}

            {status !== "loading" && isLoggedIn && (
              <div ref={accountRef} className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setAccountOpen((current) => !current)}
                  className="flex h-10 items-center gap-2 rounded-xl border border-transparent px-2 transition-colors hover:border-border hover:bg-background"
                  aria-label="Open account menu"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-velora-navy text-[11px] font-bold text-white">
                    {initial}
                  </span>

                  <span className="max-w-[88px] truncate text-sm font-semibold text-velora-navy">
                    {firstName}
                  </span>

                  <ChevronDown
                    size={15}
                    className={`shrink-0 text-text/45 transition-transform duration-200 ${
                      accountOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 top-[calc(100%+8px)] w-60 overflow-hidden rounded-2xl border border-border bg-white p-1.5 shadow-xl shadow-velora-navy/10"
                    >
                      <div className="border-b border-border px-3 py-3">
                        <p className="truncate text-sm font-bold text-velora-navy">
                          {session?.user?.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-text/55">
                          {session?.user?.email}
                        </p>
                      </div>

                      <div className="py-1">
                        {isInternalUser && dashboardUrl ? (
                          <a
                            href={`${dashboardUrl}/admin`}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-text/75 transition-colors hover:bg-background hover:text-velora-navy"
                            onClick={() => setAccountOpen(false)}
                          >
                            <LayoutDashboard size={16} />
                            Open internal dashboard
                          </a>
                        ) : (
                          <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-text/50">
                            <UserRound size={16} />
                            Customer account
                          </div>
                        )}
                      </div>

                      <div className="border-t border-border pt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                        >
                          <LogOut size={16} />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* <QuotationLink className="hidden rounded-lg bg-velora-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:bg-[#123b73] hover:shadow-md md:inline-flex">
              Request Quotation
            </QuotationLink> */}
            <QuotationLink className="hidden h-10 items-center rounded-xl bg-velora-navy px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#123b73] hover:shadow-md md:inline-flex">
              Request Quotation
            </QuotationLink>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-text/70 transition-colors hover:bg-background lg:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </motion.header>

      <div
        id="mobile-nav"
        className={`fixed inset-0 top-[72px] z-[999] lg:hidden ${
          menuOpen ? "visible" : "invisible"
        }`}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-velora-navy/30 transition-opacity duration-200 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Close menu"
          onClick={closeMenu}
        />

        <motion.div
          initial={false}
          animate={{ x: menuOpen ? 0 : "100%" }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-border bg-white shadow-2xl"
        >
          <div className="border-b border-border px-6 py-5">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-velora-navy text-sm font-bold text-white">
                  {initial}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-velora-navy">
                    {session?.user?.name}
                  </p>
                  <p className="truncate text-xs text-text/55">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm font-semibold text-velora-navy">
                Velora Pack
              </p>
            )}
          </div>

          <div className="flex flex-1 flex-col p-6">
            <ul className="flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="block rounded-lg px-3 py-3 text-base font-medium text-text/75 transition-colors hover:bg-background hover:text-velora-navy"
                    onClick={closeMenu}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-auto space-y-3 border-t border-border pt-6">
              <QuotationLink
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-velora-navy text-sm font-semibold text-white transition-colors hover:bg-[#123b73]"
                onClick={closeMenu}
              >
                Request Quotation
              </QuotationLink>

              {!isLoggedIn ? (
                <>
                  <Link
                    href="/login"
                    className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-border text-sm font-semibold text-velora-navy transition-colors hover:bg-background"
                    onClick={closeMenu}
                  >
                    Sign in
                  </Link>

                  <Link
                    href="/register"
                    className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-velora-navy/25 text-sm font-semibold text-velora-navy transition-colors hover:bg-velora-navy hover:text-white"
                    onClick={closeMenu}
                  >
                    Create account
                  </Link>
                </>
              ) : (
                <>
                  {isInternalUser && dashboardUrl && (
                    <a
                      href={`${dashboardUrl}/admin`}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border text-sm font-semibold text-velora-navy transition-colors hover:bg-background"
                      onClick={closeMenu}
                    >
                      <LayoutDashboard size={17} />
                      Open dashboard
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-200 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={17} />
                    Sign out
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
