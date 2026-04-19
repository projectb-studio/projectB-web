"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BlockPalette from "./BlockPalette";
import BlockList from "./BlockList";
import type { Block } from "./types";
import DetailBlocksRenderer from "@/lib/detail-blocks/renderer";

const DRAFT_KEY = (id: string) => `detail-editor-draft:${id}`;

export default function EditorShell({
  productId,
  productName,
  initialBlocks,
}: {
  productId: string;
  productName: string;
  initialBlocks: Block[];
}) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [hasDraft, setHasDraft] = useState(false);
  const dirty = useRef(false);

  // mount: localStorage 초안이 있으면 알림
  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY(productId));
    if (raw && raw !== JSON.stringify(initialBlocks)) {
      setHasDraft(true);
    }
  }, [productId, initialBlocks]);

  const restoreDraft = () => {
    const raw = localStorage.getItem(DRAFT_KEY(productId));
    if (raw) {
      try {
        setBlocks(JSON.parse(raw) as Block[]);
        setHasDraft(false);
      } catch {
        // ignore
      }
    }
  };

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY(productId));
    setHasDraft(false);
  };

  // 변경 감지 + 2초 debounce localStorage 저장
  useEffect(() => {
    const same = JSON.stringify(blocks) === JSON.stringify(initialBlocks);
    dirty.current = !same;
    if (same) return;
    const t = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY(productId), JSON.stringify(blocks));
    }, 2000);
    return () => clearTimeout(t);
  }, [blocks, initialBlocks, productId]);

  // beforeunload 가드
  useEffect(() => {
    function onBefore(e: BeforeUnloadEvent) {
      if (dirty.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", onBefore);
    return () => window.removeEventListener("beforeunload", onBefore);
  }, []);

  const save = useCallback(async () => {
    setStatus("saving");
    const res = await fetch(`/api/admin/products/${productId}/detail-blocks`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
    });
    if (res.ok) {
      setStatus("saved");
      dirty.current = false;
      localStorage.removeItem(DRAFT_KEY(productId));
      setTimeout(() => setStatus("idle"), 1500);
    } else {
      setStatus("error");
      const err = await res.json().catch(() => ({}));
      console.error("save failed", err);
    }
  }, [blocks, productId]);

  return (
    <div className="space-y-4">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-[var(--pb-light-gray)] pb-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/products/${productId}`}
            className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> 상품 수정
          </Link>
          <h1 className="heading-display text-base tracking-wide truncate">
            상세 페이지 — {productName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-[var(--pb-jet-black)]">
            <button
              type="button"
              onClick={() => setTab("edit")}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider ${
                tab === "edit" ? "bg-[var(--pb-jet-black)] text-white" : ""
              }`}
            >
              편집
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider ${
                tab === "preview" ? "bg-[var(--pb-jet-black)] text-white" : ""
              }`}
            >
              미리보기
            </button>
          </div>
          <button
            type="button"
            onClick={save}
            className="btn-primary text-xs px-4 py-1.5"
          >
            저장
          </button>
          <span className="text-xs text-[var(--pb-gray)] min-w-[60px]">
            {status === "saving" && "저장 중..."}
            {status === "saved" && "저장됨"}
            {status === "error" && "저장 실패"}
          </span>
        </div>
      </header>

      {hasDraft && (
        <div className="border border-[var(--accent-sale)] bg-red-50 px-4 py-2 text-xs flex items-center justify-between">
          <span>저장되지 않은 초안이 있습니다.</span>
          <div className="flex gap-2">
            <button onClick={restoreDraft} className="underline">
              초안 불러오기
            </button>
            <button onClick={discardDraft} className="underline text-[var(--pb-gray)]">
              버리기
            </button>
          </div>
        </div>
      )}

      {tab === "edit" ? (
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
          <BlockPalette onAdd={(b) => setBlocks([...blocks, b])} />
          <div>
            {blocks.length === 0 ? (
              <p className="text-sm text-[var(--pb-gray)] py-12 text-center border border-dashed border-[var(--pb-light-gray)]">
                좌측에서 블록을 추가해주세요.
              </p>
            ) : (
              <BlockList value={blocks} onChange={setBlocks} />
            )}
            <p className="text-xs text-[var(--pb-gray)] mt-3">
              블록 {blocks.length}/50
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto py-6">
          <DetailBlocksRenderer blocks={blocks} />
        </div>
      )}
    </div>
  );
}
