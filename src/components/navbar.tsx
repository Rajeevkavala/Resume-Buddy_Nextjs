
'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Menu, User as UserIcon } from 'lucide-react';
import { Icons } from '@/components/icons';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { useState, startTransition } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from './ui/separator';

// Import ThemeToggle statically for faster navbar rendering
import { ThemeToggle } from '@/components/theme-toggle';

// Import sheet components statically
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

// Import dropdown components statically
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', prefetch: true },
  { href: '/analysis', label: 'Analysis', prefetch: true },
  { href: '/qa', label: 'Q&A', prefetch: true },
  { href: '/interview', label: 'Interview', prefetch: true },
  { href: '/improvement', label: 'Improvement', prefetch: true },
];

// Additional routes - enable prefetching for critical routes
export const allAppRoutes = [
  ...navItems,
  { href: '/profile', label: 'Profile', prefetch: true },
  { href: '/login', label: 'Login', prefetch: false }, // Auth routes don't need prefetch
  { href: '/signup', label: 'Signup', prefetch: false },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    startTransition(() => {
      logout();
      setIsMobileMenuOpen(false);
    });
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('').toUpperCase();
  };

  // Only render navbar for authenticated users
  if (!user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center px-4 md:px-6">
        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-muted/80 transition-colors"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-sm border-l border-border/40">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <div className="flex h-full flex-col">
                <div className="border-b border-border/20 pb-4">
                   <Link
                      href="/dashboard"
                      className="flex items-center gap-2 group"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icons.logo className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                      <span className="text-lg font-bold font-headline bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        ResumeBuddy
                      </span>
                    </Link>
                </div>
                <nav className="mt-6 flex flex-col gap-2">
                  {navItems.map(item => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        prefetch={item.prefetch}
                        className={cn(
                          'rounded-lg px-4 py-3 text-base font-medium transition-all hover:bg-muted/60 group',
                          pathname === item.href
                            ? 'bg-muted text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <span className="group-hover:translate-x-1 transition-transform inline-block">
                          {item.label}
                        </span>
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <div className="mt-auto">
                    <Separator className="my-4 bg-border/20" />
                    <SheetClose asChild>
                        <Link href="/profile" className="flex items-center w-full rounded-lg px-4 py-3 text-base font-medium transition-all text-muted-foreground hover:bg-muted/60 hover:text-foreground group cursor-pointer">
                            <UserIcon className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                            Profile
                        </Link>
                    </SheetClose>
                     <Button variant="ghost" onClick={handleLogout} className="w-full justify-start rounded-lg px-4 py-3 text-base font-medium transition-all text-muted-foreground hover:bg-red-50 hover:text-red-600 group cursor-pointer dark:hover:bg-red-950/20 dark:hover:text-red-400">
                        <LogOut className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                        Logout
                    </Button>
                    <Separator className="my-4 bg-border/20" />
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                        <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {getInitials(user.displayName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className='text-sm flex-1 min-w-0'>
                            <p className='font-semibold text-foreground truncate'>{user.displayName}</p>
                            <p className='text-muted-foreground truncate text-xs'>{user.email}</p>
                        </div>
                    </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Desktop Nav */}
        <Link
          href="/dashboard"
          className="mr-8 hidden items-center space-x-2 md:flex group"
        >
          <Icons.logo className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-bold font-headline text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
            ResumeBuddy
          </span>
        </Link>
        <nav className="hidden items-center space-x-1 text-sm font-medium md:flex">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={item.prefetch}
              className={cn(
                'rounded-lg px-4 py-2 transition-all hover:bg-muted/60 relative overflow-hidden group',
                pathname === item.href
                  ? 'bg-muted text-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="relative z-10 group-hover:translate-y-0 transition-transform">
                {item.label}
              </span>
              {pathname !== item.href && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-3">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-muted/60 transition-all group cursor-pointer">
                    <Avatar className="h-9 w-9 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                        <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(user.displayName)}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-2 border border-border/40 shadow-lg" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-3 bg-muted/30 rounded-lg mb-2">
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {getInitials(user.displayName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1 flex-1 min-w-0">
                            <p className="text-sm font-semibold leading-none truncate">{user.displayName}</p>
                            <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/20" />
                <DropdownMenuItem asChild className="p-0 cursor-pointer">
                    <Link href="/profile" className="flex items-center w-full px-3 py-2 rounded-lg transition-all hover:bg-muted/60 group cursor-pointer">
                        <UserIcon className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Profile</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/20" />
                <DropdownMenuItem onClick={logout} className="px-3 py-2 rounded-lg transition-all hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 group cursor-pointer dark:hover:bg-red-950/20 dark:hover:text-red-400 dark:focus:bg-red-950/20 dark:focus:text-red-400">
                    <LogOut className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
