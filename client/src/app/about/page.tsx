'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-4 p-8 sm:p-20 h-screen ">
      <div className="max-w-3xl">
        <h1 className="scroll-m-20 text-xl lg:text-2xl font-semibold tracking-tight lg:text-5xl">About</h1>
      </div>
      <div className="max-w-3xl">
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          As a university student, selecting the right courses can be incredibly stressful. Hearing how your friends
          feel about a specific class can make this decision much easier. While websites like{' '}
          <Link href="https://www.ratemyprofessors.com" className="text-[#4b5563] hover:underline underline-offset-4">
            Rate My Professors
          </Link>{' '}
          offer insights into professors, they often fall short when it comes to course-specific information. That’s why
          I created Rate That Class—to provide a dedicated platform where students can share reviews and advice, helping
          others make informed decisions about their course selections.
        </p>
      </div>

      <div className="max-w-3xl">
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Rate That Class is constantly evolving, with exciting new features planned to be added soon. If you have any
          questions or suggestions, please feel free to join our Discord community and share your thoughts.
        </p>
      </div>

      <a
        target="_blank"
        href="https://discord.gg/rUWcEdhjYV"
        // className="text-[#4b5563] hover:underline underline-offset-4"
      >
        <Button variant="outline">
          <svg width="24px" height="24px" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          Join Server
        </Button>
      </a>
    </div>
  );
}
