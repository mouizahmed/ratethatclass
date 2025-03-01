'use client';
import Link from 'next/link';

export default function Footer() {
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
