import { useEffect, useCallback } from "react";

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

function isInputFocused(): boolean {
  const activeElement = document.activeElement;
  return (
    activeElement?.tagName === "INPUT" ||
    activeElement?.tagName === "TEXTAREA" ||
    activeElement?.hasAttribute("contenteditable")
  );
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check each shortcut
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrlKey
          ? event.ctrlKey || event.metaKey
          : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const keyMatch =
          event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }

      // Quick search with "/" key (when not in input)
      if (event.key === "/" && !isInputFocused()) {
        event.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          '[data-tour="header-search"] input'
        );
        searchInput?.focus();
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

// Hook for global shortcuts that should be registered once
export function useGlobalKeyboardShortcuts(onOpenHelp: () => void) {
  const shortcuts: ShortcutConfig[] = [
    {
      key: "h",
      ctrlKey: true,
      action: onOpenHelp,
      description: "Open help drawer",
    },
    {
      key: "k",
      ctrlKey: true,
      action: () => {
        const searchInput = document.querySelector<HTMLInputElement>(
          '[data-tour="header-search"] input'
        );
        searchInput?.focus();
      },
      description: "Open global search",
    },
  ];

  useKeyboardShortcuts(shortcuts);
}
