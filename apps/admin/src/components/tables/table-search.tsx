'use client';

import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { debounce } from '@/lib/utils/debounce';

interface TableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function TableSearch({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
}: TableSearchProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const debouncedOnChange = debounce((val: string) => {
      onChange(val);
    }, debounceMs);

    debouncedOnChange(localValue);
  }, [localValue, onChange, debounceMs]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-10 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {localValue && (
        <button
          onClick={() => {
            setLocalValue('');
            onChange('');
          }}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </div>
  );
}
