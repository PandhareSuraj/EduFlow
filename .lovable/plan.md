
# Multi-Language Support Implementation (English, Hindi, Marathi)

## Overview

This plan implements a complete internationalization (i18n) system for the EduFlow application, enabling users to switch between English, Hindi (हिंदी), and Marathi (मराठी) languages. The implementation covers landing pages, product tour, navigation menus, buttons, help content, and all user-facing text.

---

## Technical Approach

We will use **react-i18next**, the industry-standard library for React internationalization, which provides:
- Easy language switching without page reload
- Browser language detection
- Namespace-based translation organization
- Interpolation for dynamic content
- Pluralization support

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/i18n/index.ts` | i18n configuration and initialization |
| `src/i18n/locales/en.json` | English translations |
| `src/i18n/locales/hi.json` | Hindi translations |
| `src/i18n/locales/mr.json` | Marathi translations |
| `src/components/layout/LanguageSwitcher.tsx` | Language selection dropdown |
| `src/hooks/useTranslation.tsx` | Custom hook wrapper for translations |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/main.tsx` | Import i18n configuration |
| `src/pages/Index.tsx` | Replace hardcoded text with translation keys |
| `src/pages/ProductTourPage.tsx` | Replace hardcoded text with translation keys |
| `src/components/landing/*.tsx` | All 7 landing components |
| `src/components/product-tour/*.tsx` | All 11 product tour components |
| `src/components/layout/Header.tsx` | Add language switcher |
| `src/components/layout/AppSidebar.tsx` | Translate navigation items |
| `src/components/layout/Footer.tsx` | Translate footer content |
| `src/components/help/*.tsx` | Translate help content and FAQs |

---

## Implementation Details

### 1. Install Dependencies

```bash
npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend
```

### 2. i18n Configuration

```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
```

### 3. Translation File Structure

```json
// src/i18n/locales/en.json (English)
{
  "common": {
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "bookDemo": "Book Demo",
    "getStarted": "Get Started Free",
    "watchDemo": "Watch Demo",
    "learnMore": "Learn More",
    "contactUs": "Contact Us",
    "backToHome": "Back to Home",
    "features": "Features",
    "pricing": "Pricing",
    "testimonials": "Testimonials",
    "productTour": "Product Tour",
    "startFreeTrial": "Start Free Trial",
    "scheduleDemo": "Schedule a Demo Call"
  },
  "landing": {
    "hero": {
      "badge": "Complete Education Management Solution",
      "title": "Transform Your Institution Digitally",
      "titleHighlight": "Institution",
      "description": "EduFlow is a powerful education management platform designed for institutions of all types. Manage students, faculty, academics, finances, and operations seamlessly.",
      "stats": {
        "institutions": "Institutions",
        "students": "Students",
        "faculty": "Faculty",
        "uptime": "Uptime"
      }
    },
    "features": {
      "title": "Everything Your Institution Needs",
      "subtitle": "Comprehensive modules designed for modern educational management",
      "studentManagement": {
        "title": "Student Management",
        "description": "Complete student lifecycle from admission to alumni. Track records, attendance, and performance."
      }
      // ... more feature translations
    },
    "pricing": {
      "title": "Plans That Grow with You",
      "subtitle": "Start free, upgrade when you need. No hidden fees, cancel anytime.",
      "starter": "Starter",
      "professional": "Professional",
      "enterprise": "Enterprise",
      "mostPopular": "Most Popular",
      "perYear": "/year",
      "custom": "Custom",
      "contactSales": "Contact Sales"
    },
    "testimonials": {
      "title": "Trusted by Leading Institutions",
      "subtitle": "See how EduFlow is transforming education management across India"
    }
  },
  "productTour": {
    "hero": {
      "badge": "Interactive Product Tour",
      "title": "Transform Your Institution with EduFlow",
      "description": "Experience the complete education management platform that powers 500+ institutions. See live workflows, real screenshots, and calculate your ROI.",
      "startDemo": "Start Interactive Demo",
      "watchVideo": "Watch Video"
    },
    "faq": {
      "title": "Frequently Asked Questions",
      "subtitle": "Everything you need to know about EduFlow",
      "categories": {
        "gettingStarted": "Getting Started",
        "features": "Features & Functionality",
        "pricing": "Pricing & Support",
        "security": "Security & Compliance"
      }
    }
  },
  "nav": {
    "dashboard": "Dashboard",
    "students": "Students",
    "courses": "Courses",
    "faculty": "Faculty",
    "fees": "Fees",
    "attendance": "Attendance",
    "exams": "Exams",
    "library": "Library",
    "reports": "Reports",
    "settings": "Settings"
  }
}
```

