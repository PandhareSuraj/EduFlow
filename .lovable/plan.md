

# Lead Generation System Upgrade

## Overview
This plan integrates an external Inquiry API across the entire EduFlow platform to centralize lead capture from multiple touchpoints. The system will send leads to a central Supabase function endpoint with automatic source tracking (identifying leads as coming from `eduflow_platform`).

## Architecture

```text
+---------------------------+      +---------------------------+
|   Landing Pages           |      |   Shared Components       |
|  - Index.tsx              |      |  - InquiryFormDialog      |
|  - ProductTourPage.tsx    |  ->  |  - FloatingContactButton  |
|  - FAQSection.tsx         |      |  - Navbar CTA Button      |
+---------------------------+      +---------------------------+
              |                                  |
              v                                  v
        +------------------------------------------+
        |          API Helper (utils/api.ts)       |
        |   - submitInquiry() function             |
        |   - Zod validation                       |
        |   - Error mapping                        |
        +------------------------------------------+
                          |
                          v
        +------------------------------------------+
        |  External API Endpoint                   |
        |  POST /submit-inquiry                    |
        +------------------------------------------+
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/utils/inquiryApi.ts` | API helper with types, validation, and submission logic |
| `src/components/lead-generation/InquiryFormDialog.tsx` | Reusable modal form component |
| `src/components/lead-generation/FloatingContactButton.tsx` | Sticky FAB in bottom-right corner |
| `src/components/lead-generation/index.ts` | Barrel export file |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Add "Book Demo" button to navbar + import FloatingContactButton |
| `src/pages/ProductTourPage.tsx` | Add "Book Demo" button to header + import FloatingContactButton |
| `src/components/product-tour/FAQSection.tsx` | Wire "Contact Support" button to open InquiryFormDialog |
| `src/components/landing/PricingPreview.tsx` | Change Enterprise "Contact Sales" to open InquiryFormDialog |
| `src/lib/validationSchemas.ts` | Add new inquiryFormSchema for the external API |

---

## Technical Details

### 1. API Helper (`src/utils/inquiryApi.ts`)

**Type definitions:**
```typescript
export interface InquiryPayload {
  contact_person: string;  // Required, 2-100 chars
  phone: string;           // Required, 10-15 digits
  source: string;          // Auto-set to "eduflow_platform"
  email?: string;          // Optional, valid email
  company_name?: string;   // Optional (institution name)
  message?: string;        // Optional, max 2000 chars
  priority: string;        // Default: "medium"
}

export interface InquiryError {
  field: string;
  message: string;
}
```

**Zod validation schema:**
```typescript
const inquirySchema = z.object({
  contact_person: z.string().min(2).max(100),
  phone: z.string().regex(/^\d{10,15}$/),
  email: z.string().email().optional().or(z.literal('')),
  company_name: z.string().optional(),
  message: z.string().max(2000).optional(),
});
```

**Submit function:**
- POST to `https://gcyrapukltxjohjfxgza.supabase.co/functions/v1/submit-inquiry`
- Auto-set `source: "eduflow_platform"` and `priority: "medium"`
- Return `{ success: true }` on 201
- Parse 400 errors and map `details` array to field-specific errors

### 2. Inquiry Form Dialog (`src/components/lead-generation/InquiryFormDialog.tsx`)

**Fields:**
- Name (contact_person) - Required, with inline validation
- Phone - Required, 10-15 digits, numeric input handling
- Email - Optional, validates as email
- Institution Name (company_name) - Optional
- Message - Optional, max 2000 chars

**Features:**
- Real-time validation with error messages under fields
- Submit button disabled while `isSubmitting`
- On 201 success: Show Sonner toast "Inquiry Received!", reset form, close dialog
- On 400 error: Map API errors to inline field messages

### 3. Floating Contact Button (`src/components/lead-generation/FloatingContactButton.tsx`)

- Fixed position: `bottom-6 right-6`
- Icon: MessageCircle or Phone from lucide-react
- Gradient background matching brand colors
- Opens InquiryFormDialog on click
- Only visible on public pages (Index, ProductTour)

### 4. Navbar Integration

**Index.tsx changes:**
- Add "Book Demo" button between "Product Tour" and "Sign In" buttons
- Desktop: Full button with CalendarPlus icon
- Mobile: Add to hamburger menu Sheet content

**ProductTourPage.tsx changes:**
- Add "Book Demo" button to header (left of Sign In)

### 5. Existing Component Updates

**FAQSection.tsx:**
- Import InquiryFormDialog
- Wrap "Contact our team" link in DialogTrigger
- Wrap "Contact Support" button in DialogTrigger

**PricingPreview.tsx:**
- Import InquiryFormDialog
- Enterprise plan "Contact Sales" opens inquiry form instead of navigating

---

## Implementation Sequence

1. **Create API helper** (`src/utils/inquiryApi.ts`)
   - Define types and Zod schema
   - Implement `submitInquiry()` function
   - Handle error mapping

2. **Create InquiryFormDialog component**
   - Build form with react-hook-form + zod
   - Wire up to API helper
   - Implement success/error handling

3. **Create FloatingContactButton component**
   - Fixed position styling
   - Dialog trigger integration

4. **Update landing pages**
   - Add navbar CTA buttons
   - Add FloatingContactButton to page layouts

5. **Update existing CTAs**
   - FAQSection contact buttons
   - PricingPreview Enterprise plan button

---

## Validation Rules Summary

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| contact_person | string | Yes | 2-100 characters |
| phone | string | Yes | 10-15 digits only |
| email | string | No | Valid email format |
| company_name | string | No | No specific validation |
| message | string | No | Max 2000 characters |
| source | string | Auto | "eduflow_platform" (snake_case) |
| priority | string | Auto | "medium" |

---

## UI/UX Considerations

- All forms use existing Tailwind theme colors
- Consistent with Dialog/Sheet patterns already in use
- Phone input strips non-numeric characters automatically
- Submit button shows loading state ("Sending...")
- Success toast uses Sonner for consistency
- Error messages appear inline under respective fields
- Forms reset on successful submission

