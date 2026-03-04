import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./use-api";

export function useCancelSubscription() {
  const api = useApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      await api.post("/api/payments/cancel");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["subscription-details"] });
    },
  });

  return {
    cancelSubscription: mutation.mutateAsync,
    isCanceling: mutation.isPending,
  };
}
