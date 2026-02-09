"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Kbd } from "@workspace/ui/components/kbd";
import { Keyboard } from "lucide-react";

interface ShortcutItem {
  keys: string[];
  description: string;
}

const shortcuts: ShortcutItem[] = [
  { keys: ["N"], description: "New project" },
  { keys: ["⌘", "K"], description: "Command menu" },
  { keys: ["G", "D"], description: "Go to Dashboard" },
  { keys: ["G", "P"], description: "Go to Projects" },
  { keys: ["?"], description: "Show shortcuts" },
];

/**
 * Keyboard Shortcuts Card for the dashboard sidebar
 * Shows common keyboard shortcuts for power users
 *
 * Design principle: Developer-first, keyboard navigation
 */
export function KeyboardShortcutsCard() {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Keyboard className="h-4 w-4 text-primary" />
          Keyboard Shortcuts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2.5">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <Kbd key={keyIndex}>{key}</Kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
