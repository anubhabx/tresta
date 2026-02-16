'use client';

import { useQuery } from '@tanstack/react-query';

import { apiClient } from '../api-client';
import { API_ENDPOINTS, QUERY_KEYS } from '../constants';

export interface BillingOverview {
  subscriptions: {
    active: number;
    pastDue: number;
    paused: number;
    canceled: number;
  };
  payments: {
    successCount: number;
    failedCount: number;
    grossCollected: number;
    grossCollectedLast30Days: number;
    currencyHint: string;
  };
}

export interface BillingRecord {
  id: string;
  user: {
    id: string;
    email: string;
    name: string;
    currentPlan: 'FREE' | 'PRO';
  };
  plan: {
    id: string;
    name: string;
    type: 'FREE' | 'PRO';
    interval: string;
    price: number;
  } | null;
  subscription: {
    id: string;
    externalId: string | null;
    status: string;
    providerStatus: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  };
  payment: {
    paymentId: string | null;
    invoiceId: string | null;
    amount: number | null;
    currency: string | null;
    paymentStatus: string | null;
    invoiceStatus: string | null;
    eventType: string;
    eventCreatedAt: string | null;
    paidAt: string | null;
    failedAt: string | null;
  };
  createdAt: string;
}

interface BillingOverviewResponse {
  success: boolean;
  data: BillingOverview;
}

interface BillingRecordsResponse {
  success: boolean;
  data: {
    records: BillingRecord[];
    nextCursor: string | null;
    hasMore: boolean;
  };
}

export interface UseBillingRecordsParams {
  search?: string;
  planId?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

export function useBillingOverview() {
  return useQuery({
    queryKey: QUERY_KEYS.BILLING_OVERVIEW,
    queryFn: async () => {
      const response = await apiClient.get<BillingOverviewResponse>(
        API_ENDPOINTS.BILLING_OVERVIEW,
      );
      return response.data.data;
    },
  });
}

export function useBillingRecords(params?: UseBillingRecordsParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.BILLING_RECORDS, params],
    queryFn: async () => {
      const response = await apiClient.get<BillingRecordsResponse>(
        API_ENDPOINTS.BILLING_RECORDS,
        {
          params,
        },
      );
      return response.data.data;
    },
  });
}
