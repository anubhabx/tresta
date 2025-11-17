'use client';

import { useProject } from '@/lib/hooks/use-projects';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TelemetrySettings } from '@/components/settings/telemetry-settings';

interface ProjectSettingsClientProps {
  projectId: string;
}

export function ProjectSettingsClient({ projectId }: ProjectSettingsClientProps) {
  const router = useRouter();
  const { data: project, isLoading } = useProject(projectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Project Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {project?.name || 'Project'}
          </p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Telemetry Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <TelemetrySettings projectId={projectId} />
        </div>

        {/* Additional Settings Sections Can Be Added Here */}
      </div>
    </div>
  );
}
