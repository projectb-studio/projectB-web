import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { getReviews } from "@/lib/data/reviews";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Photo Reviews",
  description: "고객님들의 생생한 포토 리뷰를 확인하세요.",
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={12}
          strokeWidth={1.5}
          className={i < rating ? "fill-pb-jet-black text-pb-jet-black" : "text-pb-light-gray"}
        />
      ))}
    </div>
  );
}

export default async function ReviewsPage() {
  const reviews = await getReviews();

  return (
    <section className="max-w-content mx-auto px-6 lg:px-12 py-12 lg:py-20">
      <h1 className="heading-display text-sm text-center tracking-wide mb-4">
        Photo Reviews
      </h1>
      <p className="text-xs text-pb-silver text-center uppercase tracking-industrial mb-12">
        {reviews.length} reviews
      </p>

      {/* Review grid — masonry-like with CSS columns */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="break-inside-avoid border border-pb-light-gray/40 overflow-hidden"
          >
            {/* Photo */}
            <Link
              href={`/product/${review.productSlug}`}
              className="relative block aspect-square bg-pb-off-white overflow-hidden"
            >
              <Image
                src={review.imageUrl}
                alt={review.productName}
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </Link>

            {/* Content */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Stars rating={review.rating} />
                <span className="text-[10px] text-pb-silver">{formatDate(review.date)}</span>
              </div>
              <Link
                href={`/product/${review.productSlug}`}
                className="block text-[10px] text-pb-silver uppercase tracking-[0.15em] hover:text-pb-gray transition-colors"
              >
                {review.productName}
              </Link>
              <p className="text-sm text-pb-charcoal leading-relaxed">
                {review.content}
              </p>
              <p className="text-[10px] text-pb-silver">{review.author}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
