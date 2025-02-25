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
import { LogOutIcon } from 'lucide-react';
import { useAuth } from '@/contexts/authContext';
import { doSignOut } from '@/firebase//auth';
import { JSX, SVGProps } from 'react';

export default function Navbar() {
  const { currentUser, userLoggedIn } = useAuth();

  const signOut = async () => {
    await doSignOut();
    window.location.reload();
  };
  return (
    <header className="flex w-full shrink-0 items-center py-4 px-4 md:px-6 z-0">
      {/* Sheet Trigger for Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>RateThatClass</SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>
          <div className="flex flex-col justify-between py-6 h-full ">
            <div>
              <Link href="#" className="flex w-full items-center py-2 text-lg font-semibold" prefetch={false}>
                Home
              </Link>
            </div>
            <div className="flex items-center justify-center w-full mr-auto ml-auto  gap-6 py-6">
              {userLoggedIn ? (
                <>
                  <SheetClose asChild>
                    <Link href="/profile">
                      <Button variant={'outline'}>{currentUser?.email || null}</Button>
                    </Link>
                  </SheetClose>

                  <Button onClick={signOut}>
                    <SheetClose asChild>
                      <LogOutIcon />
                    </SheetClose>
                  </Button>
                </>
              ) : (
                <>
                  <Button>
                    <SheetClose asChild>
                      <Link href="/login">Login</Link>
                    </SheetClose>
                  </Button>

                  <Button>
                    <SheetClose asChild>
                      <Link href="/register">Register</Link>
                    </SheetClose>
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Home Button for Mobile */}
      <Link href="/" className="ml-4 text-xl font-semibold tracking-tight lg:hidden" prefetch={false}>
        RateThatClass
      </Link>

      {/* Home Button for Desktop */}
      <Link href="/" className="mr-6 hidden lg:flex" prefetch={false}>
        <div className="text-xl scroll-m-20 tracking-tight font-semibold">RateThatClass</div>
      </Link>

      {/* Navigation for Desktop */}
      {userLoggedIn ? (
        <nav className="ml-auto hidden lg:flex gap-6">
          <Link href="/profile">
            <Button variant={'outline'}>{currentUser?.email ?? 'ERROR'}</Button>
          </Link>
          <Button onClick={signOut}>Log Out</Button>
        </nav>
      ) : (
        <nav className="ml-auto hidden lg:flex gap-6">
          <Link href="/login">
            <Button>Login</Button>
          </Link>
          <Link href="/register">
            <Button>Register</Button>
          </Link>
        </nav>
      )}
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
