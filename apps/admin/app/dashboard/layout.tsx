import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold">Tresta Admin</h1>
              <nav className="flex gap-4">
                <Link 
                  href="/dashboard" 
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/dashboard/dlq" 
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Dead Letter Queue
                </Link>
                <Link 
                  href="/dashboard/health" 
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Health
                </Link>
              </nav>
            </div>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          Tresta Admin Panel • Notification System Management
        </div>
      </footer>
    </div>
  );
}
