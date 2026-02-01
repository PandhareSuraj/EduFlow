import React from "react";

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutSection {
  category: string;
  items: ShortcutItem[];
}

const shortcuts: ShortcutSection[] = [
  {
    category: 'Navigation',
    items: [
      { keys: ['/'], description: 'Open global search' },
      { keys: ['Ctrl', 'K'], description: 'Open global search (alternative)' },
      { keys: ['Ctrl', 'B'], description: 'Toggle sidebar' },
      { keys: ['Ctrl', 'H'], description: 'Open help drawer' },
      { keys: ['Esc'], description: 'Close dialogs and drawers' },
    ],
  },
  {
    category: 'Actions',
    items: [
      { keys: ['Ctrl', 'S'], description: 'Save form' },
      { keys: ['Ctrl', 'Enter'], description: 'Submit form' },
      { keys: ['Ctrl', 'N'], description: 'New item (context-aware)' },
    ],
  },
  {
    category: 'Tables',
    items: [
      { keys: ['↑', '↓'], description: 'Navigate rows' },
      { keys: ['Enter'], description: 'View selected row' },
      { keys: ['E'], description: 'Edit selected row' },
      { keys: ['Delete'], description: 'Delete selected row' },
    ],
  },
];

export function KeyboardShortcuts() {
  return (
    <div className="space-y-6">
      {shortcuts.map((section, idx) => (
        <div key={idx}>
          <h4 className="font-medium text-sm text-muted-foreground mb-3">
            {section.category}
          </h4>
          <div className="space-y-2">
            {section.items.map((shortcut, sIdx) => (
              <div
                key={sIdx}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
              >
                <span className="text-sm">{shortcut.description}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, kIdx) => (
                    <React.Fragment key={kIdx}>
                      <kbd className="px-2 py-1 text-xs font-mono bg-background border rounded shadow-sm">
                        {key}
                      </kbd>
                      {kIdx < shortcut.keys.length - 1 && (
                        <span className="text-xs text-muted-foreground">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          Tip: Press{" "}
          <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border rounded">
            /
          </kbd>{" "}
          anywhere to quickly search
        </p>
      </div>
    </div>
  );
}
