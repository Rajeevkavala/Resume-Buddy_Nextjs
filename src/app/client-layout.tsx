'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

// Import critical components statically for faster initial rendering
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/context/auth-context';
import { ResumeProvider } from '@/context/resume-context';
import { useAuth } from '@/context/auth-context';
import { PrivacyGuard } from '@/components/privacy-guard';

// Import Navbar statically to avoid skeleton loading
import Navbar from '@/components/navbar';

// Dynamically import non-critical components
const Toaster = dynamic(() => import('@/components/ui/sonner').then(mod => ({ default: mod.Toaster })), {
  ssr: false,
});
const ClientServiceWorker = dynamic(() => import('./client-service-worker'), {
  ssr: false,
});

interface ClientLayoutProps {
  children: ReactNode;
}

// Component to handle conditional layout rendering
function ConditionalLayoutWrapper({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  
  // Pages that don't need navbar wrapper
  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/signup';
  
  // Show content without navbar for public pages or unauthenticated users
  if (isPublicPage || !user) {
    return <>{children}</>;
  }
  
  // Authenticated pages get navbar layout
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

// Dynamically import WebVitals for performance monitoring
const WebVitals = dynamic(() => import('@/components/web-vitals').then(mod => ({ default: mod.WebVitals })), {
  ssr: false,
});

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <PrivacyGuard>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      > 
        <AuthProvider>
          <ResumeProvider>
            <ConditionalLayoutWrapper>
              {children}
            </ConditionalLayoutWrapper>
            <Toaster richColors />
            <ClientServiceWorker />
            <WebVitals />
          </ResumeProvider>
        </AuthProvider>
      </ThemeProvider>
    </PrivacyGuard>
  );
}