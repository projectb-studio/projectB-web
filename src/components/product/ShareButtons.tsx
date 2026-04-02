"use client";

import { useState } from "react";
import { Link2, MessageCircle } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getUrl = () => url || window.location.href;

  const handleKakaoShare = () => {
    const shareUrl = `https://sharer.kakao.com/talk/friends/picker/shorturl?url=${encodeURIComponent(getUrl())}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = getUrl();
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleKakaoShare}
        aria-label={`${title} 카카오톡 공유`}
        className="flex items-center justify-center w-9 h-9 border border-[var(--pb-light-gray)] text-[var(--pb-gray)] hover:border-[var(--pb-jet-black)] hover:text-[var(--pb-jet-black)] transition-colors"
      >
        <MessageCircle size={16} strokeWidth={1.5} />
      </button>
      <button
        type="button"
        onClick={handleCopyLink}
        aria-label="링크 복사"
        className="relative flex items-center justify-center w-9 h-9 border border-[var(--pb-light-gray)] text-[var(--pb-gray)] hover:border-[var(--pb-jet-black)] hover:text-[var(--pb-jet-black)] transition-colors"
      >
        <Link2 size={16} strokeWidth={1.5} />
        {copied && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-[var(--pb-jet-black)] bg-[var(--pb-off-white)] border border-[var(--pb-light-gray)] px-2 py-0.5">
            복사 완료!
          </span>
        )}
      </button>
    </div>
  );
}
