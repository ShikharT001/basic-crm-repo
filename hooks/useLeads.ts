import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import {
  Lead,
  LeadPriority,
  LeadSource,
  LeadStatus,
  PaginationMeta,
} from "@/types/crm";

export interface LeadFilterParams {
  page?: number;
  page_size?: number;
  search?: string;
  status_filter?: LeadStatus | "";
  priority_filter?: LeadPriority | "";
  source_filter?: LeadSource | "";
  assigned_to_id?: string;
}

export interface LeadConvertPayload {
  deal_title?: string;
  deal_price?: number;
  deal_stage?: string;
  create_contact?: boolean;
}

export function useLeads(params: LeadFilterParams = {}) {
  const queryClient = useQueryClient();

  const queryKey = ["crm", "leads", params];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await api.get<Lead[]>("/leads", params as any);
      return {
        leads: response.data,
        meta: response.meta,
      };
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: async (payload: Partial<Lead>) => {
      const response = await api.post<Lead>("/leads", payload);
      return response;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Lead created successfully");
      queryClient.invalidateQueries({ queryKey: ["crm", "leads"] });
      queryClient.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.message || "Failed to create lead");
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Lead> }) => {
      const response = await api.put<Lead>(`/leads/${id}`, data);
      return response;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Lead updated successfully");
      queryClient.invalidateQueries({ queryKey: ["crm", "leads"] });
      queryClient.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.message || "Failed to update lead");
    },
  });

  const convertLeadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: LeadConvertPayload }) => {
      const response = await api.post<{ deal: any; contact: any; lead_id: string }>(
        `/leads/${id}/convert-to-deal`,
        data
      );
      return response;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Lead converted to deal successfully");
      queryClient.invalidateQueries({ queryKey: ["crm", "leads"] });
      queryClient.invalidateQueries({ queryKey: ["crm", "deals"] });
      queryClient.invalidateQueries({ queryKey: ["crm", "contacts"] });
      queryClient.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.message || "Failed to convert lead to deal");
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<{ lead_id: string }>(`/leads/${id}`);
      return response;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Lead deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["crm", "leads"] });
      queryClient.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.message || "Failed to delete lead");
    },
  });

  return {
    leads: query.data?.leads || [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createLead: createLeadMutation.mutateAsync,
    isCreating: createLeadMutation.isPending,
    updateLead: updateLeadMutation.mutateAsync,
    isUpdating: updateLeadMutation.isPending,
    convertLead: convertLeadMutation.mutateAsync,
    isConverting: convertLeadMutation.isPending,
    deleteLead: deleteLeadMutation.mutateAsync,
    isDeleting: deleteLeadMutation.isPending,
  };
}
