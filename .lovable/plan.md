

# Fix: Student Search Input Blocked Inside Collect Fee Dialog

## Problem
The previous fix (`modal={true}` + `z-[60]`) is insufficient. The browser console confirms: **"Blocked aria-hidden on an element because its descendant retained focus."** When the Popover opens via a Portal, the Dialog marks all outside DOM nodes as `aria-hidden`. Chrome then blocks focus on the Popover's `CommandInput`, making typing impossible.

## Root Cause
Radix Dialog uses `aria-hidden` on sibling DOM elements. Since Popover renders through a Portal (outside the Dialog DOM tree), the Dialog marks the Popover's portal container as `aria-hidden`, and Chrome prevents focus on elements inside `aria-hidden` containers.

## Solution
Replace the Popover-based dropdown with an **inline dropdown** that renders inside the Dialog DOM tree (no portal), avoiding the focus trap conflict entirely.

### File: `src/components/ui/student-search-combobox.tsx`

Remove the `Popover`/`PopoverTrigger`/`PopoverContent` wrapper entirely. Instead:

1. Use a simple `div`-based toggle: clicking the trigger button toggles `open` state
2. Render the `Command` dropdown in a positioned `div` directly below the trigger (no Portal)
3. Add click-outside detection to close the dropdown
4. Keep all existing search logic, `CommandInput`, `CommandList`, and `StudentItem` unchanged

```text
┌──────────────────────────────────┐
│ Dialog (z-50, focus trap)        │
│  ┌────────────────────────────┐  │
│  │ Trigger Button             │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │  ← inline div, no portal
│  │ Command                    │  │
│  │  CommandInput (typeable!)  │  │
│  │  CommandList (results)     │  │
│  └────────────────────────────┘  │
│                                  │
└──────────────────────────────────┘
```

Key implementation details:
- Wrap in a `relative` container div
- Dropdown is an `absolute`-positioned div with `top-full mt-1 w-full` styling
- Add `bg-popover border rounded-md shadow-md` for proper visual appearance
- Use a `useRef` + click-outside listener to close when clicking elsewhere
- Remove all Popover/PopoverTrigger/PopoverContent imports

This approach completely eliminates the Dialog vs Popover focus conflict since everything stays within the Dialog's DOM tree.

