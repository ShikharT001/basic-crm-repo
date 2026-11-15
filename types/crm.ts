// ==================== ROLES & ENUMS ====================

export type CRMUserRole = "SUPER_ADMIN" | "ORG_ADMIN" | "ORG_USER";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "PROPOSAL_SENT"
  | "CONVERTED"
  | "LOST";

export type LeadPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type LeadSource =
  | "WEBSITE"
  | "REFERRAL"
  | "COLD_CALL"
  | "SOCIAL_MEDIA"
  | "EVENT"
  | "CAMPAIGN"
  | "OTHER";

export type DealStage =
  | "PROSPECTING"
  | "QUALIFICATION"
  | "PROPOSAL"
  | "NEGOTIATION"
  | "CLOSED_WON"
  | "CLOSED_LOST";

export type TransactionType = "PAYMENT" | "INVOICE" | "REFUND" | "DEPOSIT";

export type PaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "UPI"
  | "STRIPE"
  | "CHEQUE"
  | "OTHER";

export type TransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type SubscriptionStatus = "trial" | "active" | "expired" | "suspended";

// ==================== API RESPONSE ENVELOPE ====================

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export interface ResponseEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

// ==================== ENTITY INTERFACES ====================

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  subscription_status: SubscriptionStatus;
  trial_days_remaining: number;
  is_trial: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  role: CRMUserRole;
  organization_id?: string | null;
  organization?: OrganizationSummary | null;
  is_active: boolean;
  last_login_at?: string | null;
  created_at: string;
}

export interface AuthTokenData {
  access_token: string;
  token_type: string;
  expires_in_minutes: number;
  user: UserProfile;
}

export interface Subscription {
  id: string;
  organization_id: string;
  plan_name: string;
  status: SubscriptionStatus;
  is_trial: boolean;
  trial_starts_at: string;
  trial_ends_at: string;
  current_period_start: string;
  current_period_end: string;
  max_users: number;
  days_remaining: number;
  is_valid: boolean;
  notes?: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subscription?: Subscription | null;
  total_users: number;
}

export interface OrgUser {
  id: string;
  organization_id?: string | null;
  email: string;
  full_name: string;
  phone?: string | null;
  role: CRMUserRole;
  is_active: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  organization_id: string;
  title: string;
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
  status: LeadStatus;
  source: LeadSource;
  priority: LeadPriority;
  estimated_value: number;
  currency: string;
  notes?: string | null;
  assigned_to_user_id?: string | null;
  assigned_user_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  organization_id: string;
  first_name: string;
  last_name?: string | null;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  secondary_phone?: string | null;
  job_title?: string | null;
  department?: string | null;
  company_name?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  lead_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  organization_id: string;
  title: string;
  description?: string | null;
  lead_id?: string | null;
  contact_id?: string | null;
  contact_name?: string | null;
  stage: DealStage;
  price: number;
  currency: string;
  probability: number;
  expected_close_date?: string | null;
  closed_at?: string | null;
  assigned_to_user_id?: string | null;
  assigned_user_name?: string | null;
  total_paid_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  organization_id: string;
  transaction_number: string;
  deal_id?: string | null;
  deal_title?: string | null;
  contact_id?: string | null;
  contact_name?: string | null;
  amount: number;
  currency: string;
  type: TransactionType;
  payment_method: PaymentMethod;
  status: TransactionStatus;
  transaction_date: string;
  notes?: string | null;
  recorded_by_user_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CRMMetricsSummary {
  total_leads: number;
  new_leads: number;
  qualified_leads: number;
  won_leads: number;
  total_contacts: number;
  total_deals: number;
  open_deals: number;
  won_deals: number;
  lost_deals: number;
  total_pipeline_value: number;
  total_won_value: number;
  total_revenue_collected: number;
  total_team_members: number;
  max_team_members_allowed: number;
}

export interface CRMDashboardData {
  organization?: OrganizationSummary | null;
  metrics: CRMMetricsSummary;
  recent_leads: Lead[];
  recent_deals: Deal[];
  recent_transactions: Transaction[];
}

export interface SuperAdminStats {
  total_organizations: number;
  active_trials: number;
  active_paid_subscriptions: number;
  expired_subscriptions: number;
  total_system_users: number;
  total_platform_revenue: number;
}

export type LeadCreate = Partial<Lead>;
export type LeadUpdate = Partial<Lead>;
export type DealCreate = Partial<Deal>;
export type DealUpdate = Partial<Deal>;
export type ContactCreate = Partial<Contact>;
export type ContactUpdate = Partial<Contact>;
export type TransactionCreate = Partial<Transaction>;
export type OrgUserCreate = Partial<OrgUser>;

export interface CRMFieldDefinition {
  field: string;
  label: string;
  description: string;
  type: string;
  required: boolean;
}

export interface ImportPreviewData {
  filename: string;
  entity_type: "LEADS" | "CONTACTS";
  total_detected_rows: number;
  detected_columns: string[];
  sample_rows: Record<string, any>[];
  suggested_mapping: Record<string, string>;
  available_crm_fields: CRMFieldDefinition[];
}

export interface RowErrorDetail {
  row_number: number;
  reason: string;
  raw_data?: Record<string, any>;
}

export interface ImportExecuteResult {
  job_id: string;
  filename: string;
  entity_type: "LEADS" | "CONTACTS";
  total_rows: number;
  imported_count: number;
  skipped_count: number;
  errors: RowErrorDetail[];
  created_at: string;
}


