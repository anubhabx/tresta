'use client';

import { SettingsForm } from '@/components/settings/settings-form';

export function SettingsClient() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          System Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure system-wide settings and operational parameters
        </p>
      </div>

      {/* Settings Form */}
      <SettingsForm />
    </div>
  );
}
