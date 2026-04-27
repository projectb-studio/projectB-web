"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Save, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DbCategory } from "@/types/database";

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editOrder, setEditOrder] = useState(0);
  const [editVisible, setEditVisible] = useState(true);
  const [editDescription, setEditDescription] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    if (res.ok) setRows(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        name,
        description: description || null,
        display_order: rows.length,
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setSlug("");
      setName("");
      setDescription("");
      await fetchData();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? "등록 실패");
    }
    setSaving(false);
  }

  function startEdit(c: DbCategory) {
    setEditingId(c.id);
    setEditName(c.name);
    setEditOrder(c.display_order);
    setEditVisible(c.is_visible);
    setEditDescription(c.description ?? "");
  }

  async function handleSave(id: string) {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        display_order: editOrder,
        is_visible: editVisible,
        description: editDescription || null,
      }),
    });
    if (res.ok) {
      setEditingId(null);
      await fetchData();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("카테고리를 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) await fetchData();
  }

  const inputClass = "w-full border border-[var(--pb-light-gray)] px-3 py-2.5 text-sm focus:border-[var(--pb-jet-black)] focus:outline-none transition-colors bg-white";
  const labelClass = "block text-xs text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading mb-1.5";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-1">카테고리 관리</h2>
          <p className="text-xs text-[var(--pb-gray)]">상품 카테고리를 관리합니다. Shop 페이지 필터에 반영됩니다.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? "취소" : "카테고리 추가"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="border border-[var(--pb-jet-black)] bg-white p-6 mb-6 space-y-4 max-w-xl">
          <h3 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold">카테고리 추가</h3>
          <div>
            <label className={labelClass}>Slug * (URL에 사용, 영문 소문자)</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              className={inputClass}
              placeholder="accessories"
            />
          </div>
          <div>
            <label className={labelClass}>이름 *</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="액세서리" />
          </div>
          <div>
            <label className={labelClass}>설명 (선택)</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary text-sm py-2.5 px-6 disabled:opacity-50">
            {saving ? "등록 중..." : "등록"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-[var(--pb-silver)]">로딩 중...</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="border border-[var(--pb-light-gray)] bg-white p-12 text-center">
          <p className="text-sm text-[var(--pb-gray)]">카테고리가 없습니다.</p>
        </div>
      ) : (
        <div className="border border-[var(--pb-light-gray)] bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--pb-light-gray)] bg-[var(--pb-off-white)]">
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  순서
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  Slug
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  이름
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  설명
                </th>
                <th className="text-left px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  노출
                </th>
                <th className="text-right px-4 py-3 text-[10px] text-[var(--pb-gray)] uppercase tracking-[0.15em] font-heading font-semibold">
                  관리
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const isEditing = editingId === c.id;
                return (
                  <tr key={c.id} className="border-b border-[var(--pb-light-gray)] last:border-b-0 hover:bg-[var(--pb-off-white)]">
                    <td className="px-4 py-3 text-xs w-20">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editOrder}
                          onChange={(e) => setEditOrder(Number(e.target.value))}
                          className="w-16 border border-[var(--pb-light-gray)] px-2 py-1 text-xs"
                        />
                      ) : (
                        c.display_order
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono">{c.slug}</td>
                    <td className="px-4 py-3 text-xs">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="border border-[var(--pb-light-gray)] px-2 py-1 text-xs"
                        />
                      ) : (
                        <span className="font-medium">{c.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs max-w-sm truncate">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full border border-[var(--pb-light-gray)] px-2 py-1 text-xs"
                        />
                      ) : (
                        c.description ?? "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={editVisible}
                            onChange={(e) => setEditVisible(e.target.checked)}
                          />
                          <span className="text-xs">노출</span>
                        </label>
                      ) : (
                        <span className={cn("text-xs", c.is_visible ? "text-[#2D8F4E]" : "text-[var(--pb-silver)]")}>
                          {c.is_visible ? "노출" : "숨김"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSave(c.id)}
                              className="text-xs px-2 py-1 border border-[var(--pb-jet-black)] bg-[var(--pb-jet-black)] text-white flex items-center gap-1"
                            >
                              <Save size={12} /> 저장
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-xs px-2 py-1 border border-[var(--pb-light-gray)] text-[var(--pb-gray)]"
                            >
                              취소
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(c)}
                              className="text-xs px-2 py-1 border border-[var(--pb-light-gray)] hover:border-[var(--pb-jet-black)]"
                            >
                              편집
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="text-xs px-2 py-1 border border-[var(--accent-sale)] text-[var(--accent-sale)] hover:bg-[var(--accent-sale)] hover:text-white flex items-center gap-1"
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
