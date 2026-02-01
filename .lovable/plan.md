
# Help System & Documentation Implementation

## Overview

This plan implements a comprehensive help system for the EduFlow application, ensuring users never feel lost. It includes a help drawer accessible from the header, contextual tooltips, in-app FAQ, "What's New" section, empty state guidance, support options, keyboard shortcut hints, breadcrumb navigation, and version display.

---

## Current State Analysis

| Feature | Current Status | Gap |
|---------|---------------|-----|
| Help Icon | "Take a Tour" in user dropdown | No dedicated help button in header |
| Contextual Tooltips | Partial (e.g., StudentPromotion) | Most complex features lack tooltips |
| FAQ Section | Exists in ProductTourPage | Not available in-app for logged-in users |
| What's New | Not implemented | No changelog or updates section |
| Empty States | Basic "No data" messages | No instructional guidance |
| Support Contact | Exists in landing page | Not accessible from in-app |
| Keyboard Shortcuts | Sidebar toggle (Ctrl+B) | No hints visible to users |
| Product Tour | Fully implemented | Working - existing infrastructure |
| Breadcrumbs | Not implemented | No navigation context on pages |
| Version Number | In package.json only | Not visible in app |

---

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/components/help/HelpDrawer.tsx` | Main help drawer with FAQ, shortcuts, support |
| Create | `src/components/help/WhatsNewSection.tsx` | Recent updates and changelog |
| Create | `src/components/help/ContextualHelpTooltip.tsx` | Reusable help tooltip component |
| Create | `src/components/help/KeyboardShortcuts.tsx` | Keyboard shortcuts reference |
| Create | `src/components/help/AppFAQ.tsx` | In-app FAQ for common questions |
| Create | `src/components/help/EmptyState.tsx` | Reusable empty state component |
| Create | `src/components/help/index.ts` | Barrel exports |
| Create | `src/components/layout/Breadcrumbs.tsx` | Dynamic breadcrumb navigation |
| Create | `src/components/layout/Footer.tsx` | Footer with version number |
| Create | `src/hooks/useKeyboardShortcuts.tsx` | Global keyboard shortcut handler |
| Create | `src/config/appConfig.ts` | App configuration including version |
| Modify | `src/components/layout/Header.tsx` | Add Help button in header |
| Modify | `src/components/layout/Layout.tsx` | Add Footer and Breadcrumbs |
| Modify | `src/pages/Students.tsx` | Add EmptyState and contextual help |
| Modify | `src/pages/Fees.tsx` | Add EmptyState and contextual help |
| Modify | `src/pages/Attendance.tsx` | Add EmptyState and contextual help |

---

## Implementation Details

### 1. App Configuration

Centralize app configuration including version:

```typescript
// src/config/appConfig.ts
export const APP_CONFIG = {
  name: 'EduFlow',
  version: '2.0.0',
  supportEmail: 'support@eduflow.com',
  supportPhone: '+91 1800-XXX-XXXX',
  releaseDate: '2026-02-01',
  whatsNew: [
    {
      version: '2.0.0',
      date: '2026-02-01',
      title: 'Major Update: Enhanced Export & Mobile Experience',
      changes: [
        'Export to Excel and PDF with date range filters',
        'Bottom navigation for mobile devices',
        'Pull-to-refresh on list pages',
        'Improved accessibility with ARIA labels',
        'Enhanced print stylesheets',
      ],
    },
    {
      version: '1.9.0',
      date: '2026-01-15',
      title: 'Student Promotion & Academic Years',
      changes: [
        'Bulk student promotion system',
        'Academic year management',
        'Promotion history and rollback',
        'Validation checks before promotion',
      ],
    },
    {
      version: '1.8.0',
      date: '2026-01-01',
      title: 'Placements & Events Module',
      changes: [
        'Placement drive management',
        'Interview scheduling',
        'Event calendar with registrations',
        'Student application tracking',
      ],
    },
  ],
};
```

### 2. Help Drawer Component

Main help panel accessible from header:

```typescript
// src/components/help/HelpDrawer.tsx
interface HelpDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDrawer({ open, onOpenChange }: HelpDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help & Support
          </SheetTitle>
          <SheetDescription>
            Find answers, learn shortcuts, and get support
          </SheetDescription>
        </SheetHeader>
        
        <Tabs defaultValue="faq" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
            <TabsTrigger value="whats-new">What's New</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>
          
          <TabsContent value="faq" className="mt-4">
            <AppFAQ />
          </TabsContent>
          
          <TabsContent value="shortcuts" className="mt-4">
            <KeyboardShortcuts />
          </TabsContent>
          
          <TabsContent value="whats-new" className="mt-4">
            <WhatsNewSection />
          </TabsContent>
          
          <TabsContent value="support" className="mt-4">
            <SupportSection />
          </TabsContent>
        </Tabs>
        
        {/* Quick Tour Button */}
        <div className="mt-6 pt-6 border-t">
          <Button onClick={handleStartTour} className="w-full">
            <PlayCircle className="mr-2 h-4 w-4" />
            Take a Guided Tour
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

### 3. In-App FAQ Component

Common questions specific to app usage:

```typescript
// src/components/help/AppFAQ.tsx
const appFaqs = [
  {
    category: 'Students',
    questions: [
      {
        q: 'How do I add a new student?',
        a: 'Go to Students page and click the "Add Student" button in the top right. Fill in the required details including name, course, and contact information. The student ID will be auto-generated.',
        action: { label: 'Go to Students', route: '/students' },
      },
      {
        q: 'How do I create login credentials for a student?',
        a: 'In the Students page, find the student in the list and click the user icon button. You can create a login using their email or mobile number.',
      },
    ],
  },
  {
    category: 'Attendance',
    questions: [
      {
        q: 'How do I record attendance?',
        a: 'Navigate to the Attendance page and click "Mark Attendance". Select the course and date, then mark each student as Present, Absent, or Late. Click Save to record.',
        action: { label: 'Go to Attendance', route: '/attendance' },
      },
      {
        q: 'Can I edit past attendance records?',
        a: 'Yes, you can edit attendance within 7 days of the session date. Go to the session details and click Edit to modify records.',
      },
    ],
  },
  {
    category: 'Fees',
    questions: [
      {
        q: 'How do I generate a fee receipt?',
        a: 'After collecting a payment, click the Receipt icon on the payment row. You can download or print the receipt directly. Receipts are auto-generated with unique numbers.',
        action: { label: 'Go to Fees', route: '/fees' },
      },
      {
        q: 'How do I set up a fee structure?',
        a: 'Go to Settings > Fee Structure to define fee types, amounts, and due dates for each course. You can create installment plans as well.',
      },
    ],
  },
  {
    category: 'Reports',
    questions: [
      {
        q: 'How do I export data to Excel?',
        a: 'On any page with a data table, click the "Export" button and select "Export to Excel". You can apply filters before exporting to get specific data.',
      },
      {
        q: 'Can I schedule automatic reports?',
        a: 'Currently, reports are generated on-demand. You can save filter configurations for quick access to frequently needed reports.',
      },
    ],
  },
];

export function AppFAQ() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      {appFaqs.map((category, idx) => (
        <div key={idx}>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">
            {category.category}
          </h4>
          <Accordion type="single" collapsible className="space-y-2">
            {category.questions.map((faq, faqIdx) => (
              <AccordionItem 
                key={faqIdx} 
                value={`${idx}-${faqIdx}`}
                className="border rounded-lg px-4"
              >
                <AccordionTrigger className="text-left text-sm py-3 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-3">
                  <p>{faq.a}</p>
                  {faq.action && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 h-auto mt-2"
                      onClick={() => navigate(faq.action.route)}
                    >
                      {faq.action.label} →
                    </Button>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
}
```

### 4. Keyboard Shortcuts Component

Display available keyboard shortcuts:

```typescript
// src/components/help/KeyboardShortcuts.tsx
const shortcuts = [
  {
    category: 'Navigation',
    items: [
      { keys: ['/', 'Ctrl', 'K'], description: 'Open global search' },
      { keys: ['Ctrl', 'B'], description: 'Toggle sidebar' },
      { keys: ['Ctrl', 'H'], description: 'Open help' },
      { keys: ['Esc'], description: 'Close dialogs' },
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
          Tip: Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border rounded">/</kbd> anywhere to quickly search
        </p>
      </div>
    </div>
  );
}
```

### 5. What's New Section

Display recent updates:

```typescript
// src/components/help/WhatsNewSection.tsx
export function WhatsNewSection() {
  const { whatsNew } = APP_CONFIG;
  
  return (
    <div className="space-y-6">
      {whatsNew.map((release, idx) => (
        <div key={idx} className={cn(
          "relative pl-6 pb-6",
          idx < whatsNew.length - 1 && "border-l border-border"
        )}>
          {/* Timeline dot */}
          <div className="absolute left-0 top-0 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background" />
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={idx === 0 ? "default" : "secondary"}>
                v{release.version}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {format(new Date(release.date), 'MMM d, yyyy')}
              </span>
              {idx === 0 && (
                <Badge variant="outline" className="text-xs">Latest</Badge>
              )}
            </div>
            
            <h4 className="font-medium text-sm">{release.title}</h4>
            
            <ul className="space-y-1">
              {release.changes.map((change, cIdx) => (
                <li key={cIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <Sparkles className="h-3 w-3 mt-1 text-primary flex-shrink-0" />
                  {change}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 6. Contextual Help Tooltip

Reusable tooltip for complex features:

```typescript
// src/components/help/ContextualHelpTooltip.tsx
interface ContextualHelpTooltipProps {
  title: string;
  description: string;
  steps?: string[];
  learnMoreLink?: string;
}

export function ContextualHelpTooltip({
  title,
  description,
  steps,
  learnMoreLink
}: ContextualHelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            type="button"
            className="inline-flex items-center justify-center rounded-full w-5 h-5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={`Help: ${title}`}
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          className="max-w-xs p-4"
          sideOffset={8}
        >
          <div className="space-y-2">
            <p className="font-medium text-sm">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
            
            {steps && steps.length > 0 && (
              <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-1 mt-2">
                {steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            )}
            
            {learnMoreLink && (
              <a 
                href={learnMoreLink} 
                className="text-xs text-primary hover:underline block mt-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more →
              </a>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

### 7. Empty State Component

Reusable component for empty data states:

```typescript
// src/components/help/EmptyState.tsx
interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  tips?: string[];
}

export function EmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  action,
  secondaryAction,
  tips
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button onClick={action.onClick}>
              <Plus className="mr-2 h-4 w-4" />
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
      
      {tips && tips.length > 0 && (
        <div className="mt-8 bg-muted/50 rounded-lg p-4 max-w-md text-left">
          <p className="text-sm font-medium flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Quick Tips
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### 8. Breadcrumbs Component

Dynamic breadcrumb navigation:

```typescript
// src/components/layout/Breadcrumbs.tsx
const routeMap: Record<string, { label: string; parent?: string }> = {
  '/dashboard': { label: 'Dashboard' },
  '/students': { label: 'Students', parent: '/dashboard' },
  '/courses': { label: 'Courses', parent: '/dashboard' },
  '/faculty': { label: 'Faculty', parent: '/dashboard' },
  '/fees': { label: 'Fees', parent: '/dashboard' },
  '/attendance': { label: 'Attendance', parent: '/dashboard' },
  '/exams': { label: 'Exams', parent: '/dashboard' },
  '/library': { label: 'Library', parent: '/dashboard' },
  '/reports': { label: 'Reports', parent: '/dashboard' },
  '/settings': { label: 'Settings', parent: '/dashboard' },
  '/id-cards': { label: 'ID Cards', parent: '/dashboard' },
  '/inventory': { label: 'Inventory', parent: '/dashboard' },
  '/hostel': { label: 'Hostel', parent: '/dashboard' },
  '/transport': { label: 'Transport', parent: '/dashboard' },
  '/events': { label: 'Events', parent: '/dashboard' },
  '/placements': { label: 'Placements', parent: '/dashboard' },
  '/grievances': { label: 'Grievances', parent: '/dashboard' },
  '/student-promotion': { label: 'Student Promotion', parent: '/dashboard' },
  // ... more routes
};

export function Breadcrumbs() {
  const location = useLocation();
  const currentRoute = location.pathname;
  
  // Don't show on dashboard (root page after login)
  if (currentRoute === '/dashboard') return null;
  
  const buildBreadcrumbs = () => {
    const crumbs: { path: string; label: string }[] = [];
    let current = currentRoute;
    
    while (current && routeMap[current]) {
      crumbs.unshift({ path: current, label: routeMap[current].label });
      current = routeMap[current].parent || '';
    }
    
    return crumbs;
  };
  
  const breadcrumbs = buildBreadcrumbs();
  
  if (breadcrumbs.length <= 1) return null;
  
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.path}>
            <BreadcrumbItem>
              {idx === breadcrumbs.length - 1 ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={crumb.path}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {idx < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
```

### 9. Footer Component

Footer with version and support links:

```typescript
// src/components/layout/Footer.tsx
export function Footer() {
  const { version, supportEmail } = APP_CONFIG;
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t bg-muted/30 py-3 px-4 md:px-6 text-xs text-muted-foreground">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>EduFlow v{version}</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">© {currentYear} EduFlow. All rights reserved.</span>
        </div>
        
        <div className="flex items-center gap-4">
          <a href={`mailto:${supportEmail}`} className="hover:text-foreground transition-colors">
            Contact Support
          </a>
          <span>•</span>
          <button 
            onClick={() => window.open('/product-tour', '_blank')}
            className="hover:text-foreground transition-colors"
          >
            Documentation
          </button>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            Press <kbd className="px-1 py-0.5 font-mono bg-muted border rounded text-[10px]">Ctrl+H</kbd> for help
          </span>
        </div>
      </div>
    </footer>
  );
}
```

### 10. Global Keyboard Shortcuts Hook

Handle global keyboard shortcuts:

```typescript
// src/hooks/useKeyboardShortcuts.tsx
interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrlKey ? (event.ctrlKey || event.metaKey) : true;
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        
        if (ctrlMatch && shiftMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
      
      // Quick search with "/" key (when not in input)
      if (event.key === '/' && !isInputFocused()) {
        event.preventDefault();
        document.querySelector<HTMLInputElement>('[data-tour="header-search"] input')?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

function isInputFocused() {
  const activeElement = document.activeElement;
  return activeElement?.tagName === 'INPUT' || 
         activeElement?.tagName === 'TEXTAREA' ||
         activeElement?.hasAttribute('contenteditable');
}
```

### 11. Header Update

Add Help button to header:

```typescript
// In Header.tsx - Add after NotificationDropdown
<Button 
  variant="ghost" 
  size="icon" 
  onClick={() => setHelpOpen(true)}
  aria-label="Help and support"
  data-tour="header-help"
>
  <HelpCircle className="h-5 w-5" />
</Button>

<HelpDrawer open={helpOpen} onOpenChange={setHelpOpen} />
```

### 12. Layout Update

Add Footer and Breadcrumbs:

```typescript
// In Layout.tsx
<main 
  id="main-content" 
  role="main"
  aria-label="Main content"
  className={cn(
    "flex-1 overflow-y-auto p-3 sm:p-4 md:p-6",
    isMobile && "pb-20"
  )}
>
  <Breadcrumbs />
  {children}
</main>
{!isMobile && <Footer />}
```

---

## File Structure

```text
src/
├── components/
│   ├── help/
│   │   ├── HelpDrawer.tsx              # NEW: Main help drawer
│   │   ├── AppFAQ.tsx                  # NEW: In-app FAQ
│   │   ├── KeyboardShortcuts.tsx       # NEW: Shortcuts reference
│   │   ├── WhatsNewSection.tsx         # NEW: Changelog
│   │   ├── ContextualHelpTooltip.tsx   # NEW: Feature tooltips
│   │   ├── EmptyState.tsx              # NEW: Empty state component
│   │   ├── SupportSection.tsx          # NEW: Support options
│   │   └── index.ts                    # NEW: Barrel exports
│   └── layout/
│       ├── Breadcrumbs.tsx             # NEW: Navigation breadcrumbs
│       ├── Footer.tsx                  # NEW: App footer
│       ├── Header.tsx                  # Modified: Add Help button
│       └── Layout.tsx                  # Modified: Add Footer, Breadcrumbs
├── config/
│   └── appConfig.ts                    # NEW: App configuration
├── hooks/
│   └── useKeyboardShortcuts.tsx        # NEW: Keyboard shortcuts hook
└── pages/
    ├── Students.tsx                    # Modified: Add EmptyState
    ├── Fees.tsx                        # Modified: Add EmptyState
    └── Attendance.tsx                  # Modified: Add contextual help
```

---

## Implementation Checklist

### Phase 1: Core Help Infrastructure
1. Create appConfig.ts with version and changelog
2. Create HelpDrawer component
3. Create AppFAQ component
4. Create KeyboardShortcuts component
5. Create WhatsNewSection component
6. Create SupportSection component
7. Create help/index.ts barrel exports

### Phase 2: Helper Components
8. Create ContextualHelpTooltip component
9. Create EmptyState component
10. Create useKeyboardShortcuts hook

### Phase 3: Layout Updates
11. Create Breadcrumbs component
12. Create Footer component
13. Update Header.tsx with Help button
14. Update Layout.tsx with Footer and Breadcrumbs

### Phase 4: Page Integration
15. Add EmptyState to Students page
16. Add EmptyState to Fees page
17. Add contextual help tooltips to complex features
18. Add keyboard shortcut hint to search input

### Phase 5: Keyboard Shortcuts
19. Implement Ctrl+H for help drawer
20. Implement / for quick search
21. Add Ctrl+K as alternative search shortcut

---

## Empty State Examples by Page

| Page | Empty State Message | Tips |
|------|-------------------|------|
| Students | "No students enrolled yet" | "Add your first student", "Import from Excel" |
| Fees | "No fee records found" | "Set up fee structure first", "Assign fees to students" |
| Attendance | "No attendance sessions yet" | "Mark attendance for today", "Create a session schedule" |
| Library | "No books in catalog" | "Add books manually", "Import book list" |
| Exams | "No exams scheduled" | "Create your first exam", "Import question bank" |

---

## Keyboard Shortcuts Summary

| Shortcut | Action |
|----------|--------|
| `/` or `Ctrl+K` | Open global search |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+H` | Open help drawer |
| `Escape` | Close dialogs/drawers |
| `Ctrl+S` | Save current form |
| `Ctrl+N` | New item (context-aware) |

---

## Support Section Content

The support tab in the help drawer includes:
- Email support: support@eduflow.com
- Phone support: Toll-free number
- Live chat: Button to open chat widget
- Documentation link: Opens ProductTourPage
- Video tutorials: Links to tutorial videos
- Report a bug: Opens feedback form

---

## Dependencies

No new dependencies required. Uses existing:
- `@radix-ui/react-accordion` - FAQ accordion
- `@radix-ui/react-tooltip` - Contextual tooltips
- `lucide-react` - Icons
- `date-fns` - Date formatting
- Existing shadcn/ui components (Sheet, Tabs, Badge, etc.)

