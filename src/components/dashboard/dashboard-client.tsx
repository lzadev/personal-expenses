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
        <div className="space-y-6">
            <ExpenseStats expenses={filteredExpenses} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
                    <p className="text-muted-foreground">
                        Manage and track your expenses
                    </p>
                </div>
                <AddExpenseDialog
                    categories={categories}
                    editingExpense={editingExpense}
                    onClose={() => setEditingExpense(null)}
                />
            </div>

            <ExpenseFilters
                categories={categories}
                filter={filter}
                onFilterChange={setFilter}
            />

            <ExpenseTable
                expenses={filteredExpenses}
                onEdit={setEditingExpense}
            />
        </div>
    )
}
