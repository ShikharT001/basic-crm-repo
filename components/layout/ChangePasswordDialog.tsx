"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z
  .object({
    old_password: z.string().min(6, "Current password must be at least 6 characters"),
    new_password: z.string().min(6, "New password must be at least 6 characters"),
    confirm_password: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "New passwords do not match",
    path: ["confirm_password"],
  });

type FormValues = z.infer<typeof schema>;

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await api.post<boolean>("/auth/change-password", {
        old_password: values.old_password,
        new_password: values.new_password,
      });
      toast.success(response.message || "Password updated successfully.");
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
      title="Change Account Password"
      description="Update your credentials for secure CRM access."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="micro-label block mb-1">Current Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            error={errors.old_password?.message}
            {...register("old_password")}
          />
        </div>

        <div>
          <label className="micro-label block mb-1">New Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            error={errors.new_password?.message}
            {...register("new_password")}
          />
        </div>

        <div>
          <label className="micro-label block mb-1">Confirm New Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            error={errors.confirm_password?.message}
            {...register("confirm_password")}
          />
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
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            Update Password
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
