import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Deal, DealStage } from "@/types/crm";

export interface DealFilterParams {
  page?: number;
  page_size?: number;
  search?: string;
  stage_filter?: DealStage | "";
  min_price?: number;
  max_price?: number;
  assigned_to_id?: string;
}

export function useDeals(params: DealFilterParams = {}) {
  const queryClient = useQueryClient();
  const queryKey = ["crm", "deals", params];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await api.get<Deal[]>("/deals", params as any);
      return {
        deals: response.data,
        meta: response.meta,
      };
    },
  });

  const createDealMutation = useMutation({
    mutationFn: async (payload: Partial<Deal>) => {
      const response = await api.post<Deal>("/deals", payload);
      return response;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Deal recorded successfully");
      queryClient.invalidateQueries({ queryKey: ["crm", "deals"] });
      queryClient.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.message || "Failed to create deal");
    },
  });

  const updateDealMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Deal> }) => {
      const response = await api.put<Deal>(`/deals/${id}`, data);
      return response;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Deal updated successfully");
      queryClient.invalidateQueries({ queryKey: ["crm", "deals"] });
      queryClient.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.message || "Failed to update deal");
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: DealStage }) => {
      const response = await api.patch<Deal>(`/deals/${id}/stage`, { stage });
      return response;
    },
    onMutate: async ({ id, stage }) => {
      // Cancel ongoing queries so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ["crm", "deals"] });

      // Snapshot previous deals state
      const previousDealsData = queryClient.getQueryData<{ deals: Deal[]; meta?: any }>(queryKey);

      if (previousDealsData) {
        queryClient.setQueryData(queryKey, {
          ...previousDealsData,
          deals: previousDealsData.deals.map((d) =>
            d.id === id ? { ...d, stage } : d
          ),
        });
      }

      return { previousDealsData };
    },
    onError: (err: ApiError, _variables, context) => {
      // Rollback to previous state on failure
      if (context?.previousDealsData) {
        queryClient.setQueryData(queryKey, context.previousDealsData);
      }
      toast.error(err.message || "Failed to transition deal stage. Reverted.");
    },
    onSuccess: (res) => {
      toast.success(res.message || "Deal stage updated");
      queryClient.invalidateQueries({ queryKey: ["crm", "deals"] });
      queryClient.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
  });

  const deleteDealMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<{ deal_id: string }>(`/deals/${id}`);
      return response;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Deal deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["crm", "deals"] });
      queryClient.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.message || "Failed to delete deal");
    },
  });

  return {
    deals: query.data?.deals || [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createDeal: createDealMutation.mutateAsync,
    isCreating: createDealMutation.isPending,
    updateDeal: updateDealMutation.mutateAsync,
    isUpdating: updateDealMutation.isPending,
    updateDealStage: updateStageMutation.mutateAsync,
    isUpdatingStage: updateStageMutation.isPending,
    deleteDeal: deleteDealMutation.mutateAsync,
    isDeleting: deleteDealMutation.isPending,
  };
}
