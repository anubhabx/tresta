'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Loader2 } from 'lucide-react';

interface Widget {
  id: string;
  projectId: string;
  config: any;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  widgets: Widget[];
}

interface WidgetSelectorProps {
  onSelect: (widgetId: string) => void;
}

export function WidgetSelector({ onSelect }: WidgetSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiClient.get('/api/projects');
        const projectsData = response.data.data;

        // Fetch widgets for each project
        const projectsWithWidgets = await Promise.all(
          projectsData.map(async (project: any) => {
            try {
              const widgetsResponse = await apiClient.get(
                `/api/widgets/project/${project.slug}`
              );
              return {
                ...project,
                widgets: widgetsResponse.data.data || [],
              };
            } catch (err) {
              return {
                ...project,
                widgets: [],
              };
            }
          })
        );

        setProjects(projectsWithWidgets.filter(p => p.widgets.length > 0));
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          No widgets found. Create a widget to view analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Select a Widget
      </h2>
      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {project.name}
            </h3>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {project.widgets.map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => onSelect(widget.id)}
                  className="text-left p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Widget {widget.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Created {new Date(widget.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
