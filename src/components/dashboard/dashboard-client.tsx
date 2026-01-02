'use client'

import { useState } from 'react'
import { ExpenseTable } from '@/components/expenses/expense-table'
import { ExpenseFilters } from '@/components/expenses/expense-filters'
import { AddExpenseDialog } from '@/components/expenses/add-expense-dialog'
import { ExpenseStats } from '@/components/expenses/expense-stats'
import type { Category, Expense, ExpenseFilter } from '@/lib/types/expense'

interface DashboardClientProps {
    initialExpenses: Expense[]
    categories: Category[]
}

export function DashboardClient({ initialExpenses, categories }: DashboardClientProps) {
    const [filter, setFilter] = useState<ExpenseFilter>({})
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

    // Filter expenses based on current filter
    const filteredExpenses = initialExpenses.filter((expense) => {
        if (filter.categoryId && expense.category_id !== filter.categoryId) {
            return false
        }
        if (filter.startDate && expense.date < filter.startDate) {
            return false
        }
        if (filter.endDate && expense.date > filter.endDate) {
            return false
        }
        if (filter.search && !expense.description?.toLowerCase().includes(filter.search.toLowerCase())) {
            return false
        }
        return true
    })

    return (
        <div className="space-y-8 pb-8">
            <ExpenseStats expenses={filteredExpenses} />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            Expenses
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
                            Manage and track all your expenses
                        </p>
                    </div>
                    <AddExpenseDialog
                        categories={categories}
                        editingExpense={editingExpense}
                        onClose={() => setEditingExpense(null)}
                    />
                </div>

                {/* Combined Card with Filters and Table */}
                <div className="bg-white dark:bg-[#242526] rounded-xl overflow-hidden">
                    {/* Filters Section */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <ExpenseFilters
                            categories={categories}
                            filter={filter}
                            onFilterChange={setFilter}
                        />
                    </div>

                    {/* Table Section */}
                    <ExpenseTable
                        expenses={filteredExpenses}
                        onEdit={setEditingExpense}
                    />
                </div>
            </div>
        </div>
    )
}
