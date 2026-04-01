import { Suspense } from "react";
import type { Metadata } from "next";
import { CSContent } from "./CSContent";

export const metadata: Metadata = {
  title: "고객센터",
  description: "FAQ, 1:1 문의, 교환/반품 안내",
};

export default function CSPage() {
  return (
    <Suspense>
      <CSContent />
    </Suspense>
  );
}
