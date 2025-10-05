
import type { Metadata } from 'next';
import { Inter, Space_Grotesk, Poppins, Montserrat, Work_Sans, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import './template-fonts.css';
import './print-resume.css';
import './enhanced-template-styles.css';
import ClientLayout from './client-layout';
import { Analytics } from "@vercel/analytics/next"

// Optimize font loading with next/font
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

// Resume Template Fonts
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-work-sans',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-jetbrains',
  display: 'swap',
});

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
  metadataBase: new URL('https://resumebuddybyrajeev.vercel.app'),
  openGraph: {
    title: 'ResumeBuddy - AI-Powered Resume Analyzer',
    description: 'Analyze and optimize your resume with AI',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable} ${poppins.variable} ${montserrat.variable} ${workSans.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable}`}>
      <body className="font-body antialiased" suppressHydrationWarning>
        <ClientLayout>
          {children}
          <Analytics />
        </ClientLayout>
      </body>
    </html>
  );
}
