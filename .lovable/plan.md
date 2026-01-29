
# Add Intro Video & Replace YouTube Links

## Objective
Integrate the EduFlow intro video (https://youtu.be/JUJ-AqucUlY, video ID: `JUJ-AqucUlY`) across the platform by replacing placeholder videos and adding new intro video touchpoints.

## Video ID Extraction
- URL: `https://youtu.be/JUJ-AqucUlY`
- Extracted Video ID: `JUJ-AqucUlY`

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/product-tour/VideoWalkthrough.tsx` | Replace placeholder video ID with new intro video |
| `src/utils/youtubeUtils.ts` | Add constant for default/intro video ID |
| `src/pages/Index.tsx` | Add intro video modal triggered by "Watch Demo" button |
| `src/components/product-tour/HeroSection3D.tsx` | Add video playback option to "Start Interactive Demo" |

---

## Implementation Details

### 1. Update YouTube Utils (`src/utils/youtubeUtils.ts`)

Add a centralized constant for the default intro video:

```typescript
// Default EduFlow intro video ID
export const EDUFLOW_INTRO_VIDEO_ID = 'JUJ-AqucUlY';
export const EDUFLOW_INTRO_VIDEO_URL = 'https://youtu.be/JUJ-AqucUlY';
```

This creates a single source of truth for the intro video across the platform.

### 2. Replace Placeholder in VideoWalkthrough

**File:** `src/components/product-tour/VideoWalkthrough.tsx`

**Current (Line 11):**
```typescript
const videoId = 'dQw4w9WgXcQ'; // Placeholder - replace with actual demo video
```

**Updated:**
```typescript
import { EDUFLOW_INTRO_VIDEO_ID } from '@/utils/youtubeUtils';
// ...
const videoId = EDUFLOW_INTRO_VIDEO_ID;
```

### 3. Add Intro Video Modal to Landing Page

**File:** `src/pages/Index.tsx`

Create an inline video dialog component or use a reusable `IntroVideoDialog`:
- Triggered by clicking "Watch Demo" button in hero section
- Displays YouTube embed in a modal with 16:9 aspect ratio
- Includes close button and accessible focus handling

**Changes:**
- Add state: `const [videoModalOpen, setVideoModalOpen] = useState(false);`
- Modify "Watch Demo" button to open modal instead of navigating
- Add Dialog component with iframe embed

### 4. Enhance HeroSection3D with Video Option

**File:** `src/components/product-tour/HeroSection3D.tsx`

Add a secondary action or modify "Start Interactive Demo" to optionally show the intro video:
- Keep existing scroll behavior as primary action
- Add a "Watch Video" floating element or secondary button

---

## New Component: IntroVideoDialog

Create a reusable dialog component for playing the intro video:

**File:** `src/components/videos/IntroVideoDialog.tsx`

```typescript
interface IntroVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IntroVideoDialog({ open, onOpenChange }: IntroVideoDialogProps) {
  // Uses EDUFLOW_INTRO_VIDEO_ID from youtubeUtils
  // 16:9 aspect ratio iframe
  // Accessible dialog with proper focus management
}
```

---

## Summary of Changes

```text
src/
├── utils/
│   └── youtubeUtils.ts          # Add EDUFLOW_INTRO_VIDEO_ID constant
├── components/
│   ├── videos/
│   │   └── IntroVideoDialog.tsx  # NEW: Reusable intro video modal
│   └── product-tour/
│       ├── VideoWalkthrough.tsx  # Replace placeholder video ID
│       └── HeroSection3D.tsx     # Add video playback option
└── pages/
    └── Index.tsx                 # Add video modal for "Watch Demo"
```

---

## Technical Considerations

1. **Centralized Video ID**: Using a constant in `youtubeUtils.ts` makes future video updates easy (single point of change)

2. **Accessibility**: Video dialogs will include:
   - Proper ARIA labels
   - Focus trap within modal
   - Keyboard escape to close
   - Pause video on close

3. **Performance**: YouTube iframes load only when dialog opens (lazy loading)

4. **Mobile Responsiveness**: Video maintains 16:9 aspect ratio with responsive container

5. **Future Database Integration**: The constant can serve as a fallback; admins can override via `tutorial_videos` table if needed

---

## Files Summary

| Action | File |
|--------|------|
| Modify | `src/utils/youtubeUtils.ts` |
| Create | `src/components/videos/IntroVideoDialog.tsx` |
| Modify | `src/components/product-tour/VideoWalkthrough.tsx` |
| Modify | `src/pages/Index.tsx` |
| Modify | `src/components/product-tour/HeroSection3D.tsx` |
