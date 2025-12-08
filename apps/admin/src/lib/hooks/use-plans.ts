
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import { toast } from 'sonner';

export interface Plan {
    id: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    interval: string;
    limits: Record<string, any>;
    isActive: boolean;
    razorpayPlanId: string | null;
    type: string;
    createdAt: string;
    updatedAt: string;
}

interface CreatePlanData {
    name: string;
    description?: string;
    price: number;
    currency?: string;
    interval: string;
    limits: any;
    razorpayPlanId?: string;
    type?: string;
}

interface UpdatePlanData {
    name?: string;
    description?: string;
    price?: number;
    interval?: string;
    limits?: any;
    razorpayPlanId?: string;
    isActive?: boolean;
}

export function usePlans() {
    const queryClient = useQueryClient();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['admin-plans'],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data: Plan[] }>('/admin/plans');
            return data.data;
        },
    });

    const createPlan = useMutation({
        mutationFn: async (planData: CreatePlanData) => {
            const { data } = await apiClient.post('/admin/plans', planData);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
            toast.success('Plan created successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create plan');
        },
    });

    const updatePlan = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdatePlanData }) => {
            const { data: responseData } = await apiClient.put(`/admin/plans/${id}`, data);
            return responseData.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
            toast.success('Plan updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update plan');
        },
    });

    const deletePlan = useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/admin/plans/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
            toast.success('Plan deactivated successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to deactivate plan');
        }
    });

    return {
        plans: data || [],
        isLoading,
        error,
        refetch,
        createPlan,
        updatePlan,
        deletePlan
    };
}
