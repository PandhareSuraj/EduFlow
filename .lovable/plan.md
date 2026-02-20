

# Minor Improvements Plan -- EduFlow Polish & Quality Pass

## Overview
A collection of targeted, low-risk improvements across the app to improve reliability, user experience, accessibility, and code quality. Each item is small and independent.

---

## 1. Restore Edge Function Config in `supabase/config.toml`

The last diff accidentally stripped all edge function configurations (JWT verification settings for 15+ functions). This needs to be restored immediately -- it is likely causing runtime issues (including the homepage loading problems reported earlier, since unauthenticated calls to functions that now default to requiring JWT will fail).

**File:** `supabase/config.toml`
**Change:** Re-add all `[functions.*]` blocks with their `verify_jwt` settings.

---

## 2. Add Privacy/Terms Links to the App Footer (Logged-in Layout)

The internal `Footer.tsx` (shown to logged-in users) has no links to Privacy Policy or Terms of Service. Add them for consistency with the landing page footer.

**File:** `src/components/layout/Footer.tsx`
**Change:** Add Privacy Policy and Terms of Service links next to the existing "Documentation" link.

---

## 3. Loading State Improvements on Landing Page

The current loading spinner is a plain circle with no branding. Replace it with the EduFlow logo + a subtle animation for a more professional feel.

**File:** `src/pages/Index.tsx` (lines 153-159)
**Change:** Show the EduFlow logo with a fade/pulse animation instead of a generic spinner.

---

## 4. Add `aria-label` to Footer Legal Buttons

The footer legal links use `<button>` elements but lack accessible labels.

**File:** `src/pages/Index.tsx` (lines 675-676)
**Change:** Add `aria-label="View Privacy Policy"` and `aria-label="View Terms of Service"`.

---

## 5. Scroll-to-Top on Legal Page Navigation

When navigating from the landing page footer to Privacy Policy or Terms of Service, the page may not scroll to the top.

**Files:** `src/pages/PrivacyPolicy.tsx`, `src/pages/TermsOfService.tsx`
**Change:** Add `useEffect(() => { window.scrollTo(0, 0); }, []);` on mount.

---

## 6. Add `<title>` / Page Title to Legal Pages

Neither Privacy Policy nor Terms of Service sets a document title, so the browser tab shows the default.

**Files:** `src/pages/PrivacyPolicy.tsx`, `src/pages/TermsOfService.tsx`
**Change:** Use `usePageTitle('Privacy Policy')` and `usePageTitle('Terms of Service')` (hook already exists at `src/hooks/usePageTitle.tsx`).

---

## 7. Landing Page Header -- Add "Back to top" Scroll on Logo Click

The logo in the sticky header is visually clickable (cursor-pointer, hover effects) but does nothing.

**File:** `src/pages/Index.tsx` (line 188)
**Change:** Add `onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}`.

---

## 8. Mobile Menu -- Close on Navigation

Verify the mobile menu Sheet closes after any link click. The `scrollToSection` already calls `setMobileMenuOpen(false)`, but navigation links (Product Tour, Auth) should also close it.

**File:** `src/pages/Index.tsx`
**Change:** Wrap navigate calls in mobile menu items to also call `setMobileMenuOpen(false)`.

---

## 9. Improve 404 Page for Unauthenticated Users

The 404 page suggests "Sign In" but doesn't mention the product tour or legal pages. Add a link to Product Tour for better discovery.

**File:** `src/pages/NotFound.tsx`
**Change:** Add Product Tour to the unauthenticated suggested pages list.

---

## 10. App Footer -- Use React Router Links Instead of `<a>` Tags

The internal footer uses `<a href="/product-tour" target="_blank">` which causes a full page reload. Replace with React Router navigation for SPA behavior.

**File:** `src/components/layout/Footer.tsx`
**Change:** Replace `<a>` tags with `useNavigate()` + `onClick` handlers or `<Link>` components.

---

## Implementation Order
1. Restore `supabase/config.toml` (critical fix)
2. Legal pages: scroll-to-top + page titles (quick wins)
3. Footer improvements (both landing + app)
4. Landing page polish (loading state, logo click, aria-labels, mobile menu)
5. 404 page enhancement

## Estimated Scope
- 7 files modified
- 0 new files
- All changes are minor (1-10 lines each)
- No new dependencies

