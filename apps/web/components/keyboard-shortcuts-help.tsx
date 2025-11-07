"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Keyboard } from "lucide-react";
import { KeyboardShortcutBadge } from "./keyboard-shortcut-badge";

interface Shortcut {
  key: string;
  description: string;
  modifier?: string;
}

const moderationShortcuts: Shortcut[] = [
  { key: "A", description: "Approve selected testimonial(s)" },
  { key: "R", description: "Reject selected testimonial(s)" },
  { key: "F", description: "Flag selected testimonial(s)" },
  { key: "D", description: "Delete selected testimonial" },
  { key: "X", description: "Clear selection" },
  { key: "Shift + A", description: "Select/deselect all", modifier: "Shift" },
  { key: "Shift + P", description: "Select all pending", modifier: "Shift" },
  { key: "Shift + V", description: "Select all approved", modifier: "Shift" },
  { key: "Shift + R", description: "Select all rejected", modifier: "Shift" },
  { key: "Shift + F", description: "Select all flagged", modifier: "Shift" },
];

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Keyboard className="h-4 w-4" />
          Keyboard Shortcuts
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Moderation Shortcuts</h4>
            <p className="text-xs text-muted-foreground">
              Select testimonials and use these shortcuts
            </p>
          </div>
          <div className="space-y-2">
            {moderationShortcuts.map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="text-muted-foreground">
                  {shortcut.description}
                </span>
                <KeyboardShortcutBadge shortcut={shortcut.key} />
              </div>
            ))}
          </div>
          <div className="pt-2 border-t text-xs text-muted-foreground">
            💡 Tip: Click on any testimonial card to select it
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
