"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function RootPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (user?.role === "SUPER_ADMIN") {
        router.replace("/super-admin/organizations");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground animate-pulse">
        <div className="w-2 h-2 rounded-full bg-accent" />
        LOADING CRM CONTEXT...
      </div>
    </div>
  );
}
