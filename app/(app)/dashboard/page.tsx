"use client";

import React from "react";
import Link from "next/link";
import { useDashboard } from "@/hooks/useDashboard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCell } from "@/components/ui/StatCell";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Deal, Lead, Transaction } from "@/types/crm";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ArrowUpRight, Plus, RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const { dashboard, isLoading, isError, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-14 bg-muted/40 animate-pulse rounded-sm" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="p-8 text-center border border-dashed border-border rounded-sm bg-card">
        <h2 className="font-serif text-lg font-medium text-foreground">
          Unable to Load Dashboard
        </h2>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          Could not communicate with the CRM metrics service.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Retry Connection
        </Button>
      </div>
    );
  }

  const { metrics, organization, recent_leads, recent_deals, recent_transactions } =
    dashboard;

  // Chart data 1: Commercial Pipeline Distribution
  const pipelineChartData = [
    { name: "Active Pipeline", value: metrics.total_pipeline_value, fill: "hsl(var(--muted-foreground))" },
    { name: "Won Contracts", value: metrics.total_won_value, fill: "hsl(var(--accent))" },
    { name: "Cash Collected", value: metrics.total_revenue_collected, fill: "hsl(var(--primary))" },
  ];

  // Chart data 2: Lead Funnel Breakdown
  const leadFunnelData = [
    { stage: "Total Leads", count: metrics.total_leads },
    { stage: "New Inbound", count: metrics.new_leads },
    { stage: "Qualified", count: metrics.qualified_leads },
    { stage: "Converted/Won", count: metrics.won_leads },
  ];

  // Lead Columns for Recent Table
  const leadColumns: Column<Lead>[] = [
    {
      key: "title",
      header: "Lead",
      render: (l) => (
        <div>
          <div className="font-medium text-foreground">{l.title}</div>
          <div className="text-[11px] text-muted-foreground font-sans">
            {l.company_name || l.email || "No company"}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (l) => <Badge size="sm">{l.status}</Badge>,
    },
    {
      key: "estimated_value",
      header: "Value",
      className: "text-right font-mono tabular-nums",
      render: (l) => formatCurrency(l.estimated_value, l.currency),
    },
    {
      key: "created_at",
      header: "Date",
      className: "font-mono text-muted-foreground",
      render: (l) => formatDate(l.created_at),
    },
  ];

  // Deal Columns for Recent Table
  const dealColumns: Column<Deal>[] = [
    {
      key: "title",
      header: "Deal Title",
      render: (d) => (
        <div>
          <div className="font-medium text-foreground">{d.title}</div>
          <div className="text-[11px] text-muted-foreground font-sans">
            {d.contact_name || "Unassigned contact"}
          </div>
        </div>
      ),
    },
    {
      key: "stage",
      header: "Stage",
      render: (d) => (
        <Badge
          variant={
            d.stage === "CLOSED_WON"
              ? "success"
              : d.stage === "CLOSED_LOST"
              ? "danger"
              : "neutral"
          }
          size="sm"
        >
          {d.stage}
        </Badge>
      ),
    },
    {
      key: "price",
      header: "Price",
      className: "text-right font-mono tabular-nums",
      render: (d) => formatCurrency(d.price, d.currency),
    },
    {
      key: "probability",
      header: "Win %",
      className: "font-mono tabular-nums",
      render: (d) => `${d.probability}%`,
    },
  ];

  // Transaction Columns for Recent Table
  const txnColumns: Column<Transaction>[] = [
    {
      key: "transaction_number",
      header: "Reference",
      className: "font-mono text-xs text-foreground font-medium",
    },
    {
      key: "type",
      header: "Type",
      render: (t) => (
        <span className="font-mono text-[10px] uppercase text-muted-foreground">
          {t.type} • {t.payment_method}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (t) => (
        <Badge
          variant={t.status === "COMPLETED" ? "success" : t.status === "FAILED" ? "danger" : "warning"}
          size="sm"
        >
          {t.status}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      className: "text-right font-mono tabular-nums font-medium",
      render: (t) => formatCurrency(t.amount, t.currency),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ledger Dashboard"
        description="Unified commercial position, lead acquisition funnel, and transaction statements."
        badge={
          organization && (
            <Badge variant="brass" size="md">
              {organization.name}
            </Badge>
          )
        }
        actions={
          <div className="flex items-center gap-2">
            <Link href="/leads">
              <Button variant="outline" size="sm">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Lead
              </Button>
            </Link>
            <Link href="/transactions">
              <Button variant="primary" size="sm">
                Record Payment
              </Button>
            </Link>
          </div>
        }
      />

      {/* Top Statement Stat Cells */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCell
          label="GROSS PIPELINE VALUE"
          value={formatCurrency(metrics.total_pipeline_value)}
          subValue={`${metrics.open_deals} active deals`}
          contextText={`${metrics.total_deals} total pipeline opportunities`}
        />
        <StatCell
          label="CLOSED WON CONTRACTS"
          value={formatCurrency(metrics.total_won_value)}
          subValue={`${metrics.won_deals} won`}
          contextText={`Lost deals: ${metrics.lost_deals}`}
        />
        <StatCell
          label="CASH COLLECTED"
          value={formatCurrency(metrics.total_revenue_collected)}
          subValue="Ledger verified"
          contextText="Total realized payments received"
        />
        <StatCell
          label="TEAM SEAT CAPACITY"
          value={`${metrics.total_team_members} / ${metrics.max_team_members_allowed}`}
          subValue="Seats"
          contextText={
            metrics.total_team_members >= metrics.max_team_members_allowed
              ? "Plan capacity reached"
              : `${metrics.max_team_members_allowed - metrics.total_team_members} available seats`
          }
        />
      </div>

      {/* Editorial Charts (Minimal, Financial Ledger Styled) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline Value Bar Chart */}
        <div className="p-4 bg-card border border-border rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="micro-label">CAPITAL DISTRIBUTION</span>
              <h3 className="font-serif text-sm font-medium text-foreground mt-0.5">
                Pipeline Value vs. Closed Cash
              </h3>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">INR (₹)</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineChartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  width={110}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), "Value"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    fontSize: 12,
                    borderRadius: 2,
                  }}
                />
                <Bar dataKey="value" radius={[0, 2, 2, 0]} barSize={18}>
                  {pipelineChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Qualification Funnel Chart */}
        <div className="p-4 bg-card border border-border rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="micro-label">ACQUISITION FUNNEL</span>
              <h3 className="font-serif text-sm font-medium text-foreground mt-0.5">
                Lead Qualification Conversion
              </h3>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">Prospects</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadFunnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="stage"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  formatter={(val: any) => [val, "Count"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    fontSize: 12,
                    borderRadius: 2,
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[2, 2, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="micro-label">RECENT INBOUND LEADS</span>
            <Link
              href="/leads"
              className="text-xs font-mono text-accent hover:underline flex items-center gap-0.5"
            >
              All leads <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <DataTable
            columns={leadColumns}
            data={recent_leads}
            emptyTitle="No recent leads"
            emptyDescription="Inbound marketing leads will appear here."
          />
        </div>

        {/* Recent Deals */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="micro-label">RECENT PIPELINE DEALS</span>
            <Link
              href="/deals"
              className="text-xs font-mono text-accent hover:underline flex items-center gap-0.5"
            >
              All deals <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <DataTable
            columns={dealColumns}
            data={recent_deals}
            emptyTitle="No active deals"
            emptyDescription="Commercial opportunities will appear here."
          />
        </div>
      </div>

      {/* Recent Ledger Transactions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="micro-label">RECENT LEDGER TRANSACTIONS</span>
          <Link
            href="/transactions"
            className="text-xs font-mono text-accent hover:underline flex items-center gap-0.5"
          >
            All transactions <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <DataTable
          columns={txnColumns}
          data={recent_transactions}
          emptyTitle="No recent transactions"
          emptyDescription="Posted invoices and payments will appear here."
        />
      </div>
    </div>
  );
}
