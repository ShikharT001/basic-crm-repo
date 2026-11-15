"use client";

import React, { useState, useEffect } from "react";
import { useOrgUsers } from "@/hooks/useOrgUsers";
import { useDashboard } from "@/hooks/useDashboard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { ConfirmationDialog } from "@/components/ui/Dialog";
import { OrgUserModal } from "@/components/features/team/OrgUserModal";
import { formatDate } from "@/lib/utils";
import { CRMUserRole, OrgUser } from "@/types/crm";
import { Plus, Search, ShieldCheck, UserX, AlertCircle, Edit3 } from "lucide-react";

export default function TeamPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<CRMUserRole | "">("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<OrgUser | null>(null);
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<OrgUser | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { users, meta, isLoading, deleteUser, isDeleting } = useOrgUsers({
    page,
    page_size: 20,
    search: debouncedSearch || undefined,
    role_filter: roleFilter || undefined,
  });

  const { dashboard } = useDashboard();
  const totalMembers = dashboard?.metrics.total_team_members ?? users.length;
  const maxAllowed = dashboard?.metrics.max_team_members_allowed ?? 10;
  const isFull = totalMembers >= maxAllowed;

  const columns: Column<OrgUser>[] = [
    {
      key: "full_name",
      header: "Member Name",
      render: (u) => (
        <div>
          <span className="font-serif font-medium text-foreground block">
            {u.full_name}
          </span>
          <span className="text-[11px] text-muted-foreground font-mono">
            {u.email}
          </span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Access Role",
      render: (u) => (
        <Badge variant={u.role === "ORG_ADMIN" ? "brass" : "neutral"} size="sm">
          {u.role === "ORG_ADMIN" ? "ADMINISTRATOR" : "STANDARD REP"}
        </Badge>
      ),
    },
    {
      key: "phone",
      header: "Contact Phone",
      className: "font-mono text-muted-foreground",
      render: (u) => u.phone || "—",
    },
    {
      key: "is_active",
      header: "Account State",
      render: (u) => (
        <Badge variant={u.is_active ? "success" : "danger"} size="sm">
          {u.is_active ? "ACTIVE" : "DEACTIVATED"}
        </Badge>
      ),
    },
    {
      key: "last_login_at",
      header: "Last Session",
      className: "font-mono text-muted-foreground",
      render: (u) => formatDate(u.last_login_at),
    },
    {
      key: "created_at",
      header: "Provisioned",
      className: "font-mono text-muted-foreground",
      render: (u) => formatDate(u.created_at),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (u) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setSelectedUser(u);
              setModalOpen(true);
            }}
            title="Edit member"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          {u.is_active && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => {
                setUserToDeactivate(u);
                setDeactivateConfirmOpen(true);
              }}
              title="Deactivate account"
            >
              <UserX className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team & Seating Capacity"
        description="Manage organization users, role permissions, and subscription seat limits."
        actions={
          <div className="relative group">
            <Button
              variant="primary"
              size="sm"
              disabled={isFull}
              onClick={() => {
                setSelectedUser(null);
                setModalOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Member
            </Button>
            {isFull && (
              <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block z-50 p-2 text-[11px] font-sans bg-card border border-border rounded-sm shadow-dropdown text-muted-foreground whitespace-nowrap">
                Plan user limit reached. Contact Super Admin to extend.
              </div>
            )}
          </div>
        }
      />

      {/* Capacity Gauge Banner */}
      <div className="p-4 bg-card border border-border rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="micro-label">SUBSCRIPTION SEATING GAUGE</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-serif text-foreground font-medium">
              {totalMembers} / {maxAllowed} Members
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              ({Math.round((totalMembers / maxAllowed) * 100)}% capacity)
            </span>
          </div>
          {isFull && (
            <p className="text-xs text-destructive flex items-center gap-1.5 mt-1 font-sans">
              <AlertCircle className="h-3.5 w-3.5" />
              Your plan seating capacity has been fully allocated. Contact Super Admin to extend.
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full md:w-64">
          <div className="h-2 w-full bg-muted/60 border border-border/80 rounded-[2px] overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isFull ? "bg-destructive" : "bg-accent"
              }`}
              style={{ width: `${Math.min(100, (totalMembers / maxAllowed) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="p-3 bg-card border border-border rounded-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8 h-8"
          />
        </div>

        <Select
          className="h-8 w-44"
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as any);
            setPage(1);
          }}
        >
          <option value="">All Access Roles</option>
          <option value="ORG_ADMIN">Administrators</option>
          <option value="ORG_USER">Standard Reps</option>
        </Select>
      </div>

      {/* Team Table */}
      <div className="space-y-0">
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          onRowClick={(user) => {
            setSelectedUser(user);
            setModalOpen(true);
          }}
          emptyTitle="No team members found"
          emptyDescription="There are no user accounts matching this query."
          emptyActionLabel={!isFull ? "Add Team Member" : undefined}
          onEmptyAction={() => {
            setSelectedUser(null);
            setModalOpen(true);
          }}
        />
        <Pagination meta={meta} onPageChange={setPage} isLoading={isLoading} />
      </div>

      <OrgUserModal
        user={selectedUser}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      <ConfirmationDialog
        open={deactivateConfirmOpen}
        onOpenChange={setDeactivateConfirmOpen}
        title="Deactivate Team Member"
        description={`Are you certain you wish to deactivate access for "${userToDeactivate?.full_name}"? Their account will be revoked, freeing up 1 seat in your plan.`}
        confirmLabel="Deactivate Account"
        isLoading={isDeleting}
        onConfirm={async () => {
          if (userToDeactivate) {
            await deleteUser(userToDeactivate.id);
            setDeactivateConfirmOpen(false);
          }
        }}
      />
    </div>
  );
}
