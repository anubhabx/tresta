'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface TelemetrySettingsProps {
  projectId: string;
  currentSetting?: 'off' | 'sampled' | 'opt-in';
  samplingRate?: number;
  onUpdate?: (setting: 'off' | 'sampled' | 'opt-in', samplingRate: number) => void;
}

export function TelemetrySettings({ 
  projectId, 
  currentSetting = 'sampled',
  samplingRate = 1,
  onUpdate 
}: TelemetrySettingsProps) {
  const [telemetrySetting, setTelemetrySetting] = useState<'off' | 'sampled' | 'opt-in'>(currentSetting);
  const [rate, setRate] = useState(samplingRate);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (onUpdate) {
        onUpdate(telemetrySetting, rate);
      }
      
      toast.success('Telemetry settings updated successfully');
    } catch (error) {
      toast.error('Failed to update telemetry settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Widget Telemetry Settings
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Control how usage and performance data is collected from your widgets
        </p>
      </div>

      {/* Telemetry Mode Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Telemetry Mode
        </label>
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <input
              type="radio"
              name="telemetry"
              value="off"
              checked={telemetrySetting === 'off'}
              onChange={(e) => setTelemetrySetting(e.target.value as 'off')}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Off (Opt-out)
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                No telemetry data will be collected from your widgets. Use this for maximum privacy.
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <input
              type="radio"
              name="telemetry"
              value="sampled"
              checked={telemetrySetting === 'sampled'}
              onChange={(e) => setTelemetrySetting(e.target.value as 'sampled')}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Sampled (Recommended)
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Collect telemetry from a small percentage of widget loads. Balances insights with privacy.
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <input
              type="radio"
              name="telemetry"
              value="opt-in"
              checked={telemetrySetting === 'opt-in'}
              onChange={(e) => setTelemetrySetting(e.target.value as 'opt-in')}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Full (Opt-in)
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Collect telemetry from all widget loads. Provides maximum insights for optimization.
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Sampling Rate */}
      {telemetrySetting === 'sampled' && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sampling Rate: {rate}%
          </label>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0.1%</span>
            <span>10%</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Approximately {rate}% of widget loads will send telemetry data
          </p>
        </div>
      )}

      {/* Privacy Information */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Privacy & Data Collection
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• No personally identifiable information (PII) is collected</li>
          <li>• Data includes: widget ID, version, load time, layout type, error counts</li>
          <li>• Do Not Track (DNT) browser settings are always respected</li>
          <li>• Data is retained for 90 days maximum</li>
          <li>• Used only for performance optimization and error tracking</li>
        </ul>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Telemetry Settings'}
        </Button>
      </div>
    </div>
  );
}
