

# Application Performance Optimization

## Overview

This plan implements comprehensive performance optimizations to achieve First Contentful Paint under 1.5 seconds, including enhanced lazy loading, image optimization, memoization, virtual scrolling for long lists, debounced search inputs, critical resource preloading, vendor bundle splitting, and an enhanced service worker.

---

## Current State Analysis

| Area | Current Status | Gap |
|------|---------------|-----|
| Lazy Loading | Implemented | All 35+ pages already use React.lazy() |
| Image loading="lazy" | Partially implemented | Some images missing attribute, some use eager for LCP |
| WebP Format | Not implemented | All images are PNG/JPEG |
| useMemo | 12 files use it | Need more for expensive computations |
| React.memo | Not used | No list item memoization |
| Virtual Scrolling | Not implemented | Tables render all rows |
| Search Debounce | 2 hooks have it | ~20+ search inputs call setState directly |
| Resource Preloading | Not implemented | No preload hints in HTML |
| Bundle Splitting | Basic Vite defaults | No manual chunk configuration |
| Service Worker | Implemented | Needs runtime caching strategy improvements |

### Files Needing Debounce (High Priority)

Based on search analysis, these files have search inputs without debounce:
- `src/pages/Students.tsx` - setSearchTerm direct call
- `src/pages/Fees.tsx` - setSearchTerm direct call  
- `src/pages/Courses.tsx` - setSearchTerm direct call
- `src/pages/Faculty.tsx` - setSearchTerm direct call
- `src/pages/Library.tsx` - setSearchTerm direct call
- `src/pages/Exams.tsx` - 2 search inputs without debounce
- `src/pages/Inventory.tsx` - setSearchQuery direct call
- `src/pages/IDCards.tsx` - setSearchTerm direct call
- And 10+ more components

### Pages with Long Lists Needing Virtual Scrolling

- **Students page**: Can have 500+ students
- **Fees page**: Renders all fee records
- **Results/Exams**: Large result sets
- **Library**: Book catalogs can be large

---

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/hooks/useDebounce.tsx` | Generic debounce hook |
| Create | `src/hooks/useDebouncedSearch.tsx` | Search-specific debounce wrapper |
| Create | `src/components/ui/virtualized-table.tsx` | Virtual scrolling table component |
| Create | `src/components/ui/optimized-image.tsx` | Image component with lazy loading + WebP |
| Create | `src/components/lists/MemoizedTableRow.tsx` | Memoized table row component |
| Modify | `vite.config.ts` | Add manual chunk splitting |
| Modify | `index.html` | Add preload hints for critical resources |
| Modify | `public/service-worker.js` | Enhanced caching strategies |
| Modify | `src/pages/Students.tsx` | Add debounce + virtual scrolling + memoization |
| Modify | `src/pages/Fees.tsx` | Add debounce + virtual scrolling |
| Modify | `src/pages/Courses.tsx` | Add debounce + memoization |
| Modify | `src/pages/Faculty.tsx` | Add debounce |
| Modify | `src/pages/Library.tsx` | Add debounce |
| Modify | `src/pages/Exams.tsx` | Add debounce |
| Modify | `src/components/product-tour/ScreenshotShowcase.tsx` | Optimize images |

---

## Implementation Details

### 1. Generic Debounce Hook

Create a reusable debounce hook for any value:

```typescript
// src/hooks/useDebounce.tsx
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

**Usage in Components:**
```typescript
const [searchTerm, setSearchTerm] = useState("");
const debouncedSearch = useDebounce(searchTerm, 300);

// Use debouncedSearch for filtering instead of searchTerm
const filteredStudents = useMemo(() => {
  return students.filter(s => 
    s.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );
}, [students, debouncedSearch]);
```

### 2. Search-Specific Debounce Wrapper

For components needing search callbacks:

```typescript
// src/hooks/useDebouncedSearch.tsx
import { useState, useCallback, useRef, useEffect } from 'react';

export function useDebouncedSearch<T>(
  searchFn: (term: string) => Promise<T[]> | T[],
  delay: number = 300
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!term || term.length < 2) {
      setResults([]);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await searchFn(term);
        setResults(data);
      } finally {
        setIsSearching(false);
      }
    }, delay);
  }, [searchFn, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { searchTerm, handleSearch, results, isSearching, setSearchTerm };
}
```

