import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMagazinePost } from "@/lib/data/magazine";
import { formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getMagazinePost(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function MagazineDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getMagazinePost(slug);

  if (!post) notFound();

  return (
    <article className="max-w-content mx-auto px-6 lg:px-12 py-12 lg:py-20">
      {/* Back link */}
      <Link href="/magazine" className="text-xs text-pb-gray hover:text-pb-jet-black flex items-center gap-1 mb-8">
        <ArrowLeft size={12} /> Magazine
      </Link>

      {/* Hero image */}
      {post.imageUrl && (
        <div className="relative aspect-[2/1] bg-pb-off-white overflow-hidden mb-8">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      )}

      {/* Header */}
      <div className="max-w-[640px] mx-auto mb-10">
        <div className="flex items-center gap-3 mb-4">
          {post.category && (
            <span className="text-[10px] text-pb-silver uppercase tracking-[0.2em]">
              {post.category}
            </span>
          )}
          <span className="text-[10px] text-pb-silver">
            {formatDate(post.date)}
          </span>
        </div>
        <h1 className="text-xl lg:text-2xl font-heading font-semibold uppercase tracking-[0.1em] leading-snug">
          {post.title}
        </h1>
      </div>

      {/* Content */}
      <div className="max-w-[640px] mx-auto">
        {post.content ? (
          <div
            className="prose prose-sm max-w-none prose-headings:font-heading prose-headings:uppercase prose-headings:tracking-[0.1em] prose-a:text-pb-jet-black prose-img:rounded-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <p className="text-sm text-pb-gray">본문이 없습니다.</p>
        )}
      </div>

      {/* Back to list */}
      <div className="max-w-[640px] mx-auto mt-16 pt-8 border-t border-pb-light-gray">
        <Link href="/magazine" className="text-xs text-pb-gray hover:text-pb-jet-black flex items-center gap-1">
          <ArrowLeft size={12} /> 목록으로 돌아가기
        </Link>
      </div>
    </article>
  );
}
