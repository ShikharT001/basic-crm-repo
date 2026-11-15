"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

export function TrialBanner() {
  const { user, logout } = useAuth();

  if (!user || !user.organization) return null;

  const { is_trial, trial_days_remaining, subscription_status } = user.organization;

  // Blocking modal if trial expired
  const isExpired = is_trial && (trial_days_remaining <= 0 || subscription_status === "expired");

  // Amber warning banner if 7 or fewer days remaining
  const showAmberWarning =
    is_trial && !isExpired && trial_days_remaining <= 7 && trial_days_remaining > 0;

  return (
    <>
      {showAmberWarning && (
        <div className="w-full bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-sans">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              Your free trial expires in{" "}
              <strong className="font-mono font-semibold">
                {trial_days_remaining} {trial_days_remaining === 1 ? "day" : "days"}
              </strong>
              . Contact support or your administrator to upgrade your subscription plan.
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-900 dark:text-amber-200">
            Trial Mode
          </span>
        </div>
      )}

      {isExpired && (
        <Dialog
          open={true}
          onOpenChange={() => {}}
          title="Subscription Trial Expired"
          description="Your organization's 1-month trial period has concluded."
          maxWidth="sm"
        >
          <div className="py-2 text-xs text-muted-foreground leading-relaxed">
            <div className="p-3 mb-4 rounded-sm border border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2.5">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Access Restricted</p>
                <p className="text-[11px] opacity-90">
                  Your trial duration ({trial_days_remaining} days remaining) has ended. Contact your Super Admin or platform owner to renew access.
                </p>
              </div>
            </div>
            <p>
              All organization records, leads, deals, and transactions are preserved securely.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border flex justify-end">
            <Button variant="outline" size="sm" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
}
