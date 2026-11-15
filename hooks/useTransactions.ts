import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Transaction, TransactionStatus, TransactionType } from "@/types/crm";

export interface TransactionFilterParams {
  page?: number;
  page_size?: number;
  status_filter?: TransactionStatus | "";
  type_filter?: TransactionType | "";
  deal_id?: string;
  contact_id?: string;
}

export function useTransactions(params: TransactionFilterParams = {}) {
  const queryClient = useQueryClient();
  const queryKey = ["crm", "transactions", params];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await api.get<Transaction[]>("/transactions", params as any);
      return {
        transactions: response.data,
        meta: response.meta,
      };
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (payload: Partial<Transaction>) => {
      const response = await api.post<Transaction>("/transactions", payload);
      return response;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Transaction entry posted");
      queryClient.invalidateQueries({ queryKey: ["crm", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["crm", "deals"] });
      queryClient.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.message || "Failed to post transaction");
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Transaction> }) => {
      const response = await api.put<Transaction>(`/transactions/${id}`, data);
      return response;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Transaction status updated");
      queryClient.invalidateQueries({ queryKey: ["crm", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.message || "Failed to update transaction");
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<{ transaction_id: string }>(`/transactions/${id}`);
      return response;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Transaction voided");
      queryClient.invalidateQueries({ queryKey: ["crm", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.message || "Failed to delete transaction");
    },
  });

  return {
    transactions: query.data?.transactions || [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createTransaction: createTransactionMutation.mutateAsync,
    isCreating: createTransactionMutation.isPending,
    updateTransaction: updateTransactionMutation.mutateAsync,
    isUpdating: updateTransactionMutation.isPending,
    deleteTransaction: deleteTransactionMutation.mutateAsync,
    isDeleting: deleteTransactionMutation.isPending,
  };
}
