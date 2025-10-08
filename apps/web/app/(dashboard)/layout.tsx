import { DashboardShell } from "@/components/dashboard-shell";
import { ReactNode } from "react";

/**
 * Server Component layout for dashboard pages
 * All UI state management is delegated to DashboardShell client component
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
