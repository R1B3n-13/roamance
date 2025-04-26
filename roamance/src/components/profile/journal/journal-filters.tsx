import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Search,
  Calendar,
  MapPin,
  Filter,
  X,
  ArrowUpDown
} from 'lucide-react';

export type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc';
export type ViewType = 'grid' | 'list' | 'map';
export type FilterCategory = 'location' | 'date' | 'type' | 'tags';

interface FilterTag {
  id: string;
  category: FilterCategory;
  label: string;
}

interface JournalFiltersProps {
  className?: string;
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterTag[]) => void;
  onSortChange: (sort: SortOption) => void;
  onViewChange: (view: ViewType) => void;
  activeFilters?: FilterTag[];
  activeSort?: SortOption;
  activeView?: ViewType;
  showViewSwitcher?: boolean;
}

export const JournalFilters: React.FC<JournalFiltersProps> = ({
  className,
  onSearch,
  onFilterChange,
  onSortChange,
  onViewChange,
  activeFilters = [],
  activeSort = 'newest',
  activeView = 'grid',
  showViewSwitcher = true
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterOpen, setFilterOpen] = React.useState(false);

  // Handle search query
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  // Handle filter removal
  const handleRemoveFilter = (filter: FilterTag) => {
    const newFilters = activeFilters.filter(f => f.id !== filter.id);
    onFilterChange(newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    onFilterChange([]);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "w-full bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-3 md:p-4",
        className
      )}
    >
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <Input
              placeholder="Search journals..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9 h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 w-full"
            />
          </div>
        </form>

        {/* Filter button */}
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-10 gap-1.5 border-slate-200 dark:border-slate-800 shadow-sm text-slate-700 dark:text-slate-300 font-medium"
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100">Filters</h4>
                {activeFilters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    onClick={handleClearFilters}
                  >
                    <X className="h-3 w-3" />
                    Clear all
                  </Button>
                )}
              </div>

              <Separator className="my-2" />

              {/* Filter sections would go here */}
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Date
                </h5>
                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs justify-start font-normal"
                  >
                    This month
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs justify-start font-normal"
                  >
                    Last 3 months
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs justify-start font-normal"
                  >
                    This year
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs justify-start font-normal"
                  >
                    Custom range
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Location
                </h5>
                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs justify-start font-normal"
                  >
                    Europe
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs justify-start font-normal"
                  >
                    Asia
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs justify-start font-normal"
                  >
                    North America
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs justify-start font-normal"
                  >
                    All Locations
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort button */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-10 gap-1.5 border-slate-200 dark:border-slate-800 shadow-sm text-slate-700 dark:text-slate-300 font-medium"
            >
              <ArrowUpDown className="h-4 w-4" />
              <span>Sort</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="end">
            <div className="space-y-1">
              <Button
                variant={activeSort === 'newest' ? 'subtle' : 'ghost'}
                size="sm"
                className="w-full justify-start text-sm h-9"
                onClick={() => onSortChange('newest')}
              >
                Newest first
              </Button>
              <Button
                variant={activeSort === 'oldest' ? 'subtle' : 'ghost'}
                size="sm"
                className="w-full justify-start text-sm h-9"
                onClick={() => onSortChange('oldest')}
              >
                Oldest first
              </Button>
              <Button
                variant={activeSort === 'name-asc' ? 'subtle' : 'ghost'}
                size="sm"
                className="w-full justify-start text-sm h-9"
                onClick={() => onSortChange('name-asc')}
              >
                Name (A to Z)
              </Button>
              <Button
                variant={activeSort === 'name-desc' ? 'subtle' : 'ghost'}
                size="sm"
                className="w-full justify-start text-sm h-9"
                onClick={() => onSortChange('name-desc')}
              >
                Name (Z to A)
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* View switcher */}
        {showViewSwitcher && (
          <Tabs defaultValue={activeView} className="h-10" onValueChange={(value) => onViewChange(value as ViewType)}>
            <TabsList className="bg-slate-100 dark:bg-slate-900 h-full">
              <TabsTrigger value="grid" className="h-full px-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </TabsTrigger>
              <TabsTrigger value="list" className="h-full px-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="2" width="14" height="2" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="1" y="7" width="14" height="2" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="1" y="12" width="14" height="2" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </TabsTrigger>
              <TabsTrigger value="map" className="h-full px-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4L5 2V12L1 14V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 2L10 4V14L5 12V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 4L15 2V12L10 14V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {/* Active filters display */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          {activeFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant="outline"
              className="px-2 py-1 h-7 gap-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            >
              {filter.label}
              <button
                onClick={() => handleRemoveFilter(filter)}
                className="ml-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-slate-600 dark:text-slate-400"
            onClick={handleClearFilters}
          >
            Clear all
          </Button>
        </div>
      )}
    </motion.div>
  );
};
