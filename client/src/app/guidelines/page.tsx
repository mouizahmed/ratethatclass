import React from 'react';
import { Metadata } from 'next';
import { generateMetadata, SEO_CONFIGS } from '@/lib/seo';

export const metadata: Metadata = generateMetadata(SEO_CONFIGS.guidelines);

export default function Guidelines() {
  return (
    <div className="flex justify-center gap-4 p-8 sm:p-20 h-screen">
      <div className="flex flex-col gap-4 max-w-3xl">
        <div className="flex justify-center">
          <h1 className="scroll-m-20 text-xl lg:text-2xl font-semibold tracking-tight lg:text-5xl">Site Guidelines</h1>
        </div>
        <div className="flex justify-center">
          <p className="leading-7 [&:not(:first-child)]:mt-6 font-bold">
            Please read these site guidelines thoroughly before using this service.
          </p>
        </div>

        <div className="">
          <p className="leading-7 [&:not(:first-child)]:mt-6">
            If you see a review that you believe violates our Site Guidelines outlined below, please report it and we
            will have it removed.
          </p>
        </div>

        <div className="">
          <p className="leading-7 [&:not(:first-child)]:mt-6 font-bold">General Guidelines</p>
          <ul className="list-disc list-inside">
            <li>Keep it honest. Only review courses and professors you have personally experienced.</li>
            <li>Stay relevant. Focus on course-related insights rather than unrelated personal details.</li>
            <li>Be respectful. Refrain from personal attacks or discriminatory remarks.</li>
            <li>Offer balance. Mention both positive aspects and areas for improvement.</li>
            <li>Avoid hearsay. Share first-hand experiences instead of rumors or speculation.</li>
            <li>No spam. Irrelevant, repetitive, or promotional content is not allowed.</li>
            <li>Reviews may be removed if they violate these guidelines.</li>
            <li>Keep it civil. Maintain a respectful tone toward instructors, peers, and fellow reviewers.</li>
          </ul>
        </div>

        <div className="">
          <p className="leading-7 [&:not(:first-child)]:mt-6 font-bold">Content Policy</p>
          <p className="leading-7">The following is prohibited:</p>
          <ul className="list-disc list-inside">
            <li>Hate speech or discriminatory language.</li>
            <li>Personal attacks, threats, or harassment.</li>
            <li>Pornographic or sexually explicit material.</li>
            <li>Promotion of violence or dangerous behavior.</li>
            <li>Illegal or copyrighted content without permission.</li>
            <li>Sharing private or confidential information.</li>
            <li>Spam, self-promotion, or irrelevant advertising.</li>
            <li>Impersonation or misrepresentation.</li>
            <li>Hyperlinks or URLs</li>
            <li>Any language other than English or French</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
