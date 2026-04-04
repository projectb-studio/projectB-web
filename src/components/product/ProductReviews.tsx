"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  productName: string;
  productSlug: string;
  author: string;
  rating: number;
  content: string;
  imageUrl: string | null;
  date: string;
}

interface ProductReviewsProps {
  productSlug: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-sm" aria-label={`${rating}점`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={cn(
            i < rating
              ? "text-[var(--pb-jet-black)]"
              : "text-[var(--pb-silver)]"
          )}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export function ProductReviews({ productSlug }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reviews?product=${encodeURIComponent(productSlug)}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data);
        setLoading(false);
      });
  }, [productSlug]);

  if (loading) {
    return (
      <section id="reviews" className="py-12">
        <p className="text-sm text-[var(--pb-silver)]">Loading...</p>
      </section>
    );
  }

  return (
    <section id="reviews" className="py-12">
      {/* Section heading */}
      <div className="flex items-baseline gap-3 mb-8">
        <h2 className="heading-section">REVIEWS</h2>
        <span className="text-sm text-[var(--pb-silver)]">
          ({reviews.length})
        </span>
      </div>

      {reviews.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-[var(--pb-silver)]">
            아직 리뷰가 없습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="flex gap-5 pb-8 border-b border-[var(--pb-light-gray)]/40 last:border-b-0 last:pb-0"
            >
              {/* Review image */}
              {review.imageUrl && (
                <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden">
                  <Image
                    src={review.imageUrl}
                    alt={`${review.author} 리뷰 이미지`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              )}

              {/* Review content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <StarRating rating={review.rating} />
                  <span className="text-xs text-[var(--pb-gray)]">
                    {review.author}
                  </span>
                  <span className="text-xs text-[var(--pb-silver)]">
                    {review.date}
                  </span>
                </div>
                <p className="text-sm text-[var(--pb-charcoal)] leading-relaxed">
                  {review.content}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
