import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
}

export function SearchBar({ 
  value, 
  onChange, 
  placeholder = "Search teams...",
  onClear,
  className = '' 
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`relative transition-all duration-200 ${
        isFocused ? 'ring-2 ring-planets-primary-blue ring-opacity-50' : ''
      }`}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-planets-dark-grey opacity-50" />
        
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="planets-search-bar pl-10 pr-10"
          data-testid="search-input"
        />

        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 hover:bg-planets-soft-grey"
            data-testid="clear-search"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Search suggestions could go here */}
      {value && isFocused && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-planets-mid-grey rounded-lg shadow-lg z-10">
          {/* Placeholder for search suggestions */}
          <div className="p-3 text-sm text-planets-dark-grey opacity-60">
            Press Enter to search for "{value}"
          </div>
        </div>
      )}
    </div>
  );
}