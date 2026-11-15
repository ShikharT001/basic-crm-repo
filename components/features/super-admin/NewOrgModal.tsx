"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useOrganizations } from "@/hooks/useOrganizations";

const schema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  slug: z.string().optional().or(z.literal("")),
  admin_name: z.string().min(2, "Admin full name is required"),
  admin_email: z.string().email("Valid admin email is required"),
  admin_password: z.string().min(6, "Initial password must be at least 6 characters"),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  trial_days: z.coerce.number().min(1).max(365).default(30),
  max_users: z.coerce.number().min(1).max(1000).default(10),
});

type FormValues = z.infer<typeof schema>;

export function NewOrgModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { createOrganization, isCreating } = useOrganizations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      admin_name: "",
      admin_email: "",
      admin_password: "",
      phone: "",
      website: "",
      trial_days: 30,
      max_users: 10,
    },
  });

  const onSubmit = async (values: FormValues) => {
    await createOrganization({
      ...values,
      slug: values.slug || undefined,
      phone: values.phone || undefined,
      website: values.website || undefined,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
      title="Provision Tenant Organization"
      description="Register a new customer organization onto the platform with a 1-month trial subscription."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="micro-label block mb-1">Company / Organization Name *</label>
            <Input
              placeholder="Apex Global Enterprises"
              error={errors.name?.message}
              {...register("name")}
            />
          </div>
          <div>
            <label className="micro-label block mb-1">Tenant Slug (Optional)</label>
            <Input
              placeholder="apex-global"
              isMono
              {...register("slug")}
            />
          </div>
        </div>

        <div className="p-3 bg-muted/20 border border-border rounded-sm space-y-3">
          <span className="micro-label block">Initial Administrator Account</span>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Admin Full Name *</label>
              <Input
                placeholder="Sarah Connor"
                error={errors.admin_name?.message}
                {...register("admin_name")}
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Admin Email Address *</label>
              <Input
                type="email"
                placeholder="admin@apexglobal.com"
                error={errors.admin_email?.message}
                {...register("admin_email")}
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground block mb-1">Initial Password *</label>
            <Input
              type="password"
              placeholder="••••••••"
              error={errors.admin_password?.message}
              {...register("admin_password")}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="micro-label block mb-1">Trial Duration (Days)</label>
            <Input
              type="number"
              isMono
              placeholder="30"
              error={errors.trial_days?.message}
              {...register("trial_days")}
            />
          </div>
          <div>
            <label className="micro-label block mb-1">User Capacity Limit (Seats)</label>
            <Input
              type="number"
              isMono
              placeholder="10"
              error={errors.max_users?.message}
              {...register("max_users")}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="micro-label block mb-1">Contact Phone</label>
            <Input placeholder="+1-555-0199" {...register("phone")} />
          </div>
          <div>
            <label className="micro-label block mb-1">Website URL</label>
            <Input placeholder="https://apexglobal.com" {...register("website")} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" variant="brass" size="sm" isLoading={isCreating}>
            Provision Organization
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
