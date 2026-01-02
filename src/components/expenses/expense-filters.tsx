"use client";

import { useState, useCallback } from "react";
import {
  Search,
  Calendar as CalendarIcon,
  Filter,
  X,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Category, ExpenseFilter } from "@/lib/types/expense";
import type { DateRange } from "react-day-picker";

interface ExpenseFiltersProps {
  categories: Category[];
  filter: ExpenseFilter;
  onFilterChange: (filter: ExpenseFilter) => void;
}

export function ExpenseFilters({
  categories,
  filter,
  onFilterChange,
}: ExpenseFiltersProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Debounced search handler
  const handleSearchChange = useCallback(
    (value: string) => {
      onFilterChange({ ...filter, search: value || undefined });
    },
    [filter, onFilterChange]
  );

  const handleCategoryChange = (value: string) => {
    onFilterChange({
      ...filter,
      categoryId: value === "all" ? undefined : value,
    });
  };

  const handleCurrencyChange = (value: string) => {
    onFilterChange({
      ...filter,
      currency: value === "all" ? undefined : value,
    });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    onFilterChange({
      ...filter,
      startDate: range?.from ? format(range.from, "yyyy-MM-dd") : undefined,
      endDate: range?.to ? format(range.to, "yyyy-MM-dd") : undefined,
    });
  };

  const clearFilters = () => {
    setDateRange(undefined);
    onFilterChange({});
  };

  const hasActiveFilters =
    filter.categoryId ||
    filter.currency ||
    filter.search ||
    filter.startDate ||
    filter.endDate;

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
      {/* Search Input */}
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search expenses..."
          value={filter.search || ""}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 h-11 bg-gray-50 dark:bg-[#3A3B3C] border-gray-200 dark:border-gray-700 focus-visible:ring-[#1877F2] focus-visible:border-[#1877F2] rounded-xl font-medium transition-all"
        />
      </div>

      {/* Category Select */}
      <Select
        value={filter.categoryId || "all"}
        onValueChange={handleCategoryChange}
      >
        <SelectTrigger className="w-full sm:w-[180px] !h-11 bg-gray-50 dark:bg-[#3A3B3C] border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-all">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>All categories</span>
            </div>
          </SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              <div className="flex items-center gap-2">
                {category.icon && <span>{category.icon}</span>}
                <span>{category.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Currency Select */}
      <Select
        value={filter.currency || "all"}
        onValueChange={handleCurrencyChange}
      >
        <SelectTrigger className="w-full sm:w-[180px] !h-11 bg-gray-50 dark:bg-[#3A3B3C] border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-all">
          <SelectValue placeholder="All currencies" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>All currencies</span>
            </div>
          </SelectItem>
          <SelectItem value="DOP">
            <div className="flex items-center gap-2">
              <span>💵</span>
              <span>DOP</span>
            </div>
          </SelectItem>
          <SelectItem value="USD">
            <div className="flex items-center gap-2">
              <span>💵</span>
              <span>USD</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Date Range Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full sm:w-[220px] !h-11 justify-start text-left font-medium bg-gray-50 dark:bg-[#3A3B3C] border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] rounded-xl transition-all ${
              dateRange?.from
                ? "text-gray-900 dark:text-gray-100"
                : "text-gray-500"
            }`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "MMM d")} -{" "}
                  {format(dateRange.to, "MMM d, yyyy")}
                </>
              ) : (
                format(dateRange.from, "MMM d, yyyy")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleDateRangeChange}
            numberOfMonths={2}
            className="rounded-xl"
          />
        </PopoverContent>
      </Popover>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          onClick={clearFilters}
          className="h-11 px-4 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-all"
        >
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      )}
    </div>
  );
}
