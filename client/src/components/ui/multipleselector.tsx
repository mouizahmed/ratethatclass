'use client';
import React, { useState, useRef } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface MultipleSelectorProps {
  data: Record<string, string>;
  placeholder: string;
  itemType: string;
  value: Record<string, string>;
  setValue: (val: Record<string, string>) => void;
}

export function MultipleSelector({ data, placeholder, itemType, value, setValue }: MultipleSelectorProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Toggle the selection for a given key
  const toggleValue = (key: string, label: string) => {
    const newValue = { ...value };
    if (newValue[key]) {
      delete newValue[key];
    } else {
      newValue[key] = label;
    }
    setValue(newValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="grow w-full h-auto justify-between gap-2"
        >
          <div className="flex flex-wrap gap-2 justify-start text-sm font-normal max-w-full">
            {Object.keys(value).length > 0 ? (
              Object.entries(value).map(([key, label]) => (
                <span key={key} className="px-2 py-1 rounded-xl border bg-slate-200 text-xs font-medium">
                  {label}
                </span>
              ))
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        style={{
          minWidth: buttonRef.current ? `${buttonRef.current.offsetWidth}px` : 'auto',
        }}
        className="p-0"
        onInteractOutside={(e) => {
          e.preventDefault();
          setOpen(false);
        }}
      >
        <Command>
          <CommandInput placeholder={`Search ${itemType}`} />
          <CommandEmpty>No {itemType} found.</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {Object.entries(data).map(([key, label]) => (
                <CommandItem key={key} onSelect={() => toggleValue(key, label)}>
                  <Check className={cn('mr-2 h-4 w-4', value[key] ? 'opacity-100' : 'opacity-0')} />
                  {label}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