### 3. Virtual Scrolling Table Component

Create a virtualized table for long lists using windowing:

**Key Features:**
- Only renders visible rows (viewport + buffer)
- Handles 1000+ rows smoothly
- Preserves table semantics for accessibility
- Integrates with existing Table components

```typescript
// src/components/ui/virtualized-table.tsx
interface VirtualizedTableProps<T> {
  data: T[];
  rowHeight: number;
  visibleRows?: number;
  renderRow: (item: T, index: number) => React.ReactNode;
  renderHeader: () => React.ReactNode;
}

function VirtualizedTable<T>({ 
  data, 
  rowHeight = 52, 
  visibleRows = 15,
  renderRow,
  renderHeader 
}: VirtualizedTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  
  const totalHeight = data.length * rowHeight;
  const startIndex = Math.floor(scrollTop / rowHeight);
  const endIndex = Math.min(startIndex + visibleRows + 2, data.length);
  
  const visibleData = data.slice(startIndex, endIndex);
  const offsetY = startIndex * rowHeight;

  return (
    <div 
      ref={containerRef}
      className="overflow-auto"
      style={{ height: visibleRows * rowHeight }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <Table>
          <TableHeader style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            {renderHeader()}
          </TableHeader>
          <TableBody style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleData.map((item, idx) => renderRow(item, startIndex + idx))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

### 4. Memoized Table Row Component

Prevent re-renders of unchanged rows:

```typescript
// src/components/lists/MemoizedTableRow.tsx
interface StudentRowProps {
  student: Student;
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  getStatusColor: (status: string) => string;
}

const StudentRow = React.memo(function StudentRow({
  student,
  onView,
  onEdit,
  onDelete,
  getStatusColor
}: StudentRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{student.student_id}</TableCell>
      <TableCell>{student.name}</TableCell>
      {/* ... rest of cells */}
    </TableRow>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if student data changed
  return (
    prevProps.student.id === nextProps.student.id &&
    prevProps.student.status === nextProps.student.status &&
    prevProps.student.name === nextProps.student.name
  );
});
```

### 5. Optimized Image Component

Create a wrapper for images with best practices:

```typescript
// src/components/ui/optimized-image.tsx
interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  priority?: boolean; // For above-the-fold images
  fallback?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  priority = false,
  fallback = '/placeholder.svg',
  className,
  ...props 
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  
  return (
    <img
      src={error ? fallback : src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      onError={() => setError(true)}
      className={cn(
        "transition-opacity duration-300",
        className
      )}
      {...props}
    />
  );
}
```

### 6. Vite Bundle Splitting Configuration

Configure manual chunks for better caching:

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => ({
  // ... existing config
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - rarely change
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip'
          ],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-charts': ['recharts'],
          'vendor-utils': ['date-fns', 'date-fns-tz', 'lodash'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-pdf': ['jspdf', 'jspdf-autotable', 'html2canvas'],
        }
      }
    },
    chunkSizeWarningLimit: 500,
  }
}));
```

### 7. Critical Resource Preloading

Add preload hints to index.html:

```html
<!-- index.html -->
<head>
  <!-- ... existing meta tags -->
  
  <!-- Preload critical fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- Preload critical assets -->
  <link rel="preload" href="/src/index.css" as="style">
  <link rel="modulepreload" href="/src/main.tsx">
  
  <!-- DNS prefetch for external services -->
  <link rel="dns-prefetch" href="https://supabase.co">
  
  <!-- Preload main logo for LCP -->
  <link rel="preload" as="image" href="/src/assets/eduflow-logo.png">
</head>
```

### 8. Enhanced Service Worker

Improve caching strategies:

```javascript
// public/service-worker.js
const CACHE_NAME = 'eduflow-v2';
const STATIC_CACHE = 'eduflow-static-v2';
const DYNAMIC_CACHE = 'eduflow-dynamic-v2';

// Static assets - cache first
const staticAssets = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(staticAssets))
  );
  self.skipWaiting();
});

// Fetch - network first for API, cache first for static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // API requests - network first with cache fallback
  if (url.hostname.includes('supabase')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets - cache first
  if (
    request.destination === 'image' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML - network first
  if (request.destination === 'document') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Default - stale while revalidate
  event.respondWith(staleWhileRevalidate(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match(request);
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });
  
  return cached || fetchPromise;
}
```

