"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer } from "@/components/ui/Drawer";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Contact } from "@/types/crm";
import { useContacts } from "@/hooks/useContacts";
import { formatDate } from "@/lib/utils";
import { Mail, Phone, Building, MapPin, Calendar, Edit3, Trash2 } from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/Dialog";

const schema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  secondary_phone: z.string().optional().nullable(),
  job_title: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  company_name: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().default("USA"),
  notes: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

export function ContactDrawer({
  contact,
  open,
  onOpenChange,
  defaultEditing = false,
}: {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEditing?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(defaultEditing);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { createContact, updateContact, deleteContact, isCreating, isUpdating, isDeleting } =
    useContacts();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      secondary_phone: "",
      job_title: "",
      department: "",
      company_name: "",
      address: "",
      city: "",
      state: "",
      country: "USA",
      notes: "",
    },
  });

  useEffect(() => {
    setIsEditing(defaultEditing || !contact);
    if (contact) {
      reset({
        first_name: contact.first_name,
        last_name: contact.last_name || "",
        email: contact.email || "",
        phone: contact.phone || "",
        secondary_phone: contact.secondary_phone || "",
        job_title: contact.job_title || "",
        department: contact.department || "",
        company_name: contact.company_name || "",
        address: contact.address || "",
        city: contact.city || "",
        state: contact.state || "",
        country: contact.country || "USA",
        notes: contact.notes || "",
      });
    } else {
      reset({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        secondary_phone: "",
        job_title: "",
        department: "",
        company_name: "",
        address: "",
        city: "",
        state: "",
        country: "USA",
        notes: "",
      });
    }
  }, [contact, defaultEditing, reset]);

  const onSubmit = async (values: FormValues) => {
    if (contact) {
      await updateContact({ id: contact.id, data: values as any });
      setIsEditing(false);
    } else {
      await createContact(values as any);
      onOpenChange(false);
    }
  };

  const handleDelete = async () => {
    if (!contact) return;
    await deleteContact(contact.id);
    setDeleteConfirmOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        title={
          !contact
            ? "Create New Contact"
            : isEditing
            ? `Edit: ${contact.full_name}`
            : contact.full_name
        }
        description={
          !contact
            ? "Add an individual to your organization's directory."
            : isEditing
            ? "Update contact particulars and organizational relationship."
            : contact.job_title
            ? `${contact.job_title} at ${contact.company_name || "Independent"}`
            : contact.company_name || "Directory Profile"
        }
        width="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <div>
              {contact && !isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {contact && !isEditing ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1" />
                  Edit Contact
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!contact) onOpenChange(false);
                      else setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    isLoading={isCreating || isUpdating}
                    onClick={handleSubmit(onSubmit)}
                  >
                    {contact ? "Save Changes" : "Create Contact"}
                  </Button>
                </>
              )}
            </div>
          </div>
        }
      >
        {contact && !isEditing ? (
          // Read-Only Detail View
          <div className="space-y-6">
            <div className="p-4 bg-muted/20 border border-border rounded-sm space-y-3">
              <div className="flex items-center gap-2.5 text-xs">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-mono text-foreground select-all">
                  {contact.email || "No email recorded"}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-mono text-foreground select-all">
                  {contact.phone || "No direct phone recorded"}
                  {contact.secondary_phone && ` / ${contact.secondary_phone}`}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-foreground">
                  {contact.company_name || "No company recorded"}
                  {contact.department && ` • ${contact.department}`}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-foreground">
                  {[contact.address, contact.city, contact.state, contact.country]
                    .filter(Boolean)
                    .join(", ") || "No address on file"}
                </span>
              </div>
            </div>

            {contact.lead_id && (
              <div className="p-3 bg-card border border-border rounded-sm">
                <span className="micro-label">Originating Lead Association</span>
                <p className="font-mono text-xs text-accent mt-0.5">{contact.lead_id}</p>
              </div>
            )}

            {contact.notes && (
              <div>
                <span className="micro-label block mb-1.5">Context & Notes</span>
                <div className="p-3 bg-card border border-border rounded-sm text-xs font-sans text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {contact.notes}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border flex justify-between text-[11px] font-mono text-muted-foreground">
              <span>CREATED: {formatDate(contact.created_at)}</span>
              <span>UPDATED: {formatDate(contact.updated_at)}</span>
            </div>
          </div>
        ) : (
          // Form View
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="micro-label block mb-1">First Name *</label>
                <Input
                  placeholder="Jim"
                  error={errors.first_name?.message}
                  {...register("first_name")}
                />
              </div>
              <div>
                <label className="micro-label block mb-1">Last Name</label>
                <Input placeholder="Halpert" {...register("last_name")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="micro-label block mb-1">Job Title</label>
                <Input placeholder="Account Executive" {...register("job_title")} />
              </div>
              <div>
                <label className="micro-label block mb-1">Company</label>
                <Input placeholder="Dunder Mifflin" {...register("company_name")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="micro-label block mb-1">Email Address</label>
                <Input
                  type="email"
                  placeholder="jim@example.com"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>
              <div>
                <label className="micro-label block mb-1">Department</label>
                <Input placeholder="Commercial Sales" {...register("department")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="micro-label block mb-1">Primary Phone</label>
                <Input placeholder="+1-555-0155" {...register("phone")} />
              </div>
              <div>
                <label className="micro-label block mb-1">Secondary Phone</label>
                <Input placeholder="+1-555-0156" {...register("secondary_phone")} />
              </div>
            </div>

            <div>
              <label className="micro-label block mb-1">Physical Address</label>
              <Input placeholder="1725 Slough Avenue" {...register("address")} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="micro-label block mb-1">City</label>
                <Input placeholder="Scranton" {...register("city")} />
              </div>
              <div>
                <label className="micro-label block mb-1">State</label>
                <Input placeholder="PA" {...register("state")} />
              </div>
              <div>
                <label className="micro-label block mb-1">Country</label>
                <Input placeholder="USA" {...register("country")} />
              </div>
            </div>

            <div>
              <label className="micro-label block mb-1">Notes & Preferences</label>
              <Textarea
                rows={3}
                placeholder="Preferred communication times, background context..."
                {...register("notes")}
              />
            </div>
          </form>
        )}
      </Drawer>

      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Contact Record"
        description={`Are you certain you wish to delete "${contact?.full_name}"? This action cannot be undone.`}
        confirmLabel="Delete Contact"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
