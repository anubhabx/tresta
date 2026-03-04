import { QueryClient, MutationCache, QueryCache } from "@tanstack/react-query";
import { useUpgradeModal } from "@/store/upgrade-modal-store";

type LimitExceededError = {
  response?: {
    data?: {
      code?: string;
      error?: {
        code?: string;
      };
    };
  };
};

const isLimitExceededError = (error: unknown): error is LimitExceededError => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const maybeError = error as LimitExceededError;
  const topLevelCode = maybeError.response?.data?.code;
  const nestedCode = maybeError.response?.data?.error?.code;
  return topLevelCode === "LIMIT_EXCEEDED" || nestedCode === "LIMIT_EXCEEDED";
};

const globalErrorHandler = (error: unknown) => {
  // Check for LIMIT_EXCEEDED error code from backend
  if (isLimitExceededError(error)) {
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
