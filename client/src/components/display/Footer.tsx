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

export default function Footer() {
  const { currentUser, userLoggedIn } = useAuth();

  const signOut = async () => {
    await doSignOut();
    window.location.reload();
  };
  return (
    <footer className="h-[100px] flex flex-col items-center">
      <div className="w-full max-w-3xl flex justify-between p-10">
        <Link href="/about" className="text-[#4b5563] hover:underline underline-offset-4">
          About
        </Link>
        <a
          target="_blank"
          href="https://discord.gg/rUWcEdhjYV"
          className="text-[#4b5563] hover:underline underline-offset-4"
        >
          Discord Community
        </a>
        <Link href="/guidelines" className="text-[#4b5563] hover:underline underline-offset-4">
          Site Guidelines
        </Link>
        <Link href="/privacy" className="text-[#4b5563] hover:underline underline-offset-4">
          Privacy Policy
        </Link>
        {/* <Link href="/about" className="text-[#4b5563] hover:underline underline-offset-4">
          Terms & Conditions
        </Link> */}
      </div>
    </footer>
  );
}
