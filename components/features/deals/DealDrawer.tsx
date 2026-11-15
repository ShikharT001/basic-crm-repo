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
import { Deal, DealStage } from "@/types/crm";
import { useDeals } from "@/hooks/useDeals";

const schema = z.object({
  title: z.string().min(2, "Deal title must be at least 2 characters"),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "Price must be positive"),
  currency: z.string().min(1).default("INR"),
  probability: z.coerce.number().min(0).max(100).default(50),
  stage: z.enum([
    "PROSPECTING",
    "QUALIFICATION",
    "PROPOSAL",
    "NEGOTIATION",
    "CLOSED_WON",
    "CLOSED_LOST",
  ] as const),
  expected_close_date: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

export function DealDrawer({
  deal,
  open,
  onOpenChange,
}: {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEditing = !!deal;
  const { createDeal, updateDeal, isCreating, isUpdating } = useDeals();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      currency: "INR",
      probability: 50,
      stage: "PROSPECTING",
      expected_close_date: "",
    },
  });

  useEffect(() => {
    if (deal) {
      reset({
        title: deal.title,
        description: deal.description || "",
        price: deal.price,
        currency: deal.currency || "INR",
        probability: deal.probability,
        stage: deal.stage,
        expected_close_date: deal.expected_close_date
          ? deal.expected_close_date.split("T")[0]
          : "",
      });
    } else {
      reset({
        title: "",
        description: "",
        price: 0,
        currency: "INR",
        probability: 50,
        stage: "PROSPECTING",
        expected_close_date: "",
      });
    }
  }, [deal, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      expected_close_date: values.expected_close_date
        ? new Date(values.expected_close_date).toISOString()
        : null,
    };

    if (isEditing && deal) {
      await updateDeal({ id: deal.id, data: payload as any });
    } else {
      await createDeal(payload as any);
    }
    onOpenChange(false);
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? `Edit Deal: ${deal?.title}` : "Record Commercial Deal"}
      description={
        isEditing
          ? "Update agreed contract pricing, pipeline stage, and win probability."
          : "Add an opportunity into your active revenue pipeline."
      }
      width="lg"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
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
            {isEditing ? "Save Deal" : "Create Deal"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="micro-label block mb-1">Contract / Deal Title *</label>
          <Input
            placeholder="e.g. Annual Cloud Infrastructure Contract"
            error={errors.title?.message}
            {...register("title")}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="micro-label block mb-1">Contract Price *</label>
            <Input
              type="number"
              step="0.01"
              isMono
              error={errors.price?.message}
              {...register("price")}
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="micro-label block mb-1">Pipeline Stage</label>
            <Select {...register("stage")}>
              <option value="PROSPECTING">PROSPECTING</option>
              <option value="QUALIFICATION">QUALIFICATION</option>
              <option value="PROPOSAL">PROPOSAL</option>
              <option value="NEGOTIATION">NEGOTIATION</option>
              <option value="CLOSED_WON">CLOSED_WON</option>
              <option value="CLOSED_LOST">CLOSED_LOST</option>
            </Select>
          </div>

          <div>
            <label className="micro-label block mb-1">Win Probability (%)</label>
            <Input
              type="number"
              min="0"
              max="100"
              isMono
              placeholder="50"
              error={errors.probability?.message}
              {...register("probability")}
            />
          </div>
        </div>

        <div>
          <label className="micro-label block mb-1">Expected Close Date</label>
          <Input type="date" {...register("expected_close_date")} />
        </div>

        <div>
          <label className="micro-label block mb-1">Deal Scope & Notes</label>
          <Textarea
            rows={3}
            placeholder="Contract deliverables, payment terms, key milestones..."
            {...register("description")}
          />
        </div>
      </form>
    </Drawer>
  );
}
