"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer } from "@/components/ui/Drawer";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Lead, LeadPriority, LeadSource, LeadStatus } from "@/types/crm";
import { useLeads } from "@/hooks/useLeads";
import { ArrowRightLeft } from "lucide-react";

const schema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  first_name: z.string().optional().nullable(),
  last_name: z.string().optional().nullable(),
  company_name: z.string().optional().nullable(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "CONVERTED", "LOST"] as const),
  source: z.enum(["WEBSITE", "REFERRAL", "COLD_CALL", "SOCIAL_MEDIA", "EVENT", "CAMPAIGN", "OTHER"] as const),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"] as const),
  estimated_value: z.coerce.number().min(0, "Value must be positive").default(0),
  currency: z.string().min(1).default("INR"),
  notes: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

export function LeadDrawer({
  lead,
  open,
  onOpenChange,
  onConvertToDeal,
}: {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConvertToDeal?: (lead: Lead) => void;
}) {
  const isEditing = !!lead;
  const { createLead, updateLead, isCreating, isUpdating } = useLeads();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      first_name: "",
      last_name: "",
      company_name: "",
      email: "",
      phone: "",
      status: "NEW",
      source: "WEBSITE",
      priority: "MEDIUM",
      estimated_value: 0,
      currency: "INR",
      notes: "",
    },
  });

  useEffect(() => {
    if (lead) {
      reset({
        title: lead.title,
        first_name: lead.first_name || "",
        last_name: lead.last_name || "",
        company_name: lead.company_name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        status: lead.status,
        source: lead.source,
        priority: lead.priority,
        estimated_value: lead.estimated_value,
        currency: lead.currency || "INR",
        notes: lead.notes || "",
      });
    } else {
      reset({
        title: "",
        first_name: "",
        last_name: "",
        company_name: "",
        email: "",
        phone: "",
        status: "NEW",
        source: "WEBSITE",
        priority: "MEDIUM",
        estimated_value: 0,
        currency: "INR",
        notes: "",
      });
    }
  }, [lead, reset]);

  const onSubmit = async (values: FormValues) => {
    if (isEditing && lead) {
      await updateLead({ id: lead.id, data: values as any });
    } else {
      await createLead(values as any);
    }
    onOpenChange(false);
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? `Edit Lead: ${lead?.title}` : "Create New Lead Entry"}
      description={
        isEditing
          ? "Update contact info, pipeline qualification status, and opportunity value."
          : "Record an inbound prospect or marketing opportunity in your CRM pipeline."
      }
      width="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {isEditing && lead && onConvertToDeal && lead.status !== "CONVERTED" && (
              <Button
                type="button"
                variant="brass"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onConvertToDeal(lead);
                }}
              >
                <ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" />
                Convert to Deal
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              isLoading={isCreating || isUpdating}
              onClick={handleSubmit(onSubmit)}
            >
              {isEditing ? "Save Changes" : "Create Lead"}
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="micro-label block mb-1">Lead Title / Opportunity *</label>
          <Input
            placeholder="e.g. Enterprise Cloud Deployment"
            error={errors.title?.message}
            {...register("title")}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="micro-label block mb-1">First Name</label>
            <Input placeholder="John" {...register("first_name")} />
          </div>
          <div>
            <label className="micro-label block mb-1">Last Name</label>
            <Input placeholder="Doe" {...register("last_name")} />
          </div>
        </div>

        <div>
          <label className="micro-label block mb-1">Company / Organization</label>
          <Input placeholder="Acme Corp" {...register("company_name")} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="micro-label block mb-1">Email Address</label>
            <Input
              type="email"
              placeholder="john@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>
          <div>
            <label className="micro-label block mb-1">Phone Number</label>
            <Input placeholder="+1-555-0100" {...register("phone")} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="micro-label block mb-1">Status</label>
            <Select {...register("status")}>
              <option value="NEW">NEW</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="QUALIFIED">QUALIFIED</option>
              <option value="PROPOSAL_SENT">PROPOSAL_SENT</option>
              <option value="CONVERTED">CONVERTED</option>
              <option value="LOST">LOST</option>
            </Select>
          </div>

          <div>
            <label className="micro-label block mb-1">Source</label>
            <Select {...register("source")}>
              <option value="WEBSITE">WEBSITE</option>
              <option value="REFERRAL">REFERRAL</option>
              <option value="COLD_CALL">COLD_CALL</option>
              <option value="SOCIAL_MEDIA">SOCIAL_MEDIA</option>
              <option value="EVENT">EVENT</option>
              <option value="CAMPAIGN">CAMPAIGN</option>
              <option value="OTHER">OTHER</option>
            </Select>
          </div>

          <div>
            <label className="micro-label block mb-1">Priority</label>
            <Select {...register("priority")}>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="micro-label block mb-1">Estimated Value</label>
            <Input
              type="number"
              step="0.01"
              isMono
              error={errors.estimated_value?.message}
              {...register("estimated_value")}
            />
          </div>

          <div>
            <label className="micro-label block mb-1">Currency</label>
            <Select {...register("currency")}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="micro-label block mb-1">Qualification Notes</label>
          <Textarea
            rows={3}
            placeholder="Key decision drivers, budget requirements, target timeline..."
            {...register("notes")}
          />
        </div>
      </form>
    </Drawer>
  );
}
