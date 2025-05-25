'use client';

import React, { useState } from 'react';
import Search from './Search';
import { ClientSearchProps } from '@/types/components';

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
