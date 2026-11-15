"use client";

import React from "react";
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Deal, DealStage } from "@/types/crm";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar, DollarSign, UserCheck } from "lucide-react";

const STAGES: { stage: DealStage; label: string }[] = [
  { stage: "PROSPECTING", label: "Prospecting" },
  { stage: "QUALIFICATION", label: "Qualification" },
  { stage: "PROPOSAL", label: "Proposal" },
  { stage: "NEGOTIATION", label: "Negotiation" },
  { stage: "CLOSED_WON", label: "Closed Won" },
  { stage: "CLOSED_LOST", label: "Closed Lost" },
];

function DraggableDealCard({
  deal,
  onDealClick,
}: {
  deal: Deal;
  onDealClick: (deal: Deal) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: deal.id,
      data: { deal },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onDealClick(deal)}
      className={`p-3 bg-card border border-border rounded-sm hover:border-accent/60 cursor-grab active:cursor-grabbing transition-colors shadow-sm select-none ${
        isDragging ? "opacity-50 ring-1 ring-accent" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <span className="text-xs font-serif font-medium text-foreground line-clamp-1">
          {deal.title}
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground tabular-nums">
          {deal.probability}% win
        </span>
      </div>

      <div className="text-sm font-mono font-medium text-foreground tabular-nums mb-2">
        {formatCurrency(deal.price, deal.currency)}
      </div>

      {deal.contact_name && (
        <div className="text-[11px] text-muted-foreground truncate font-sans mb-1.5 flex items-center gap-1">
          <UserCheck className="h-3 w-3 shrink-0" />
          <span className="truncate">{deal.contact_name}</span>
        </div>
      )}

      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(deal.expected_close_date)}
        </span>
        {deal.total_paid_amount > 0 && (
          <span className="text-emerald-700 dark:text-emerald-400 font-medium tabular-nums flex items-center gap-0.5">
            <DollarSign className="h-3 w-3" />
            Paid: {formatCurrency(deal.total_paid_amount, deal.currency)}
          </span>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({
  stage,
  label,
  deals,
  onDealClick,
}: {
  stage: DealStage;
  label: string;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  const totalValue = deals.reduce((acc, d) => acc + (d.price || 0), 0);
  const currency = deals[0]?.currency || "INR";

  const isWon = stage === "CLOSED_WON";
  const isLost = stage === "CLOSED_LOST";

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-muted/20 border rounded-sm min-w-[240px] transition-colors ${
        isOver
          ? "border-accent ring-1 ring-accent/50 bg-accent/5"
          : isWon
          ? "border-emerald-600/30"
          : isLost
          ? "border-destructive/30"
          : "border-border"
      }`}
    >
      {/* Header */}
      <div className="p-3 border-b border-border bg-card/60">
        <div className="flex items-center justify-between">
          <span className="micro-label">{label}</span>
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground tabular-nums">
            {deals.length}
          </span>
        </div>
        <div className="mt-1 text-xs font-mono font-medium text-foreground tabular-nums">
          {formatCurrency(totalValue, currency)}
        </div>
      </div>

      {/* Cards Scrollable */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[160px]">
        {deals.length === 0 ? (
          <div className="h-28 flex items-center justify-center text-[11px] font-mono text-muted-foreground/50 border border-dashed border-border/60 rounded-[2px]">
            Drop deal here
          </div>
        ) : (
          deals.map((deal) => (
            <DraggableDealCard
              key={deal.id}
              deal={deal}
              onDealClick={onDealClick}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function DealsKanban({
  deals,
  onDealClick,
  onStageChange,
}: {
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  onStageChange: (dealId: string, newStage: DealStage) => void;
}) {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const dealId = active.id as string;
    const targetStage = over.id as DealStage;

    const deal = deals.find((d) => d.id === dealId);
    if (deal && deal.stage !== targetStage) {
      onStageChange(dealId, targetStage);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 overflow-x-auto pb-4">
        {STAGES.map((col) => (
          <KanbanColumn
            key={col.stage}
            stage={col.stage}
            label={col.label}
            deals={deals.filter((d) => d.stage === col.stage)}
            onDealClick={onDealClick}
          />
        ))}
      </div>
    </DndContext>
  );
}
