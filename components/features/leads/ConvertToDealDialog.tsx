"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Lead } from "@/types/crm";
import { useLeads } from "@/hooks/useLeads";

const schema = z.object({
  deal_title: z.string().min(2, "Deal title must be at least 2 characters"),
  deal_price: z.coerce.number().min(0, "Price must be greater than or equal to 0"),
  deal_stage: z.string().default("QUALIFIED"),
  create_contact: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

export function ConvertToDealDialog({
  lead,
  open,
  onOpenChange,
}: {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { convertLead, isConverting } = useLeads();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      deal_title: "",
      deal_price: 0,
      deal_stage: "QUALIFIED",
      create_contact: true,
    },
  });

  useEffect(() => {
    if (lead) {
      reset({
        deal_title: `${lead.company_name || lead.title} - Deal`,
        deal_price: lead.estimated_value || 0,
        deal_stage: "QUALIFIED",
        create_contact: true,
      });
    }
  }, [lead, reset]);

  if (!lead) return null;

  const onSubmit = async (values: FormValues) => {
    await convertLead({
      id: lead.id,
      data: values,
    });
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Convert Lead to Deal & Contact"
      description={`Promote prospective lead "${lead.title}" directly into your active commercial sales pipeline.`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="micro-label block mb-1">Deal Title</label>
          <Input
            placeholder="Commercial contract title"
            error={errors.deal_title?.message}
            {...register("deal_title")}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="micro-label block mb-1">Agreed Value / Price</label>
            <Input
              type="number"
              step="0.01"
              isMono
              error={errors.deal_price?.message}
              {...register("deal_price")}
            />
          </div>

          <div>
            <label className="micro-label block mb-1">Initial Deal Stage</label>
            <Select {...register("deal_stage")}>
              <option value="PROSPECTING">PROSPECTING</option>
              <option value="QUALIFIED">QUALIFIED</option>
              <option value="PROPOSAL">PROPOSAL</option>
              <option value="NEGOTIATION">NEGOTIATION</option>
            </Select>
          </div>
        </div>

        <div className="p-3 bg-muted/30 border border-border rounded-sm flex items-start gap-2.5">
          <input
            type="checkbox"
            id="create_contact"
            className="mt-0.5 rounded border-border"
            {...register("create_contact")}
          />
          <label htmlFor="create_contact" className="text-xs text-foreground font-sans">
            <span className="font-medium block">Create Contact Record</span>
            <span className="text-[11px] text-muted-foreground block">
              Automatically persist {lead.first_name || ""} {lead.last_name || ""} ({lead.email || "No email"}) into your organization&apos;s Contacts directory.
            </span>
          </label>
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
          <Button type="submit" variant="brass" size="sm" isLoading={isConverting}>
            Confirm & Convert
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
