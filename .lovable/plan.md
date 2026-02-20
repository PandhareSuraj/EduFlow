

# Add Privacy Policy and Terms of Service Pages

## Overview
Create two new pages -- Privacy Policy and Terms of Service -- with professional, relevant legal content tailored to an education management SaaS platform. Then wire up the dead footer links on the landing page to navigate to these pages.

## What Will Be Built

### Privacy Policy Page
A comprehensive page covering:
- Information we collect (student data, institutional data, usage analytics)
- How we use the information
- Data storage and security (Supabase-backed, encrypted)
- Third-party sharing policies
- Student data protection (FERPA/data privacy compliance references)
- Cookies and tracking
- User rights (access, correction, deletion)
- Contact information for privacy concerns

### Terms of Service Page
A comprehensive page covering:
- Acceptance of terms
- Service description (cloud-based education management)
- User accounts and responsibilities
- Acceptable use policy
- Intellectual property
- Data ownership (institutions own their data)
- Service availability and uptime
- Limitation of liability
- Termination
- Governing law
- Contact information

### Footer Link Updates
Make the "Privacy Policy" and "Terms of Service" links in the landing page footer clickable and navigable.

## Technical Details

### New Files (2)
1. **`src/pages/PrivacyPolicy.tsx`** -- Standalone public page (no auth required) with styled legal content, consistent header/footer with landing page styling
2. **`src/pages/TermsOfService.tsx`** -- Same structure as Privacy Policy

### Modified Files (2)
3. **`src/App.tsx`** -- Add two new public routes:
   - `/privacy-policy` -> `PrivacyPolicy`
   - `/terms-of-service` -> `TermsOfService`

4. **`src/pages/Index.tsx`** -- Update footer Legal section (lines 674-677): replace static `<li>` elements with clickable items using `onClick={() => navigate('/privacy-policy')}` and `onClick={() => navigate('/terms-of-service')}`, matching the existing Product section link styling

### Design Approach
- Pages will use the same visual style as the landing page (gradient background, consistent typography)
- Include a "Back to Home" link at the top
- Use proper heading hierarchy and readable paragraph formatting
- Last updated date shown at the top
- Company name and contact details pulled from `APP_CONFIG`
