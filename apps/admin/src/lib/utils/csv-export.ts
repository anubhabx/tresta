/**
 * Convert array of objects to CSV string
 */
export function convertToCSV(data: any[], columns: string[]): string {
  if (data.length === 0) return '';

  // Create header row
  const header = columns.join(',');

  // Create data rows
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        const value = item[col];
        // Handle null/undefined
        if (value === null || value === undefined) return '';
        // Escape quotes and wrap in quotes if contains comma or quote
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Generate timestamped filename
 */
export function generateCSVFilename(prefix: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefix}-export-${timestamp}.csv`;
}

/**
 * Export data to CSV and download
 */
export function exportToCSV(data: any[], columns: string[], filenamePrefix: string): void {
  const csv = convertToCSV(data, columns);
  const filename = generateCSVFilename(filenamePrefix);
  downloadCSV(csv, filename);
}
