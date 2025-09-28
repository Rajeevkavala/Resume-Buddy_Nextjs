# ResumeBuddy AI Copilot Instructions

## Architecture Overview

ResumeBuddy is a Next.js 15 application that uses AI to analyze resumes against job descriptions. The app follows a **client-side context architecture** with Firebase backend and Google Genkit AI flows.

### Core Components
- **Next.js App Router** (`src/app/`) - File-based routing with server/client components
- **AI Flows** (`src/ai/flows/`) - Server actions using Google Genkit for resume analysis
- **Context Providers** (`src/context/`) - Global state management for auth and resume data
- **Firebase Integration** - Authentication, Firestore for persistence, Storage for files

## Key Patterns & Conventions

### Client-Server Boundary
```tsx
// Server actions in src/app/actions.ts - all AI flows are server-side
'use server';
export async function analyzeResume(formData: FormData) {
  return await analyzeResumeContent({ resumeText, jobDescription });
}

// Client components use contexts for state
'use client';
const { resumeText, analysis, setAnalysis } = useContext(ResumeContext);
```

### Authentication Flow
- **Conditional Layout**: `client-layout.tsx` renders different layouts based on auth state
- **Route Protection**: Middleware in `middleware.ts` handles auth redirects
- **No Loading States**: Auth is resolved immediately via Firebase `onAuthStateChanged`

### AI Flow Structure
All AI flows in `src/ai/flows/` follow this pattern:
```typescript
// Input/Output schemas with Zod
const InputSchema = z.object({...});
export type Input = z.infer<typeof InputSchema>;

// Genkit flow definition
export const flowName = ai.defineFlow({
  name: 'flow-name',
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  authPolicy: noAuth(),
}, async (input) => {
  // AI logic using ai.generate()
});
```

### Context State Management
- **ResumeContext**: Manages resume text, job description, and all AI analysis results
- **AuthContext**: Handles Firebase auth state and user management
- **Data Persistence**: Dual storage in Firestore (cloud) and localStorage (offline)

## Development Workflows

### Running the App
```bash
npm run dev              # Start development server (port 9002)
npm run genkit:dev       # Start Genkit AI development UI
npm run genkit:watch     # Watch mode for AI flows
```

### Adding New AI Features
1. Create flow in `src/ai/flows/new-feature.ts` using existing patterns
2. Add server action in `src/app/actions.ts`
3. Update `types.ts` for new data structures
4. Add UI component with context integration
5. Update `ResumeContext` to manage new state

### File Processing
- **Text Extraction**: `actions.ts` handles PDF/DOCX parsing with `pdf-parse-fork` and `mammoth`
- **File Upload**: `FileUploader` component with drag-drop support
- **Validation**: Zod schemas validate minimum content length (100 chars)

## Critical Dependencies

- **Genkit**: `genkit` and `@genkit-ai/googleai` for AI flows
- **Firebase**: Authentication, Firestore, Storage
- **UI**: Radix UI components with Tailwind CSS
- **File Processing**: `pdf-parse-fork`, `mammoth`, `docx`

## Performance Optimizations

### Loading Prevention
- No loading states between auth transitions (see `FINAL_LOADING_FIX.md`)
- Conditional layout rendering based on auth state
- Static imports for critical components, dynamic for non-critical

### Route Optimization
- Middleware precompiles critical routes: `/`, `/analysis`, `/qa`, `/interview`, `/improvement`
- Next.js config enables partial prerendering (PPR) and package import optimization