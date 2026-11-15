"use client";

import React, { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { toast } from "sonner";
import { Lock, Mail, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const expired = searchParams.get("expired");

  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const user = await login(values.email, values.password);
      toast.success(`Welcome back, ${user.full_name || user.email}`);

      if (from) {
        router.push(from);
      } else if (user.role === "SUPER_ADMIN") {
        router.push("/super-admin/organizations");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillSuperAdmin = () => {
    setValue("email", "superadmin@crmplatform.com");
    setValue("password", "SuperAdmin@CRM2026!");
  };

  return (
    <div className="max-w-md w-full mx-auto my-auto py-8">
      {expired && (
        <div className="mb-4 p-3 rounded-sm border border-amber-600/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>Your session has expired. Please authenticate to resume.</span>
        </div>
      )}

      <div className="p-8 bg-card border border-border rounded-sm shadow-dropdown">
        <div className="mb-6">
          <div className="micro-label">AUTHENTICATION PORTAL</div>
          <h1 className="font-serif text-2xl font-normal text-foreground mt-1">
            Sign In to Your Workspace
          </h1>
          <p className="mt-1 text-xs text-muted-foreground font-sans leading-relaxed">
            Access tenant leads, commercial pipeline, and financial ledgers.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="micro-label block mb-1">Account Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="admin@apexsolutions.com"
                className="pl-9"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>
          </div>

          <div>
            <label className="micro-label block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                className="pl-9"
                error={errors.password?.message}
                {...register("password")}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isSubmitting}
          >
            Sign In to CRM
          </Button>
        </form>

        {/* Quick Credential Helper */}
        <div className="mt-6 pt-5 border-t border-border/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-2">
            <span>SEED CREDENTIALS</span>
            <button
              type="button"
              onClick={fillSuperAdmin}
              className="text-accent hover:underline"
            >
              Auto-fill Super Admin
            </button>
          </div>
          <div className="p-2.5 rounded-[2px] bg-muted/30 border border-border text-[11px] font-mono text-muted-foreground space-y-1">
            <div>
              Super Admin:{" "}
              <span className="text-foreground">superadmin@crmplatform.com</span>
            </div>
            <div>
              Password:{" "}
              <span className="text-foreground">SuperAdmin@CRM2026!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 md:p-8">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[2px] bg-accent flex items-center justify-center text-accent-foreground font-serif font-bold text-xs">
            K
          </div>
          <span className="font-serif font-medium text-lg tracking-tight">
            KING Operating System
          </span>
        </div>
        <ThemeToggle />
      </div>

      <Suspense
        fallback={
          <div className="max-w-md w-full mx-auto p-8 text-center text-xs font-mono text-muted-foreground animate-pulse">
            LOADING PORTAL...
          </div>
        }
      >
        <LoginForm />
      </Suspense>

      {/* Footer */}
      <div className="text-center text-[11px] font-mono text-muted-foreground/60 max-w-5xl mx-auto w-full">
        ENTERPRISE MULTI-TENANT ARCHITECTURE • 256-BIT ENCRYPTED SESSION
      </div>
    </div>
  );
}
