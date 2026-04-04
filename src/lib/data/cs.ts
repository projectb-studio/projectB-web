export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export async function getFaqItems(): Promise<FaqItem[]> {
  try {
    const res = await fetch("/api/faq");
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback handled below
  }
  return [];
}