### 9. useMemo for Expensive Computations

Add memoization to pages with heavy filtering:

**Students.tsx Pattern:**
```typescript
// Memoize filtered results
const filteredStudents = useMemo(() => {
  return students.filter(student => {
    const matchesSearch = 
      student.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      student.student_id?.toLowerCase().includes(debouncedSearch.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
}, [students, debouncedSearch, statusFilter]);

// Memoize stats calculations
const stats = useMemo(() => ({
  total: students.length,
  active: students.filter(s => s.status === 'active').length,
  graduated: students.filter(s => s.status === 'graduated').length,
  pendingFees: students.filter(s => 
    s.student_fees?.some(fee => fee.balance_amount > 0)
  ).length
}), [students]);
```

---

## File Structure

```text
src/
├── hooks/
│   ├── useDebounce.tsx           # NEW: Generic debounce
│   └── useDebouncedSearch.tsx    # NEW: Search-specific debounce
├── components/
│   ├── ui/
│   │   ├── virtualized-table.tsx # NEW: Virtual scrolling table
│   │   └── optimized-image.tsx   # NEW: Optimized image component
│   └── lists/
│       └── MemoizedTableRow.tsx  # NEW: Memoized row components
├── pages/
│   ├── Students.tsx              # Modified: Debounce + memoization
│   ├── Fees.tsx                  # Modified: Debounce + memoization
│   └── Courses.tsx               # Modified: Debounce + memoization
public/
└── service-worker.js             # Modified: Enhanced caching
index.html                        # Modified: Preload hints
vite.config.ts                    # Modified: Bundle splitting
```

---

## Implementation Checklist

### Phase 1: Core Hooks
1. Create `useDebounce` hook
2. Create `useDebouncedSearch` hook

### Phase 2: UI Components
3. Create `VirtualizedTable` component
4. Create `OptimizedImage` component
5. Create `MemoizedTableRow` components

### Phase 3: Page Optimizations
6. Update Students.tsx with debounce + useMemo + React.memo
7. Update Fees.tsx with debounce + useMemo
8. Update Courses.tsx with debounce + useMemo
9. Update Faculty.tsx with debounce
10. Update Library.tsx with debounce
11. Update remaining search inputs (Exams, Inventory, IDCards, etc.)

### Phase 4: Build Optimizations
12. Configure vite.config.ts with manual chunks
13. Add preload hints to index.html
14. Enhance service-worker.js with better caching strategies

### Phase 5: Image Optimization
15. Add loading="lazy" to below-fold images
16. Replace OptimizedImage in ScreenshotShowcase
17. Ensure priority images use loading="eager"

---

## Performance Improvements Summary

| Optimization | Expected Impact |
|-------------|-----------------|
| Debounced search (300ms) | Reduces API calls by 80-90% |
| useMemo on filters | Prevents recalculation on every render |
| React.memo on list items | Prevents re-render of unchanged rows |
| Virtual scrolling | Only renders ~15 rows vs 500+ |
| Bundle splitting | Better cache hit rates |
| Resource preloading | Faster LCP, reduced blocking |
| Enhanced service worker | Offline support, faster repeat visits |
| Image lazy loading | Deferred non-critical image loading |

---

## Target Metrics

| Metric | Current (Est.) | Target |
|--------|---------------|--------|
| First Contentful Paint | ~2.5s | < 1.5s |
| Time to Interactive | ~4s | < 3s |
| Initial Bundle Size | ~800KB | < 400KB (main) |
| Search Response Time | Instant (blocking) | 300ms debounced |
| Table Render (500 rows) | ~800ms | < 50ms (virtual) |
| Repeat Visit Load | ~2s | < 500ms (cached) |

---

## Dependencies

No new dependencies required. Uses:
- Existing lodash for debounce utilities in some hooks
- Native browser APIs for virtual scrolling
- Built-in React.memo and useMemo
- Vite's built-in Rollup configuration

