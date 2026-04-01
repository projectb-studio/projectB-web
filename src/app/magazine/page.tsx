import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getMagazinePosts } from "@/lib/data/magazine";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Magazine",
  description: "PROJECT B의 이야기와 소식을 전합니다.",
};

export default async function MagazinePage() {
  const posts = await getMagazinePosts();
  const [featured, ...rest] = posts;

  return (
    <section className="max-w-content mx-auto px-6 lg:px-12 py-12 lg:py-20">
      <h1 className="heading-display text-sm text-center tracking-wide mb-12">
        Magazine
      </h1>

      {/* Featured post */}
      {featured && (
        <Link href={`/magazine/${featured.slug}`} className="group block mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            <div className="relative aspect-[3/2] bg-pb-off-white overflow-hidden">
              <Image
                src={featured.imageUrl}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[10px] text-pb-silver uppercase tracking-[0.2em] mb-3">
                {featured.category}
              </p>
              <h2 className="text-lg lg:text-xl font-medium leading-snug mb-3">
                {featured.title}
              </h2>
              <p className="text-sm text-pb-charcoal leading-relaxed mb-4">
                {featured.excerpt}
              </p>
              <p className="text-[10px] text-pb-silver">
                {formatDate(featured.date)}
              </p>
            </div>
          </div>
        </Link>
      )}

      {/* Divider */}
      <div className="h-px bg-pb-light-gray/40 mb-12" />

      {/* Post grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
        {rest.map((post) => (
          <Link
            key={post.id}
            href={`/magazine/${post.slug}`}
            className="group block"
          >
            <div className="relative aspect-[3/2] bg-pb-off-white overflow-hidden mb-4">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <p className="text-[10px] text-pb-silver uppercase tracking-[0.2em] mb-2">
              {post.category}
            </p>
            <h3 className="text-sm font-medium leading-snug mb-2 group-hover:text-pb-gray transition-colors">
              {post.title}
            </h3>
            <p className="text-xs text-pb-gray leading-relaxed line-clamp-2 mb-2">
              {post.excerpt}
            </p>
            <p className="text-[10px] text-pb-silver">
              {formatDate(post.date)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
