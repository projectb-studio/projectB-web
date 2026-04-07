"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { THEME_PRESETS } from "@/constants/themes";

export default function AdminSettingsPage() {
  const [currentTheme, setCurrentTheme] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setCurrentTheme(data.theme_id);
        setLoading(false);
      });
  }, []);

  async function handleSelect(themeId: string) {
    if (themeId === currentTheme) return;
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme_id: themeId }),
    });
    if (res.ok) {
      setCurrentTheme(themeId);
      alert("테마가 변경되었습니다. 새로고침하면 적용됩니다.");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[var(--pb-silver)]">로딩 중...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading text-xs tracking-[0.15em] uppercase font-semibold mb-1">사이트 테마</h2>
        <p className="text-xs text-[var(--pb-gray)]">사이트 전체 색감을 변경합니다.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {THEME_PRESETS.map((theme) => {
          const isActive = currentTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => handleSelect(theme.id)}
              disabled={saving}
              className={cn(
                "border bg-white p-5 text-left transition-colors relative",
                isActive
                  ? "border-[var(--pb-jet-black)] ring-1 ring-[var(--pb-jet-black)]"
                  : "border-[var(--pb-light-gray)] hover:border-[var(--pb-charcoal)]",
                saving && "opacity-50 cursor-not-allowed"
              )}
            >
              {isActive && (
                <div className="absolute top-3 right-3">
                  <Check size={16} className="text-[var(--pb-jet-black)]" />
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 border border-black/10"
                  style={{ backgroundColor: theme.colors["--pb-snow"] }}
                  title="배경"
                />
                <div
                  className="w-8 h-8 border border-black/10"
                  style={{ backgroundColor: theme.colors["--pb-jet-black"] }}
                  title="전경"
                />
                <div
                  className="w-8 h-8 border border-black/10"
                  style={{ backgroundColor: theme.colors["--pb-accent-terracotta"] }}
                  title="강조"
                />
              </div>

              <p className="text-sm font-medium mb-1">{theme.name}</p>
              <p className="text-xs text-[var(--pb-gray)]">{theme.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
