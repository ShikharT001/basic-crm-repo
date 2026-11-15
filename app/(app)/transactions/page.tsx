"use client";

import React, { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { ConfirmationDialog } from "@/components/ui/Dialog";
import { TransactionModal } from "@/components/features/transactions/TransactionModal";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Transaction, TransactionStatus, TransactionType } from "@/types/crm";
import { Plus, Trash2, Receipt } from "lucide-react";

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "">("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "">("");

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [txnToDelete, setTxnToDelete] = useState<Transaction | null>(null);

  const { transactions, meta, isLoading, deleteTransaction, isDeleting } = useTransactions({
    page,
    page_size: 20,
    status_filter: statusFilter || undefined,
    type_filter: typeFilter || undefined,
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "FAILED":
      case "CANCELLED":
        return "danger";
      case "REFUNDED":
        return "warning";
      default:
        return "neutral";
    }
  };

  const columns: Column<Transaction>[] = [
    {
      key: "transaction_number",
      header: "Reference #",
      className: "font-mono font-medium text-foreground select-all",
    },
    {
      key: "type",
      header: "Type & Rail",
      render: (t) => (
        <div>
          <span className="font-mono text-xs font-medium text-foreground uppercase block">
            {t.type}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground uppercase">
            {t.payment_method}
          </span>
        </div>
      ),
    },
    {
      key: "association",
      header: "Deal / Contact Link",
      render: (t) => (
        <div>
          <span className="font-medium text-foreground text-xs block">
            {t.deal_title || "General Ledger"}
          </span>
          <span className="text-[11px] text-muted-foreground font-sans">
            {t.contact_name || "No linked contact"}
          </span>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Monetary Amount",
      className: "text-right font-mono tabular-nums font-medium",
      render: (t) => (
        <span
          className={
            t.type === "REFUND"
              ? "text-destructive"
              : t.status === "COMPLETED"
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-foreground"
          }
        >
          {t.type === "REFUND" ? "-" : "+"}
          {formatCurrency(t.amount, t.currency)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (t) => <Badge variant={getStatusVariant(t.status)} size="sm">{t.status}</Badge>,
    },
    {
      key: "transaction_date",
      header: "Posted Date",
      className: "font-mono text-muted-foreground",
      render: (t) => formatDateTime(t.transaction_date),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (t) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => {
              setTxnToDelete(t);
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
        title="Financial Transactions Ledger"
        description="Accounting ledger of customer payments, milestone deposits, and issued invoices."
        actions={
          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Record Transaction
          </Button>
        }
      />

      {/* Filter Ribbon */}
      <div className="p-3 bg-card border border-border rounded-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-muted-foreground" />
          <span className="micro-label">LEDGER FILTERING</span>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Select
            className="h-8 w-36"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as any);
              setPage(1);
            }}
          >
            <option value="">All Types</option>
            <option value="PAYMENT">PAYMENT</option>
            <option value="INVOICE">INVOICE</option>
            <option value="DEPOSIT">DEPOSIT</option>
            <option value="REFUND">REFUND</option>
          </Select>

          <Select
            className="h-8 w-36"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="REFUNDED">REFUNDED</option>
          </Select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="space-y-0">
        <DataTable
          columns={columns}
          data={transactions}
          isLoading={isLoading}
          emptyTitle="No financial transactions recorded"
          emptyDescription="There are no payment or invoice records matching this filter."
          emptyActionLabel="Post Transaction"
          onEmptyAction={() => setModalOpen(true)}
        />
        <Pagination meta={meta} onPageChange={setPage} isLoading={isLoading} />
      </div>

      <TransactionModal open={modalOpen} onOpenChange={setModalOpen} />

      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Void / Delete Transaction"
        description={`Are you certain you wish to remove transaction record "${txnToDelete?.transaction_number}"? This will update deal total paid metrics.`}
        confirmLabel="Void Transaction"
        isLoading={isDeleting}
        onConfirm={async () => {
          if (txnToDelete) {
            await deleteTransaction(txnToDelete.id);
            setDeleteConfirmOpen(false);
          }
        }}
      />
    </div>
  );
}
