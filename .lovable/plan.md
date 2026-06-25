# Multi-language Certificates (English / Marathi) + Domicile Certificate

## Goal
On the Certificates page, add a language selector. When **Marathi** is selected, the Transfer (TC), Bonafide, and new **Domicile** certificates generate fully in Marathi (Devanagari). When **English** is selected, the current English layout is used. Add a new **Domicile certificate** type alongside TC and Bonafide.

## Important technical note
The current PDFs use jsPDF's built-in Helvetica font, which **cannot render Marathi (Devanagari)** — it prints blank boxes. To fix this we embed a Unicode Devanagari font (Noto Sans Devanagari) into jsPDF and switch to it whenever the language is Marathi.

## What will be built

### 1. Devanagari font embedding
- Add `Noto Sans Devanagari` (regular + bold) as base64 font files bundled with the PDF utils.
- A helper registers the font into each jsPDF document and exposes a `setFont` switch so English keeps Helvetica and Marathi uses Devanagari.

### 2. Language selector on the Certificates page
- A dropdown (English / मराठी) in the Certificates page header, default English.
- The selected language is passed into every PDF generator call (TC, Bonafide, Domicile).
- (Optional sensible default: prefill from the app's current i18n language, still overridable.)

### 3. Translation layer
- A single `certificateStrings` module holding every label / sentence template for both `en` and `mr` (titles, field labels, body sentences, footer like "Principal", "Office Seal", "Date", "Place").
- Each PDF generator reads strings from this module based on the chosen language instead of hardcoded English.
- Exact Marathi wording will be taken from the sample you upload, so the phrasing matches your official format.

### 4. New Domicile Certificate
- New PDF generator `DomicileCertificatePDF.tsx` (same classic bordered, logo + Principal/seal style as TC).
- New "Domicile" action button in the Student Records table (next to TC / Bonafide).
- A `domicile_no` field added to the student form and tracked in stats (new "Domicile Issued" card).
- Typical Domicile fields surfaced in the form if not already present: place/village, taluka, district, state, years of residence. (Final field list confirmed against your sample.)

### 5. Database
- Add a `domicile_no` column (and any missing Domicile fields like `taluka`, `district`, `state`, `residence_years`) to the `certificate_students` table via migration.

## Files affected
```text
src/pages/Certificates.tsx                              (language dropdown, Domicile button, stats card)
src/components/certificates/CertificateStudentForm.tsx  (domicile_no + domicile fields)
src/components/certificates/pdf/pdfUtils.ts             (Devanagari font register helper)
src/components/certificates/pdf/certificateStrings.ts   (NEW: en + mr string tables)
src/components/certificates/pdf/fonts/NotoDevanagari.ts  (NEW: base64 font)
src/components/certificates/pdf/TransferCertificatePDF.tsx   (use lang strings/font)
src/components/certificates/pdf/BonafideCertificatePDF.tsx   (use lang strings/font)
src/components/certificates/pdf/DomicileCertificatePDF.tsx   (NEW)
+ Supabase migration for new columns
```

## Open dependency
I'll match the Marathi TC and Domicile wording exactly to the sample you upload. Once approved, please attach the Marathi sample so the phrasing and field order are correct; I can scaffold with a standard Maharashtra format first and refine to your sample after.
