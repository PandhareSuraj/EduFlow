

# Fix: "Cannot read properties of null (reading 'useEffect')" Error

## Root Cause

The `Dashboard` component and `usePageTitle` hook import `useEffect` via named imports (`import { useEffect } from "react"`), but during Vite's lazy module loading, the React module reference can sometimes be `null`. Adding an explicit default `import React from 'react'` ensures React is fully initialized before hooks are called.

## Changes

### 1. `src/pages/Dashboard.tsx`
Add `import React from 'react'` at the top of the file (line 1, before all other imports).

### 2. `src/hooks/usePageTitle.tsx`
Add `import React from 'react'` before the `useEffect` import:
```
import React from 'react';
import { useEffect } from 'react';
```

These are the only two files in the error stack trace that need this fix. The admin widget files were already patched in a previous edit.
