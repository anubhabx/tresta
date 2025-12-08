
'use client';

import { useMemo, useState } from 'react';
import { usePlans, type Plan } from '@/lib/hooks/use-plans';
import { DataTable, type DataTableColumn } from '@/components/tables/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';
import { PlanDialog } from './plan-dialog';

export function PlansClient() {
    const { plans, isLoading, error, refetch, deletePlan } = usePlans();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const columns: DataTableColumn<Plan>[] = useMemo(
        () => [
            {
                key: 'name',
                header: 'Name',
                render: (plan) => (
                    <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {plan.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {plan.description}
                        </div>
                    </div>
                ),
            },
            {
                key: 'price',
                header: 'Price',
                render: (plan) => (
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: plan.currency }).format(plan.price / 100)} / {plan.interval}
                    </span>
                ),
            },
            {
                key: 'type',
                header: 'Type',
                render: (plan) => (
                    <Badge variant={plan.type === 'PRO' ? 'default' : 'secondary'}>
                        {plan.type}
                    </Badge>
                ),
            },
            {
                key: 'isActive',
                header: 'Status',
                render: (plan) => (
                    <Badge variant={plan.isActive ? 'outline' : 'destructive'}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                ),
            },
            {
                key: 'razorpayPlanId',
                header: 'Razorpay ID',
                render: (plan) => (
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                        {plan.razorpayPlanId || 'N/A'}
                    </code>
                ),
            },
            {
                key: 'createdAt',
                header: 'Created At',
                render: (plan) => (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(plan.createdAt)}
                    </span>
                ),
            },
            {
                key: 'actions',
                header: 'Actions',
                render: (plan) => (
                    <div className="flex gap-2">
                        {plan.isActive && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    if (confirm('Are you sure you want to deactivate this plan?')) {
                                        deletePlan.mutate(plan.id);
                                    }
                                }}
                                disabled={deletePlan.isPending}
                            >
                                Deactivate
                            </Button>
                        )}
                    </div>
                )
            }
        ],
        [deletePlan]
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Plans</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Manage subscription plans and pricing
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => refetch()} variant="outline" disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <PlanDialog />
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                        Failed to Load Plans
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                        {error instanceof Error ? error.message : 'An error occurred'}
                    </p>
                    <Button variant="destructive" onClick={() => refetch()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </div>
            )}

            {/* Table */}
            {isLoading && (
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            )}

            {!isLoading && !error && (
                <DataTable
                    data={plans}
                    columns={columns}
                    emptyMessage="No plans found"
                />
            )}
        </div>
    );
}
