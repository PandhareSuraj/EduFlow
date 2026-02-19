

# UI/UX Minor Issues Fix Plan

## Issues Found

### 1. Product Tour Header -- Buttons Overflow on Mobile (390px)
The Product Tour header shows "Back to Home", the logo, AND "Book Demo" + "Sign In" buttons all in one row. On mobile, the "Book Demo" button text gets cut off ("Book D...") and the "Sign In" button is completely hidden off-screen.

**Fix**: Hide "Book Demo" and "Sign In" buttons on mobile (`hidden sm:flex`), and add a hamburger menu or simplified mobile header similar to the landing page pattern.

### 2. Footer Links Are Dead (Not Clickable)
All footer links under Product, Company, and Legal columns (Pricing, Security, Roadmap, About Us, Careers, Blog, Contact, Privacy Policy, Terms of Service, Cookie Policy, GDPR) are `<li>` elements with `cursor-pointer` but NO `onClick` handlers or `<a>` tags. They look clickable but do nothing.

**Fix**: 
- "Pricing" should scroll to the pricing section (`scrollToSection('pricing')`)
- "Product Tour" already works (has `onClick`)
- "Contact" should open `InquiryFormDialog`
- All others (Security, Roadmap, About Us, Careers, Blog, Privacy Policy, Terms of Service, Cookie Policy, GDPR) -- either link to real pages or remove the `cursor-pointer` and hover styling to avoid misleading users

### 3. Social Media Links Are Dead
Twitter, LinkedIn, Facebook, Instagram in the footer are just `<span>` tags with no links.

**Fix**: Either add real social media URLs or remove them to avoid misleading visitors.

### 4. "Install App" Button Overlaps Floating Contact Button
On mobile, the "Install App" PWA prompt button (bottom-right) overlaps with the floating contact button (also bottom-right). Both compete for the same space.

**Fix**: Adjust the floating contact button position on mobile to `bottom-20` when the install prompt is visible, or move it to `bottom-left`.

### 5. Stats Counter Shows "0" on Landing Page
The landing page hero stats show "0+", "0+", "0+", "0%" instead of animated numbers (500+, 50,000+, 5,000+, 99.9%). The counter animation uses `setInterval` which seems not to trigger properly.

**Fix**: Review the `useEffect` for the stats counter animation -- it may have a dependency issue or the animation isn't triggering on component mount.

### 6. Copyright Year Says 2025 Instead of 2026
Both the landing page and product tour footers show "2025" but the current date is February 2026.

**Fix**: Use `new Date().getFullYear()` dynamically instead of hardcoding the year.

### 7. App Store Badges in Mobile Showcase Are Fake
The "Download on App Store" and "Get it on Google Play" badges in the Mobile Showcase section are clickable divs but don't link to any actual app store listing. This could erode trust.

**Fix**: Either link them to real listings or add a "Coming Soon" badge/tooltip to set expectations.

### 8. Product Tour Page -- Inconsistent Content Indentation
In `ProductTourPage.tsx`, sections inside `<main>` have inconsistent indentation -- sections 2-11 are not properly nested under `<main>`, they're at the same level. While this doesn't break rendering, it could cause layout issues if `<main>` styling changes.

**Fix**: Properly indent all sections within the `<main>` tag.

## Technical Details

### Files to Modify (3 files)

1. **`src/pages/Index.tsx`**
   - Fix stats counter animation (lines 33, useEffect with statsCount)
   - Make footer links functional or remove misleading styling (lines 650-689)
   - Update copyright year to dynamic (line 683)

2. **`src/pages/ProductTourPage.tsx`**
   - Add mobile-responsive header with hamburger menu or hide desktop buttons on mobile (lines 166-192)
   - Fix copyright year in footer (line ~295)
   - Fix section indentation inside `<main>` (lines 200-280)

3. **`src/components/landing/MobileShowcase.tsx`**
   - Add "Coming Soon" indicator to App Store badges (lines 48-62)

4. **`src/components/lead-generation/FloatingContactButton.tsx`**
   - Adjust position to avoid overlap with "Install App" button on mobile

