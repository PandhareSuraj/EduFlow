

# Update Trust Logos with Realistic Institution Names

## Overview

Replace the current institution names with realistic, generic names appropriate for a startup that's just beginning. Remove references to famous institutions like IIT, NIT, BITS Pilani, IIM, VIT, etc. Also update the "500+" claim to a more realistic number.

---

## Current Issues

| Problem | Why It's an Issue |
|---------|-------------------|
| Famous institution names (IIT, NIT, BITS, IIM, VIT) | Cannot claim these as customers without permission |
| "500+ institutions" claim | Unrealistic for a new startup |
| Names like "Delhi Public School" | DPS is a well-known brand, could be problematic |

---

## Changes

### File to Modify
`src/components/product-tour/TrustLogos.tsx`

### New Institution Names
Replace with realistic, generic college names that sound authentic:

```typescript
const institutions = [
  'Sai Vidya College of Engineering',
  'Shree Balaji Institute of Technology',
  'Nalanda Academy of Arts & Science',
  'Guru Nanak Polytechnic',
  'Bharathi Women\'s College',
  'Vidyapeeth Institute of Management',
  'Sardar Patel Commerce College',
  'Adarsh Nursing College',
  'Sunrise International School',
  'Mahatma Gandhi Institute of Education',
  'Swami Vivekananda Degree College',
  'Chanakya Business School'
];
```

### Updated Tagline
Change from "500+ leading educational institutions" to a more appropriate message:

```typescript
<p className="text-center text-muted-foreground">
  Trusted by <span className="text-primary font-semibold">growing number of</span> educational institutions across India
</p>
```

Or alternatively, use a specific but modest number like "50+" or "100+" if there are actual customers.

---

## Summary of Changes

| Current | Updated |
|---------|---------|
| IIM Bangalore | Vidyapeeth Institute of Management |
| BITS Pilani | Shree Balaji Institute of Technology |
| VIT Vellore | Sai Vidya College of Engineering |
| National Institute of Technology | Nalanda Academy of Arts & Science |
| IIT references | Removed entirely |
| "500+ leading institutions" | "growing number of institutions" |

---

## Technical Details

- Single file modification: `src/components/product-tour/TrustLogos.tsx`
- Lines 4-17: Update institutions array
- Lines 23-25: Update the tagline text
- No other components or files affected

