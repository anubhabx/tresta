"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@workspace/ui/components/command";
import {
  FolderPlus,
  LayoutDashboard,
  Settings,
  User,
  LogOut,
  Search,
  FileText,
  Code,
  Palette,
  Sun,
  Moon,
  Monitor,
  ExternalLink,
  HelpCircle,
  MessageSquare,
  PlusCircle,
} from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { projects } from "@/lib/queries";
import type { Project } from "@/types/api";

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const { signOut } = useClerk();
  const { isSignedIn } = useAuth();
  const { setTheme, theme } = useTheme();

  // Fetch user's projects for quick navigation
  const { data: projectsData } = projects.queries.useList(1, 10);
  const projectsList = projectsData?.data || [];
  const totalProjects = projectsData?.meta?.pagination?.total || 0;

  // Handle controlled/uncontrolled state
  const commandOpen = open !== undefined ? open : isOpen;
  const setCommandOpen = onOpenChange || setIsOpen;

  // Global keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandOpen, setCommandOpen]);

  const runCommand = React.useCallback(
    (command: () => void) => {
      setCommandOpen(false);
      command();
    },
    [setCommandOpen],
  );

  return (
    <CommandDialog
      open={commandOpen}
      onOpenChange={setCommandOpen}
      title="Command Palette"
      description="Search for commands, navigate, or perform actions"
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/projects/new"))}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard"))}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Go to Dashboard
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/projects"))}
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            View All Projects
          </CommandItem>
        </CommandGroup>

        {/* Projects - Show user's projects for quick access */}
        {projectsList.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Your Projects">
              {projectsList.slice(0, 5).map((project: Project) => (
                <CommandItem
                  key={project.id}
                  onSelect={() =>
                    runCommand(() => router.push(`/projects/${project.slug}`))
                  }
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {project.name}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {project._count?.testimonials || 0} testimonials
                  </span>
                </CommandItem>
              ))}
              {totalProjects > 5 && (
                <CommandItem
                  onSelect={() => runCommand(() => router.push("/projects"))}
                >
                  <Search className="mr-2 h-4 w-4" />
                  View all {totalProjects} projects...
                </CommandItem>
              )}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push("/docs"))}>
            <FileText className="mr-2 h-4 w-4" />
            API Documentation
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/pricing"))}
          >
            <Code className="mr-2 h-4 w-4" />
            Pricing
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => window.open("https://tresta.app", "_blank"))
            }
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Visit Homepage
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Theme */}
        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
            <Sun className="mr-2 h-4 w-4" />
            Light Mode
            {theme === "light" && (
              <span className="ml-auto text-xs text-primary">Active</span>
            )}
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
            <Moon className="mr-2 h-4 w-4" />
            Dark Mode
            {theme === "dark" && (
              <span className="ml-auto text-xs text-primary">Active</span>
            )}
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
            <Monitor className="mr-2 h-4 w-4" />
            System Theme
            {theme === "system" && (
              <span className="ml-auto text-xs text-primary">Active</span>
            )}
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Account */}
        {isSignedIn && (
          <CommandGroup heading="Account">
            <CommandItem
              onSelect={() =>
                runCommand(() => router.push("/dashboard/settings"))
              }
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => router.push("/dashboard/account"))
              }
            >
              <User className="mr-2 h-4 w-4" />
              Account
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => signOut({ redirectUrl: "/" }))}
              className="text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </CommandItem>
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Help */}
        <CommandGroup heading="Help">
          <CommandItem
            onSelect={() =>
              runCommand(() =>
                window.open("mailto:support@tresta.app", "_blank"),
              )
            }
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Contact Support
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