```json
// src/i18n/locales/hi.json (Hindi - हिंदी)
{
  "common": {
    "signIn": "साइन इन करें",
    "signUp": "साइन अप करें",
    "bookDemo": "डेमो बुक करें",
    "getStarted": "मुफ्त शुरू करें",
    "watchDemo": "डेमो देखें",
    "learnMore": "और जानें",
    "contactUs": "संपर्क करें",
    "backToHome": "होम पर वापस जाएं",
    "features": "सुविधाएं",
    "pricing": "मूल्य निर्धारण",
    "testimonials": "प्रशंसापत्र",
    "productTour": "उत्पाद दौरा",
    "startFreeTrial": "मुफ्त परीक्षण शुरू करें",
    "scheduleDemo": "डेमो कॉल शेड्यूल करें"
  },
  "landing": {
    "hero": {
      "badge": "संपूर्ण शिक्षा प्रबंधन समाधान",
      "title": "अपने संस्थान को डिजिटल रूप से बदलें",
      "titleHighlight": "संस्थान",
      "description": "EduFlow सभी प्रकार के संस्थानों के लिए डिज़ाइन किया गया एक शक्तिशाली शिक्षा प्रबंधन प्लेटफ़ॉर्म है। छात्रों, शिक्षकों, शिक्षाविदों, वित्त और संचालन का सहज प्रबंधन करें।",
      "stats": {
        "institutions": "संस्थान",
        "students": "छात्र",
        "faculty": "शिक्षक",
        "uptime": "अपटाइम"
      }
    },
    "features": {
      "title": "आपके संस्थान को जो कुछ भी चाहिए",
      "subtitle": "आधुनिक शैक्षिक प्रबंधन के लिए व्यापक मॉड्यूल",
      "studentManagement": {
        "title": "छात्र प्रबंधन",
        "description": "प्रवेश से लेकर पूर्व छात्र तक पूर्ण छात्र जीवनचक्र। रिकॉर्ड, उपस्थिति और प्रदर्शन को ट्रैक करें।"
      }
    },
    "pricing": {
      "title": "आपके साथ बढ़ने वाली योजनाएं",
      "subtitle": "मुफ्त शुरू करें, जब जरूरत हो तब अपग्रेड करें। कोई छिपी फीस नहीं, कभी भी रद्द करें।",
      "starter": "स्टार्टर",
      "professional": "प्रोफेशनल",
      "enterprise": "एंटरप्राइज़",
      "mostPopular": "सबसे लोकप्रिय",
      "perYear": "/वर्ष",
      "custom": "कस्टम",
      "contactSales": "सेल्स से संपर्क करें"
    },
    "testimonials": {
      "title": "अग्रणी संस्थानों द्वारा विश्वसनीय",
      "subtitle": "देखें कि EduFlow पूरे भारत में शिक्षा प्रबंधन को कैसे बदल रहा है"
    }
  },
  "nav": {
    "dashboard": "डैशबोर्ड",
    "students": "छात्र",
    "courses": "पाठ्यक्रम",
    "faculty": "शिक्षक",
    "fees": "फीस",
    "attendance": "उपस्थिति",
    "exams": "परीक्षाएं",
    "library": "पुस्तकालय",
    "reports": "रिपोर्ट",
    "settings": "सेटिंग्स"
  }
}
```

```json
// src/i18n/locales/mr.json (Marathi - मराठी)
{
  "common": {
    "signIn": "साइन इन करा",
    "signUp": "साइन अप करा",
    "bookDemo": "डेमो बुक करा",
    "getStarted": "मोफत सुरू करा",
    "watchDemo": "डेमो पहा",
    "learnMore": "अधिक जाणून घ्या",
    "contactUs": "संपर्क साधा",
    "backToHome": "मुख्यपृष्ठावर परत जा",
    "features": "वैशिष्ट्ये",
    "pricing": "किंमत",
    "testimonials": "प्रशस्तिपत्रे",
    "productTour": "उत्पाद दौरा",
    "startFreeTrial": "मोफत चाचणी सुरू करा",
    "scheduleDemo": "डेमो कॉल शेड्यूल करा"
  },
  "landing": {
    "hero": {
      "badge": "संपूर्ण शिक्षण व्यवस्थापन उपाय",
      "title": "तुमच्या संस्थेचे डिजिटल परिवर्तन करा",
      "titleHighlight": "संस्था",
      "description": "EduFlow हे सर्व प्रकारच्या संस्थांसाठी डिझाइन केलेले एक शक्तिशाली शिक्षण व्यवस्थापन प्लॅटफॉर्म आहे. विद्यार्थी, शिक्षक, शैक्षणिक, वित्त आणि कार्यप्रणाली सहजतेने व्यवस्थापित करा.",
      "stats": {
        "institutions": "संस्था",
        "students": "विद्यार्थी",
        "faculty": "शिक्षक",
        "uptime": "अपटाइम"
      }
    },
    "features": {
      "title": "तुमच्या संस्थेला आवश्यक असलेले सर्वकाही",
      "subtitle": "आधुनिक शैक्षणिक व्यवस्थापनासाठी व्यापक मॉड्यूल्स",
      "studentManagement": {
        "title": "विद्यार्थी व्यवस्थापन",
        "description": "प्रवेशापासून माजी विद्यार्थ्यांपर्यंत संपूर्ण विद्यार्थी जीवनचक्र. नोंदी, उपस्थिती आणि कामगिरी ट्रॅक करा."
      }
    },
    "pricing": {
      "title": "तुमच्यासोबत वाढणाऱ्या योजना",
      "subtitle": "मोफत सुरू करा, गरज असेल तेव्हा अपग्रेड करा. कोणतीही लपलेली फी नाही, कधीही रद्द करा.",
      "starter": "स्टार्टर",
      "professional": "प्रोफेशनल",
      "enterprise": "एंटरप्राइझ",
      "mostPopular": "सर्वात लोकप्रिय",
      "perYear": "/वर्ष",
      "custom": "सानुकूल",
      "contactSales": "विक्रीशी संपर्क साधा"
    },
    "testimonials": {
      "title": "आघाडीच्या संस्थांनी विश्वासार्ह",
      "subtitle": "EduFlow संपूर्ण भारतात शिक्षण व्यवस्थापन कसे बदलत आहे ते पहा"
    }
  },
  "nav": {
    "dashboard": "डॅशबोर्ड",
    "students": "विद्यार्थी",
    "courses": "अभ्यासक्रम",
    "faculty": "शिक्षक",
    "fees": "शुल्क",
    "attendance": "उपस्थिती",
    "exams": "परीक्षा",
    "library": "ग्रंथालय",
    "reports": "अहवाल",
    "settings": "सेटिंग्ज"
  }
}
```

