

## Plan: Fix Header Navigation - Compact Header with Prominent Logo

### Problem Identified
From the screenshot, the header has too much vertical space:
- Current logo: `h-14 md:h-24 lg:h-28` (up to 112px height)
- Current padding: `py-5` (20px vertical padding)
- This creates an oversized header that looks disproportionate

### Solution
Reduce header dimensions while keeping the logo visually prominent:

| Element | Current | Proposed |
|---------|---------|----------|
| Logo height | `h-14 md:h-24 lg:h-28` | `h-10 md:h-12 lg:h-14` |
| Header padding | `py-5` | `py-3` |
| Navigation buttons | Default size | Add `text-sm` for compact look |

### Technical Changes

**File: `src/pages/Index.tsx`**

1. **Reduce logo size** (still prominent but not oversized):
```tsx
// Before
className="h-14 md:h-24 lg:h-28 w-auto ..."

// After  
className="h-10 md:h-12 lg:h-14 w-auto ..."
```
This gives: 40px → 48px → 56px (still larger than typical nav logos at 32-40px)

2. **Reduce header padding**:
```tsx
// Before
<div className="container mx-auto px-4 py-5 flex justify-between items-center">

// After
<div className="container mx-auto px-4 py-3 flex justify-between items-center">
```

3. **Make navigation buttons more compact**:
```tsx
// Add text-sm and reduce icon/button sizing
<Button variant="ghost" onClick={() => navigate('/product-tour')} className="hidden sm:flex text-sm">
  <Map className="mr-1.5 h-3.5 w-3.5" />
  Product Tour
</Button>
```

### Visual Result
- Header height reduced from ~140px to ~70px
- Logo remains the largest element in header (prominent)
- Navigation feels balanced and professional
- Consistent with modern SaaS landing page standards

### Files to Modify
- `src/pages/Index.tsx` - Header section (lines 78-100)

