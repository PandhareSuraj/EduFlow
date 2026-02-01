

# Full Accessibility Implementation

## Overview

This plan makes the EduFlow application fully accessible according to WCAG AA standards, including proper ARIA labels, keyboard navigation, focus management, screen reader support, and enhanced color contrast.

---

## Current State Analysis

| Requirement | Current Status | Gap |
|-------------|---------------|-----|
| Skip-to-content link | Implemented | None - already in Layout.tsx |
| Main content landmark | Implemented | `<main id="main-content">` exists in Layout.tsx |
| ARIA labels on icon buttons | Partial | ~70 icon buttons missing aria-labels |
| Alt text on images | Good | Most images have alt text |
| Focus indicators | Good | Radix components have focus-visible styles |
| Keyboard navigation | Mostly working | Tab order correct, Enter/Space work on buttons |
| Modal focus trapping | Built-in | Radix Dialog/AlertDialog handle this automatically |
| Escape to close modals | Built-in | Radix handles this |
| Form label association | Partial | Some manual inputs need explicit labels |
| Color contrast | Needs audit | Some muted text may fail 4.5:1 ratio |
| Page title announcements | Not implemented | No dynamic document.title updates |
| Screen reader live regions | Not implemented | No aria-live for notifications |

---

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/hooks/usePageTitle.tsx` | Dynamic page title updates for screen readers |
| Create | `src/components/ui/visually-hidden.tsx` | Helper for screen-reader-only content |
| Create | `src/components/ui/live-region.tsx` | ARIA live region for announcements |
| Modify | `src/index.css` | Enhanced focus styles, contrast fixes |
| Modify | `src/components/layout/Layout.tsx` | Add role="main" to main content |
| Modify | `src/components/layout/Header.tsx` | Add ARIA labels to icon buttons |
| Modify | `src/components/notifications/NotificationDropdown.tsx` | Add ARIA labels and live region |
| Modify | `src/components/ui/dialog.tsx` | Ensure focus trap and Escape handling |
| Modify | `src/components/ui/alert-dialog.tsx` | Add role="alertdialog" if missing |
| Modify | `src/components/dashboard/StatsCard.tsx` | Add aria-label for screen readers |
| Modify | `src/pages/Dashboard.tsx` | Add usePageTitle hook |
| Modify | `src/pages/Students.tsx` | Add usePageTitle hook |
| Modify | Major pages | Add page title hooks |

---

## Implementation Details

### 1. Page Title Hook for Screen Readers

Create a hook to update document.title on route changes:

```typescript
// src/hooks/usePageTitle.tsx
import { useEffect } from 'react';

export function usePageTitle(title: string, suffix: string = "EduFlow") {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${suffix}` : suffix;
    const previousTitle = document.title;
    document.title = fullTitle;
    
    // Announce page change to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Navigated to ${title}`;
    document.body.appendChild(announcement);
    
    return () => {
      document.title = previousTitle;
      announcement.remove();
    };
  }, [title, suffix]);
}
```

### 2. Visually Hidden Component

For screen-reader-only content:

```typescript
// src/components/ui/visually-hidden.tsx
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}
```

### 3. Live Region for Announcements

For dynamic content updates:

```typescript
// src/components/ui/live-region.tsx
interface LiveRegionProps {
  children: React.ReactNode;
  mode?: 'polite' | 'assertive';
  atomic?: boolean;
}

export function LiveRegion({ 
  children, 
  mode = 'polite',
  atomic = true 
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={mode}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  );
}
```

### 4. Enhanced Focus Styles

Add more visible focus indicators to index.css:

```css
/* Enhanced focus indicators for accessibility */
*:focus-visible {
  outline: 2px solid hsl(var(--ring)) !important;
  outline-offset: 2px !important;
}

/* High contrast focus for buttons */
button:focus-visible,
[role="button"]:focus-visible {
  box-shadow: 0 0 0 3px hsl(var(--ring) / 0.5);
}

/* Skip link styles (enhance existing) */
.skip-link:focus {
  clip: auto !important;
  height: auto !important;
  width: auto !important;
  overflow: visible !important;
  position: absolute !important;
}
```

### 5. Color Contrast Improvements

Update CSS variables for better contrast:

```css
:root {
  /* Improve muted-foreground contrast */
  --muted-foreground: 215.4 16.3% 40%; /* Darker for better contrast */
}

.dark {
  /* Improve dark mode muted text contrast */
  --muted-foreground: 215 20.2% 70%; /* Lighter for better contrast */
}
```

### 6. Layout Landmark Enhancement

Update Layout.tsx to ensure proper landmarks:

```tsx
// Already has role via <main> element
// Ensure aria-labelledby for sections
<main 
  id="main-content" 
  role="main"
  aria-label="Main content"
  className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6"
>
  {children}
</main>
```

### 7. Icon Button ARIA Labels

Add aria-labels to all icon-only buttons:

**Header.tsx - Notification button:**
```tsx
<Button 
  variant="ghost" 
  size="icon" 
  className="relative"
  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
>
  <Bell className="h-5 w-5" />
  ...
</Button>
```

**NotificationDropdown.tsx:**
```tsx
<Button
  variant="ghost"
  size="sm"
  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
  onClick={(e) => handleDismiss(e, notification.id)}
  aria-label="Dismiss notification"
>
  <X className="h-3 w-3" />
</Button>
```

**Events.tsx - Clear poster button:**
```tsx
<Button
  type="button"
  variant="destructive"
  size="icon"
  className="absolute -top-2 -right-2 h-6 w-6"
  onClick={() => { ... }}
  aria-label="Remove poster image"
