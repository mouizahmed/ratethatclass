'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="h-[100px] flex flex-col items-center">
      <div className="w-full max-w-3xl flex justify-between p-10 gap-4">
        <Link href="/about" className="text-[#4b5563] hover:underline underline-offset-4 text-center flex items-center">
          About
        </Link>
        <a
          target="_blank"
          href="https://discord.gg/rUWcEdhjYV"
          className="text-[#4b5563] hover:underline underline-offset-4 text-center flex items-center"
        >
          Discord Community
        </a>
        <Link
          href="/guidelines"
          className="text-[#4b5563] hover:underline underline-offset-4 text-center flex items-center"
        >
          Site Guidelines
        </Link>
        <Link
          href="/privacy"
          className="text-[#4b5563] hover:underline underline-offset-4 text-center flex items-center"
        >
          Privacy Policy
        </Link>
        {/* <Link href="/about" className="text-[#4b5563] hover:underline underline-offset-4">
          Terms & Conditions
        </Link> */}
      </div>
      <div className="text-[#4b5563] text-sm pb-4">
        Copyright © 2025{' '}
        <Link href="/" className="hover:underline underline-offset-4">
          RateThatClass
        </Link>
        . All rights reserved.
      </div>
    </footer>
  );
}
