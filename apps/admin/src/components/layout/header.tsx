'use client';

import { UserButton } from '@clerk/nextjs';
import { Menu } from 'lucide-react';
import { StatusBar } from './status-bar';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Status bar */}
      <div className="flex-1 flex justify-center">
        <StatusBar />
      </div>

      {/* User menu */}
      <div className="flex items-center gap-4">
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'h-10 w-10',
            },
          }}
          afterSignOutUrl="/sign-in"
        />
      </div>
    </header>
  );
}
