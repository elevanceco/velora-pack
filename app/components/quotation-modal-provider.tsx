"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { RequestQuotationModal } from "./request-quotation-modal";

type QuotationModalContextValue = {
  open: boolean;

  selectedProductId: string | null;

  openModal: (productId?: string) => void;

  closeModal: () => void;
};

const QuotationModalContext = createContext<QuotationModalContextValue | null>(
  null,
);

export function QuotationModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  const openModal = useCallback((productId?: string) => {
    setSelectedProductId(productId ?? null);
    setOpen(true);
  }, []);
  const closeModal = useCallback(() => {
    setSelectedProductId(null);
    setOpen(false);
  }, []);

  useEffect(() => {
    const handleHashOpen = () => {
      if (window.location.hash === "#quotation") {
        openModal();
        history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}`,
        );
      }
    };

    handleHashOpen();
    window.addEventListener("hashchange", handleHashOpen);

    return () => window.removeEventListener("hashchange", handleHashOpen);
  }, [openModal]);

  const value = useMemo(
    () => ({
      open,

      selectedProductId,

      openModal,

      closeModal,
    }),
    [open, selectedProductId, openModal, closeModal],
  );

  return (
    <QuotationModalContext.Provider value={value}>
      {children}
      <RequestQuotationModal open={open} onOpenChange={setOpen} />
    </QuotationModalContext.Provider>
  );
}

export function useQuotationModal() {
  const context = useContext(QuotationModalContext);

  if (!context) {
    throw new Error(
      "useQuotationModal must be used within QuotationModalProvider",
    );
  }

  return context;
}
