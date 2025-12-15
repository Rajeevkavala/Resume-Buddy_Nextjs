# One‑Page Resume Templates + Backend Generation Spec

This app renders **A4 one-page resumes** using React template components and exports to **PDF** and **DOCX**.

Scope:
- “Modern templates” used by the Resume Builder (Create Resume page)
- The **exact data shape** (`ResumeData`) templates consume
- How export works “in the backend” (client-side export pipeline in this repo)
- Practical **content limits** to keep resumes to **one page**

---

## 1) Canonical page size (A4)

All modern templates are rendered inside an A4 container:
- Width: **210mm**
- Height: **297mm**

The preview container is set up in:
- `src/components/modern-resume-preview.tsx`

Export functions rely on this A4 layout:
- HTML preview capture uses `resume-preview-container` / `.resume-container`
- Direct PDF generation uses explicit A4 page dimensions

---

## 2) Canonical resume data contract (what templates render)

Templates consume `ResumeData` from:
- `src/lib/types.ts`

### `ResumeData` (shape)

```ts
export type ResumeData = {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    website?: string;
  };
  summary?: string;

  skills: {
    languages?: string[];
    frameworks?: string[];
    databases?: string[];
    tools?: string[];
    cloud?: string[];
    other?: string[];
  };

  experience: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    achievements: string[];
  }[];

  educationAndCertifications: {
    education: {
      degree: string;
      institution: string;
      location: string;
      graduationDate: string;
      gpa?: string;
      honors?: string[];
      major?: string;
      minor?: string;
    }[];
    certifications: {
      name: string;
      issuer: string;
      date: string;
      expirationDate?: string;
      credentialId?: string;
    }[];
  };

  projects?: {
    name: string;
    description: string;
    technologies: string[];
    link?: string;
    achievements: string[];
  }[];
};
```

---

## 3) Modern template set (exact templates)

These are the template IDs used by the Resume Builder:
- `professional`
- `modern`
- `creative`
- `minimal`
- `executive`
- `tech`
- `faang`

Defined in:
- `src/lib/modern-templates.ts` (metadata, ATS score, colors)

Rendered by:
- `src/components/modern-resume-preview.tsx` → `renderTemplate()`

Template components live in:
- `src/components/templates/*.tsx`

### Section order (recommended for one page)

**Default order that works across all templates**:
1) Header (name + contact)
2) Summary (optional)
3) Skills
4) Experience
5) Education & Certifications
6) Projects (optional)

---

## 4) One‑page content limits (required to fit A4)

The app can export multi-page PDFs if content is long. To ensure a **single page**, keep content within this budget.

### Hard caps (recommended)
- Summary: **2–4 lines** (max ~350–450 characters)
- Skills: **4–6 grouped lines** total (ex: Languages/Frameworks/Tools/Cloud)
- Experience:
  - Roles: **2–3** (max 4 only if bullets are short)
  - Bullets per role: **2–3**
  - Bullet length: **≤ 1 line** each (avoid wrapping)
- Education: **1–2** entries
- Certifications: **0–2** entries
- Projects:
  - Projects: **0–2** (max 3 only if extremely compact)
  - Bullets per project: **1–2**
  - Description: **1 line**

### Practical trimming rules
- Prefer fewer roles/projects with stronger quantified bullets.
- Drop older/irrelevant roles first.
- Keep links short (use domain/slug, not long URLs).

---

## 5) Template implementation notes (to guarantee one-page layout)

All templates should:
- Render inside the A4 container without introducing extra margins outside
- Avoid fixed heights that cause overflow clipping
- Avoid large decorative blocks that consume vertical space
- Keep headings compact and consistent

Common CSS hooks seen in templates:
- `.resume-template`
- `.resume-container`
- `.template-section`

---

## 6) Export pipeline (“backend generation” in this repo)

### 6.1 PDF export (two paths)

#### A) Direct data → PDF (jsPDF)
Implemented inside:
- `src/components/modern-resume-preview.tsx` (`generateDirectPDF`)

Characteristics:
- Generates a PDF page using A4 dimensions
- Writes sections in a compact, ATS-friendly text format
- Has built-in compacting behavior (examples):
  - Projects limited (top 3)
  - Project achievements limited (top 2)
- If content still overflows, it **adds pages** automatically

This path is best when you want predictable text output and consistent PDF rendering.

#### B) HTML preview capture → PDF (html2canvas + jsPDF)
Implemented in:
- `src/lib/resume-export.ts` (`exportToPDF`)

Characteristics:
- Captures the rendered HTML template visually (what you see is what you export)
- Produces high-fidelity “exact look” output
- If the captured image is taller than one A4 page, it splits across multiple pages

This path is best when you want the template’s exact visuals.

### 6.2 DOCX export
Implemented in:
- `src/lib/resume-export.ts` (`exportToDOCX`)

Characteristics:
- Uses the `docx` library to generate a structured Word document
- More editable than PDF
- Visual layout is not always pixel-perfect vs the HTML templates (DOCX is flow-based)

---

## 7) Template-by-template one-page guidance

These notes are meant to keep each template within A4.

### `professional`
- Best for ATS and one-page.
- Keep:
  - 2–3 experience roles
  - 2 bullets per role
  - 0–2 projects

### `modern` (two-column)
- Sidebar consumes height quickly.
- Keep:
  - Skills grouped and short
  - Experience roles to 2–3
  - Avoid long URLs

### `minimal`
- Large padding/whitespace by design.
- Keep:
  - 1–2 roles
  - 1–2 bullets per role
  - Projects optional (0–1)

### `creative`
- Visual elements reduce available space.
- Keep:
  - 1–2 roles
  - Short bullets only
  - 0–1 projects

### `executive`
- Emphasize summary + leadership accomplishments.
- Keep:
  - 2 roles
  - 2 bullets per role
  - Minimal projects

### `tech`
- Skills can grow fast.
- Keep:
  - Skills groups to 4 lines
  - Projects to 1–2
  - Strong quantified bullets

### `faang`
- Dense, achievement-focused.
- Keep:
  - 2 roles
  - 2–3 bullets per role
  - 0–1 project

---

## 8) Quick “one-page ready” example content budget

If you want a safe default that almost always fits A4:
- Summary: 3 lines
- Skills: 5 lines total
- Experience: 2 roles × 2 bullets
- Education: 1 entry
- Certifications: 1 entry
- Projects: 1 project × 1 bullet

---

## 9) Where to change templates

- Template visuals (HTML/CSS): `src/components/templates/*.tsx`
- Template metadata (name/ATS score/colors): `src/lib/modern-templates.ts`
- Export behavior:
  - Direct PDF: `src/components/modern-resume-preview.tsx`
  - HTML capture PDF + DOCX: `src/lib/resume-export.ts`
