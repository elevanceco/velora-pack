import type { QuotationFormData } from "@/hooks/use-quotation-form";

export const WHATSAPP_NUMBER = "6281284849822";

const PRODUCT_LABELS: Record<string, string> = {
  "opp-plastic-bag": "OPP Plastic Bag",
  "printed-opp": "Printed OPP Packaging",
  "garment-packaging": "Garment Packaging",
  "food-packaging": "Food Packaging",
  other: "Other",
};

export function getProductLabel(value: string): string {
  return PRODUCT_LABELS[value] ?? value;
}

export function buildQuotationWhatsAppMessage(data: QuotationFormData): string {
  const customPrinting =
    data.customPrinting === "yes"
      ? "Yes"
      : data.customPrinting === "no"
        ? "No"
        : "-";

  return `Halo Velora Pack,

Saya ingin meminta penawaran harga.

Nama: ${data.fullName}
Perusahaan: ${data.companyName || "-"}
Nomor Telepon: ${data.phoneNumber}
Email: ${data.email || "-"}

Produk: ${getProductLabel(data.productType)}
Estimasi Quantity: ${data.estimatedQuantity}
Custom Printing: ${customPrinting}

Keterangan:
${data.additionalNotes || "-"}

Mohon informasi harga, MOQ, dan lead time produksi.

Terima kasih.`;
}

export function openWhatsAppWithMessage(message: string): void {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function buildLeadNotes(data: QuotationFormData): string {
  const customPrinting =
    data.customPrinting === "yes"
      ? "Yes"
      : data.customPrinting === "no"
        ? "No"
        : "-";

  return `Product: ${getProductLabel(data.productType)}
Estimated Quantity: ${data.estimatedQuantity}
Custom Printing: ${customPrinting}
Notes: ${data.additionalNotes || "-"}`;
}
