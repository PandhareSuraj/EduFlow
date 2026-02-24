

# Fix: Student Search in Collect Fee Dialog (Third Attempt)

## Root Cause Analysis

The console log confirms the issue persists: `"Blocked aria-hidden on an element because its descendant retained focus."` The focused element is the combobox trigger **Button**, and the ancestor with `aria-hidden` is the **DialogContent** of CollectFeeDialog.

The previous inline-dropdown fix removed the Portal problem, but the `cmdk` library's `Command` component still interferes with Radix Dialog's focus management. When the dropdown opens and `autoFocus` fires on the `CommandInput`, `cmdk` internally manages focus in a way that conflicts with the Dialog's `aria-hidden` bookkeeping.

## Solution

Replace `cmdk`'s `Command`/`CommandInput`/`CommandList`/`CommandItem`/`CommandGroup`/`CommandEmpty` with **plain HTML elements** (`<input>`, `<div>`). This eliminates all framework-level focus conflicts entirely.

### File: `src/components/ui/student-search-combobox.tsx`

**Changes:**
1. Remove all `Command*` imports from `cmdk`
2. Replace `CommandInput` with a plain `<input>` element with the same styling
3. Replace `CommandList`/`CommandGroup`/`CommandItem`/`CommandEmpty` with plain `<div>` elements
4. Keep all existing search logic (`useStudentSearch`), click-outside handling, and `StudentItem` rendering — just swap the wrappers
5. Handle keyboard navigation (arrow keys, Enter) manually for accessibility

Key structure:
```text
<div ref={containerRef} className="relative">
  <Button onClick={toggle} />          ← trigger (unchanged)
  {open && (
    <div className="absolute ...">     ← dropdown container (unchanged)
      <input                           ← plain input replaces CommandInput
        autoFocus
        value={searchTerm}
        onChange={...}
      />
      <div className="overflow-y-auto"> ← replaces CommandList
        {/* results rendered as clickable divs */}
      </div>
    </div>
  )}
</div>
```

This approach has zero dependency on `cmdk` or Radix internals, so there are no focus trap or `aria-hidden` conflicts possible.

