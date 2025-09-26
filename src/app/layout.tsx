
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';
import { ResumeProvider } from '@/context/resume-context';
import Navbar from '@/components/navbar';

export const metadata: Metadata = {
  title: 'ResumeWise',
  description: 'AI-Powered Resume Analyzer',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ResumeProvider>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
              <Navbar />
              {children}
            </div>
            <Toaster richColors />
          </ResumeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
