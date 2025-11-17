'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { WidgetConfig, WidgetLayout, WidgetTheme, CardStyle } from '@workspace/types';
import { DEFAULT_WIDGET_CONFIG } from '@workspace/types';

interface WidgetConfiguratorProps {
  config: WidgetConfig;
  onChange: (config: WidgetConfig) => void;
}

export function WidgetConfigurator({ config, onChange }: WidgetConfiguratorProps) {
  const currentConfig = { ...DEFAULT_WIDGET_CONFIG, ...config };

  const updateConfig = (updates: Partial<WidgetConfig>) => {
    onChange({ ...currentConfig, ...updates });
  };

  return (
    <div className="space-y-6">
      {/* Layout Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Layout
        </label>
        <div className="grid grid-cols-5 gap-2">
          {(['carousel', 'grid', 'masonry', 'wall', 'list'] as WidgetLayout[]).map((layout) => (
            <button
              key={layout}
              onClick={() => updateConfig({ layout })}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                currentConfig.layout === layout
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
              }`}
            >
              {layout.charAt(0).toUpperCase() + layout.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Theme
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['light', 'dark', 'auto'] as WidgetTheme[]).map((theme) => (
            <button
              key={theme}
              onClick={() => updateConfig({ theme })}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                currentConfig.theme === theme
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
              }`}
            >
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Primary Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={currentConfig.primaryColor}
              onChange={(e) => updateConfig({ primaryColor: e.target.value })}
              className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <input
              type="text"
              value={currentConfig.primaryColor}
              onChange={(e) => updateConfig({ primaryColor: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="#0066FF"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Secondary Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={currentConfig.secondaryColor}
              onChange={(e) => updateConfig({ secondaryColor: e.target.value })}
              className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <input
              type="text"
              value={currentConfig.secondaryColor}
              onChange={(e) => updateConfig({ secondaryColor: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="#00CC99"
            />
          </div>
        </div>
      </div>

      {/* Card Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Card Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['default', 'minimal', 'bordered'] as CardStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => updateConfig({ cardStyle: style })}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                currentConfig.cardStyle === style
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
              }`}
            >
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Display Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Display Options
        </label>
        <div className="space-y-2">
          {[
            { key: 'showRating', label: 'Show Rating' },
            { key: 'showDate', label: 'Show Date' },
            { key: 'showAvatar', label: 'Show Avatar' },
            { key: 'showAuthorRole', label: 'Show Author Role' },
            { key: 'showAuthorCompany', label: 'Show Author Company' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentConfig[key as keyof WidgetConfig] as boolean}
                onChange={(e) => updateConfig({ [key]: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Max Testimonials */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Max Testimonials: {currentConfig.maxTestimonials}
        </label>
        <input
          type="range"
          min="1"
          max="100"
          value={currentConfig.maxTestimonials}
          onChange={(e) => updateConfig({ maxTestimonials: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>1</span>
          <span>100</span>
        </div>
      </div>

      {/* Carousel Settings */}
      {currentConfig.layout === 'carousel' && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Carousel Settings
          </h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currentConfig.autoRotate}
              onChange={(e) => updateConfig({ autoRotate: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Auto Rotate</span>
          </label>
          {currentConfig.autoRotate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rotate Interval: {currentConfig.rotateInterval / 1000}s
              </label>
              <input
                type="range"
                min="2000"
                max="10000"
                step="1000"
                value={currentConfig.rotateInterval}
                onChange={(e) => updateConfig({ rotateInterval: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>2s</span>
                <span>10s</span>
              </div>
            </div>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currentConfig.showNavigation}
              onChange={(e) => updateConfig({ showNavigation: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show Navigation</span>
          </label>
        </div>
      )}

      {/* Grid Settings */}
      {currentConfig.layout === 'grid' && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Grid Settings
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Columns: {currentConfig.columns}
            </label>
            <input
              type="range"
              min="1"
              max="4"
              value={currentConfig.columns}
              onChange={(e) => updateConfig({ columns: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1</span>
              <span>4</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
