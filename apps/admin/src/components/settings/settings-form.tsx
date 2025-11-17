'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSettings, useUpdateSettings } from '@/lib/hooks/use-settings';
import { RefreshCw, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils/format';

export function SettingsForm() {
  const { data: settings, isLoading, error, refetch } = useSettings();
  const updateSettings = useUpdateSettings();

  const [formData, setFormData] = useState({
    emailQuotaLimit: 0,
    ablyConnectionLimit: 0,
    autoModerationEnabled: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        emailQuotaLimit: settings.emailQuotaLimit,
        ablyConnectionLimit: settings.ablyConnectionLimit,
        autoModerationEnabled: settings.autoModerationEnabled,
      });
    }
  }, [settings]);

  const validateField = (name: string, value: any): string | null => {
    switch (name) {
      case 'emailQuotaLimit':
        if (value < 0 || value > 1000000) {
          return 'Email quota must be between 0 and 1,000,000';
        }
        break;
      case 'ablyConnectionLimit':
        if (value < 0 || value > 10000) {
          return 'Ably connection limit must be between 0 and 10,000';
        }
        break;

    }
    return null;
  };

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);

    // Validate field
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

    // Validate all fields
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

    if (!settings) return;

    try {
      await updateSettings.mutateAsync({
        ...formData,
        version: settings.version,
      });
      toast.success('Settings updated successfully');
      setHasChanges(false);
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('Settings were modified by another admin. Please refresh and try again.');
      } else {
        toast.error(error.response?.data?.error?.message || 'Failed to update settings');
      }
    }
  };

  const handleReset = () => {
    if (settings) {
      setFormData({
        emailQuotaLimit: settings.emailQuotaLimit,
        ablyConnectionLimit: settings.ablyConnectionLimit,
        autoModerationEnabled: settings.autoModerationEnabled,
      });
      setErrors({});
      setHasChanges(false);
    }
  };

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
          Failed to Load Settings
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Quota Limit */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Email Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="emailQuotaLimit"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email Quota Limit
            </label>
            <input
              type="number"
              id="emailQuotaLimit"
              value={formData.emailQuotaLimit}
              onChange={(e) => handleChange('emailQuotaLimit', parseInt(e.target.value) || 0)}
              className={`block w-full rounded-md border ${
                errors.emailQuotaLimit
                  ? 'border-red-300 dark:border-red-600'
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              min="0"
              max="1000000"
            />
            {errors.emailQuotaLimit && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.emailQuotaLimit}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Maximum number of emails that can be sent (0-1,000,000)
            </p>
          </div>
        </div>
      </div>

      {/* Ably Connection Limit */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Real-time Connection Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="ablyConnectionLimit"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Ably Connection Limit
            </label>
            <input
              type="number"
              id="ablyConnectionLimit"
              value={formData.ablyConnectionLimit}
              onChange={(e) => handleChange('ablyConnectionLimit', parseInt(e.target.value) || 0)}
              className={`block w-full rounded-md border ${
                errors.ablyConnectionLimit
                  ? 'border-red-300 dark:border-red-600'
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              min="0"
              max="10000"
            />
            {errors.ablyConnectionLimit && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.ablyConnectionLimit}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Maximum number of concurrent Ably connections (0-10,000)
            </p>
          </div>
        </div>
      </div>

      {/* Auto-Moderation Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Auto-Moderation Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="autoModerationEnabled"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Enable Auto-Moderation
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Automatically moderate testimonials based on content analysis
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.autoModerationEnabled}
              onClick={() => handleChange('autoModerationEnabled', !formData.autoModerationEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.autoModerationEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.autoModerationEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>


        </div>
      </div>



      {/* Metadata */}
      {settings && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Version: {settings.version}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={!hasChanges || updateSettings.isPending}
        >
          Reset
        </Button>
        <Button
          type="submit"
          disabled={!hasChanges || Object.keys(errors).length > 0 || updateSettings.isPending}
        >
          {updateSettings.isPending ? (
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
  );
}
