

# Fix: Student Search Not Working Inside Collect Fee Dialog

## Problem
The `StudentSearchCombobox` uses a Radix `Popover` inside a Radix `Dialog`. This causes two known issues:
1. **Z-index collision**: Both Dialog and Popover use `z-50`, so the Popover dropdown can render behind the Dialog overlay
2. **Focus trap conflict**: The Dialog's modal focus trap can prevent keyboard input from reaching the Popover's `CommandInput`, making search non-functional

## Solution

### File: `src/components/ui/student-search-combobox.tsx`

Two changes to the Popover/PopoverContent:

1. **Add `modal={true}` to the `Popover`** — This ensures the Popover properly manages its own focus when open, overriding the Dialog's focus trap so typing works in the search input.

2. **Add `z-[60]` to the `PopoverContent`** — This places the dropdown above the Dialog's `z-50` overlay, ensuring it's visible and interactive.

```tsx
// Before
<Popover open={open} onOpenChange={setOpen}>
  ...
  <PopoverContent className="w-[600px] p-0" align="start">

// After
<Popover open={open} onOpenChange={setOpen} modal={true}>
  ...
  <PopoverContent className="w-[600px] p-0 z-[60]" align="start">
```

These two small changes resolve both the visibility and input issues when the combobox is rendered inside any Dialog.

