
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, User as UserIcon } from 'lucide-react';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';

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
      .join('').toUpperCase();
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
                    <SheetClose asChild>
                        <Link href="/profile" className="flex items-center w-full rounded-md px-3 py-2 text-lg font-medium transition-colors text-muted-foreground hover:bg-muted">
                            <UserIcon className="mr-3 h-5 w-5" />
                            Profile
                        </Link>
                    </SheetClose>
                     <Button variant="ghost" onClick={handleLogout} className="w-full justify-start rounded-md px-3 py-2 text-lg font-medium transition-colors text-muted-foreground hover:bg-muted">
                        <LogOut className="mr-3 h-5 w-5" />
                        Logout
                    </Button>
                    <Separator className="my-4" />
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                        <div className='text-sm'>
                            <p className='font-semibold'>{user.displayName}</p>
                            <p className='text-muted-foreground truncate max-w-[150px]'>{user.email}</p>
                        </div>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
