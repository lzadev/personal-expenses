'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Expense } from '@/lib/types/expense'
import { deleteExpense } from '@/lib/actions/expenses'
import { formatCurrency } from '@/lib/utils/currency'

interface ExpenseTableProps {
    expenses: Expense[]
    onEdit: (expense: Expense) => void
}

export function ExpenseTable({ expenses, onEdit }: ExpenseTableProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) return

        setDeletingId(id)
        try {
            await deleteExpense(id)
        } catch (error) {
            console.error('Failed to delete expense:', error)
            alert('Failed to delete expense')
        } finally {
            setDeletingId(null)
        }
    }

    // Sort expenses by date (newest first)
    const sortedExpenses = [...expenses].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    if (expenses.length === 0) {
        return (
            <div className="bg-white dark:bg-[#242526] rounded-xl p-12 text-center animate-fade-in">
                <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full gradient-fb-blue flex items-center justify-center shadow-lg">
                        <span className="text-3xl">📊</span>
                    </div>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No expenses found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add your first expense to get started</p>
            </div>
        )
    }

    return (
        <>
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Latest Expenses</h3>
                    <button className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium transition-colors">
                        View All
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {sortedExpenses.map((expense, index) => (
                            <tr
                                key={expense.id}
                                className="group hover:bg-gray-50 dark:hover:bg-[#2A2B2C] transition-colors animate-slide-up"
                                style={{ animationDelay: `${index * 0.03}s` }}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                        {format(new Date(expense.date), 'dd/MM/yyyy')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{expense.category?.icon || '📝'}</span>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                                            {expense.category?.name || 'Uncategorized'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                        {expense.description || '—'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {formatCurrency(expense.amount, expense.currency)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(expense)}
                                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-[#1877F2] dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(expense.id)}
                                            disabled={deletingId === expense.id}
                                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-[#F02849] dark:hover:bg-red-950/30 dark:hover:text-red-400"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
                Showing {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
            </div>
        </>
    )
}
