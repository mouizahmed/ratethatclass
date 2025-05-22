'use client';

import React, { useState, useEffect } from 'react';
import Search from './Search';
import { University } from '@/types/university';
// import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';
import Link from 'next/link';

interface ClientSearchProps {
  data: University[];
  valueKey: keyof University;
  labelKey: keyof University;
  placeholder: string;
  emptyMessage: string;
}

export default function ClientSearch({ data, valueKey, labelKey, placeholder, emptyMessage }: ClientSearchProps) {
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Static render for SEO
  if (!mounted) {
    return (
      <div className="w-full">
        <div className="flex h-10 items-center rounded-md border border-input bg-white pl-3 text-sm ring-offset-background focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-2">
          <SearchIcon className="h-[16px] w-[16px]" />
          <input
            type="text"
            placeholder={placeholder}
            className="w-full p-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            readOnly
          />
        </div>
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Available Universities:</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {data.map((university) => (
              <li key={university.university_name}>
                <Link 
                  href={`/${university.university_name.replaceAll(' ', '_').toLowerCase()}`}
                  className="text-blue-600 hover:underline"
                >
                  {university.university_name}
                </Link>
                <span className="text-sm text-gray-500 ml-2">
                  ({university.review_num} reviews)
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <Search
      data={data}
      valueKey={valueKey}
      labelKey={labelKey}
      searchValue={searchValue}
      setSearchValue={setSearchValue}
      selectedValue={selectedValue}
      setSelectedValue={setSelectedValue}
      placeholder={placeholder}
      emptyMessage={emptyMessage}
    />
  );
}
