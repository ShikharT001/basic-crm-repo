"use client";

import React, { useState, useEffect } from "react";
import { useOrganizations } from "@/hooks/useOrganizations";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { NewOrgModal } from "@/components/features/super-admin/NewOrgModal";
import { ExtendSubModal } from "@/components/features/super-admin/ExtendSubModal";
import { formatDate } from "@/lib/utils";
import { Organization, SubscriptionStatus } from "@/types/crm";
import { Plus, Search, CalendarClock, Building2 } from "lucide-react";

export default function SuperAdminOrganizationsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "">("");

  const [newOrgModalOpen, setNewOrgModalOpen] = useState(false);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { organizations, meta, isLoading } = useOrganizations({
    page,
    page_size: 20,
    search: debouncedSearch || undefined,
    status_filter: statusFilter || undefined,
  });

  const getSubBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "trial":
        return "warning";
      case "expired":
      case "suspended":
        return "danger";
      default:
        return "neutral";
    }
  };

  const columns: Column<Organization>[] = [
    {
      key: "name",
      header: "Organization / Company",
      render: (org) => (
        <div>
          <span className="font-serif font-medium text-foreground block">
            {org.name}
          </span>
          <span className="text-[11px] text-muted-foreground font-mono">
            {org.slug} • {org.email || "No email"}
          </span>
        </div>
      ),
    },
    {
      key: "subscription_status",
      header: "Subscription Plan",
      render: (org) => {
        const sub = org.subscription;
        if (!sub) return <Badge size="sm">NONE</Badge>;
        return (
          <div>
            <div className="flex items-center gap-1.5">
              <Badge variant={getSubBadgeVariant(sub.status)} size="sm">
                {sub.status.toUpperCase()}
              </Badge>
              {sub.is_trial && (
                <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400">
                  (Trial)
                </span>
              )}
            </div>
            <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
              {sub.days_remaining} days left • {sub.plan_name}
            </div>
          </div>
        );
      },
    },
    {
      key: "user_capacity",
      header: "Seating / Users",
      className: "font-mono tabular-nums text-xs",
      render: (org) => {
        const max = org.subscription?.max_users || 10;
        return (
          <span>
            {org.total_users} / {max} seats
          </span>
        );
      },
    },
    {
      key: "is_active",
      header: "Status",
      render: (org) => (
        <Badge variant={org.is_active ? "success" : "danger"} size="sm">
          {org.is_active ? "ACTIVE" : "INACTIVE"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Registered",
      className: "font-mono text-muted-foreground",
      render: (org) => formatDate(org.created_at),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (org) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              setSelectedOrg(org);
              setExtendModalOpen(true);
            }}
          >
            <CalendarClock className="h-3 w-3 mr-1 text-accent" />
            Extend Subscription
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenant Organizations Directory"
        description="Platform Super Admin registry of customer companies, 1-month trials, and subscription quotas."
        actions={
          <Button
            variant="brass"
            size="sm"
            onClick={() => setNewOrgModalOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Provision Organization
          </Button>
        }
      />

      {/* Filter Ribbon */}
      <div className="p-3 bg-card border border-border rounded-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search organizations by name, slug, or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8 h-8"
          />
        </div>

        <Select
          className="h-8 w-44"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as any);
            setPage(1);
          }}
        >
          <option value="">All Subscription States</option>
          <option value="trial">Active Trials</option>
          <option value="active">Active (Paid)</option>
          <option value="expired">Expired</option>
          <option value="suspended">Suspended</option>
        </Select>
      </div>

      {/* Organizations Table */}
      <div className="space-y-0">
        <DataTable
          columns={columns}
          data={organizations}
          isLoading={isLoading}
          emptyTitle="No tenant organizations registered"
          emptyDescription="Provision a new organization to start a 1-month trial subscription."
          emptyActionLabel="Provision Organization"
          onEmptyAction={() => setNewOrgModalOpen(true)}
        />
        <Pagination meta={meta} onPageChange={setPage} isLoading={isLoading} />
      </div>

      <NewOrgModal open={newOrgModalOpen} onOpenChange={setNewOrgModalOpen} />

      <ExtendSubModal
        org={selectedOrg}
        open={extendModalOpen}
        onOpenChange={setExtendModalOpen}
      />
    </div>
  );
}
