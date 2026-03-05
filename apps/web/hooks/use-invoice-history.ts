import { useQuery } from "@tanstack/react-query";
import { useApi } from "./use-api";
import type { ApiSuccessResponse } from "@workspace/types";

export interface InvoiceHistoryItem {
  id: string;
  invoiceId: string | null;
  amount: number | null;
  currency: string | null;
  status: string;
  paidAt: string | null;
  date: string;
  downloadUrl: string | null;
}

interface InvoiceHistoryResponse {
  invoices: InvoiceHistoryItem[];
}

export function useInvoiceHistory() {
  const api = useApi();

  const fetchInvoices = async (): Promise<InvoiceHistoryItem[]> => {
    try {
      const response = await api.get<ApiSuccessResponse<InvoiceHistoryResponse>>(
        "/api/payments/invoices",
      );
      return response.data?.data?.invoices ?? [];
    } catch {
      return [];
    }
  };

  const query = useQuery({
    queryKey: ["invoice-history"],
    queryFn: fetchInvoices,
    staleTime: 1000 * 60 * 5,
  });

  return {
    invoices: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
