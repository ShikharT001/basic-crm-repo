"use client";

import React, { useState, useEffect } from "react";
import { useDeals } from "@/hooks/useDeals";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { ConfirmationDialog } from "@/components/ui/Dialog";
import { DealDrawer } from "@/components/features/deals/DealDrawer";
import { DealsKanban } from "@/components/features/deals/DealsKanban";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Deal, DealStage } from "@/types/crm";
import { LayoutGrid, List, Plus, Search, Trash2, Calendar, UserCheck } from "lucide-react";

export default function DealsPage() {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  // Filters & State
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<DealStage | "">("");
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();

  // Drawers & Modals
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { deals, meta, isLoading, updateDealStage, deleteDeal, isDeleting } = useDeals({
    page,
    page_size: viewMode === "kanban" ? 100 : 20,
    search: debouncedSearch || undefined,
    stage_filter: stageFilter || undefined,
    min_price: minPrice,
    max_price: maxPrice,
  });

  const columns: Column<Deal>[] = [
    {
      key: "title",
      header: "Deal Title / Client",
      render: (deal) => (
        <div>
          <span className="font-serif font-medium text-foreground block">
            {deal.title}
          </span>
          <span className="text-[11px] text-muted-foreground font-sans">
            {deal.contact_name ? `Contact: ${deal.contact_name}` : "Unlinked"}
          </span>
        </div>
      ),
    },
    {
      key: "stage",
      header: "Pipeline Stage",
      render: (deal) => (
        <Badge
          variant={
            deal.stage === "CLOSED_WON"
              ? "success"
              : deal.stage === "CLOSED_LOST"
              ? "danger"
              : "neutral"
          }
          size="sm"
        >
          {deal.stage}
        </Badge>
      ),
    },
    {
      key: "price",
      header: "Price",
      className: "text-right font-mono tabular-nums",
      render: (deal) => formatCurrency(deal.price, deal.currency),
    },
    {
      key: "probability",
      header: "Win Probability",
      className: "font-mono tabular-nums",
      render: (deal) => `${deal.probability}%`,
    },
    {
      key: "total_paid_amount",
      header: "Paid Amount",
      className: "text-right font-mono tabular-nums",
      render: (deal) =>
        deal.total_paid_amount > 0 ? (
          <span className="text-emerald-700 dark:text-emerald-400 font-medium">
            {formatCurrency(deal.total_paid_amount, deal.currency)}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "expected_close_date",
      header: "Close Date",
      className: "font-mono text-muted-foreground",
      render: (deal) => formatDate(deal.expected_close_date),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (deal) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => {
              setDealToDelete(deal);
              setDeleteConfirmOpen(true);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commercial Deals & Pipeline"
        description="Active revenue opportunities, probability forecasting, and contract lifecycle."
        actions={
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center border border-border rounded-sm bg-card p-0.5">
              <button
                onClick={() => setViewMode("kanban")}
                className={`p-1.5 rounded-[2px] transition-colors ${
                  viewMode === "kanban"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Kanban Board View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-[2px] transition-colors ${
                  viewMode === "table"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Table List View"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedDeal(null);
                setDrawerOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              New Deal
            </Button>
          </div>
        }
      />

      {/* Filter Ribbon */}
      <div className="p-3 bg-card border border-border rounded-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search deals by title..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8 h-8"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <Select
            className="h-8 w-40"
            value={stageFilter}
            onChange={(e) => {
              setStageFilter(e.target.value as any);
              setPage(1);
            }}
          >
            <option value="">All Pipeline Stages</option>
            <option value="PROSPECTING">PROSPECTING</option>
            <option value="QUALIFICATION">QUALIFICATION</option>
            <option value="PROPOSAL">PROPOSAL</option>
            <option value="NEGOTIATION">NEGOTIATION</option>
            <option value="CLOSED_WON">CLOSED_WON</option>
            <option value="CLOSED_LOST">CLOSED_LOST</option>
          </Select>

          <Input
            type="number"
            placeholder="Min Price"
            className="h-8 w-28"
            isMono
            value={minPrice ?? ""}
            onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
          />

          <Input
            type="number"
            placeholder="Max Price"
            className="h-8 w-28"
            isMono
            value={maxPrice ?? ""}
            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>

      {/* View Rendering */}
      {viewMode === "kanban" ? (
        <DealsKanban
          deals={deals}
          onDealClick={(deal) => {
            setSelectedDeal(deal);
            setDrawerOpen(true);
          }}
          onStageChange={(dealId, newStage) => {
            updateDealStage({ id: dealId, stage: newStage });
          }}
        />
      ) : (
        <div className="space-y-0">
          <DataTable
            columns={columns}
            data={deals}
            isLoading={isLoading}
            onRowClick={(deal) => {
              setSelectedDeal(deal);
              setDrawerOpen(true);
            }}
            emptyTitle="No deals recorded"
            emptyDescription="No pipeline opportunities match your criteria. Record a new deal to track contracts."
            emptyActionLabel="Record Deal"
            onEmptyAction={() => {
              setSelectedDeal(null);
              setDrawerOpen(true);
            }}
          />
          <Pagination meta={meta} onPageChange={setPage} isLoading={isLoading} />
        </div>
      )}

      {/* Drawers & Dialogs */}
      <DealDrawer
        deal={selectedDeal}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />

      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Deal Record"
        description={`Are you certain you wish to remove the deal "${dealToDelete?.title}"? Associated transaction history will be unlinked.`}
        confirmLabel="Delete Deal"
        isLoading={isDeleting}
        onConfirm={async () => {
          if (dealToDelete) {
            await deleteDeal(dealToDelete.id);
            setDeleteConfirmOpen(false);
          }
        }}
      />
    </div>
  );
}
