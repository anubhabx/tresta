'use client';

import { UserButton } from '@clerk/nextjs';
import { Menu } from 'lucide-react';
import { StatusBar } from './status-bar';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md hover:bg-accent"
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
