'use client';
import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function Dropdown({
  data,
  placeholder,
  value,
  setValue,
  initialValue,
  returnType,
  disabled,
}: {
  data: Record<string, string>;
  placeholder: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  initialValue: string;
  returnType: 'key' | 'value';
  disabled?: boolean;
}) {
  return (
    <Select defaultValue={initialValue} value={value} onValueChange={setValue} disabled={disabled}>
      <SelectTrigger className="w-full hover:bg-zinc-100 transition duration-150 h-10">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{placeholder}</SelectLabel>
          {Object.entries(data).map(([key, label]) => {
            let value = key;
            if (returnType == 'value') {
              value = label;
            }

            return (
              <SelectItem key={key} value={value}>
                {label}
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
