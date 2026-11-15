"use client";

import React, { useState, useEffect } from "react";
import { useContacts } from "@/hooks/useContacts";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { ContactDrawer } from "@/components/features/contacts/ContactDrawer";
import { formatDate } from "@/lib/utils";
import { Contact } from "@/types/crm";
import { Plus, Search, Mail, Phone, Building } from "lucide-react";

export default function ContactsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [defaultEditing, setDefaultEditing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { contacts, meta, isLoading } = useContacts({
    page,
    page_size: 20,
    search: debouncedSearch || undefined,
    company: companyFilter || undefined,
  });

  const columns: Column<Contact>[] = [
    {
      key: "full_name",
      header: "Name / Designation",
      render: (contact) => (
        <div>
          <span className="font-serif font-medium text-foreground block">
            {contact.full_name}
          </span>
          <span className="text-[11px] text-muted-foreground font-sans">
            {contact.job_title || "Contact Person"}
          </span>
        </div>
      ),
    },
    {
      key: "company_name",
      header: "Company",
      render: (contact) => (
        <span className="text-foreground font-medium">
          {contact.company_name || "—"}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email Address",
      className: "font-mono text-muted-foreground",
      render: (contact) => (
        <span className="select-all">
          {contact.email || "—"}
        </span>
      ),
    },
    {
      key: "phone",
      header: "Telephone",
      className: "font-mono text-muted-foreground",
      render: (contact) => (
        <span className="select-all">
          {contact.phone || "—"}
        </span>
      ),
    },
    {
      key: "city",
      header: "Location",
      render: (contact) =>
        contact.city || contact.country ? (
          <span className="text-muted-foreground">
            {[contact.city, contact.state, contact.country].filter(Boolean).join(", ")}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "created_at",
      header: "Registered",
      className: "font-mono text-muted-foreground",
      render: (contact) => formatDate(contact.created_at),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts Directory"
        description="Address book of clients, accounts, and stakeholders across your commercial network."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedContact(null);
              setDefaultEditing(true);
              setDrawerOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Contact
          </Button>
        }
      />

      {/* Search & Filter */}
      <div className="p-3 bg-card border border-border rounded-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search contacts by name, email, phone, city..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8 h-8"
          />
        </div>

        <div className="w-full md:w-60">
          <Input
            placeholder="Filter by company name..."
            value={companyFilter}
            onChange={(e) => {
              setCompanyFilter(e.target.value);
              setPage(1);
            }}
            className="h-8"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="space-y-0">
        <DataTable
          columns={columns}
          data={contacts}
          isLoading={isLoading}
          onRowClick={(contact) => {
            setSelectedContact(contact);
            setDefaultEditing(false);
            setDrawerOpen(true);
          }}
          emptyTitle="No contacts recorded"
          emptyDescription="Your organization has not added any contact profiles yet."
          emptyActionLabel="Add First Contact"
          onEmptyAction={() => {
            setSelectedContact(null);
            setDefaultEditing(true);
            setDrawerOpen(true);
          }}
        />
        <Pagination meta={meta} onPageChange={setPage} isLoading={isLoading} />
      </div>

      <ContactDrawer
        contact={selectedContact}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        defaultEditing={defaultEditing}
      />
    </div>
  );
}