>
  <X className="h-4 w-4" />
</Button>
```

### 8. StatsCard Screen Reader Support

Make stats cards announce properly:

```tsx
<Card 
  className={cn("...", className)}
  role="region"
  aria-label={`${title}: ${value}`}
>
  ...
</Card>
```

### 9. Table Accessibility

Ensure tables have proper structure:

```tsx
<Table role="table" aria-label="Student records">
  <TableHeader>
    <TableRow>
      <TableHead scope="col">Name</TableHead>
      ...
    </TableRow>
  </TableHeader>
  <TableBody>
    ...
  </TableBody>
</Table>
```

### 10. Dialog Accessibility Improvements

Ensure dialogs work correctly (mostly built-in with Radix):

```tsx
// Dialog.tsx - add aria-modal (Radix handles this)
<DialogPrimitive.Content
  ref={ref}
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
  ...
>
```

### 11. Form Input Labels

Ensure all inputs have associated labels:

```tsx
// Pattern for manual inputs
<div className="space-y-2">
  <Label htmlFor="search-input">Search students</Label>
  <Input
    id="search-input"
    placeholder="Search by name or ID..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>

// Or use aria-label for inputs without visible labels
<Input
  aria-label="Search students, courses, and faculty"
  placeholder="Search..."
  ...
/>
```

---

## Implementation Checklist

### Phase 1: Core Accessibility Infrastructure
1. Create usePageTitle hook
2. Create VisuallyHidden component
3. Create LiveRegion component
4. Update index.css with enhanced focus styles
5. Update index.css with contrast improvements

### Phase 2: Landmark and Navigation
6. Add role="main" and aria-label to Layout.tsx main content
7. Add aria-labels to AppSidebar navigation
8. Add page title updates to all major pages

### Phase 3: Interactive Elements
9. Add aria-labels to Header icon buttons
10. Add aria-labels to NotificationDropdown buttons
11. Add aria-labels to Events.tsx icon buttons
12. Add aria-labels to testimonial carousel navigation
13. Add aria-labels to all remaining icon-only buttons

### Phase 4: Content and Announcements
14. Add aria-label to StatsCard for screen readers
15. Add table accessibility attributes
16. Add aria-live region for notifications
17. Add aria-labels to form inputs without visible labels

### Phase 5: Testing and Verification
18. Test keyboard navigation through all pages
19. Test with screen reader (VoiceOver/NVDA)
20. Run automated accessibility audit

---

## Keyboard Navigation Summary

| Element | Key | Action |
|---------|-----|--------|
| All focusable | Tab | Move to next element |
| All focusable | Shift+Tab | Move to previous element |
| Buttons | Enter/Space | Activate |
| Links | Enter | Navigate |
| Dialogs | Escape | Close |
| Dropdown menus | Arrow Up/Down | Navigate options |
| Dropdown menus | Escape | Close |
| Combobox | Arrow Up/Down | Navigate options |
| Combobox | Enter | Select option |

Most keyboard navigation is already handled by Radix UI components.

---

## WCAG AA Compliance Summary

| Criterion | Status After Implementation |
|-----------|---------------------------|
| 1.1.1 Non-text Content | Pass - Alt text on all images |
| 1.3.1 Info and Relationships | Pass - Proper semantic HTML |
| 1.3.2 Meaningful Sequence | Pass - Logical DOM order |
| 1.4.3 Contrast (Minimum) | Pass - 4.5:1 ratio for text |
| 2.1.1 Keyboard | Pass - All functionality accessible |
| 2.1.2 No Keyboard Trap | Pass - Escape closes modals |
| 2.4.1 Bypass Blocks | Pass - Skip link implemented |
| 2.4.2 Page Titled | Pass - Dynamic titles |
| 2.4.3 Focus Order | Pass - Logical tab order |
| 2.4.4 Link Purpose | Pass - Clear link text |
| 2.4.6 Headings and Labels | Pass - Descriptive headings |
| 2.4.7 Focus Visible | Pass - Enhanced focus styles |
| 3.1.1 Language of Page | Already set in HTML |
| 3.2.1 On Focus | Pass - No context change on focus |
| 3.3.1 Error Identification | Pass - Form validation |
| 3.3.2 Labels or Instructions | Pass - Form labels |
| 4.1.1 Parsing | Pass - Valid HTML |
| 4.1.2 Name, Role, Value | Pass - ARIA labels |

---

## Color Contrast Specific Fixes

| Element | Current | Updated | Ratio |
|---------|---------|---------|-------|
| Muted text (light) | hsl(215 16% 47%) | hsl(215 16% 40%) | 4.5:1+ |
| Muted text (dark) | hsl(215 20% 65%) | hsl(215 20% 70%) | 4.5:1+ |
| Badge secondary | Keep as-is | Verify | 4.5:1 |
| Placeholder text | system default | Verify | 4.5:1+ |

---

## Files Changed Summary

| Category | Files |
|----------|-------|
| New hooks | usePageTitle.tsx |
| New components | visually-hidden.tsx, live-region.tsx |
| Core styles | index.css |
| Layout | Layout.tsx |
| Header | Header.tsx, NotificationDropdown.tsx |
| Dashboard | StatsCard.tsx, Dashboard.tsx |
| All pages | Add usePageTitle to each page |
| UI components | dialog.tsx (verify), table.tsx (if needed) |
| Various icon buttons | Events.tsx, AMCPlans.tsx, etc. |

