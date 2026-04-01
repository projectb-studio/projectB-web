import { Suspense } from "react";
import type { Metadata } from "next";
import { NoticeContent } from "./NoticeContent";

export const metadata: Metadata = {
  title: "공지사항",
  description: "PROJECT B의 공지사항과 이벤트 소식",
};

export default function NoticePage() {
  return (
    <Suspense>
      <NoticeContent />
    </Suspense>
  );
}
