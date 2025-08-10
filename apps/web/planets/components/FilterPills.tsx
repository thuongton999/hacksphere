import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterPillsProps {
  options: FilterOption[];
  selectedFilters: string[];
  onFilterToggle: (filterId: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export function FilterPills({ 
  options, 
  selectedFilters, 
  onFilterToggle, 
  onClearAll,
  className = '' 
}: FilterPillsProps) {
  const hasActiveFilters = selectedFilters.length > 0;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Filter options */}
      {options.map((option) => {
        const isSelected = selectedFilters.includes(option.id);
        
        return (
          <button
            key={option.id}
            onClick={() => onFilterToggle(option.id)}
            className={`planets-filter-pill ${isSelected ? 'active' : ''}`}
            data-testid={`filter-${option.id}`}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={`ml-1 text-xs ${
                isSelected ? 'text-white' : 'text-planets-dark-grey opacity-60'
              }`}>
                ({option.count})
              </span>
            )}
          </button>
        );
      })}

      {/* Clear all button */}
      {hasActiveFilters && onClearAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-planets-dark-grey hover:text-planets-warm-coral ml-2"
          data-testid="clear-all-filters"
        >
          <X className="w-3 h-3 mr-1" />
          Clear All
        </Button>
      )}

      {/* Active filter count */}
      {hasActiveFilters && (
        <span className="text-xs text-planets-dark-grey opacity-60 ml-2">
          {selectedFilters.length} filter{selectedFilters.length !== 1 ? 's' : ''} active
        </span>
      )}
    </div>
  );
}

// Predefined filter options for common use cases
export const TRACK_FILTERS: FilterOption[] = [
  { id: 'ai-ml', label: 'AI/ML' },
  { id: 'web', label: 'Web' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'blockchain', label: 'Blockchain' },
  { id: 'iot', label: 'IoT' },
  { id: 'fintech', label: 'FinTech' },
  { id: 'healthtech', label: 'HealthTech' },
  { id: 'edtech', label: 'EdTech' },
];

export const STAGE_FILTERS: FilterOption[] = [
  { id: 'idea', label: 'Idea Stage' },
  { id: 'prototype', label: 'Prototype' },
  { id: 'mvp', label: 'MVP' },
  { id: 'demo-ready', label: 'Demo Ready' },
];

export const TRACTION_FILTERS: FilterOption[] = [
  { id: 'pre-launch', label: 'Pre-Launch' },
  { id: 'launched', label: 'Launched' },
  { id: 'users-1k', label: '1K+ Users' },
  { id: 'users-10k', label: '10K+ Users' },
];

export const TECH_FILTERS: FilterOption[] = [
  { id: 'react', label: 'React' },
  { id: 'vue', label: 'Vue' },
  { id: 'python', label: 'Python' },
  { id: 'nodejs', label: 'Node.js' },
  { id: 'aws', label: 'AWS' },
  { id: 'gcp', label: 'Google Cloud' },
];

export const REGION_FILTERS: FilterOption[] = [
  { id: 'north-america', label: 'North America' },
  { id: 'europe', label: 'Europe' },
  { id: 'asia', label: 'Asia' },
  { id: 'remote', label: 'Remote' },
];