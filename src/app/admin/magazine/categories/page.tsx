"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  sort_order: number;
}

export default function AdminMagazineCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/magazine/categories");
    if (res.ok) setCategories(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    const res = await fetch("/api/admin/magazine/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), sort_order: categories.length }),
    });
    if (res.ok) {
      setNewName("");
      await fetchCategories();
    }
    setAdding(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" 카테고리를 삭제하시겠습니까?`)) return;
    await fetch(`/api/admin/magazine/categories/${id}`, { method: "DELETE" });
    await fetchCategories();
  }

  const inputClass = "w-full border border-[var(--pb-light-gray)] px-3 py-2.5 text-sm focus:border-[var(--pb-jet-black)] focus:outline-none transition-colors bg-white";

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-sm text-[var(--pb-silver)]">로딩 중...</p></div>;
  }

  return (
    <div className="max-w-xl space-y-6">
      <Link href="/admin/magazine" className="text-xs text-[var(--pb-gray)] hover:text-[var(--pb-jet-black)] flex items-center gap-1">
        <ArrowLeft size={12} /> 매거진 목록
      </Link>

      <div className="border border-[var(--pb-light-gray)] bg-white p-6 space-y-4">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold">카테고리 관리</h2>

        {categories.length === 0 ? (
          <p className="text-sm text-[var(--pb-gray)]">등록된 카테고리가 없습니다.</p>
        ) : (
          <ul className="divide-y divide-[var(--pb-light-gray)]">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center justify-between py-3">
                <span className="text-sm">{cat.name}</span>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-1 text-[var(--pb-silver)] hover:text-[var(--accent-sale)] transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className={inputClass}
            placeholder="새 카테고리명"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newName.trim()}
            className="btn-primary px-4 py-2.5 text-sm flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
          >
            <Plus size={14} />
            추가
          </button>
        </div>
      </div>
    </div>
  );
}
