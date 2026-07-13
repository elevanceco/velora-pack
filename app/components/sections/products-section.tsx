import Link from "next/link";
import Image from "next/image";
import { ArrowLink } from "../arrow-link";
import { SectionTag } from "../section-tag";
import { QuotationLink } from "../quotation-trigger";

const TONE_PALETTE = [
  "from-sky-100 to-blue-50",
  "from-indigo-100 to-violet-50",
  "from-cyan-100 to-teal-50",
  "from-blue-100 to-slate-50",
  "from-[#B8D9FF] to-sky-50",
] as const;

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  thickness: string | null;
  sizeRange: string | null;
  moq: number;
  uom: string | null;
  imageUrl: string | null;
};

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(
      `${process.env.DASHBOARD_URL}/api/public/products`,
      {
        next: { revalidate: 300 },
      },
    );
    if (!res.ok) return [];
    const { products } = await res.json();
    return products;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function ProductsSection() {
  const products = await getProducts();

  if (products.length === 0) return null; // dashboard down/kosong -> section gak nongol, gak crash

  return (
    <section id="products" className="py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <SectionTag>Our Products</SectionTag>
            <h2 className="mt-2 text-2xl font-bold text-velora-navy sm:text-3xl lg:text-4xl">
              OPP Packaging Solutions
            </h2>
          </div>
          <ArrowLink href="#products" className="shrink-0">
            View All Products
          </ArrowLink>
        </div>

        <div className="mt-8 -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-none md:mx-0 md:hidden md:px-0">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              tone={TONE_PALETTE[index % TONE_PALETTE.length]}
              className="w-[min(280px,85vw)] shrink-0 snap-start"
            />
          ))}
        </div>

        <div className="mt-10 hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              tone={TONE_PALETTE[index % TONE_PALETTE.length]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({
  product,
  className = "",
}: {
  product: Product;
  tone?: string;
  className?: string;
}) {
  const specs = [product.thickness, product.sizeRange].filter(Boolean);

  return (
    <article
      className={`
        group
        flex
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-white
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
        ${className}
      `}
    >
      {/* Image */}

      <div className="relative aspect-[4/3] overflow-hidden bg-background">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-film-blue/30" />
        )}
      </div>

      {/* Content */}

      <div className="flex flex-1 flex-col p-5">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-velora-blue">
          {product.category}
        </span>

        <h3 className="mt-2 text-lg font-semibold leading-snug text-velora-navy">
          {product.name}
        </h3>

        <p className="mt-3 flex-1 text-sm leading-6 text-text/70">
          {product.description ||
            "Contact us for detailed specifications and quotation."}
        </p>

        {/* Specs */}

        <div className="mt-4 flex flex-wrap gap-2">
          {specs.map((spec) => (
            <span
              key={spec}
              className="rounded-full bg-background px-3 py-1 text-xs font-medium text-text/70"
            >
              {spec}
            </span>
          ))}

          <span className="rounded-full bg-film-blue/30 px-3 py-1 text-xs font-medium text-velora-navy">
            MOQ {product.moq.toLocaleString("id-ID")}
            {product.uom ? ` ${product.uom}` : ""}
          </span>
        </div>

        {/* CTA */}

        <QuotationLink
          href="#quotation"
          className="
            mt-5
            inline-flex
            items-center
            gap-2
            text-sm
            font-medium
            text-velora-blue
            transition-colors
            hover:text-velora-navy
          "
        >
          Request Quote
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </QuotationLink>
      </div>
    </article>
  );
}
