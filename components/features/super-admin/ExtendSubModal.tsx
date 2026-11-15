"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Organization } from "@/types/crm";
import { useOrganizations } from "@/hooks/useOrganizations";

const schema = z.object({
  days: z.coerce.number().min(1, "Must extend by at least 1 day").max(365),
  new_status: z.enum(["trial", "active", "suspended"] as const).optional(),
  plan_name: z.string().optional().or(z.literal("")),
  max_users: z.coerce.number().min(1).optional(),
});

type FormValues = z.infer<typeof schema>;

export function ExtendSubModal({
  org,
  open,
  onOpenChange,
}: {
  org: Organization | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { extendSubscription, isExtending } = useOrganizations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      days: 30,
      new_status: "active",
      plan_name: "",
      max_users: 10,
    },
  });

  useEffect(() => {
    if (org?.subscription) {
      reset({
        days: 30,
        new_status: (org.subscription.status as any) || "active",
        plan_name: org.subscription.plan_name || "",
        max_users: org.subscription.max_users || 10,
      });
    }
  }, [org, reset]);

  if (!org) return null;

  const onSubmit = async (values: FormValues) => {
    await extendSubscription({
      id: org.id,
      data: {
        days: values.days,
        new_status: values.new_status,
        plan_name: values.plan_name || undefined,
        max_users: values.max_users,
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Extend Subscription: ${org.name}`}
      description="Grant additional trial or active validity days and adjust user seating capacity."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="micro-label block mb-1">Additional Days *</label>
          <Input
            type="number"
            isMono
            placeholder="30"
            error={errors.days?.message}
            {...register("days")}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="micro-label block mb-1">Subscription Status</label>
            <Select {...register("new_status")}>
              <option value="active">Active (Paid)</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspended</option>
            </Select>
          </div>

          <div>
            <label className="micro-label block mb-1">User Capacity Limit</label>
            <Input
              type="number"
              isMono
              placeholder="10"
              error={errors.max_users?.message}
              {...register("max_users")}
            />
          </div>
        </div>

        <div>
          <label className="micro-label block mb-1">Plan Tier Name</label>
          <Input placeholder="e.g. Enterprise Annual" {...register("plan_name")} />
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
          <Button type="submit" variant="brass" size="sm" isLoading={isExtending}>
            Extend Subscription
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
