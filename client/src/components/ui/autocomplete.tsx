import { cn } from '@/lib/utils';
import { Command as CommandPrimitive } from 'cmdk';
import { Check } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from './command';
import { Input } from './input';
import { SearchInput } from './searchInput';
import { Popover, PopoverAnchor, PopoverContent } from './popover';
import { Skeleton } from './skeleton';
import Link from 'next/link';

type Props<T extends string> = {
  selectedValue: T;
  onSelectedValueChange: (value: T) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  items: { value: T; label: string }[];
  isLoading?: boolean;
  emptyMessage?: string;
  placeholder?: string;
};

export function AutoComplete<T extends string>({
  selectedValue,
  onSelectedValueChange,
  searchValue,
  onSearchValueChange,
  items,
  isLoading,
  emptyMessage = 'No items.',
  placeholder = 'Search...',
}: Props<T>) {
  const [open, setOpen] = useState(false);

  const labels = useMemo(
    () =>
      items.reduce((acc, item) => {
        acc[item.value] = item.label;
        return acc;
      }, {} as Record<string, string>),
    [items]
  );

  const filteredItems = useMemo(() => {
    const lowerSearch = searchValue.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(lowerSearch) || // Search in label
        item.value.toLowerCase().includes(lowerSearch) // Search in value
    );
  }, [items, searchValue]);

  const reset = () => {
    onSelectedValueChange('' as T);
    onSearchValueChange('');
  };

  const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.relatedTarget?.hasAttribute('cmdk-list') && labels[selectedValue] !== searchValue) {
      reset();
    }
  };

  const onSelectItem = (inputValue: string) => {
    if (inputValue === selectedValue) {
      reset();
    } else {
      onSelectedValueChange(inputValue as T);
      onSearchValueChange(labels[inputValue] ?? '');
    }
    setOpen(false);
  };
  const currentPath = window.location.pathname.replace(/\/$/, '');

  return (
    <div className="flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <PopoverAnchor asChild>
            <CommandPrimitive.Input
              asChild
              value={searchValue}
              onValueChange={onSearchValueChange}
              onKeyDown={(e) => setOpen(e.key !== 'Escape')}
              onMouseDown={() => setOpen((open) => !!searchValue || !open)}
              onFocus={() => setOpen(true)}
              onBlur={onInputBlur}
            >
              <SearchInput placeholder={placeholder} />
            </CommandPrimitive.Input>
          </PopoverAnchor>
          {!open && <CommandList aria-hidden="true" className="hidden" />}
          <PopoverContent
            asChild
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              if (e.target instanceof Element && e.target.hasAttribute('cmdk-input')) {
                e.preventDefault();
              }
            }}
            className="w-[--radix-popover-trigger-width] p-0"
          >
            <CommandList>
              {isLoading && (
                <CommandPrimitive.Loading>
                  <div className="p-1">
                    <Skeleton className="h-6 w-full" />
                  </div>
                </CommandPrimitive.Loading>
              )}
              {filteredItems.length > 0 && !isLoading ? (
                <CommandGroup>
                  {filteredItems.map((option) => (
                    <Link href={`${currentPath}/${option.value.replace(' ', '_').toLowerCase()}`} key={option.value}>
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onMouseDown={(e) => e.preventDefault()}
                        onSelect={onSelectItem}
                      >
                        <Check
                          className={cn('mr-2 h-4 w-4', selectedValue === option.value ? 'opacity-100' : 'opacity-0')}
                        />
                        {option.value}
                        {/* : {option.label} */}
                      </CommandItem>
                    </Link>
                  ))}
                </CommandGroup>
              ) : null}
              {!isLoading ? <CommandEmpty>{emptyMessage ?? 'No items.'}</CommandEmpty> : null}
            </CommandList>
          </PopoverContent>
        </Command>
      </Popover>
    </div>
  );
}
