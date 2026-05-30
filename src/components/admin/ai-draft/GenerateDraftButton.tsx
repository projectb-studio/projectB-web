"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function GenerateDraftButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${productId}/drafts`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "초안 생성 실패");
      }
      router.push(`/admin/drafts/${data.draft.id}/review`);
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-50"
      >
        <Sparkles className="w-3.5 h-3.5" />
        {loading ? "AI 초안 생성 중..." : "AI 초안 생성"}
      </button>
      {error && <span className="text-xs text-[var(--accent-sale)]">{error}</span>}
    </div>
  );
}
