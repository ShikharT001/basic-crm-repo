"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import {
  Menu,
  Search,
  KeyRound,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

export function TopBar({ onMobileMenuClick }: { onMobileMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <>
      <header className="h-14 border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Global Search */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden h-8 w-8 p-0"
            onClick={onMobileMenuClick}
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/70" />
            <input
              type="text"
              placeholder="Search leads, deals, contacts, transactions..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-background border border-border rounded-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring font-sans"
            />
          </div>
        </div>

        {/* Right Side: Theme Toggle & User Menu */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* User Account Popover */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 p-1.5 rounded-sm hover:bg-muted/50 border border-transparent hover:border-border transition-colors text-left"
              aria-label="User account menu"
            >
              <div className="w-7 h-7 rounded-[2px] bg-secondary border border-border flex items-center justify-center font-mono text-xs font-medium text-foreground">
                {initials}
              </div>
              <div className="hidden lg:block">
                <div className="text-xs font-medium leading-none text-foreground truncate max-w-[130px]">
                  {user?.full_name || user?.email}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground leading-none mt-1">
                  {user?.role}
                </div>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground hidden lg:block" />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-56 bg-card border border-border rounded-sm shadow-dropdown z-50 py-1 divide-y divide-border/60 animate-in fade-in-50 duration-100">
                  <div className="p-3">
                    <p className="text-xs font-serif font-medium text-foreground truncate">
                      {user?.full_name}
                    </p>
                    <p className="text-[11px] font-mono text-muted-foreground truncate">
                      {user?.email}
                    </p>
                    {user?.organization && (
                      <p className="text-[10px] text-accent mt-1 uppercase font-mono tracking-wider">
                        {user.organization.name}
                      </p>
                    )}
                  </div>

                  <div className="p-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        setPasswordDialogOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted/50 rounded-[2px] transition-colors"
                    >
                      <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Change Password</span>
                    </button>
                  </div>

                  <div className="p-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-[2px] transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
    </>
  );
}
