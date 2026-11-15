"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { OrgUser } from "@/types/crm";
import { useOrgUsers } from "@/hooks/useOrgUsers";

const schema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Valid corporate email address required"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  phone: z.string().optional().nullable(),
  role: z.enum(["ORG_USER", "ORG_ADMIN"] as const),
});

type FormValues = z.infer<typeof schema>;

export function OrgUserModal({
  user,
  open,
  onOpenChange,
}: {
  user: OrgUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEditing = !!user;
  const { createUser, updateUser, isCreating, isUpdating } = useOrgUsers();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      phone: "",
      role: "ORG_USER",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name,
        email: user.email,
        password: "",
        phone: user.phone || "",
        role: user.role === "ORG_ADMIN" ? "ORG_ADMIN" : "ORG_USER",
      });
    } else {
      reset({
        full_name: "",
        email: "",
        password: "",
        phone: "",
        role: "ORG_USER",
      });
    }
  }, [user, reset]);

  const onSubmit = async (values: FormValues) => {
    if (isEditing && user) {
      const payload: any = {
        full_name: values.full_name,
        phone: values.phone || null,
        role: values.role,
      };
      if (values.password && values.password.length >= 6) {
        payload.password = values.password;
      }
      await updateUser({ id: user.id, data: payload });
    } else {
      if (!values.password) {
        return;
      }
      await createUser({
        full_name: values.full_name,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
        role: values.role,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? `Edit Team Member: ${user?.full_name}` : "Add Organization Team Member"}
      description={
        isEditing
          ? "Update member access role, telephone, or reset account password."
          : "Provision a new login account. This consumes 1 seat under your plan's user capacity."
      }
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="micro-label block mb-1">Full Name *</label>
          <Input
            placeholder="e.g. Pam Beesly"
            error={errors.full_name?.message}
            {...register("full_name")}
          />
        </div>

        <div>
          <label className="micro-label block mb-1">Corporate Email Address *</label>
          <Input
            type="email"
            placeholder="pam@company.com"
            disabled={isEditing}
            error={errors.email?.message}
            {...register("email")}
          />
          {isEditing && (
            <p className="mt-1 text-[10px] text-muted-foreground font-mono">
              Email identity cannot be altered once created.
            </p>
          )}
        </div>

        <div>
          <label className="micro-label block mb-1">
            {isEditing ? "New Password (Leave blank to keep unchanged)" : "Account Password *"}
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="micro-label block mb-1">Access Role</label>
            <Select {...register("role")}>
              <option value="ORG_USER">ORG_USER (Standard Rep)</option>
              <option value="ORG_ADMIN">ORG_ADMIN (Administrator)</option>
            </Select>
          </div>

          <div>
            <label className="micro-label block mb-1">Direct Phone</label>
            <Input placeholder="+1-555-0199" {...register("phone")} />
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
          <Button type="submit" size="sm" isLoading={isCreating || isUpdating}>
            {isEditing ? "Save Member" : "Create Account"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
