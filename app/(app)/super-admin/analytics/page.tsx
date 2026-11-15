"use client";

import React from "react";
import { useOrganizations } from "@/hooks/useOrganizations";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCell } from "@/components/ui/StatCell";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function SuperAdminAnalyticsPage() {
  const { stats, isLoadingStats, isError, refetch } = useOrganizations();

  if (isLoadingStats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="p-8 text-center border border-dashed border-border rounded-sm bg-card">
        <h2 className="font-serif text-lg font-medium text-foreground">
          Analytics Service Unavailable
        </h2>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          Could not fetch platform owner statistics.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Retry Connection
        </Button>
      </div>
    );
  }

  const subscriptionBreakdown = [
    { name: "Active Trials", count: stats.active_trials, fill: "hsl(var(--accent))" },
    { name: "Active Paid", count: stats.active_paid_subscriptions, fill: "hsl(var(--primary))" },
    { name: "Expired / Suspended", count: stats.expired_subscriptions, fill: "hsl(var(--destructive))" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Master Analytics"
        description="High-level telemetry across all tenant organizations, active trial subscriptions, and system utilization."
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh Telemetry
          </Button>
        }
      />

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCell
          label="TOTAL TENANT ORGANIZATIONS"
          value={stats.total_organizations}
          subValue="Registered companies"
          contextText="All registered platform workspaces"
        />

        <StatCell
          label="ACTIVE 1-MONTH TRIALS"
          value={stats.active_trials}
          subValue="Trial workspaces"
          contextText="Currently running active evaluation periods"
        />

        <StatCell
          label="ACTIVE PAID SUBSCRIPTIONS"
          value={stats.active_paid_subscriptions}
          subValue="Paid accounts"
          contextText="Converted enterprise accounts"
        />

        <StatCell
          label="EXPIRED TRIAL SUBSCRIPTIONS"
          value={stats.expired_subscriptions}
          subValue="Lapsed trials"
          contextText="Accounts pending renewal or upgrade"
        />

        <StatCell
          label="SYSTEM USER ACCOUNTS"
          value={stats.total_system_users}
          subValue="Total users"
          contextText="Active sales reps and org admins across all tenants"
        />

        <StatCell
          label="TOTAL PLATFORM REVENUE"
          value={formatCurrency(stats.total_platform_revenue)}
          subValue="Aggregated cash"
          contextText="Gross volume processed through platform transactions"
        />
      </div>

      {/* Subscription Breakdown Chart */}
      <div className="p-6 bg-card border border-border rounded-sm">
        <div className="mb-4">
          <span className="micro-label">TENANT SUBSCRIPTION DISTRIBUTION</span>
          <h3 className="font-serif text-base font-medium text-foreground mt-0.5">
            Active Trials vs. Paid Subscriptions vs. Expired
          </h3>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subscriptionBreakdown} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                formatter={(val: any) => [val, "Organizations"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  fontSize: 12,
                  borderRadius: 2,
                }}
              />
              <Bar dataKey="count" radius={[2, 2, 0, 0]} barSize={36}>
                {subscriptionBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
