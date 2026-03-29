# Aush Forms — Product Definition

## What is the end product?

A SaaS platform where businesses create smart client intake forms with OCR document processing. Business owners sign up, pick a template (Financial, Medical, Legal, General), customize their branding, and get a shareable public link. Their clients visit the link, upload documents (which OCR reads and auto-fills fields), complete the form, and submit. Submissions are stored in a database with documents in cloud storage.

Think: **Typeform meets smart document processing** — but specifically for client intake workflows.

## Who are the users?

**Business owners** — law firms, financial advisors, medical offices, insurance agencies. They want to digitize their client onboarding paperwork. They sign up, configure their form, share a link, and view submissions from a dashboard.

**Clients** — people visiting a business's intake form link. They fill out the form anonymously (no account needed), upload documents, and submit. They want it to be fast and painless.

## User Workflows

### Business Owner
1. Sign up → onboarding wizard: pick template, set business name, slug, logo, brand color
2. Get public link: `aushforms.com/f/mybusiness`
3. Share link with clients
4. View dashboard: list of submissions with unread badges
5. Click a submission → see all form data, uploaded documents, download PDF
6. Get notified (dashboard badge + email) when new submissions arrive
7. Settings: edit branding, template, field configuration

### Client
1. Visit `aushforms.com/f/mybusiness`
2. See branded intake form with the business's logo and colors
3. Step 1: Upload ID → OCR auto-fills name, DOB, address
4. Step 2: Upload additional documents (varies by template)
5. Step 3: Complete remaining fields (employment, medical, legal — depends on template)
6. Step 4: Additional details (reason for visit, notes)
7. Step 5: Review everything → submit
8. Documents uploaded to cloud storage, form saved to database
9. Download PDF of their submission

## Core Features

1. **Template system** — 4 preset templates with different field sets
2. **Business customization** — logo, brand color, slug, field toggles (enable/disable, required/optional)
3. **Multi-step form wizard** — progress bar, validation, animated transitions
4. **OCR document processing** — Tesseract.js client-side, auto-fills form fields from uploaded images
5. **Supabase Storage** — documents and generated PDFs stored in cloud
6. **Submission dashboard** — list view with status badges, individual detail view
7. **PDF generation** — branded PDF with business logo, colored headers, form data tables, embedded document images
8. **Notifications** — dashboard badge (unread count) + email notification on new submission
9. **localStorage auto-save** — client form progress persists across tab close/refresh
10. **i18n** — English + Spanish toggle on public form and landing page
11. **Dark/light mode** — theme toggle
12. **Responsive** — works on mobile, tablet, desktop

## Tech Stack

| Tool | Purpose |
|------|---------|
| Next.js 15 | Framework (App Router) |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| Supabase | Auth, PostgreSQL database, Storage, RLS |
| React Hook Form | Form state management |
| Zod | Validation schemas |
| Tesseract.js | Client-side OCR |
| jsPDF + jspdf-autotable | PDF generation |
| Framer Motion | Animations |
| next-themes | Dark/light mode |
| Lucide React | Icons |

## Acceptance Criteria

- [ ] Business owner can sign up and complete onboarding (template, branding, slug)
- [ ] Public form page loads at `/f/[slug]` with the business's branding
- [ ] Form fields match the selected template
- [ ] Document upload works (JPG/PNG), OCR processes and auto-fills fields
- [ ] OCR failure shows retry/fill-manually options
- [ ] Form validates per step, can't skip ahead
- [ ] Smooth animated transitions between steps
- [ ] On submit: data saves to DB, files upload to Storage, PDF generated
- [ ] Client can download PDF after submitting
- [ ] Business owner dashboard shows submissions list with unread badges
- [ ] Business owner can view submission detail (all data + documents + PDF download)
- [ ] Dashboard notification badge updates on new submission
- [ ] Email notification simulated on new submission
- [ ] localStorage saves client form progress, restores on refresh
- [ ] i18n toggle works (EN/ES) on public form and landing page
- [ ] Landing page has animated sections, features, testimonials, CTA
- [ ] Dark and light mode work
- [ ] Mobile responsive

## Constraints

- Email notifications are simulated (show the UX, no real email service)
- Templates are preset — no drag-and-drop form builder
- OCR is best-effort — Tesseract.js accuracy varies
- i18n only on public-facing pages (dashboard is English only)
- Portfolio project — must look impressive

## Edge Cases

- Business owner picks a slug that's taken → show error, suggest alternatives
- Client uploads non-image file → reject with clear error
- OCR extracts nothing → graceful fallback, never blocks
- Client refreshes mid-form → localStorage restores progress
- Client submits with optional fields empty → handle in PDF (skip empty fields)
- Business owner has zero submissions → show helpful empty state
- Multiple clients submit simultaneously → Supabase handles concurrency
- Large image upload (10MB+) → show progress, consider client-side resize
