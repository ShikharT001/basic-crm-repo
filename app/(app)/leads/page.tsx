"use client";

import React, { useState, useEffect } from "react";
import { useLeads } from "@/hooks/useLeads";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { ConfirmationDialog } from "@/components/ui/Dialog";
import { LeadDrawer } from "@/components/features/leads/LeadDrawer";
import { ConvertToDealDialog } from "@/components/features/leads/ConvertToDealDialog";
import { LeadsKanban } from "@/components/features/leads/LeadsKanban";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Lead, LeadPriority, LeadSource, LeadStatus } from "@/types/crm";
import { LayoutGrid, List, Plus, Search, Trash2, ArrowRightLeft, UploadCloud } from "lucide-react";
import { ExcelImportModal } from "@/components/features/imports/ExcelImportModal";

export default function LeadsPage() {
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  // Filters & Pagination State
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<LeadPriority | "">("");
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "">("");

  // Drawer & Dialog State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Debounce search input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { leads, meta, isLoading, deleteLead, isDeleting } = useLeads({
    page,
    page_size: viewMode === "kanban" ? 100 : 20,
    search: debouncedSearch || undefined,
    status_filter: statusFilter || undefined,
    priority_filter: priorityFilter || undefined,
    source_filter: sourceFilter || undefined,
  });

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

  const columns: Column<Lead>[] = [
    {
      key: "title",
      header: "Lead / Requirement",
      render: (lead) => (
        <div>
          <span className="font-serif font-medium text-foreground block">
            {lead.title}
          </span>
          <span className="text-[11px] text-muted-foreground font-sans">
            {lead.first_name || ""} {lead.last_name || ""}
            {lead.company_name ? ` • ${lead.company_name}` : ""}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (lead) => <Badge size="sm">{lead.status}</Badge>,
    },
    {
      key: "priority",
      header: "Priority",
      render: (lead) => (
        <Badge variant={getPriorityVariant(lead.priority)} size="sm">
          {lead.priority}
        </Badge>
      ),
    },
    {
      key: "source",
      header: "Source",
      className: "font-mono text-[11px] text-muted-foreground uppercase",
      render: (lead) => lead.source,
    },
    {
      key: "estimated_value",
      header: "Est. Value",
      className: "text-right font-mono tabular-nums",
      render: (lead) => formatCurrency(lead.estimated_value, lead.currency),
    },
    {
      key: "created_at",
      header: "Created",
      className: "font-mono text-muted-foreground",
      render: (lead) => formatDate(lead.created_at),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (lead) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {lead.status !== "CONVERTED" && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px]"
              title="Convert to Deal"
              onClick={() => {
                setLeadToConvert(lead);
                setConvertDialogOpen(true);
              }}
            >
              <ArrowRightLeft className="h-3 w-3 mr-1 text-accent" />
              Convert
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => {
              setLeadToDelete(lead);
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
        title="Inbound Leads"
        description="Prospective opportunities, pipeline stage qualification, and customer conversion."
        actions={
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center border border-border rounded-sm bg-card p-0.5">
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
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportModalOpen(true)}
            >
              <UploadCloud className="h-3.5 w-3.5 mr-1 text-accent" />
              Import Excel
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedLead(null);
                setDrawerOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              New Lead
            </Button>
          </div>
        }
      />

      {/* Filter Ribbon */}
      <div className="p-3 bg-card border border-border rounded-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search leads, companies, emails..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8 h-8"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <Select
            className="h-8 w-32"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="QUALIFIED">QUALIFIED</option>
            <option value="PROPOSAL_SENT">PROPOSAL_SENT</option>
            <option value="CONVERTED">CONVERTED</option>
            <option value="LOST">LOST</option>
          </Select>

          <Select
            className="h-8 w-32"
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value as any);
              setPage(1);
            }}
          >
            <option value="">All Priorities</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </Select>

          <Select
            className="h-8 w-32"
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value as any);
              setPage(1);
            }}
          >
            <option value="">All Sources</option>
            <option value="WEBSITE">WEBSITE</option>
            <option value="REFERRAL">REFERRAL</option>
            <option value="COLD_CALL">COLD_CALL</option>
            <option value="SOCIAL_MEDIA">SOCIAL_MEDIA</option>
            <option value="EVENT">EVENT</option>
            <option value="CAMPAIGN">CAMPAIGN</option>
            <option value="OTHER">OTHER</option>
          </Select>
        </div>
      </div>

      {/* Main View Mode */}
      {viewMode === "table" ? (
        <div className="space-y-0">
          <DataTable
            columns={columns}
            data={leads}
            isLoading={isLoading}
            onRowClick={(lead) => {
              setSelectedLead(lead);
              setDrawerOpen(true);
            }}
            emptyTitle="No leads found"
            emptyDescription="No leads matched your filter criteria. Create a new lead to start tracking."
            emptyActionLabel="Create Lead"
            onEmptyAction={() => {
              setSelectedLead(null);
              setDrawerOpen(true);
            }}
          />
          <Pagination meta={meta} onPageChange={setPage} isLoading={isLoading} />
        </div>
      ) : (
        <LeadsKanban
          leads={leads}
          onLeadClick={(lead) => {
            setSelectedLead(lead);
            setDrawerOpen(true);
          }}
        />
      )}

      {/* Drawers & Dialogs */}
      <LeadDrawer
        lead={selectedLead}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onConvertToDeal={(lead) => {
          setLeadToConvert(lead);
          setConvertDialogOpen(true);
        }}
      />

      <ConvertToDealDialog
        lead={leadToConvert}
        open={convertDialogOpen}
        onOpenChange={setConvertDialogOpen}
      />

      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Lead Entry"
        description={`Are you certain you want to remove the lead "${leadToDelete?.title}"?`}
        confirmLabel="Delete Lead"
        isLoading={isDeleting}
        onConfirm={async () => {
          if (leadToDelete) {
            await deleteLead(leadToDelete.id);
            setDeleteConfirmOpen(false);
          }
        }}
      />

      <ExcelImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        entityType="LEADS"
        title="Import Leads from Spreadsheet"
      />
    </div>
  );
}
