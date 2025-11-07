import { useEffect, useCallback } from "react";

interface KeyboardShortcut {
  key: string;
  action: () => void;
  disabled?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

/**
 * Custom hook for handling keyboard shortcuts
 * Automatically ignores shortcuts when typing in input fields
 */
export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if user is typing in an input, textarea, or contenteditable
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isTyping) return;

      // Find matching shortcut
      const shortcut = shortcuts.find((s) => {
        const keyMatches = s.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatches = s.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatches = s.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = s.alt ? event.altKey : !event.altKey;

        return keyMatches && ctrlMatches && shiftMatches && altMatches && !s.disabled;
      });

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress, enabled]);
}
