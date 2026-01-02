'use client'

import { useState } from 'react'
import { Search, Filter, X, Calendar as CalendarIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Category, ExpenseFilter } from '@/lib/types/expense'
import { format } from 'date-fns'

interface ExpenseFiltersProps {
    categories: Category[]
    filter: ExpenseFilter
    onFilterChange: (filter: ExpenseFilter) => void
}

export function ExpenseFilters({ categories, filter, onFilterChange }: ExpenseFiltersProps) {
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

    const handleCategoryChange = (value: string) => {
        onFilterChange({
            ...filter,
            categoryId: value === 'all' ? undefined : value,
        })
    }

    const handleSearchChange = (value: string) => {
        onFilterChange({
            ...filter,
            search: value || undefined,
        })
    }

    const handleDateRangeSelect = (range: { from?: Date; to?: Date }) => {
        setDateRange(range)
        onFilterChange({
            ...filter,
            startDate: range.from ? format(range.from, 'yyyy-MM-dd') : undefined,
            endDate: range.to ? format(range.to, 'yyyy-MM-dd') : undefined,
        })
    }

    const clearFilters = () => {
        setDateRange({})
        onFilterChange({})
    }

    const hasActiveFilters = filter.categoryId || filter.search || filter.startDate || filter.endDate

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search expenses..."
                    value={filter.search || ''}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 h-11 bg-gray-50 dark:bg-[#3A3B3C] border-gray-200 dark:border-gray-700 focus-visible:ring-[#1877F2] focus-visible:border-[#1877F2] rounded-xl font-medium transition-all"
                />
            </div>

            {/* Category Select */}
            <Select value={filter.categoryId || 'all'} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full sm:w-[200px] !h-11 bg-gray-50 dark:bg-[#3A3B3C] border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-all">
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

            {/* Date Range Picker */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className={`w-full sm:w-auto h-11 px-4 bg-gray-50 dark:bg-[#3A3B3C] border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] rounded-xl font-medium transition-all ${dateRange.from ? 'border-[#1877F2] bg-blue-50 dark:bg-blue-950/30 text-[#1877F2]' : ''
                            }`}
                    >
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {dateRange.from ? (
                            dateRange.to ? (
                                <>
                                    {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
                                </>
                            ) : (
                                format(dateRange.from, 'MMM dd, yyyy')
                            )
                        ) : (
                            'Date range'
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-auto p-0 rounded-2xl">
                    <Calendar
                        mode="range"
                        selected={dateRange as any}
                        onSelect={(range) => handleDateRangeSelect(range || {})}
                        numberOfMonths={2}
                        className="rounded-2xl"
                    />
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="w-full sm:w-auto h-11 px-4 text-gray-600 dark:text-gray-400 hover:text-[#F02849] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl font-medium transition-all animate-scale-in"
                >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                </Button>
            )}
        </div>
    )
}
