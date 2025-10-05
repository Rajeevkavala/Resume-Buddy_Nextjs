'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const navSections = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#stats', label: 'Why Us' },
];

export default function LandingNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll handler
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    
    if (element) {
      const yOffset = -80; // Offset for fixed navbar
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header 
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        isScrolled 
          ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b shadow-sm' 
          : 'bg-transparent'
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 group"
        >
          <Icons.logo className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-bold font-headline text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
            ResumeBuddy
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
          {navSections.map((section) => (
            <a
              key={section.href}
              href={section.href}
              onClick={(e) => handleSmoothScroll(e, section.href)}
              className="rounded-lg px-4 py-2 transition-all hover:bg-muted/60 text-muted-foreground hover:text-foreground relative overflow-hidden group"
            >
              <span className="relative z-10">
                {section.label}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-3">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" className="font-medium">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="font-semibold shadow-md hover:shadow-lg transition-all">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center space-x-2">
          <ThemeToggle />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-muted/80 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm border-l border-border/40">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <div className="flex h-full flex-col">
                {/* Mobile Logo */}
                <div className="border-b border-border/20 pb-4">
                  <Link
                    href="/"
                    className="flex items-center gap-2 group"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icons.logo className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-lg font-bold font-headline bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                      ResumeBuddy
                    </span>
                  </Link>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="mt-6 flex flex-col gap-2">
                  {navSections.map((section) => (
                    <SheetClose asChild key={section.href}>
                      <a
                        href={section.href}
                        onClick={(e) => handleSmoothScroll(e, section.href)}
                        className="rounded-lg px-4 py-3 text-base font-medium transition-all hover:bg-muted/60 text-muted-foreground hover:text-foreground group"
                      >
                        <span className="group-hover:translate-x-1 transition-transform inline-block">
                          {section.label}
                        </span>
                      </a>
                    </SheetClose>
                  ))}
                </nav>

                {/* Mobile Actions */}
                <div className="mt-auto space-y-3 pt-6 border-t border-border/20">
                  <SheetClose asChild>
                    <Link href="/login" className="block">
                      <Button 
                        variant="outline" 
                        className="w-full font-medium"
                        size="lg"
                      >
                        Sign In
                      </Button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/signup" className="block">
                      <Button 
                        className="w-full font-semibold shadow-md"
                        size="lg"
                      >
                        Get Started
                      </Button>
                    </Link>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
