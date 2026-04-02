import { Suspense } from "react";
import type { Metadata } from "next";
import { CSContent } from "./CSContent";

export const metadata: Metadata = {
  title: "고객센터",
  description: "FAQ, Q&A, 기타 문의, 도매/제휴 문의, 공지사항",
};

export default function CSPage() {
  return (
    <Suspense>
      <CSContent />
    </Suspense>
  );
}
