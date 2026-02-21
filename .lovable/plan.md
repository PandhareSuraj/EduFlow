

# Fix Inquiry Form Submission Errors

## Problem
The inquiry form shows "Submission Failed - An unexpected error occurred" because the BizFlow CRM API returns a **409 Conflict** status (the lead with that phone number already exists), but the code has no handler for 409 -- it falls through to the generic error case.

## Changes

### 1. Handle 409 Conflict in `src/utils/inquiryApi.ts`

Add a handler for HTTP 409 between the existing 400 and 401/403 handlers. A 409 from the CRM means the lead already exists, so we should treat this as a **success** from the user's perspective (their inquiry is already recorded):

```typescript
if (response.status === 409) {
  return { success: true, message: 'Your inquiry has already been received. Our team will contact you shortly.' };
}
```

### 2. Show custom success message in `src/components/lead-generation/InquiryFormDialog.tsx`

Update the success toast to use the response message (so the 409 "already received" message is shown instead of the default):

```typescript
toast.success('Inquiry Received!', {
  description: response.message || 'Our team will contact you shortly.',
});
```

### 3. Fix CSP `data:` URI warning in `public/_headers`

Add `data:` to the `script-src` directive to stop the CSP violation warning about loading base64 scripts (used by the Vite dev/preview pipeline):

```
script-src 'self' 'unsafe-inline' 'unsafe-eval' data: https://www.youtube.com ...
```

## Summary
- 1 functional fix (409 handling) -- resolves the "Submission Failed" error
- 1 UX improvement (dynamic success message)
- 1 CSP fix (data: URI allowance)
- 3 files modified, no new dependencies

