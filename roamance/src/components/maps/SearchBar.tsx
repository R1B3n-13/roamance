'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isDarkMode: boolean;
}

export function SearchBar({ value, onChange, isDarkMode }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={cn(
      'w-full relative flex items-center',
      isFocused ? 'ring-2 ring-primary/20 rounded-md' : ''
    )}>
      <Search className={cn(
        'absolute left-3 h-4 w-4',
        isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground/70'
      )} />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search for places, addresses, or coordinates"
        className={cn(
          'pl-9 pr-8 h-10 border',
          isDarkMode
            ? 'bg-muted/30 border-muted/40 placeholder:text-muted-foreground/50'
            : 'bg-background border-muted/30 placeholder:text-muted-foreground/60'
        )}
      />
      {value && (
        <button
          className="absolute right-3"
          onClick={() => onChange('')}
        >
          <X className={cn(
            'h-4 w-4',
            isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground/70'
          )} />
        </button>
      )}
    </div>
  );
}
