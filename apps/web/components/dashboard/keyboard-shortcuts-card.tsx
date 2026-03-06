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
    <Card className="backdrop-blur-xl border border-white/5 p-6 shadow-2xl relative overflow-hidden ring-1 ring-white/5 hidden lg:block">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="flex items-center gap-2 mb-6">
        <Keyboard className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Keyboard Shortcuts
        </h3>
      </div>

      <div className="space-y-3">
        {shortcuts.map((shortcut, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-zinc-400">{shortcut.description}</span>
            <div className="flex items-center gap-1">
              {shortcut.keys.map((key, keyIndex) => (
                <Kbd
                  key={keyIndex}
                  className="border-white/10 text-zinc-300 font-mono text-[10px] px-1.5"
                >
                  {key}
                </Kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
