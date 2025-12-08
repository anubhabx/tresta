
import { useApi } from "@/hooks/use-api";
import { QueryClient, MutationCache, QueryCache } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUpgradeModal } from "@/components/billing/upgrade-modal";

const globalErrorHandler = (error: any) => {
  // Check for LIMIT_EXCEEDED error code from backend
  if (error?.response?.data?.code === "LIMIT_EXCEEDED") {
    useUpgradeModal.getState().open();
    return;
  }

  // Optional: Global generic error toast if needed, but usually handled locally
  // toast.error(error.message || "An error occurred");
};

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: globalErrorHandler,
  }),
  queryCache: new QueryCache({
    onError: globalErrorHandler,
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
