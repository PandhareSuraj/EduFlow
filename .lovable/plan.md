

# Make EduFlow Logo Bigger Across All Pages

## Current Logo Sizes (and Proposed)

| Location | File | Current Size | New Size |
|----------|------|-------------|----------|
| **Landing page header** | `Index.tsx` (line 109) | `h-10 md:h-12 lg:h-14` | `h-14 md:h-16 lg:h-20` |
| **Landing mobile menu** | `Index.tsx` (line 147) | `h-10` | `h-14` |
| **Landing footer** | `Index.tsx` (line 536) | `h-8` | `h-12` |
| **Auth page** | `Auth.tsx` (line 251) | `h-28 md:h-32` | `h-32 md:h-40` |
| **Product Tour header** | `ProductTourPage.tsx` (line ~155) | Same as landing | `h-14 md:h-16 lg:h-20` |
| **Product Tour footer** | `ProductTourPage.tsx` (line 273) | `h-6` | `h-10` |
| **404 page** | `NotFound.tsx` (line 73) | `h-16` | `h-24` |
| **Error fallback** | `ErrorFallback.tsx` (line 34) | `h-16` | `h-24` |
| **Page loader** | `page-loader.tsx` (line 16) | `h-16` | `h-24` |
| **Sidebar (branding)** | `AppSidebar.tsx` (line 207) | `h-8 w-8` | `h-10 w-10` |
| **Header (branding)** | `Header.tsx` (line 93) | `h-10 w-10` | `h-12 w-12` |

## Technical Details

### Files to Modify (7 files)
1. **`src/pages/Index.tsx`** -- 3 logo instances (header, mobile menu, footer)
2. **`src/pages/Auth.tsx`** -- 1 instance (hero logo)
3. **`src/pages/ProductTourPage.tsx`** -- 2 instances (header, footer)
4. **`src/pages/NotFound.tsx`** -- 1 instance
5. **`src/components/error/ErrorFallback.tsx`** -- 1 instance
6. **`src/components/ui/page-loader.tsx`** -- 1 instance
7. **`src/components/layout/AppSidebar.tsx`** -- 1 instance (college branding logo)
8. **`src/components/layout/Header.tsx`** -- 1 instance (college branding logo)

Each change is a single Tailwind class update (e.g., `h-16` to `h-24`). No structural or layout changes needed.
