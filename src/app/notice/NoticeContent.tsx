"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Pin, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import type { Notice } from "@/lib/data/notices";

type NoticeTab = "all" | "notice" | "event";

const NOTICE_TABS: { id: NoticeTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "notice", label: "공지사항" },
  { id: "event", label: "이벤트" },
];

function NoticeItem({ notice }: { notice: Notice }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-pb-light-gray">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-start justify-between w-full py-4 text-left gap-4"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {notice.isPinned && (
              <Pin size={10} strokeWidth={1.5} className="text-pb-jet-black shrink-0" />
            )}
            <span
              className={cn(
                "text-[10px] uppercase tracking-[0.15em]",
                notice.type === "event" ? "text-accent-sale" : "text-pb-silver",
              )}
            >
              {notice.type === "event" ? "Event" : "Notice"}
            </span>
            <span className="text-[10px] text-pb-silver">{formatDate(notice.date)}</span>
          </div>
          <span className={cn("text-sm", notice.isPinned && "font-medium")}>
            {notice.title}
          </span>
        </div>
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className={cn(
            "text-pb-gray transition-transform duration-200 mt-2 shrink-0",
            isOpen && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-96 pb-6" : "max-h-0",
        )}
      >
        <p className="text-sm text-pb-charcoal leading-relaxed whitespace-pre-line">
          {notice.content}
        </p>
      </div>
    </div>
  );
}

export function NoticeContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<NoticeTab>("all");
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    if (tabParam === "event") setActiveTab("event");
    else if (tabParam === "notice") setActiveTab("notice");
  }, [tabParam]);

  useEffect(() => {
    import("@/lib/data/notices").then((mod) =>
      mod
        .getNotices(activeTab === "all" ? undefined : activeTab)
        .then(setNotices),
    );
  }, [activeTab]);

  return (
    <section className="max-w-narrow mx-auto px-6 lg:px-12 py-12 lg:py-20">
      <h1 className="heading-display text-sm text-center tracking-wide mb-10">
        Notice & Events
      </h1>

      {/* Tabs */}
      <div className="flex border-b border-pb-light-gray mb-8">
        {NOTICE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-3 text-xs font-heading font-semibold uppercase tracking-industrial transition-colors border-b-2",
              activeTab === tab.id
                ? "border-pb-jet-black text-pb-jet-black"
                : "border-transparent text-pb-silver hover:text-pb-gray",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notice list */}
      {notices.length > 0 ? (
        <div className="border-t border-pb-light-gray">
          {notices.map((notice) => (
            <NoticeItem key={notice.id} notice={notice} />
          ))}
        </div>
      ) : (
        <p className="text-center text-pb-gray text-sm py-16">
          등록된 글이 없습니다.
        </p>
      )}
    </section>
  );
}
