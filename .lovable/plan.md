# Improve TC/LC & Bonafide Certificate Design

Redesign both certificate PDFs to a **classic, formal** government-document aesthetic, with the **college logo in the header** and a **Principal signature + seal** block. English only. No data/schema changes — purely the PDF generation layout.

## Files changed
- `src/components/certificates/pdf/TransferCertificatePDF.tsx`
- `src/components/certificates/pdf/BonafideCertificatePDF.tsx`

## Shared visual language (applied to both)
- **Double ornate border**: thick outer rule + thin inner rule in a deep accent tone (TC = maroon, Bonafide = navy), with small corner accent marks for a traditional look.
- **Logo header**: load `college.logoUrl` and draw it (top-center/left) beside the college name. Use an async image loader (convert URL → dataURL via `Image`/canvas) with a graceful fallback to text-only header if the logo is missing or fails to load.
- **Header block**: large bold college name, address line, contact line, separated from the body by a ruled divider.
- **Title**: centered, bold, underlined certificate title with letter spacing for formality.
- **Body**: improved line spacing, justified/wrapped paragraphs, bold field labels with aligned values, consistent margins.
- **Footer signature area (Principal + seal)**:
  - Left: a bordered "Seal" placeholder box ("Office Seal").
  - Right: signature line with "Principal" label and `college.signatureTitle`.
  - Date + place line above the footer.

## TC/LC specifics
- Keep all existing fields (name, parents, caste/religion, nationality, DOB figures + words, admission/leaving dates, class, course, subjects, conduct, remarks, exam result block).
- Tighten the numbered field rows into a clean aligned two-column rhythm and add a "Certified that the above information is true as per college records" closing line above the footer.

## Bonafide specifics
- Keep certifying paragraph, register no, course/class, academic year, DOB, character/conduct, remarks.
- Add a formal closing line ("Issued on request for ____ purpose") and the same seal + Principal footer.

## Technical notes
- Add an internal `loadImageAsDataUrl(url)` helper in each file (or a small shared util) that resolves to `{ dataUrl, width, height }` and returns `null` on failure so generation never breaks.
- Make `generate*PDF` await the logo load before drawing; keep the existing function signatures and `doc.save(...)` filenames unchanged so `Certificates.tsx` needs no edits.

## Verification
- Build check, then generate a TC and a Bonafide from the Certificates page and visually confirm borders, logo, layout, and the seal/Principal footer render correctly (including the no-logo fallback).