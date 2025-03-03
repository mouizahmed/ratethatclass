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
import { BadgeCheck, LogOutIcon } from 'lucide-react';
import { useAuth } from '@/contexts/authContext';
import { doSignOut } from '@/firebase//auth';
import { JSX, SVGProps } from 'react';
import { BadgeX } from 'lucide-react';

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
              <SheetClose asChild>
                <Link href="/" className="flex w-full items-center py-2 text-lg font-semibold" prefetch={false}>
                  Home
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/about" className="flex w-full items-center py-2 text-lg font-semibold" prefetch={false}>
                  About
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/guidelines"
                  className="flex w-full items-center py-2 text-lg font-semibold"
                  prefetch={false}
                >
                  Site Guidelines
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/privacy" className="flex w-full items-center py-2 text-lg font-semibold" prefetch={false}>
                  Privacy Policy
                </Link>
              </SheetClose>
            </div>
            <div className="flex flex-col items-center justify-center w-full mr-auto ml-auto  gap-4 py-6">
              {userLoggedIn && currentUser ? (
                <>
                  <div className="w-full">
                    {currentUser.emailVerified ? (
                      <Button variant={'outline'} className="w-full">
                        <BadgeCheck className="text-blue-500" />
                      </Button>
                    ) : (
                      <SheetClose asChild>
                        <Link href="/profile">
                          <Button variant={'outline'} className="w-full">
                            Not Verified
                            <BadgeX className="text-red-500" />
                          </Button>
                        </Link>
                      </SheetClose>
                    )}
                  </div>
                  <div className="w-full">
                    <SheetClose asChild>
                      <Link href="/profile">
                        <Button variant={'outline'} className="w-full whitespace-normal break-all">
                          {currentUser?.email || null}
                        </Button>
                      </Link>
                    </SheetClose>
                  </div>
                  <div className="w-full">
                    <SheetClose asChild>
                      <Button onClick={signOut} className="w-full">
                        <LogOutIcon />
                      </Button>
                    </SheetClose>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-full grid grid-cols-2 gap-4">
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
                  </div>
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
      {userLoggedIn && currentUser ? (
        <nav className="ml-auto hidden lg:flex gap-6">
          {currentUser.emailVerified ? (
            <Button variant={'outline'}>
              <BadgeCheck className="text-blue-500" />
            </Button>
          ) : (
            <Link href="/profile">
              <Button variant={'outline'}>
                Not Verified
                <BadgeX className="text-red-500" />
              </Button>
            </Link>
          )}

          <Link href="/profile">
            <Button variant={'outline'}>{currentUser.email ?? 'ERROR'}</Button>
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
