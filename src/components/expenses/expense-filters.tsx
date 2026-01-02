'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
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
        <div className="flex flex-col sm:flex-row gap-3 animate-slide-up">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search expenses..."
                    value={filter.search || ''}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9 transition-all duration-200 focus:scale-[1.01]"
                />
            </div>

            <Select value={filter.categoryId || 'all'} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full sm:w-[200px] transition-all duration-200">
                    <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
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

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto transition-all duration-200">
                        <Filter className="h-4 w-4 mr-2" />
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
                <DropdownMenuContent align="end" className="w-auto p-0">
                    <Calendar
                        mode="range"
                        selected={dateRange as any}
                        onSelect={(range) => handleDateRangeSelect(range || {})}
                        numberOfMonths={2}
                        className="rounded-md"
                    />
                </DropdownMenuContent>
            </DropdownMenu>

            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="w-full sm:w-auto transition-all duration-200 hover:bg-destructive/10"
                >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                </Button>
            )}
        </div>
    )
}
