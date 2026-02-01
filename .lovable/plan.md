

# Add Security Headers for Production Readiness

## Overview

This plan adds essential HTTP security headers to protect the EduFlow platform against common web vulnerabilities like clickjacking and cross-site scripting (XSS). Since Lovable uses static hosting, we'll create a `_headers` file in the public folder.

---

## What These Headers Do (Non-Technical)

| Header | Protection |
|--------|------------|
| X-Frame-Options | Prevents your site from being embedded in malicious websites |
| Content-Security-Policy | Controls what resources can load on your pages |
| X-Content-Type-Options | Prevents browsers from guessing file types incorrectly |
| Referrer-Policy | Controls what information is shared when users click links |
| Permissions-Policy | Restricts access to device features like camera/microphone |

---

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| Create | `public/_headers` | Define security headers for static hosting |
| Modify | `index.html` | Add meta tag fallback for CSP |

---

## Implementation Details

### 1. Create `public/_headers` File

This file configures HTTP headers for all routes. The format is compatible with Netlify, Cloudflare Pages, and similar static hosting platforms.

```text
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.youtube.com; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'
```

**Header Breakdown:**

- **X-Frame-Options: SAMEORIGIN** - Only allows the page to be embedded in iframes from the same origin (prevents clickjacking)

- **X-Content-Type-Options: nosniff** - Prevents MIME-type sniffing attacks

- **Referrer-Policy: strict-origin-when-cross-origin** - Sends full URL for same-origin requests, only origin for cross-origin

- **Permissions-Policy** - Disables unnecessary browser APIs (camera, microphone, geolocation) unless explicitly needed

- **Content-Security-Policy** - Detailed breakdown:
  - `default-src 'self'` - Only load resources from same origin by default
  - `script-src 'self' 'unsafe-inline' 'unsafe-eval'` - Allow inline scripts (required by Vite/React)
  - `style-src 'self' 'unsafe-inline'` - Allow inline styles (required by Tailwind)
  - `img-src 'self' data: https: blob:` - Allow images from same origin, data URIs, any HTTPS, and blob URLs
  - `connect-src 'self' https://*.supabase.co wss://*.supabase.co` - Allow API calls to Supabase
  - `frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com` - Allow YouTube embeds for intro video
  - `frame-ancestors 'self'` - Prevents page from being embedded elsewhere (modern replacement for X-Frame-Options)

### 2. Update `index.html` with Meta Tag Fallback

Add a CSP meta tag as a fallback for environments where `_headers` may not be processed:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.youtube.com; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'">
```

---

## Technical Notes

### CSP Directives Explained

```text
default-src 'self'
├── script-src 'self' 'unsafe-inline' 'unsafe-eval'
│   ├── 'self' - Scripts from same origin
│   ├── 'unsafe-inline' - Required for Vite HMR and inline event handlers
│   ├── 'unsafe-eval' - Required for some React/Vite runtime features
│   └── youtube.com - For YouTube iframe API
├── style-src 'self' 'unsafe-inline'
│   ├── 'self' - Stylesheets from same origin
│   ├── 'unsafe-inline' - Required for Tailwind/Radix inline styles
│   └── fonts.googleapis.com - Google Fonts stylesheets
├── font-src 'self' https://fonts.gstatic.com
│   └── For Google Fonts font files
├── img-src 'self' data: https: blob:
│   ├── 'self' - Local images
│   ├── data: - Base64 encoded images
│   ├── https: - All HTTPS images (for Supabase storage, avatars, etc.)
│   └── blob: - For dynamically generated images
├── connect-src 'self' https://*.supabase.co wss://*.supabase.co
│   ├── Supabase REST API calls
│   └── Supabase realtime WebSocket connections
├── frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com
│   └── YouTube video embeds (IntroVideoDialog)
├── frame-ancestors 'self'
│   └── Prevents clickjacking (CSP equivalent of X-Frame-Options)
├── base-uri 'self'
│   └── Restricts base element URLs
└── form-action 'self'
    └── Forms can only submit to same origin
```

### Why `unsafe-inline` and `unsafe-eval` Are Needed

These are required because:
1. **Vite** - Uses inline scripts for hot module replacement in development
2. **React** - Some runtime features require eval
3. **Tailwind CSS** - Generates inline styles dynamically
4. **Radix UI** - Injects inline styles for accessibility

In a stricter production environment, you could use nonce-based CSP, but that requires server-side rendering support.

---

## Files Summary

| Action | File |
|--------|------|
| Create | `public/_headers` |
| Modify | `index.html` |

---

## Post-Implementation Verification

After deployment, verify headers using:
1. Browser DevTools → Network tab → Select document → Headers
2. [securityheaders.com](https://securityheaders.com) - Free online scanner
3. Browser console for any CSP violation errors

