

# Add Missing Security Headers

## Current Status

The security headers implementation from the previous change covers most requirements. Only minor additions are needed.

---

## Changes Required

| Action | File | Change |
|--------|------|--------|
| Modify | `public/_headers` | Add X-XSS-Protection header |
| Modify | `index.html` | Keep CSP meta tag as-is (already comprehensive) |

---

## Implementation Details

### Update `public/_headers`

Add the X-XSS-Protection header to the existing file:

**Current:**
```text
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: ...
```

**Updated:**
```text
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: ...
```

---

## Notes on Specific Requests

### font-src Directive
The current `font-src 'self' https://fonts.gstatic.com` is actually more appropriate than `font-src 'self' data:` because:
- The platform uses Google Fonts (loaded from fonts.gstatic.com)
- `data:` URIs for fonts are rarely needed and could be a security concern

### HttpOnly and Secure Cookie Flags
These cannot be configured from static hosting files. They are:
- **Automatically handled by Supabase** - The Supabase client library sets secure cookie flags for authentication tokens
- **Server-side configuration** - Cookie flags are set when cookies are created on the server, not controllable from frontend

### X-XSS-Protection Note
This header is considered legacy - modern browsers with CSP support ignore it. However, it provides protection for older browsers that don't fully support CSP, so adding it improves compatibility.

---

## Files Summary

| Action | File |
|--------|------|
| Modify | `public/_headers` |

---

## Final Header Configuration

After this change, the complete security headers will be:

```text
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.youtube.com; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'
```

