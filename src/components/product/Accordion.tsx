"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItem {
  title: string;
  content: string;
}

interface AccordionProps {
  items: AccordionItem[];
}

export function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="border-t border-pb-light-gray">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className="border-b border-pb-light-gray">
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex items-center justify-between w-full py-4 text-left"
            >
              <span className="text-xs font-heading font-semibold uppercase tracking-industrial">
                {item.title}
              </span>
              <ChevronDown
                size={14}
                strokeWidth={1.5}
                className={cn(
                  "text-pb-gray transition-transform duration-200",
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
              <p className="text-sm text-pb-charcoal leading-relaxed whitespace-pre-line">
                {item.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
