'use client';

import { useState, useEffect } from 'react';
import { useAlerts, useUpdateAlertConfig } from '@/lib/hooks/use-alerts';
import { DataTable } from '@/components/tables/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Save, AlertCircle, Bell, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

export function AlertsClient() {
  const { data, isLoading, error, refetch } = useAlerts();
  const updateConfig = useUpdateAlertConfig();

  const [formData, setFormData] = useState({
    emailQuotaThreshold: 80,
    dlqCountThreshold: 10,
    failedJobRateThreshold: 0.1,
    slackWebhookUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (data?.config) {
      setFormData({
        emailQuotaThreshold: data.config.emailQuotaThreshold,
        dlqCountThreshold: data.config.dlqCountThreshold,
        failedJobRateThreshold: data.config.failedJobRateThreshold,
        slackWebhookUrl: data.config.slackWebhookUrl,
      });
    }
  }, [data]);

  const validateField = (name: string, value: any): string | null => {
    switch (name) {
      case 'emailQuotaThreshold':
        if (value < 0 || value > 100) {
          return 'Email quota threshold must be between 0 and 100';
        }
        break;
      case 'dlqCountThreshold':
        if (value < 0) {
          return 'DLQ count threshold must be a positive number';
        }
        break;
      case 'failedJobRateThreshold':
        if (value < 0 || value > 1) {
          return 'Failed job rate threshold must be between 0 and 1';
        }
        break;
      case 'slackWebhookUrl':
        if (value && !value.startsWith('https://hooks.slack.com/')) {
          return 'Invalid Slack webhook URL';
        }
        break;
    }
    return null;
  };

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);

    const error = validateField(name, value);
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) {
        newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix validation errors before saving');
      return;
    }

    try {
      await updateConfig.mutateAsync(formData);
      toast.success('Alert configuration updated successfully');
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to update alert configuration');
    }
  };

  const handleReset = () => {
    if (data?.config) {
      setFormData({
        emailQuotaThreshold: data.config.emailQuotaThreshold,
        dlqCountThreshold: data.config.dlqCountThreshold,
        failedJobRateThreshold: data.config.failedJobRateThreshold,
        slackWebhookUrl: data.config.slackWebhookUrl,
      });
      setErrors({});
      setHasChanges(false);
    }
  };

  const historyColumns = [
    {
      key: 'alertType',
      header: 'Alert Type',
      render: (alert: any) => <Badge variant="warning">{alert.alertType}</Badge>,
    },
    {
      key: 'message',
      header: 'Message',
      render: (alert: any) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">{alert.message}</span>
      ),
    },
    {
      key: 'triggeredAt',
      header: 'Triggered At',
      render: (alert: any) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(alert.triggeredAt)}
        </span>
      ),
    },
    {
      key: 'resolved',
      header: 'Status',
      render: (alert: any) =>
        alert.resolved ? (
          <Badge variant="default">
            <CheckCircle className="h-3 w-3" />
            Resolved
          </Badge>
        ) : (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3" />
            Active
          </Badge>
        ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
          Failed to Load Alerts
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
          {error instanceof Error ? error.message : 'An error occurred'}
        </p>
        <Button variant="destructive" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Alert Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure alert thresholds and notification settings
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Alert Thresholds
            </h2>
          </div>

          <div className="space-y-4">
            {/* Email Quota Threshold */}
            <div>
              <label
                htmlFor="emailQuotaThreshold"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Quota Threshold (%)
              </label>
              <input
                type="number"
                id="emailQuotaThreshold"
                value={formData.emailQuotaThreshold}
                onChange={(e) =>
                  handleChange('emailQuotaThreshold', parseInt(e.target.value) || 0)
                }
                className={`block w-full rounded-md border ${
                  errors.emailQuotaThreshold
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                min="0"
                max="100"
              />
              {errors.emailQuotaThreshold && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.emailQuotaThreshold}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Alert when email quota usage exceeds this percentage (0-100)
              </p>
            </div>

            {/* DLQ Count Threshold */}
            <div>
              <label
                htmlFor="dlqCountThreshold"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                DLQ Count Threshold
              </label>
              <input
                type="number"
                id="dlqCountThreshold"
                value={formData.dlqCountThreshold}
                onChange={(e) => handleChange('dlqCountThreshold', parseInt(e.target.value) || 0)}
                className={`block w-full rounded-md border ${
                  errors.dlqCountThreshold
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                min="0"
              />
              {errors.dlqCountThreshold && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.dlqCountThreshold}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Alert when dead letter queue count exceeds this number
              </p>
            </div>

            {/* Failed Job Rate Threshold */}
            <div>
              <label
                htmlFor="failedJobRateThreshold"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Failed Job Rate Threshold
              </label>
              <input
                type="number"
                id="failedJobRateThreshold"
                value={formData.failedJobRateThreshold}
                onChange={(e) =>
                  handleChange('failedJobRateThreshold', parseFloat(e.target.value) || 0)
                }
                step="0.01"
                className={`block w-full rounded-md border ${
                  errors.failedJobRateThreshold
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                min="0"
                max="1"
              />
              {errors.failedJobRateThreshold && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.failedJobRateThreshold}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Alert when failed job rate exceeds this ratio (0-1, e.g., 0.1 = 10%)
              </p>
            </div>

            {/* Slack Webhook URL */}
            <div>
              <label
                htmlFor="slackWebhookUrl"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Slack Webhook URL (Optional)
              </label>
              <input
                type="url"
                id="slackWebhookUrl"
                value={formData.slackWebhookUrl}
                onChange={(e) => handleChange('slackWebhookUrl', e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className={`block w-full rounded-md border ${
                  errors.slackWebhookUrl
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.slackWebhookUrl && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.slackWebhookUrl}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Slack webhook URL for alert notifications
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || updateConfig.isPending}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={!hasChanges || Object.keys(errors).length > 0 || updateConfig.isPending}
          >
            {updateConfig.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Alert History */}
      {data && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Alert History (Last 7 Days)
          </h2>
          <DataTable
            data={data.history}
            columns={historyColumns}
            emptyMessage="No alerts triggered in the last 7 days"
          />
        </div>
      )}
    </div>
  );
}
