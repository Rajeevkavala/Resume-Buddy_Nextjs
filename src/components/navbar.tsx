
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { Icons } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from './ui/separator';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/analysis', label: 'Analysis' },
  { href: '/qa', label: 'Q&A' },
  { href: '/interview', label: 'Interview' },
  { href: '/improvement', label: 'Improvement' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('');
  };

  if (!user) {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center gap-2">
              <Icons.logo className="text-primary" />
              <span className="inline-block font-bold font-headline text-lg">
                ResumeBuddy
              </span>
            </div>
          </Link>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="secondary" onClick={() => router.push('/login')}>
              Login
            </Button>
            <Button variant="default" onClick={() => router.push('/signup')}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-sm">
              <div className="flex h-full flex-col">
                <div className="border-b pb-4">
                   <Link
                      href="/"
                      className="flex items-center gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icons.logo className="h-7 w-7 text-primary" />
                      <span className="text-lg font-bold font-headline">
                        ResumeBuddy
                      </span>
                    </Link>
                </div>
                <nav className="mt-6 flex flex-col gap-4">
                  {navItems.map(item => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-muted',
                          pathname === item.href
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground'
                        )}
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <div className="mt-auto">
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                            </Avatar>
                            <div className='text-sm'>
                                <p className='font-semibold'>{user.displayName}</p>
                                <p className='text-muted-foreground truncate max-w-[150px]'>{user.email}</p>
                            </div>
                         </div>
                         <Button variant="ghost" size="icon" onClick={handleLogout}>
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Desktop Nav */}
        <Link
          href="/"
          className="mr-6 hidden items-center space-x-2 md:flex"
        >
          <Icons.logo className="h-7 w-7 text-primary" />
          <span className="font-bold font-headline text-lg">
            ResumeBuddy
          </span>
        </Link>
        <nav className="hidden items-center space-x-2 text-sm font-medium md:flex">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-md px-3 py-2 transition-colors hover:bg-muted',
                pathname === item.href
                  ? 'bg-muted text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-3">
             <Avatar className="h-9 w-9">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
            <Button variant="outline" onClick={logout} size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
