"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, Check, X } from "lucide-react";
import BlockPalette from "@/components/admin/detail-editor/BlockPalette";
import BlockList from "@/components/admin/detail-editor/BlockList";
import type { Block } from "@/components/admin/detail-editor/types";
import DetailBlocksRenderer from "@/lib/detail-blocks/renderer";
import DraftDiff from "./DraftDiff";

type Tab = "edit" | "preview" | "diff";

export interface DraftReviewShellProps {
  draftId: string;
  productId: string;
  productName: string;
  initialBlocks: Block[];
  liveBlocks: Block[];
  generator: string | null;
  revision: number;
  feedback: string | null;
  factsNeedingInput: string[];
  /** 법정 고지 중 비어 있는 항목 — 채우기 전까지 발행이 막힌다 */
  legalGaps?: string[];
  /** 품질 루프 판정 결과 */
  quality?: { score: number; passed: boolean; attempts: number } | null;
}

export default function DraftReviewShell({
  draftId,
  productId,
  productName,
  initialBlocks,
  liveBlocks,
  generator,
  revision,
  feedback,
  factsNeedingInput,
  legalGaps = [],
  quality = null,
}: DraftReviewShellProps) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [tab, setTab] = useState<Tab>("preview");
  const [busy, setBusy] = useState<null | "save" | "approve" | "reject">(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [note, setNote] = useState("");

  const save = useCallback(async () => {
    setBusy("save");
    setMsg(null);
    const res = await fetch(`/api/admin/drafts/${draftId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    setMsg(res.ok ? "초안 저장됨" : `저장 실패: ${data.error ?? ""}`);
  }, [blocks, draftId]);

  async function approve() {
    if (!confirm("이 초안을 검토 완료로 보고 라이브 상세페이지에 발행할까요?")) return;
    setBusy("approve");
    setMsg(null);
    // 편집분이 있으면 발행 전 먼저 저장
    await fetch(`/api/admin/drafts/${draftId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
    });
    const res = await fetch(`/api/admin/drafts/${draftId}/approve`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      router.push(`/admin/products/${productId}/drafts`);
      router.refresh();
    } else {
      setBusy(null);
      setMsg(`발행 실패: ${data.error ?? ""}`);
    }
  }

  async function reject(regenerate: boolean) {
    setBusy("reject");
    setMsg(null);
    const res = await fetch(`/api/admin/drafts/${draftId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note, regenerate }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      if (data.regenerated && data.draftId) {
        router.push(`/admin/drafts/${data.draftId}/review`);
      } else {
        router.push(`/admin/products/${productId}/drafts`);
      }
      router.refresh();
    } else {
      setBusy(null);
      setMsg(`반려 실패: ${data.error ?? ""}`);
    }
  }

  const tabBtn = (t: Tab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(t)}
      className={`px-3 py-1.5 text-xs uppercase tracking-wider ${
        tab === t ? "bg-[var(--pb-jet-black)] text-white" : ""
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-[var(--pb-light-gray)] pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/admin/products/${productId}/drafts`}
            className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] flex items-center gap-1 shrink-0"
          >
            <ArrowLeft className="w-3 h-3" /> 초안 목록
          </Link>
          <h1 className="heading-display text-base tracking-wide truncate">
            초안 검수 — {productName}
          </h1>
          <span className="text-[10px] uppercase tracking-wider border border-[var(--pb-light-gray)] px-1.5 py-0.5 text-[var(--pb-gray)] shrink-0">
            v{revision} · {generator ?? "manual"}
          </span>
          {quality && (
            <span
              title={`AI 품질 판정 ${quality.score.toFixed(1)}/10 · 생성 ${quality.attempts}회`}
              className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 shrink-0 border ${
                quality.passed
                  ? "border-[var(--pb-jet-black)] text-[var(--pb-jet-black)]"
                  : "border-[var(--accent-sale)] text-[var(--accent-sale)]"
              }`}
            >
              품질 {quality.score.toFixed(1)}/10
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-[var(--pb-jet-black)]">
            {tabBtn("edit", "편집")}
            {tabBtn("preview", "미리보기")}
            {tabBtn("diff", "비교")}
          </div>
          <button
            type="button"
            onClick={save}
            disabled={busy !== null}
            className="border border-[var(--pb-jet-black)] text-xs px-3 py-1.5 disabled:opacity-50"
          >
            {busy === "save" ? "저장 중..." : "초안 저장"}
          </button>
        </div>
      </header>

      {/* 검수 안내 — 이 초안이 직전 반려 의견을 반영한 것이면 표시 */}
      {feedback && (
        <div className="border border-[var(--pb-jet-black)] bg-[var(--pb-snow)] px-4 py-2 text-xs">
          <span className="font-semibold">반영한 직전 의견:</span> {feedback}
        </div>
      )}

      {/* 법정 고지 미기입 — 채우기 전까지 발행이 막힌다 (경고가 아니라 차단 사유) */}
      {legalGaps.length > 0 && (
        <div className="border-[1.5px] border-[var(--accent-sale)] bg-red-50 px-4 py-3 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 text-[var(--accent-sale)] shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold text-[var(--accent-sale)]">
              법정 고지 {legalGaps.length}개 항목이 비어 있어 발행할 수 없습니다
            </p>
            <p>
              전자상거래법 상품정보제공고시가 요구하는 항목입니다. 편집 탭의
              &lsquo;상품정보제공고시&rsquo; 표에서 채워주세요:{" "}
              <strong>{legalGaps.join(", ")}</strong>
            </p>
            <p className="text-[var(--pb-gray)]">
              값을 모르면 빈칸으로 두지 말고 확인 방법이나 사유를 적어주세요.
            </p>
          </div>
        </div>
      )}

      {/* 사실값 입력 필요 경고 — AI 는 사실을 지어내지 않으므로 운영자가 채워야 함 */}
      {factsNeedingInput.length > 0 && (
        <div className="border border-[var(--accent-sale)] bg-red-50 px-4 py-2 text-xs flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-[var(--accent-sale)] shrink-0" />
          <span>
            AI 가 채우지 않은 <strong>사실 항목</strong>이 있습니다(발행 전 확인):{" "}
            {factsNeedingInput.join(", ")}. 편집 탭에서 직접 입력하세요.
          </span>
        </div>
      )}

      {msg && <p className="text-xs text-[var(--pb-gray)]">{msg}</p>}

      {tab === "edit" && (
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
            <p className="text-xs text-[var(--pb-gray)] mt-3">블록 {blocks.length}/50</p>
          </div>
        </div>
      )}

      {tab === "preview" && (
        <div className="max-w-3xl mx-auto py-6">
          <DetailBlocksRenderer blocks={blocks} />
        </div>
      )}

      {tab === "diff" && <DraftDiff liveBlocks={liveBlocks} draftBlocks={blocks} />}

      {/* 검수 결정 바 */}
      <div className="border-t border-[var(--pb-light-gray)] pt-4 mt-6 space-y-3">
        {!showReject ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowReject(true)}
              disabled={busy !== null}
              className="border border-[var(--accent-sale)] text-[var(--accent-sale)] text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" /> 반려
            </button>
            <button
              type="button"
              onClick={approve}
              disabled={busy !== null}
              className="btn-primary text-xs px-5 py-2 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              {busy === "approve" ? "발행 중..." : "승인 후 발행"}
            </button>
          </div>
        ) : (
          <div className="border border-[var(--pb-light-gray)] p-4 space-y-3">
            <label className="text-xs uppercase tracking-[0.15em] text-[var(--pb-gray)]">
              반려 의견 (재생성 시 AI 가 반영합니다)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="예: 컨셉 카피가 너무 길어요. 소재 강조를 더 해주세요."
              className="w-full border-[1.5px] border-[var(--pb-light-gray)] focus:border-[var(--pb-jet-black)] outline-none px-3 py-2 text-sm"
            />
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReject(false)}
                disabled={busy !== null}
                className="text-xs px-3 py-2 text-[var(--pb-gray)]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => reject(false)}
                disabled={busy !== null}
                className="border border-[var(--pb-jet-black)] text-xs px-4 py-2 disabled:opacity-50"
              >
                반려만
              </button>
              <button
                type="button"
                onClick={() => reject(true)}
                disabled={busy !== null || !note.trim()}
                className="btn-primary text-xs px-4 py-2 disabled:opacity-50"
                title={!note.trim() ? "의견을 입력하면 재생성할 수 있습니다" : ""}
              >
                {busy === "reject" ? "처리 중..." : "반려 후 의견 반영 재생성"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
