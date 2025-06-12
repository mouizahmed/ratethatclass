'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { BadgeCheck } from 'lucide-react';
import { AuthProvider, useAuth } from '@/contexts/authContext';
import { doSignOut } from '@/firebase/auth';
import { JSX, SVGProps } from 'react';
import { BadgeX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Navbar() {
  return (
    <AuthProvider>
      <NavbarInner />
    </AuthProvider>
  );
}

function NavbarInner() {
  const { currentUser, userLoggedIn, loading, isAdmin, isOwner } = useAuth();

  const signOut = async () => {
    await doSignOut();
    window.location.reload();
  };

  const renderAuthButtons = () => {
    if (loading) {
      return (
        <div className="flex gap-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      );
    }

    if (userLoggedIn && currentUser) {
      return (
        <div className="flex items-center gap-4">
          {isAdmin || isOwner ? (
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="outline" className="flex items-center gap-2">
                  Admin Dashboard
                </Button>
              </Link>
              <Button variant="outline" className="max-w-[200px] truncate">
                {currentUser.email}
              </Button>
            </div>
          ) : (
            <>
              {currentUser.emailVerified ? (
                <Button variant="outline" className="flex items-center gap-2">
                  <BadgeCheck className="text-blue-500" />
                  <span className="hidden sm:inline">Verified</span>
                </Button>
              ) : (
                <Link href="/profile">
                  <Button variant="outline" className="flex items-center gap-2">
                    <BadgeX className="text-red-500" />
                    <span className="hidden sm:inline">Not Verified</span>
                  </Button>
                </Link>
              )}
              <Link href="/profile">
                <Button variant="outline" className="max-w-[200px] truncate">
                  {currentUser.email}
                </Button>
              </Link>
            </>
          )}
          <Button onClick={signOut} variant="destructive">
            Log Out
          </Button>
        </div>
      );
    }

    return (
      <div className="flex gap-4">
        <Link href="/login">
          <Button>Login</Button>
        </Link>
        <Link href="/register">
          <Button variant="outline">Register</Button>
        </Link>
      </div>
    );
  };

  const renderMobileAuthButtons = () => {
    if (loading) {
      return (
        <div className="flex flex-col gap-3 w-full">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }

    if (userLoggedIn && currentUser) {
      return (
        <div className="flex flex-col gap-3 w-full">
          {isAdmin || isOwner ? (
            <div className="flex flex-col gap-3 w-full">
              <SheetClose asChild>
                <Link href="/admin">
                  <Button variant="outline" className="flex items-center justify-center gap-2 w-full">
                    Admin Dashboard
                  </Button>
                </Link>
              </SheetClose>
              <Button variant="outline" className="w-full truncate">
                {currentUser.email}
              </Button>
            </div>
          ) : (
            <>
              {currentUser.emailVerified ? (
                <Button variant="outline" className="flex items-center justify-center gap-2 w-full">
                  <BadgeCheck className="text-blue-500" />
                  <span>Verified</span>
                </Button>
              ) : (
                <SheetClose asChild>
                  <Link href="/profile">
                    <Button variant="outline" className="flex items-center justify-center gap-2 w-full">
                      <BadgeX className="text-red-500" />
                      <span>Not Verified</span>
                    </Button>
                  </Link>
                </SheetClose>
              )}
              <SheetClose asChild>
                <Link href="/profile">
                  <Button variant="outline" className="w-full truncate">
                    {currentUser.email}
                  </Button>
                </Link>
              </SheetClose>
            </>
          )}
          <Button onClick={signOut} variant="destructive" className="w-full">
            Log Out
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3 w-full">
        <SheetClose asChild>
          <Link href="/login">
            <Button className="w-full">Login</Button>
          </Link>
        </SheetClose>
        <SheetClose asChild>
          <Link href="/register">
            <Button variant="outline" className="w-full">
              Register
            </Button>
          </Link>
        </SheetClose>
      </div>
    );
  };

  return (
    <header className="flex w-full shrink-0 items-center py-4 px-4 md:px-6 z-0 border-b">
      {/* Sheet Trigger for Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-left">RateThatClass</SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>
          <div className="flex flex-col justify-between h-[calc(100vh-120px)]">
            <div className="flex flex-col gap-6">
              <SheetClose asChild>
                <Link
                  href="/"
                  className="flex w-full items-center py-3 text-lg font-semibold hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/about"
                  className="flex w-full items-center py-3 text-lg font-semibold hover:text-primary transition-colors"
                >
                  About
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/guidelines"
                  className="flex w-full items-center py-3 text-lg font-semibold hover:text-primary transition-colors"
                >
                  Site Guidelines
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/privacy"
                  className="flex w-full items-center py-3 text-lg font-semibold hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </SheetClose>
            </div>
            <div className="mt-8 pt-6 border-t">{renderMobileAuthButtons()}</div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Home Button for Mobile */}
      <Link href="/" className="ml-4 text-xl font-semibold tracking-tight lg:hidden">
        RateThatClass
      </Link>

      {/* Home Button for Desktop */}
      <Link href="/" className="mr-6 hidden lg:flex">
        <div className="text-xl scroll-m-20 tracking-tight font-semibold">RateThatClass</div>
      </Link>

      {/* Navigation for Desktop */}
      <nav className="ml-auto hidden lg:flex">{renderAuthButtons()}</nav>
    </header>
  );
}

function MenuIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}
