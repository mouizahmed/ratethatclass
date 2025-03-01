'use client';
import React from 'react';
import { AutoComplete } from '../ui/autocomplete';

export default function Search<T extends Record<string, unknown>>({
  data = [],
  valueKey,
  labelKey,
  searchValue,
  setSearchValue,
  selectedValue,
  setSelectedValue,
  placeholder,
  emptyMessage,
}: {
  data: T[];
  valueKey: keyof T;
  labelKey: keyof T;
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  selectedValue: string;
  setSelectedValue: React.Dispatch<React.SetStateAction<string>>;
  placeholder: string;
  emptyMessage: string;
}) {
  const mapItemsToIdValue = (): { value: string; label: string }[] => {
    return data.map((item) => ({
      value: item[valueKey] as string,
      label: item[labelKey] as string,
    }));
  };

  const items = mapItemsToIdValue();

  return (
    <AutoComplete
      selectedValue={selectedValue}
      onSelectedValueChange={setSelectedValue}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      items={items ?? []}
      emptyMessage={emptyMessage}
      placeholder={placeholder}
    />
  );
}
