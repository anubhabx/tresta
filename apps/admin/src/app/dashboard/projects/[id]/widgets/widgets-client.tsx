'use client';

import { useState } from 'react';
import { useWidgets, useCreateWidget, useDeleteWidget } from '@/lib/hooks/use-widgets';
import { useProject } from '@/lib/hooks/use-projects';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Loader2, Trash2, Settings, Code } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils/format';
import { WidgetConfigurator } from '@/components/widgets/widget-configurator';
import { WidgetPreview } from '@/components/widgets/widget-preview';
import { EmbedCodeGenerator } from '@/components/widgets/embed-code-generator';
import type { WidgetConfig } from '@workspace/types';
import { DEFAULT_WIDGET_CONFIG } from '@workspace/types';

interface WidgetsClientProps {
  projectId: string;
}

export function WidgetsClient({ projectId }: WidgetsClientProps) {
  const router = useRouter();
  const { data: project } = useProject(projectId);
  const { data: widgets, isLoading } = useWidgets(projectId);
  const createWidget = useCreateWidget();
  const deleteWidget = useDeleteWidget();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [widgetName, setWidgetName] = useState('');
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>(DEFAULT_WIDGET_CONFIG);
  const [activeTab, setActiveTab] = useState<'configure' | 'preview' | 'embed'>('configure');

  const handleCreateWidget = async () => {
    if (!widgetName.trim()) {
      return;
    }

    await createWidget.mutateAsync({
      projectId,
      name: widgetName,
      type: 'embed',
      config: widgetConfig,
    });

    setIsCreateDialogOpen(false);
    setWidgetName('');
    setWidgetConfig(DEFAULT_WIDGET_CONFIG);
  };

  const handleDeleteWidget = async (widgetId: string) => {
    if (confirm('Are you sure you want to delete this widget? This action cannot be undone.')) {
      await deleteWidget.mutateAsync(widgetId);
    }
  };

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Widgets
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {project?.name || 'Project'}
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Widget
        </Button>
      </div>

      {/* Widgets List */}
      {!widgets || widgets.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Code className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No widgets yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first widget to start embedding testimonials on your website
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Your First Widget
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {widget.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {widget.config.layout || 'grid'} layout
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedWidget(widget.id)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteWidget(widget.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Theme:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {widget.config.theme || 'light'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Max Items:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {widget.config.maxTestimonials || 10}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Created:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {formatDate(widget.createdAt)}
                  </span>
                </div>
              </div>

              {widget.stats && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Impressions</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {widget.stats.impressions || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Clicks</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {widget.stats.clicks || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                className="w-full mt-4"
                variant="outline"
                onClick={() => setSelectedWidget(widget.id)}
              >
                <Code className="h-4 w-4" />
                Get Embed Code
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Create Widget Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Create New Widget
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {/* Configuration Panel */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Widget Name
                    </label>
                    <input
                      type="text"
                      value={widgetName}
                      onChange={(e) => setWidgetName(e.target.value)}
                      placeholder="e.g., Homepage Widget"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex gap-4">
                      <button
                        onClick={() => setActiveTab('configure')}
                        className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'configure'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                      >
                        Configure
                      </button>
                      <button
                        onClick={() => setActiveTab('preview')}
                        className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'preview'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => setActiveTab('embed')}
                        className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'embed'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                      >
                        Embed Code
                      </button>
                    </div>
                  </div>

                  {/* Tab Content */}
                  {activeTab === 'configure' && (
                    <WidgetConfigurator config={widgetConfig} onChange={setWidgetConfig} />
                  )}
                  {activeTab === 'embed' && (
                    <EmbedCodeGenerator widgetId="preview" />
                  )}
                </div>

                {/* Preview Panel */}
                {(activeTab === 'configure' || activeTab === 'preview') && (
                  <div className="lg:sticky lg:top-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Live Preview
                    </h3>
                    <WidgetPreview widgetId="preview" config={widgetConfig} />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setWidgetName('');
                  setWidgetConfig(DEFAULT_WIDGET_CONFIG);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateWidget}
                disabled={!widgetName.trim() || createWidget.isPending}
              >
                {createWidget.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Widget'
                )}
              </Button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Widget Details Dialog */}
      {selectedWidget && (
        <Dialog open={!!selectedWidget} onOpenChange={() => setSelectedWidget(null)}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Widget Embed Code
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <EmbedCodeGenerator widgetId={selectedWidget} />
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <Button onClick={() => setSelectedWidget(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
