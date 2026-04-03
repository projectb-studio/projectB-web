"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, MessageCircle, Phone, Mail, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqItem } from "@/lib/data/cs";

type CsTab = "faq" | "qna" | "etc" | "wholesale" | "notice";

const CS_TABS = [
  { id: "faq" as const, label: "FAQ" },
  { id: "qna" as const, label: "Q&A" },
  { id: "etc" as const, label: "기타 문의" },
  { id: "wholesale" as const, label: "도매/제휴" },
  { id: "notice" as const, label: "공지사항" },
];

const VALID_TABS: CsTab[] = CS_TABS.map((t) => t.id);

// --- FAQ Accordion (existing, unchanged) ---

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

// --- Inquiry Form (reused inside Q&A tab) ---

function InquiryForm({ onClose }: { onClose?: () => void }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    // TODO: Replace with Supabase pb_cs_inquiries insert
    setTimeout(() => {
      setStatus("success");
    }, 500);
  };

  if (status === "success") {
    return (
      <div className="space-y-4 max-w-lg">
        <div className="py-8 text-center">
          <p className="text-sm font-medium text-[var(--accent-success)] mb-2">문의가 등록되었습니다.</p>
          <p className="text-xs text-pb-gray mb-6">답변은 1~2영업일 내에 등록됩니다.</p>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              onClose?.();
            }}
            className="btn-secondary text-xs px-4 py-2"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-heading font-semibold uppercase tracking-industrial">
          문의 작성
        </h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-pb-gray hover:text-pb-jet-black transition-colors"
          >
            닫기
          </button>
        )}
      </div>
      <div>
        <label htmlFor="inquiry-type" className="block text-xs text-pb-gray uppercase tracking-industrial mb-1.5">
          문의 유형
        </label>
        <select
          id="inquiry-type"
          name="type"
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
          name="title"
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
          name="content"
          rows={6}
          required
          placeholder="문의 내용을 상세히 작성해주세요"
          className="w-full border border-pb-light-gray px-3 py-2.5 text-sm focus:border-pb-jet-black focus:outline-none transition-colors resize-none"
        />
      </div>
      <button type="submit" disabled={status === "submitting"} className="btn-primary disabled:opacity-50">
        {status === "submitting" ? "등록 중..." : "문의 등록"}
      </button>
    </form>
  );
}

// --- Q&A Tab ---

interface QnaItem {
  id: string;
  title: string;
  date: string;
  status: "answered" | "waiting";
  question: string;
  answer?: string;
}

const DUMMY_QNA: QnaItem[] = [
  {
    id: "qna-1",
    title: "세라믹 화병 색상 차이 문의",
    date: "2026-03-28",
    status: "answered",
    question: "온라인에서 본 색상과 실제 제품 색상이 다를 수 있나요?",
    answer: "핸드메이드 제품 특성상 미세한 색상 차이가 있을 수 있습니다. 모니터 환경에 따라서도 다르게 보일 수 있으니 참고 부탁드립니다.",
  },
  {
    id: "qna-2",
    title: "린넨 테이블러너 세탁 방법",
    date: "2026-03-25",
    status: "answered",
    question: "린넨 소재 세탁 시 주의사항이 있나요?",
    answer: "30도 이하 찬물에 중성세제로 손세탁을 권장드립니다. 건조기 사용은 피해주세요.",
  },
  {
    id: "qna-3",
    title: "황동 캔들홀더 변색 관련",
    date: "2026-03-22",
    status: "answered",
    question: "황동 제품이 시간이 지나면 변색되나요?",
    answer: "황동은 시간이 지나며 자연스러운 경년 변화(파티나)가 생깁니다. 이는 소재의 특성이며, 부드러운 천으로 닦아주시면 광택을 유지할 수 있습니다.",
  },
  {
    id: "qna-4",
    title: "선물 포장 추가 비용 문의",
    date: "2026-03-20",
    status: "answered",
    question: "선물 포장 시 추가 비용이 발생하나요?",
    answer: "선물 포장은 무료로 제공됩니다. 주문 시 배송 메모에 '선물 포장 요청'이라고 적어주세요.",
  },
  {
    id: "qna-5",
    title: "오크 우드 트레이 재입고 일정",
    date: "2026-03-18",
    status: "waiting",
    question: "현재 품절된 오크 우드 트레이 재입고 예정이 있나요?",
  },
  {
    id: "qna-6",
    title: "해외 배송 가능 여부",
    date: "2026-03-15",
    status: "waiting",
    question: "일본으로 배송이 가능한가요? 배송비는 얼마인가요?",
  },
];

