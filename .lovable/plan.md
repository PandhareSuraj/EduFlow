# Certificates Module (TC & Bonafide)

A new self-contained module to record certificate-specific student details and generate printable Transfer Certificate (TC) and Bonafide Certificate PDFs in English, styled after the uploaded samples. The college header (name, code, affiliation, address, logo) is pulled automatically from existing college settings.

## What gets built

### 1. New database table `certificate_students`
A dedicated table (independent of the existing `students` table) holding every field needed by the TC and Bonafide certificates. Fields captured by the custom form:

- Identity: full name, mother's name, father's/guardian name
- Personal: gender, date of birth (date) + date of birth in words, place of birth, nationality, religion, caste/sub-caste, blood group
- Academic: course/branch, class, register no / PRN (eligibility no), college code, academic year, date of admission, date of leaving, subjects (text), previous exam details
- Certificate fields: conduct, character, exam appeared (yes/no), exam name, exam session (summer/winter), result (passed/failed/absent), seat no, remarks
- Scoped to the user's college (`college_id`) with standard id/created_at/updated_at and created_by.

RLS: college-scoped access for `admin`, `clerk`, `super_admin` (read/write), following the existing role pattern. GRANTs added for `authenticated` and `service_role`.

### 2. Certificates page + route
- New page `src/pages/Certificates.tsx` at route `/certificates`, protected for `admin`, `clerk`, `super_admin`, wrapped in `Layout` like other modules.
- Sidebar entry "Certificates" (FileText/Award icon) added to the `admin` and `clerk` menus in `AppSidebar.tsx`.
- Lazy-loaded and routed in `App.tsx`.

Page layout (matches existing module style: header, stat cards, search, table):
- Stat cards: total records, TCs generated, Bonafides generated.
- "Add Student" button opening a dialog with the custom certificate-student form (zod-validated).
- Searchable table of saved certificate-students with actions: Edit, Generate TC, Generate Bonafide, Delete.

### 3. Custom student add/edit form
- `src/components/certificates/CertificateStudentForm.tsx` — dialog form covering all fields above, English labels only, zod validation (length limits, required name/course), saving to `certificate_students`.

### 4. PDF generators (printable download)
Built with `jsPDF` (already used in the project), one A4 page each, laid out to mirror the samples:
- `src/components/certificates/pdf/TransferCertificatePDF.tsx` — bordered TC layout: college header block (auto from college settings), "TRANSFER / LEAVING CERTIFICATE" title, numbered fields (name, mother's name, caste, religion, nationality, place of birth, DOB figures + words, admission/leaving dates with class, subjects, conduct, remarks with exam/result/seat no), footer with Date / Clerk / Principal.
- `src/components/certificates/pdf/BonafideCertificatePDF.tsx` — bonafide layout: header block, "Bonafide Certificate" title, certifying sentence with name, register no, course/year, academic year, DOB, character, footer with Date / Clerk / Principal.
- Both pull college name/address/code/affiliation/logo/signature from `useCollegeSettings` / `useBranding`, and save files as `TC_{name}_{date}.pdf` / `Bonafide_{name}_{date}.pdf` (matching the project's export naming convention).

## Technical notes
- Reuses existing patterns: `useCollegeSettings` for header, `usePageTitle`, shadcn `Dialog`/`Table`/`Card`, `useToast`, jsPDF (as in `CertificatePDF.tsx`).
- All certificate text and form labels are English only.
- The module does not read from or modify the existing `students` table.

```text
/certificates
 ├─ Stat cards
 ├─ [Add Student] → CertificateStudentForm dialog
 └─ Table rows → [Edit] [Generate TC] [Generate Bonafide] [Delete]
                         │                │
                  TransferCertificatePDF  BonafideCertificatePDF  (jsPDF download)
```

## Build order
1. Migration: create `certificate_students` (+ GRANTs + RLS).
2. Form component with zod validation.
3. TC and Bonafide PDF generators.
4. Certificates page (stats, search, table, actions).
5. Wire route in `App.tsx` and sidebar entries in `AppSidebar.tsx`.
