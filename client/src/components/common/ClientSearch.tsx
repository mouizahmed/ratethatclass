'use client';

import React, { useState } from 'react';
import Search from './Search';
import { University } from '@/types/university';

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