function QnATab() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      {/* Header with write button */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-pb-gray">
          총 {DUMMY_QNA.length}건의 문의
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-xs px-4 py-2"
        >
          문의하기
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="mb-8 pb-8 border-b border-pb-light-gray">
          <InquiryForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Q&A list */}
      <div className="border-t border-pb-light-gray">
        {DUMMY_QNA.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div key={item.id} className="border-b border-pb-light-gray">
              <button
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex items-start justify-between w-full py-4 text-left gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-[0.15em] px-1.5 py-0.5 border",
                        item.status === "answered"
                          ? "text-[#2D8F4E] border-[#2D8F4E]"
                          : "text-pb-silver border-pb-light-gray",
                      )}
                    >
                      {item.status === "answered" ? "답변완료" : "답변대기"}
                    </span>
                    <span className="text-[10px] text-pb-silver">{item.date}</span>
                  </div>
                  <span className="text-sm font-medium">{item.title}</span>
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
                  isOpen ? "max-h-60 pb-4" : "max-h-0",
                )}
              >
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-pb-silver uppercase tracking-[0.15em] block mb-1">Q</span>
                    <p className="text-sm text-pb-charcoal leading-relaxed">{item.question}</p>
                  </div>
                  {item.answer && (
                    <div className="border-t border-pb-light-gray/50 pt-3">
                      <span className="text-[10px] text-pb-silver uppercase tracking-[0.15em] block mb-1">A</span>
                      <p className="text-sm text-pb-charcoal leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Etc Inquiry Tab (기타 문의: 교환/반품, 배송, 결제) ---

function EtcInquiryTab() {
  return (
    <div className="space-y-10 max-w-lg">
      {/* 교환/반품 안내 */}
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
          <p>1. Q&A 게시판 또는 카카오톡으로 교환/반품 접수</p>
          <p>2. 안내에 따라 상품 발송</p>
          <p>3. 상품 확인 후 교환 발송 또는 환불 처리 (2~3영업일)</p>
        </div>
      </div>

      <div className="h-px bg-pb-light-gray/40" />

      {/* 배송 안내 */}
      <div>
        <h3 className="text-xs font-heading font-semibold uppercase tracking-industrial mb-3">
          배송 안내
        </h3>
        <div className="space-y-2 text-sm text-pb-charcoal leading-relaxed">
          <p>• 결제 완료 후 2~5영업일 내 배송</p>
          <p>• 50,000원 이상 구매 시 무료배송</p>
          <p>• 50,000원 미만 주문 시 배송비 3,000원</p>
          <p>• 도서산간 지역 추가 배송비 발생 (2,000~3,000원)</p>
          <p>• 주문 폭주 시 배송이 지연될 수 있습니다</p>
        </div>
      </div>

      <div className="h-px bg-pb-light-gray/40" />

      {/* 결제 안내 */}
      <div>
        <h3 className="text-xs font-heading font-semibold uppercase tracking-industrial mb-3">
          결제 안내
        </h3>
        <div className="space-y-2 text-sm text-pb-charcoal leading-relaxed">
          <p>• 신용/체크카드 결제</p>
          <p>• 무통장 입금 (가상계좌)</p>
          <p>• 카카오페이, 네이버페이, 토스페이</p>
          <p>• 휴대폰 결제</p>
          <p>• 적립금/포인트 결제 (회원 전용)</p>
        </div>
      </div>

      <div className="h-px bg-pb-light-gray/40" />

      {/* 카카오톡 상담 */}
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

// --- Wholesale Tab (도매/제휴 문의) ---

function WholesaleTab() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    // TODO: Replace with Supabase pb_cs_inquiries insert (type: wholesale)
    setTimeout(() => {
      setStatus("success");
    }, 500);
  };

  if (status === "success") {
    return (
      <div className="space-y-10 max-w-lg">
        <div className="py-8 text-center">
          <p className="text-sm font-medium text-[var(--accent-success)] mb-2">도매/제휴 문의가 등록되었습니다.</p>
          <p className="text-xs text-pb-gray mb-6">담당자 확인 후 연락드리겠습니다. (1~3영업일)</p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="btn-secondary text-xs px-4 py-2"
          >
            새 문의 작성
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-lg">
      <p className="text-sm text-pb-charcoal leading-relaxed">
        대량 구매, 도매, 공간 제휴 등 비즈니스 문의를 남겨주세요.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="ws-company" className="block text-xs text-pb-gray uppercase tracking-industrial mb-1.5">
            회사/단체명
          </label>
          <input
            id="ws-company"
            name="company"
            type="text"
            required
            placeholder="회사 또는 단체명을 입력해주세요"
            className="w-full border border-pb-light-gray px-3 py-2.5 text-sm focus:border-pb-jet-black focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label htmlFor="ws-name" className="block text-xs text-pb-gray uppercase tracking-industrial mb-1.5">
            담당자명
          </label>
          <input
            id="ws-name"
            name="name"
            type="text"
            required
            placeholder="담당자 성함을 입력해주세요"
            className="w-full border border-pb-light-gray px-3 py-2.5 text-sm focus:border-pb-jet-black focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label htmlFor="ws-phone" className="block text-xs text-pb-gray uppercase tracking-industrial mb-1.5">
            연락처
          </label>
          <input
            id="ws-phone"
            name="phone"
            type="tel"
            required
            placeholder="010-0000-0000"
            className="w-full border border-pb-light-gray px-3 py-2.5 text-sm focus:border-pb-jet-black focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label htmlFor="ws-email" className="block text-xs text-pb-gray uppercase tracking-industrial mb-1.5">
            이메일
          </label>
          <input
            id="ws-email"
            name="email"
            type="email"
            required
            placeholder="email@example.com"
            className="w-full border border-pb-light-gray px-3 py-2.5 text-sm focus:border-pb-jet-black focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label htmlFor="ws-content" className="block text-xs text-pb-gray uppercase tracking-industrial mb-1.5">
            문의 내용
          </label>
          <textarea
            id="ws-content"
            name="content"
            rows={6}
            required
            placeholder="문의 내용을 상세히 작성해주세요"
            className="w-full border border-pb-light-gray px-3 py-2.5 text-sm focus:border-pb-jet-black focus:outline-none transition-colors resize-none"
          />
        </div>
        <button type="submit" disabled={status === "submitting"} className="btn-primary disabled:opacity-50">
          {status === "submitting" ? "등록 중..." : "문의 등록"}
        </button>
      </form>

      <div className="h-px bg-pb-light-gray/40" />

      {/* Direct contact info */}
      <div className="space-y-4">
        <h3 className="text-xs font-heading font-semibold uppercase tracking-industrial">
          직접 문의
        </h3>
        <div className="flex items-center gap-3">
          <Mail size={16} strokeWidth={1.5} className="text-pb-silver shrink-0" />
          <div>
            <p className="text-xs text-pb-gray">이메일 문의</p>
            <a
              href="mailto:project_b_sindang@naver.com"
              className="text-sm font-medium hover:underline"
            >
              project_b_sindang@naver.com
            </a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Phone size={16} strokeWidth={1.5} className="text-pb-silver shrink-0" />
          <div>
            <p className="text-xs text-pb-gray">전화 문의</p>
            <a
              href="tel:010-2122-0691"
              className="text-sm font-medium hover:underline"
            >
              010-2122-0691
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Notice Tab (공지사항) ---

interface NoticeItem {
  id: string;
  title: string;
  date: string;
  isNew: boolean;
  content: string;
}

const DUMMY_NOTICES: NoticeItem[] = [
  {
    id: "notice-1",
    title: "2026년 4월 배송 안내",
    date: "2026-03-30",
    isNew: true,
    content: "4월 중 택배사 물량 증가로 인해 배송이 1~2일 지연될 수 있습니다. 양해 부탁드립니다.",
  },
  {
    id: "notice-2",
    title: "신당동 오프라인 매장 운영시간 변경 안내",
    date: "2026-03-25",
    isNew: true,
    content: "4월 1일부터 평일 운영시간이 11:00~20:00에서 10:30~20:30으로 변경됩니다.",
  },
  {
    id: "notice-3",
    title: "봄 시즌 신상품 입고 안내",
    date: "2026-03-18",
    isNew: false,
    content: "봄 시즌 신상품이 순차적으로 입고되고 있습니다. Shop 페이지에서 확인해 주세요.",
  },
  {
    id: "notice-4",
    title: "개인정보처리방침 개정 안내",
    date: "2026-03-10",
    isNew: false,
    content: "개인정보처리방침이 일부 개정되었습니다. 자세한 내용은 개인정보처리방침 페이지를 확인해 주세요.",
  },
  {
    id: "notice-5",
    title: "PROJECT B 온라인 스토어 오픈",
    date: "2026-03-01",
    isNew: false,
    content: "PROJECT B 온라인 스토어가 공식 오픈했습니다. 오프라인 매장과 동일한 가격으로 만나보세요. 오픈 기념 전 상품 무료배송 이벤트를 진행합니다.",
  },
];

function NoticeTab() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="border-t border-pb-light-gray">
      {DUMMY_NOTICES.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="border-b border-pb-light-gray">
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex items-start justify-between w-full py-4 text-left gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-pb-silver">{item.date}</span>
                  {item.isNew && (
                    <span className="text-[10px] uppercase tracking-[0.15em] px-1.5 py-0.5 bg-pb-jet-black text-white">
                      NEW
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">{item.title}</span>
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
              <p className="text-sm text-pb-charcoal leading-relaxed">
                {item.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Main CS Content ---

export function CSContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<CsTab>("faq");
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);

  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam as CsTab)) {
      setActiveTab(tabParam as CsTab);
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
      <div className="flex border-b border-pb-light-gray mb-8 overflow-x-auto">
        {CS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-3 text-xs font-heading font-semibold uppercase tracking-industrial transition-colors border-b-2 whitespace-nowrap min-w-0",
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
      {activeTab === "qna" && <QnATab />}
      {activeTab === "etc" && <EtcInquiryTab />}
      {activeTab === "wholesale" && <WholesaleTab />}
      {activeTab === "notice" && <NoticeTab />}
    </section>
  );
}