### 4. Language Switcher Component

```typescript
// src/components/layout/LanguageSwitcher.tsx
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' }
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
  
  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLang.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={i18n.language === lang.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{lang.nativeName}</span>
            <span className="text-muted-foreground text-xs">({lang.name})</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 5. Usage Example in Components

```typescript
// Before (hardcoded)
<Button onClick={() => navigate('/auth')}>
  Sign In
</Button>

// After (translated)
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

<Button onClick={() => navigate('/auth')}>
  {t('common.signIn')}
</Button>
```

---

## Translation Coverage

### Pages with Full Translation

| Page | Text Elements | Priority |
|------|--------------|----------|
| Landing Page (Index.tsx) | ~150 strings | High |
| Product Tour Page | ~200 strings | High |
| Auth Page | ~30 strings | High |
| Dashboard | ~50 strings | Medium |

### Components Requiring Translation

| Category | Components | Strings |
|----------|-----------|---------|
| Landing | 7 components (HowItWorks, Pricing, Testimonials, etc.) | ~100 |
| Product Tour | 11 components (FAQ, Features, ROI Calculator, etc.) | ~150 |
| Navigation | Header, Sidebar, Footer | ~50 |
| Help System | FAQ, Shortcuts, What's New, Support | ~80 |
| Common UI | Buttons, Labels, Tooltips | ~100 |

---

## Language Switcher Placement

The language switcher will be added in:

1. **Landing Page Header**: Next to the Sign In button (visible to visitors)
2. **Product Tour Header**: Next to navigation buttons
3. **App Header**: In the header toolbar for logged-in users (optional)

---

## Technical Considerations

### Font Support
Hindi and Marathi use Devanagari script. The default system fonts and web fonts (Noto Sans Devanagari) support these scripts. Add to index.css:

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', 'Noto Sans Devanagari', sans-serif;
}
```

### RTL Support
Hindi and Marathi are LTR (left-to-right), so no RTL layout changes are needed.

### Number Formatting
Numbers with Indian format (lakhs/crores) will be preserved in translations as they are already used in the code.

---

## Implementation Phases

### Phase 1: Infrastructure Setup
1. Install i18next and related packages
2. Create i18n configuration
3. Set up translation file structure
4. Create Language Switcher component

### Phase 2: Landing Page Translation
5. Translate Index.tsx
6. Translate all 7 landing components
7. Add language switcher to landing header

### Phase 3: Product Tour Translation
8. Translate ProductTourPage.tsx
9. Translate all 11 product tour components
10. Translate FAQ content

### Phase 4: Navigation & Help
11. Translate AppSidebar navigation items
12. Translate Header and Footer
13. Translate Help Drawer content

### Phase 5: App-wide Completion
14. Translate common UI elements (buttons, labels)
15. Translate error messages and notifications
16. Add language switcher to authenticated header

---

## Translation String Estimates

| Language | Total Strings | Word Count |
|----------|--------------|------------|
| English | ~500 | ~3,000 |
| Hindi | ~500 | ~3,000 |
| Marathi | ~500 | ~3,000 |

---

## Dependencies to Add

```json
{
  "i18next": "^23.x",
  "react-i18next": "^14.x",
  "i18next-browser-languagedetector": "^7.x"
}
```

---

## Quality Assurance

- Native speaker review for Hindi and Marathi translations
- Test text overflow with longer Hindi/Marathi strings
- Verify Devanagari font rendering across browsers
- Test language persistence across page refreshes
- Validate dynamic content interpolation works correctly
