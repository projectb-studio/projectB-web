"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqItem } from "@/lib/data/cs";

type CsTab = "faq" | "inquiry" | "return";

const CS_TABS = [
  { id: "faq" as const, label: "FAQ" },
  { id: "inquiry" as const, label: "1:1 문의" },
  { id: "return" as const, label: "교환/반품" },
];

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="border-t border-pb-light-gray">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="border-b border-pb-light-gray">
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex items-start justify-between w-full py-4 text-left gap-4"
            >
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-pb-silver uppercase tracking-[0.15em] block mb-1">
                  {item.category}
                </span>
                <span className="text-sm font-medium">{item.question}</span>
              </div>
              <ChevronDown
                size={14}
                strokeWidth={1.5}
                className={cn(
                  "text-pb-gray transition-transform duration-200 mt-1.5 shrink-0",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-200",
                isOpen ? "max-h-40 pb-4" : "max-h-0",
              )}
            >
              <p className="text-sm text-pb-charcoal leading-relaxed pl-0">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InquiryForm() {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // TODO: Submit to Supabase pb_cs_inquiries
      }}
      className="space-y-4 max-w-lg"
    >
      <div>
        <label htmlFor="inquiry-type" className="block text-xs text-pb-gray uppercase tracking-industrial mb-1.5">
          문의 유형
        </label>
        <select
          id="inquiry-type"
          required
          className="w-full border border-pb-light-gray px-3 py-2.5 text-sm focus:border-pb-jet-black focus:outline-none transition-colors bg-white"
        >
          <option value="">선택해주세요</option>
          <option value="product">상품 문의</option>
          <option value="order">주문/결제 문의</option>
          <option value="shipping">배송 문의</option>
          <option value="etc">기타</option>
        </select>
      </div>
      <div>
        <label htmlFor="inquiry-title" className="block text-xs text-pb-gray uppercase tracking-industrial mb-1.5">
          제목
        </label>
        <input
          id="inquiry-title"
          type="text"
          required
          placeholder="문의 제목을 입력해주세요"
          className="w-full border border-pb-light-gray px-3 py-2.5 text-sm focus:border-pb-jet-black focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label htmlFor="inquiry-content" className="block text-xs text-pb-gray uppercase tracking-industrial mb-1.5">
          내용
        </label>
        <textarea
          id="inquiry-content"
          rows={6}
          required
          placeholder="문의 내용을 상세히 작성해주세요"
          className="w-full border border-pb-light-gray px-3 py-2.5 text-sm focus:border-pb-jet-black focus:outline-none transition-colors resize-none"
        />
      </div>
      <button type="submit" className="btn-primary">Submit Inquiry</button>
    </form>
  );
}

function ReturnInfo() {
  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h3 className="text-xs font-heading font-semibold uppercase tracking-industrial mb-3">
          교환/반품 안내
        </h3>
        <div className="space-y-2 text-sm text-pb-charcoal leading-relaxed">
          <p>• 수령 후 7일 이내 접수 가능</p>
          <p>• 단순 변심: 반품 배송비 고객 부담 (3,000원)</p>
          <p>• 상품 하자: 무료 교환/반품</p>
          <p>• 사용 흔적이 있거나 태그 제거 시 교환/반품 불가</p>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-heading font-semibold uppercase tracking-industrial mb-3">
          교환/반품 절차
        </h3>
        <div className="space-y-2 text-sm text-pb-charcoal leading-relaxed">
          <p>1. 1:1 문의 또는 카카오톡으로 교환/반품 접수</p>
          <p>2. 안내에 따라 상품 발송</p>
          <p>3. 상품 확인 후 교환 발송 또는 환불 처리 (2~3영업일)</p>
        </div>
      </div>

      <div className="h-px bg-pb-light-gray/40" />

      <div className="flex items-center gap-3">
        <MessageCircle size={16} strokeWidth={1.5} className="text-pb-silver" />
        <div>
          <p className="text-xs text-pb-gray">카카오톡 상담</p>
          <p className="text-sm font-medium">@projectb</p>
        </div>
      </div>
    </div>
  );
}

export function CSContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<CsTab>("faq");
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);

  useEffect(() => {
    if (tabParam === "inquiry" || tabParam === "return" || tabParam === "faq") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    import("@/lib/data/cs").then((mod) =>
      mod.getFaqItems().then(setFaqItems),
    );
  }, []);

  return (
    <section className="max-w-narrow mx-auto px-6 lg:px-12 py-12 lg:py-20">
      <h1 className="heading-display text-sm text-center tracking-wide mb-10">
        Customer Service
      </h1>

      {/* Tabs */}
      <div className="flex border-b border-pb-light-gray mb-8">
        {CS_TABS.map((tab) => (
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

      {/* Tab content */}
      {activeTab === "faq" && <FaqAccordion items={faqItems} />}
      {activeTab === "inquiry" && <InquiryForm />}
      {activeTab === "return" && <ReturnInfo />}
    </section>
  );
}
