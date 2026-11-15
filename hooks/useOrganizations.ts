import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Organization, SubscriptionStatus, SuperAdminStats } from "@/types/crm";

export interface OrgFilterParams {
  page?: number;
  page_size?: number;
  search?: string;
  status_filter?: SubscriptionStatus | "";
}

export interface CreateOrgPayload {
  name: string;
  slug?: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
  phone?: string;
  website?: string;
  trial_days?: number;
  max_users?: number;
}

export interface ExtendSubscriptionPayload {
  days: number;
  new_status?: string;
  plan_name?: string;
  max_users?: number;
}

export function useOrganizations(params: OrgFilterParams = {}) {
  const queryClient = useQueryClient();
  const queryKey = ["crm", "super_admin", "organizations", params];

  const orgsQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await api.get<Organization[]>("/super-admin/organizations", params as any);
      return {
        organizations: response.data,
        meta: response.meta,
      };
    },
  });

  const statsQuery = useQuery({
    queryKey: ["crm", "super_admin", "stats"],
    queryFn: async () => {
      const response = await api.get<SuperAdminStats>("/super-admin/stats");
      return response.data;
    },
  });

  const createOrgMutation = useMutation({
    mutationFn: async (payload: CreateOrgPayload) => {
      const response = await api.post<Organization>("/super-admin/organizations", payload);
      return response;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Organization & trial created successfully");
      queryClient.invalidateQueries({ queryKey: ["crm", "super_admin"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.message || "Failed to create organization");
    },
  });

  const extendSubscriptionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ExtendSubscriptionPayload }) => {
      const response = await api.post<Organization>(
        `/super-admin/organizations/${id}/subscription/extend`,
        data
      );
      return response;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Subscription updated and extended");
      queryClient.invalidateQueries({ queryKey: ["crm", "super_admin"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.message || "Failed to extend subscription");
    },
  });

  return {
    organizations: orgsQuery.data?.organizations || [],
    meta: orgsQuery.data?.meta,
    isLoading: orgsQuery.isLoading,
    isError: orgsQuery.isError,
    error: orgsQuery.error,
    refetch: orgsQuery.refetch,
    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading,
    createOrganization: createOrgMutation.mutateAsync,
    isCreating: createOrgMutation.isPending,
    extendSubscription: extendSubscriptionMutation.mutateAsync,
    isExtending: extendSubscriptionMutation.isPending,
  };
}
