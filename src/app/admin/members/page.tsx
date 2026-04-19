"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Member {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  grade: "normal" | "vip";
  is_blocked: boolean;
  joined_at: string;
  order_count: number;
  total_spent: number;
  last_order_at: string | null;
}

const GRADE_LABELS: Record<string, string> = { normal: "일반", vip: "VIP" };

export default function AdminMembersPage() {
  const [items, setItems] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("");
  const [blocked, setBlocked] = useState("");
  const [page, setPage] = useState(1);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    if (grade) qs.set("grade", grade);
    if (blocked) qs.set("blocked", blocked);
    qs.set("page", String(page));
    const res = await fetch(`/api/admin/members?${qs}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.items ?? []);
    }
    setLoading(false);
  }, [search, grade, blocked, page]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const csvHref = () => {
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    if (grade) qs.set("grade", grade);
    if (blocked) qs.set("blocked", blocked);
    return `/api/admin/members/export?${qs}`;
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="heading-display text-xl tracking-wide">회원 관리</h1>
        <a href={csvHref()} className="btn-secondary text-xs px-4 py-2">
          CSV 내보내기
        </a>
      </header>

      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="이름 / 이메일 / 전화 검색"
          className="border border-[var(--pb-light-gray)] px-3 py-2 text-sm w-64 focus:border-[var(--pb-jet-black)] focus:outline-none"
        />
        <select
          value={grade}
          onChange={(e) => { setGrade(e.target.value); setPage(1); }}
          className="border border-[var(--pb-light-gray)] px-3 py-2 text-sm"
        >
          <option value="">전체 등급</option>
          <option value="normal">일반</option>
          <option value="vip">VIP</option>
        </select>
        <select
          value={blocked}
          onChange={(e) => { setBlocked(e.target.value); setPage(1); }}
          className="border border-[var(--pb-light-gray)] px-3 py-2 text-sm"
        >
          <option value="">전체 상태</option>
          <option value="false">활성</option>
          <option value="true">차단</option>
        </select>
      </div>

      <div className="border border-[var(--pb-light-gray)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--pb-off-white)] text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">이름</th>
              <th className="px-4 py-3 text-left">이메일</th>
              <th className="px-4 py-3 text-left">전화</th>
              <th className="px-4 py-3 text-left">등급</th>
              <th className="px-4 py-3 text-left">가입일</th>
              <th className="px-4 py-3 text-left">최근주문</th>
              <th className="px-4 py-3 text-right">총 구매</th>
              <th className="px-4 py-3 text-right">주문수</th>
              <th className="px-4 py-3 text-left">상태</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-[var(--pb-gray)]">불러오는 중...</td></tr>
            )}
            {!loading && items.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-[var(--pb-gray)]">해당 조건의 회원이 없습니다.</td></tr>
            )}
            {!loading && items.map((u) => (
              <tr key={u.user_id} className="border-t border-[var(--pb-light-gray)] hover:bg-[var(--pb-off-white)]">
                <td className="px-4 py-3">
                  <Link href={`/admin/members/${u.user_id}`} className="hover:underline">
                    {u.full_name ?? "(이름 없음)"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--pb-charcoal)]">{u.email ?? "-"}</td>
                <td className="px-4 py-3 text-[var(--pb-charcoal)]">{u.phone ?? "-"}</td>
                <td className="px-4 py-3">{GRADE_LABELS[u.grade] ?? u.grade}</td>
                <td className="px-4 py-3 text-[var(--pb-gray)]">{u.joined_at?.slice(0, 10)}</td>
                <td className="px-4 py-3 text-[var(--pb-gray)]">{u.last_order_at?.slice(0, 10) ?? "-"}</td>
                <td className="px-4 py-3 text-right tabular-nums">₩{Number(u.total_spent).toLocaleString()}</td>
                <td className="px-4 py-3 text-right tabular-nums">{u.order_count}</td>
                <td className="px-4 py-3">
                  {u.is_blocked ? (
                    <span className="text-[var(--accent-sale)]">차단</span>
                  ) : (
                    <span className="text-[var(--pb-gray)]">활성</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <nav className="flex gap-2 items-center">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="btn-secondary text-xs px-3 py-1 disabled:opacity-40"
        >
          이전
        </button>
        <span className="text-xs text-[var(--pb-gray)]">페이지 {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={items.length < 20}
          className="btn-secondary text-xs px-3 py-1 disabled:opacity-40"
        >
          다음
        </button>
      </nav>
    </section>
  );
}
