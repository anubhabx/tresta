'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

const normalizeUrl = (url?: string) => {
  if (!url) return undefined;
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const WIDGET_CDN_BASE_URL =
  normalizeUrl(process.env.NEXT_PUBLIC_WIDGET_CDN_BASE_URL) ?? 'https://cdn.tresta.app';

const WIDGET_API_BASE_URL =
  normalizeUrl(process.env.NEXT_PUBLIC_WIDGET_API_BASE_URL) ?? 'https://api.tresta.app';

interface EmbedCodeGeneratorProps {
  widgetId: string;
  version?: string;
  integrity?: string;
}

export function EmbedCodeGenerator({ 
  widgetId, 
  version = '1.0.0',
  integrity = 'sha384-4jFE09FkV0xR5ddepdvz9YHwjiCpitF2DfaacLZpTiNy+8unDi97RISCsLSpKzhI'
}: EmbedCodeGeneratorProps) {
  const [embedType, setEmbedType] = useState<'standard' | 'csp'>('standard');
  const [versionType, setVersionType] = useState<'exact' | 'major' | 'latest'>('exact');
  const [copied, setCopied] = useState(false);

  const getVersionUrl = () => {
    switch (versionType) {
      case 'exact':
        return `v${version}`;
      case 'major':
        return `v${version.split('.')[0]}`;
      case 'latest':
        return 'latest';
    }
  };

  const generateStandardEmbed = () => {
    const versionUrl = getVersionUrl();
    const scriptSrc = `${WIDGET_CDN_BASE_URL}/widget/${versionUrl}/tresta-widget.iife.js`;
    return `<!-- Tresta Testimonial Widget -->
<div id="tresta-widget-${widgetId}" data-widget-id="${widgetId}"></div>
<script async src="${scriptSrc}" 
        data-widget-id="${widgetId}"></script>`;
  };

  const generateCSPEmbed = () => {
    const versionUrl = getVersionUrl();
    const scriptSrc = `${WIDGET_CDN_BASE_URL}/widget/${versionUrl}/tresta-widget.iife.js`;
    return `<!-- Tresta Testimonial Widget (CSP-friendly with SRI) -->
<div id="tresta-widget-${widgetId}" data-widget-id="${widgetId}"></div>
<script async 
        src="${scriptSrc}" 
        integrity="${integrity}"
        crossorigin="anonymous"
        data-widget-id="${widgetId}"></script>`;
  };

  const embedCode = embedType === 'standard' ? generateStandardEmbed() : generateCSPEmbed();
  const cspDirectiveText = `script-src 'self' ${WIDGET_CDN_BASE_URL};
connect-src ${WIDGET_API_BASE_URL};
img-src ${WIDGET_CDN_BASE_URL} ${WIDGET_API_BASE_URL} data:;
style-src 'self' ${WIDGET_CDN_BASE_URL};`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      toast.success('Embed code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="space-y-4">
      {/* Embed Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Embed Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setEmbedType('standard')}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              embedType === 'standard'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setEmbedType('csp')}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              embedType === 'csp'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
          >
            CSP-Friendly (SRI)
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {embedType === 'standard' 
            ? 'Standard embed code for most websites'
            : 'CSP-friendly embed with Subresource Integrity for enhanced security'}
        </p>
      </div>

      {/* Version Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Version Pinning
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setVersionType('exact')}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              versionType === 'exact'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
          >
            Exact ({version})
          </button>
          <button
            onClick={() => setVersionType('major')}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              versionType === 'major'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
          >
            Major (v{version.split('.')[0]})
          </button>
          <button
            onClick={() => setVersionType('latest')}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              versionType === 'latest'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
          >
            Latest
          </button>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {versionType === 'exact' && '✓ Recommended: Exact version for production stability'}
          {versionType === 'major' && '⚠ Auto-updates to latest minor/patch versions'}
          {versionType === 'latest' && '⚠ Not recommended: Always uses latest version'}
        </div>
      </div>

      {/* Embed Code Display */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Embed Code
          </label>
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
          <code>{embedCode}</code>
        </pre>
      </div>

      {/* CSP Requirements */}
      {embedType === 'csp' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Required CSP Directives
          </h4>
          <pre className="bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 p-3 rounded text-xs overflow-x-auto">
{cspDirectiveText}
          </pre>
        </div>
      )}
    </div>
  );
}
