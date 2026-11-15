"use client";

import React from "react";
import { Lead, LeadStatus } from "@/types/crm";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

const LEAD_COLUMNS: { stage: LeadStatus; label: string }[] = [
  { stage: "NEW", label: "New Leads" },
  { stage: "CONTACTED", label: "Contacted" },
  { stage: "QUALIFIED", label: "Qualified" },
  { stage: "PROPOSAL_SENT", label: "Proposal Sent" },
  { stage: "CONVERTED", label: "Converted" },
  { stage: "LOST", label: "Archived / Lost" },
];

export function LeadsKanban({
  leads,
  onLeadClick,
}: {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}) {
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "danger";
      case "HIGH":
        return "warning";
      case "MEDIUM":
        return "brass";
      default:
        return "neutral";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 overflow-x-auto pb-4">
      {LEAD_COLUMNS.map((col) => {
        const columnLeads = leads.filter((l) => l.status === col.stage);
        const totalEstimatedValue = columnLeads.reduce(
          (acc, curr) => acc + (curr.estimated_value || 0),
          0
        );

        return (
          <div
            key={col.stage}
            className="flex flex-col bg-muted/20 border border-border rounded-sm min-w-[220px]"
          >
            {/* Column Header */}
            <div className="p-3 border-b border-border bg-card/60">
              <div className="flex items-center justify-between">
                <span className="micro-label">{col.label}</span>
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground tabular-nums">
                  {columnLeads.length}
                </span>
              </div>
              <div className="mt-1 text-xs font-mono font-medium text-foreground tabular-nums">
                {formatCurrency(totalEstimatedValue, columnLeads[0]?.currency || "INR")}
              </div>
            </div>

            {/* Column Cards */}
            <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[140px]">
              {columnLeads.length === 0 ? (
                <div className="h-24 flex items-center justify-center text-[11px] font-mono text-muted-foreground/60 border border-dashed border-border/60 rounded-[2px]">
                  Empty
                </div>
              ) : (
                columnLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => onLeadClick(lead)}
                    className="p-3 bg-card border border-border rounded-sm hover:border-accent/60 cursor-pointer transition-colors shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <span className="text-xs font-serif font-medium text-foreground line-clamp-1">
                        {lead.title}
                      </span>
                      <Badge variant={getPriorityVariant(lead.priority)} size="sm">
                        {lead.priority}
                      </Badge>
                    </div>

                    {lead.company_name && (
                      <p className="text-[11px] text-muted-foreground truncate font-sans">
                        {lead.company_name}
                      </p>
                    )}

                    <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-foreground font-medium tabular-nums">
                        {formatCurrency(lead.estimated_value, lead.currency)}
                      </span>
                      <span className="text-muted-foreground text-[10px] uppercase">
                        {lead.source}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
