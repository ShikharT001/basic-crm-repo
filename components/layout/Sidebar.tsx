"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Target,
  Briefcase,
  Users2,
  Receipt,
  UserCheck,
  Settings,
  Building2,
  BarChart3,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

export function Sidebar({
  mobileOpen = false,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const role = user?.role;

  let navItems: NavItem[] = [];

  if (role === "SUPER_ADMIN") {
    navItems = [
      { label: "Organizations", href: "/super-admin/organizations", icon: Building2 },
      { label: "Platform Analytics", href: "/super-admin/analytics", icon: BarChart3 },
    ];
  } else if (role === "ORG_ADMIN") {
    navItems = [
      { label: "Ledger Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Leads", href: "/leads", icon: Target },
      { label: "Deals & Pipeline", href: "/deals", icon: Briefcase },
      { label: "Contacts", href: "/contacts", icon: Users2 },
      { label: "Transactions", href: "/transactions", icon: Receipt },
      { label: "Team & Capacity", href: "/team", icon: UserCheck },
      { label: "Settings", href: "/settings", icon: Settings },
    ];
  } else {
    // ORG_USER
    navItems = [
      { label: "Ledger Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Leads", href: "/leads", icon: Target },
      { label: "Deals & Pipeline", href: "/deals", icon: Briefcase },
      { label: "Contacts", href: "/contacts", icon: Users2 },
      { label: "Transactions", href: "/transactions", icon: Receipt },
      { label: "Settings", href: "/settings", icon: Settings },
    ];
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card border-r border-border w-64 select-none">
      {/* Brand Header */}
      <div className="h-14 px-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-[2px] bg-accent flex items-center justify-center text-accent-foreground font-serif font-bold text-xs">
            K
          </div>
          <span className="font-serif font-medium text-base tracking-tight text-foreground">
            KING CRM
          </span>
          <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/80 px-1.5 py-0.5 rounded bg-muted/50 border border-border">
            v1.0
          </span>
        </div>

        {mobileOpen && (
          <button
            onClick={onMobileClose}
            className="md:hidden p-1 rounded text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Organization Banner */}
      <div className="px-5 py-3 border-b border-border/60 bg-muted/20">
        <div className="micro-label">Active Scope</div>
        <div className="text-xs font-serif font-medium text-foreground truncate mt-0.5">
          {user?.organization?.name || "Global Platform Master"}
        </div>
        <div className="text-[10px] font-mono text-muted-foreground truncate">
          Role: <span className="text-accent">{role}</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-2 mb-2 micro-label">
          {role === "SUPER_ADMIN" ? "Platform Control" : "Tenant Operations"}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onMobileClose && onMobileClose()}
              className={cn(
                "group flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-xs transition-colors duration-150",
                isActive
                  ? "bg-secondary text-foreground font-medium border-l-2 border-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-accent" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="truncate tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer System Info */}
      <div className="p-3 border-t border-border text-[11px] font-mono text-muted-foreground/70 bg-card">
        <div className="flex justify-between items-center">
          <span>SECURE PROTOCOL</span>
          <span className="text-emerald-600 dark:text-emerald-400">● LIVE</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-background/80 backdrop-blur-[2px]">
          <div className="relative flex-1 max-w-xs w-full bg-card animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
          <div className="flex-1" onClick={onMobileClose} />
        </div>
      )}
    </>
  );
}
