
import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './client-layout';

export const metadata: Metadata = {
  title: {
    default: 'ResumeBuddy - AI-Powered Resume Analyzer',
    template: '%s | ResumeBuddy'
  },
  description: 'Analyze and optimize your resume with AI. Get ATS scores, personalized improvements, interview prep, and skill gap analysis tailored to your target job description.',
  keywords: ['resume analyzer', 'AI resume', 'ATS score', 'job application', 'interview preparation', 'resume optimization', 'career tools'],
  authors: [{ name: 'ResumeBuddy' }],
  creator: 'ResumeBuddy',
  publisher: 'ResumeBuddy',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-icon.png',
  },
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
      <body className="font-body antialiased" suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
