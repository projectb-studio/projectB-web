import Image from "next/image";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { WishlistButton } from "@/components/common/WishlistButton";
import type { Product } from "@/types/database";

interface ProductCardProps {
  product: Product;
  variant?: "vertical" | "horizontal";
}

function PriceDisplay({ price, salePrice }: { price: number; salePrice?: number }) {
  if (salePrice) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-accent-sale">
          {formatPrice(salePrice)}
        </span>
        <span className="text-xs text-pb-silver line-through">
          {formatPrice(price)}
        </span>
      </div>
    );
  }
  return (
    <span className="text-sm font-medium text-pb-jet-black">
      {formatPrice(price)}
    </span>
  );
}

export function ProductCard({ product, variant = "vertical" }: ProductCardProps) {
  const { name, price, salePrice, tag, badge, slug, imageUrl } = product;

  const badgeClass =
    badge === "NEW"
      ? "badge-new"
      : badge === "BEST"
      ? "badge-best"
      : badge === "SALE" || (badge && badge.startsWith("-"))
      ? "badge-sale"
      : badge === "HANDMADE"
      ? "badge-handmade"
      : null;

  return (
    <Link href={`/product/${slug}`} className="group block">
      {/* Image container */}
      <div className="relative overflow-hidden aspect-product bg-pb-off-white">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 1024px) 50vw, 25vw"
        />
        {badgeClass && badge && (
          <span className={cn("badge absolute top-3 left-3", badgeClass)}>
            {badge}
          </span>
        )}
        <WishlistButton
          product={product}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>

      {/* Info — vertical layout (default, New In) */}
      {variant === "vertical" && (
        <div className="mt-4 space-y-1.5">
          <p className="text-[10px] text-pb-silver uppercase tracking-[0.2em]">{tag}</p>
          <p className="text-sm text-pb-jet-black line-clamp-2 leading-snug">{name}</p>
          <PriceDisplay price={price} salePrice={salePrice} />
        </div>
      )}

      {/* Info — horizontal layout (Best Sellers) */}
      {variant === "horizontal" && (
        <>
          {/* Mobile: vertical fallback */}
          <div className="mt-4 space-y-1.5 sm:hidden">
            <p className="text-[10px] text-pb-silver uppercase tracking-[0.2em]">{tag}</p>
            <p className="text-sm text-pb-jet-black line-clamp-2 leading-snug">{name}</p>
            <PriceDisplay price={price} salePrice={salePrice} />
          </div>
          {/* Desktop: horizontal */}
          <div className="hidden sm:flex mt-4 items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm text-pb-jet-black line-clamp-2 leading-snug">{name}</p>
              <p className="text-[10px] text-pb-silver uppercase tracking-[0.2em] mt-1">{tag}</p>
            </div>
            <div className="shrink-0 text-right">
              <PriceDisplay price={price} salePrice={salePrice} />
            </div>
          </div>
        </>
      )}
    </Link>
  );
}
