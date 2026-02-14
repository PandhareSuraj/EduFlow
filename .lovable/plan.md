

# Smart Lead Capture Forms Across Landing Page and Product Tour

## Current State

Currently, inquiry forms (connected to BizFlow CRM) exist at these touchpoints:

| Page | Location | Status |
|------|----------|--------|
| Landing | Header "Book Demo" | Has form |
| Landing | Mobile menu "Book Demo" | Has form |
| Landing | Pricing Enterprise "Contact Sales" | Has form |
| Landing | Bottom CTA section | NO form (just links) |
| Landing | Floating contact button | Has form |
| Product Tour | Header "Book Demo" | Has form |
| Product Tour | Hero "Schedule Live Demo" | NO form (navigates to /auth) |
| Product Tour | Final CTA "Schedule a Demo Call" | Has form |
| Product Tour | FAQ (2 touchpoints) | Has form |
| Product Tour | Floating contact button | Has form |

**Problem**: The landing page hero section (highest visibility area) has no lead capture form, and the bottom CTA just navigates away. The Product Tour hero also sends users to the auth page instead of capturing their info.

## Plan: Add 4 New Form Placements (Total: ~7 per page)

### 1. Landing Page Hero -- "Book a Free Demo" Button
**File**: `src/pages/Index.tsx` (line ~227-245)

Add a third CTA button in the hero section wrapped in `InquiryFormDialog`. This is the highest-traffic area of the page.

- Title: "Book a Free Demo"
- Description: "Get a personalized walkthrough of EduFlow for your institution."

### 2. Landing Page -- Mid-Page CTA Banner After Features Section
**File**: `src/pages/Index.tsx` (after features section, ~line 402)

Add a compact inline CTA banner between Features and "How It Works" sections with a "Request a Callback" button wrapped in `InquiryFormDialog`. This catches users who are exploring features but not ready to scroll further.

### 3. Landing Page Bottom CTA -- Add Inquiry Form to "Schedule Demo" Button
**File**: `src/pages/Index.tsx` (line ~516-524)

Replace the "Take a Tour" button with a "Schedule a Demo" button wrapped in `InquiryFormDialog`, keeping "Start Free Trial" as is.

### 4. Product Tour Hero -- Fix "Schedule Live Demo" Button
**File**: `src/components/product-tour/HeroSection3D.tsx` (line ~113-121)

Change the "Schedule Live Demo" button from `navigate('/auth')` to open `InquiryFormDialog`. This is the highest-visibility CTA on the tour page.

## Result: Smart Form Distribution

**Landing Page (7 touchpoints)**:
1. Header navbar "Book Demo"
2. Mobile menu "Book Demo"
3. Hero section "Book a Free Demo" (NEW)
4. Mid-page CTA banner "Request a Callback" (NEW)
5. Pricing Enterprise "Contact Sales"
6. Bottom CTA "Schedule a Demo" (NEW)
7. Floating contact button

**Product Tour (7 touchpoints)**:
1. Header "Book Demo"
2. Hero "Schedule Live Demo" (FIXED)
3. Final CTA "Schedule a Demo Call"
4. FAQ "Contact our team"
5. FAQ "Contact Support"
6. Floating contact button
7. (Inherits from landing page visits)

## Technical Details

### Files to Modify (3 files)
1. **`src/pages/Index.tsx`** -- Add 3 new `InquiryFormDialog` placements (hero, mid-page banner, bottom CTA)
2. **`src/components/product-tour/HeroSection3D.tsx`** -- Wrap "Schedule Live Demo" in `InquiryFormDialog` instead of navigating to /auth

Each change simply wraps an existing or new `Button` inside the existing `InquiryFormDialog` component -- no new components needed. All submissions go through the same BizFlow CRM API integration.

