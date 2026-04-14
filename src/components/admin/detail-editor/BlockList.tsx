"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { Block } from "./types";
import BlockEditor from "./BlockEditor";

export default function BlockList({
  value,
  onChange,
}: {
  value: Block[];
  onChange: (next: Block[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  function onEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return;
    const oldIdx = value.findIndex((b) => b.id === e.active.id);
    const newIdx = value.findIndex((b) => b.id === e.over!.id);
    onChange(arrayMove(value, oldIdx, newIdx));
  }

  function updateAt(id: string, next: Block) {
    onChange(value.map((b) => (b.id === id ? next : b)));
  }
  function remove(id: string) {
    onChange(value.filter((b) => b.id !== id));
  }
  function duplicate(id: string) {
    const idx = value.findIndex((b) => b.id === id);
    const copy = { ...value[idx], id: crypto.randomUUID() } as Block;
    onChange([...value.slice(0, idx + 1), copy, ...value.slice(idx + 1)]);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onEnd}>
      <SortableContext items={value.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {value.map((b) => (
            <SortableCard key={b.id} id={b.id}>
              <BlockEditor
                block={b}
                onChange={(next) => updateAt(b.id, next)}
                onDuplicate={() => duplicate(b.id)}
                onRemove={() => remove(b.id)}
              />
            </SortableCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableCard({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="border border-[var(--pb-light-gray)] bg-white">
      <div
        {...attributes}
        {...listeners}
        className="flex items-center gap-1 cursor-grab active:cursor-grabbing border-b border-[var(--pb-off-white)] px-2 py-1.5 text-xs text-[var(--pb-gray)] select-none"
      >
        <GripVertical className="w-3 h-3" /> 드래그로 순서 변경
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}
