"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useTransactions } from "@/hooks/useTransactions";
import { useDeals } from "@/hooks/useDeals";
import { useContacts } from "@/hooks/useContacts";

const schema = z.object({
  deal_id: z.string().optional().or(z.literal("")),
  contact_id: z.string().optional().or(z.literal("")),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  currency: z.string().min(1).default("INR"),
  type: z.enum(["PAYMENT", "INVOICE", "REFUND", "DEPOSIT"] as const),
  payment_method: z.enum([
    "CASH",
    "BANK_TRANSFER",
    "CREDIT_CARD",
    "DEBIT_CARD",
    "UPI",
    "STRIPE",
    "CHEQUE",
    "OTHER",
  ] as const),
  status: z.enum(["PENDING", "COMPLETED", "FAILED", "CANCELLED", "REFUNDED"] as const),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function TransactionModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { createTransaction, isCreating } = useTransactions();
  const { deals } = useDeals({ page_size: 100 });
  const { contacts } = useContacts({ page_size: 100 });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      deal_id: "",
      contact_id: "",
      amount: 0,
      currency: "INR",
      type: "PAYMENT",
      payment_method: "BANK_TRANSFER",
      status: "COMPLETED",
      notes: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      deal_id: values.deal_id || null,
      contact_id: values.contact_id || null,
    };
    await createTransaction(payload as any);
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
      title="Record Financial Transaction"
      description="Post a payment, invoice, deposit, or refund entry to the ledger."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="micro-label block mb-1">Amount *</label>
            <Input
              type="number"
              step="0.01"
              isMono
              placeholder="0.00"
              error={errors.amount?.message}
              {...register("amount")}
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

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="micro-label block mb-1">Transaction Type</label>
            <Select {...register("type")}>
              <option value="PAYMENT">PAYMENT</option>
              <option value="INVOICE">INVOICE</option>
              <option value="DEPOSIT">DEPOSIT</option>
              <option value="REFUND">REFUND</option>
            </Select>
          </div>

          <div>
            <label className="micro-label block mb-1">Payment Method</label>
            <Select {...register("payment_method")}>
              <option value="BANK_TRANSFER">BANK_TRANSFER</option>
              <option value="STRIPE">STRIPE</option>
              <option value="CREDIT_CARD">CREDIT_CARD</option>
              <option value="UPI">UPI</option>
              <option value="CASH">CASH</option>
              <option value="CHEQUE">CHEQUE</option>
              <option value="OTHER">OTHER</option>
            </Select>
          </div>

          <div>
            <label className="micro-label block mb-1">Status</label>
            <Select {...register("status")}>
              <option value="COMPLETED">COMPLETED</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="REFUNDED">REFUNDED</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="micro-label block mb-1">Associated Deal (Optional)</label>
            <Select {...register("deal_id")}>
              <option value="">None / Unlinked</option>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.currency} {d.price.toLocaleString()})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="micro-label block mb-1">Associated Contact (Optional)</label>
            <Select {...register("contact_id")}>
              <option value="">None / Unlinked</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.company_name || "Individual"})
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <label className="micro-label block mb-1">Ledger Notes / Reference</label>
          <Textarea
            rows={2}
            placeholder="e.g. Wire confirmation ref #WT-9821, payment milestone 1"
            {...register("notes")}
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
          <Button type="submit" size="sm" isLoading={isCreating}>
            Post Entry
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
