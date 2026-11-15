"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { KeyRound, Shield, Building, User } from "lucide-react";
import { ChangePasswordDialog } from "@/components/layout/ChangePasswordDialog";

export default function SettingsPage() {
  const { user } = useAuth();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Settings & Organization Context"
        description="Inspect account identity, organization parameters, and active subscription status."
      />

      {/* User Identity Card */}
      <div className="p-6 bg-card border border-border rounded-sm">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-accent" />
          <span className="micro-label">AUTHENTICATED IDENTITY</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <div>
            <span className="text-muted-foreground block text-[11px]">Full Name</span>
            <span className="font-serif text-base font-medium text-foreground block mt-0.5">
              {user?.full_name || "—"}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px]">Email Address</span>
            <span className="font-mono text-foreground block mt-0.5 select-all">
              {user?.email}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px]">Role & Scope</span>
            <div className="mt-1">
              <Badge variant="brass" size="md">
                {user?.role}
              </Badge>
            </div>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px]">Direct Phone</span>
            <span className="font-mono text-foreground block mt-0.5">
              {user?.phone || "No phone recorded"}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px]">Account Created</span>
            <span className="font-mono text-muted-foreground block mt-0.5">
              {formatDate(user?.created_at)}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px]">Security Credentials</span>
            <div className="mt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPasswordDialogOpen(true)}
              >
                <KeyRound className="h-3.5 w-3.5 mr-1" />
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Organization & Subscription Context */}
      {user?.organization && (
        <div className="p-6 bg-card border border-border rounded-sm">
          <div className="flex items-center gap-2 mb-4">
            <Building className="h-4 w-4 text-accent" />
            <span className="micro-label">TENANT SUBSCRIPTION SPECIFICATION</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <span className="text-muted-foreground block text-[11px]">Company Name</span>
              <span className="font-serif text-base font-medium text-foreground block mt-0.5">
                {user.organization.name}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[11px]">Tenant Identifier / Slug</span>
              <span className="font-mono text-foreground block mt-0.5 select-all">
                {user.organization.slug}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[11px]">Subscription State</span>
              <div className="mt-1 flex items-center gap-2">
                <Badge
                  variant={
                    user.organization.subscription_status === "active"
                      ? "success"
                      : user.organization.subscription_status === "trial"
                      ? "warning"
                      : "danger"
                  }
                  size="md"
                >
                  {user.organization.subscription_status.toUpperCase()}
                </Badge>
                {user.organization.is_trial && (
                  <span className="text-[11px] font-mono text-muted-foreground">
                    ({user.organization.trial_days_remaining} trial days remaining)
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-muted-foreground block text-[11px]">Tenant UUID</span>
              <span className="font-mono text-[11px] text-muted-foreground block mt-0.5 select-all">
                {user.organization.id}
              </span>
            </div>
          </div>
        </div>
      )}

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
    </div>
  );
}
