"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
}

export function QuantitySelector({ min = 1, max = 99, onChange }: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(1);

  function update(next: number) {
    const clamped = Math.min(max, Math.max(min, next));
    setQuantity(clamped);
    onChange?.(clamped);
  }

  return (
    <div className="inline-flex items-center border border-pb-light-gray">
      <button
        onClick={() => update(quantity - 1)}
        disabled={quantity <= min}
        className="w-10 h-10 flex items-center justify-center text-pb-gray hover:text-pb-jet-black disabled:opacity-30 transition-colors"
      >
        <Minus size={14} strokeWidth={1.5} />
      </button>
      <span className="w-10 h-10 flex items-center justify-center text-sm font-medium text-pb-jet-black border-x border-pb-light-gray">
        {quantity}
      </span>
      <button
        onClick={() => update(quantity + 1)}
        disabled={quantity >= max}
        className="w-10 h-10 flex items-center justify-center text-pb-gray hover:text-pb-jet-black disabled:opacity-30 transition-colors"
      >
        <Plus size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}
