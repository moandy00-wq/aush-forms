# Aush Forms — Project Instructions

A SaaS platform where businesses create smart client intake forms with OCR document processing. Business owners sign up, pick a template, customize branding, and get a public link. Clients visit the link, upload documents (OCR auto-fills fields), complete the form, and submit. Built with Next.js 15, Supabase, and Tesseract.js.

## Tech Stack

| Library | Purpose |
|---------|---------|
| Next.js 15 (App Router) | Framework |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling (CSS-first config, `@theme` directive) |
| Supabase (@supabase/ssr) | Auth, PostgreSQL, Storage, RLS |
| React Hook Form 7.x | Form state management |
| @hookform/resolvers | Connects Zod to React Hook Form |
| Zod | Per-step validation schemas |
| Tesseract.js | Client-side OCR (runs in Web Worker) |
| jsPDF + jspdf-autotable | PDF generation |
| Framer Motion | Step transitions, scroll animations |
| next-themes | Dark/light mode toggle |
| Lucide React | Icons |

## Build Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npx tsc --noEmit     # Type check
```

## Code Style

- Functional components, named exports (except page.tsx which uses default export)
- `'use client'` only where needed (form state, file upload, OCR, theme toggle, hooks)
- React Hook Form manages ALL form state on the public form — no useState for form fields
- Zod schemas in `src/lib/schemas.ts`
- Types in `src/lib/types.ts`
- Supabase client helpers in `src/lib/supabase/` (client.ts + server.ts)
- One component per file, filename matches export name

## Architecture

```
src/
  app/
    page.tsx                    # Landing page
    login/page.tsx              # Sign in
    signup/page.tsx             # Create account
    setup/page.tsx              # Onboarding wizard (template, branding, slug)
    dashboard/
      page.tsx                  # Submissions list
      submissions/[id]/page.tsx # Submission detail
    settings/page.tsx           # Edit business profile
    f/[slug]/page.tsx           # Public intake form
    api/
      submissions/route.ts     # POST: save submission, trigger notification
      setup/route.ts            # POST: save business profile
    layout.tsx                  # Root layout (fonts, ThemeProvider)
    globals.css                 # Tailwind v4 @theme + global styles
  components/
    FormWizard.tsx              # Wizard orchestrator (public form)
    steps/                      # Form step components (per template)
      PersonalInfo.tsx
      DocumentUpload.tsx
      Employment.tsx            # Financial template
      MedicalInfo.tsx           # Medical template
      LegalInfo.tsx             # Legal template
      AdditionalDetails.tsx
      ReviewSubmit.tsx
    ui/
      FormField.tsx             # Labeled input with error display
      FileDropzone.tsx          # Drag-and-drop upload with preview
      ProgressBar.tsx           # Step progress indicator
      ThemeToggle.tsx           # Dark/light toggle
      LanguageToggle.tsx        # EN/ES switcher
    AppSidebar.tsx              # Dashboard sidebar
    AppShell.tsx                # Dashboard layout wrapper
  lib/
    types.ts                    # Shared TypeScript interfaces
    schemas.ts                  # Zod validation schemas
    templates.ts                # Template definitions (fields, steps, defaults)
    ocr.ts                      # Tesseract.js wrapper
    pdf.ts                      # jsPDF + autotable wrapper
    useFormPersist.ts           # localStorage auto-save hook
    supabase/
      client.ts                 # Browser Supabase client
      server.ts                 # Server Supabase client + service role
    i18n/
      en.json                   # English translations
      es.json                   # Spanish translations
      TranslationProvider.tsx   # i18n context + hook
  middleware.ts                 # Auth protection + setup redirect
```

## Database (Supabase)

### Tables
- `profiles` — business owner profile (slug, business_name, logo_url, brand_color, template, field_config jsonb, notification_email)
- `submissions` — client form submissions (owner_id, form_data jsonb, template, status, read, pdf_url)
- `submission_documents` — uploaded files per submission (submission_id, document_type, file_url, file_name, ocr_text, ocr_fields jsonb)

### Storage Buckets
- `logos` — business logos
- `documents` — client uploaded documents
- `pdfs` — generated PDFs

### RLS
- profiles: owner can read/update own. Public can read by slug.
- submissions: owner can read/update own. Public can insert (new submissions).
- submission_documents: owner can read own (via submission join). Public can insert.
- Storage: logos/documents/pdfs follow same ownership pattern.

## Design Tokens

| Token | Value |
|-------|-------|
| Primary accent | Cyan (`cyan-500` / `cyan-600`) |
| Gray family | Neutral |
| Display font | Space Grotesk |
| Body font | Inter |
| Border radius | 6/8/12/16 scale |
| Mood | Clean, professional, SaaS |

## Rules

1. OCR failures never block the user — always allow manual entry
2. Form data persists across step navigation (React Hook Form handles this)
3. Can't skip ahead in the form wizard — only completed + current steps accessible
4. All file uploads go to Supabase Storage — never stored locally
5. PDF includes all non-empty fields + embedded document images
6. Business owner's brand color and logo appear on their public form
7. Email notifications are simulated (show toast/UX, no real email service)
8. i18n only on public-facing pages (landing page + public form). Dashboard is English only.
9. All interactive elements get transition-all duration-150
10. Mobile responsive — form fields stack on small screens
