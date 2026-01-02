'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Expense } from '@/lib/types/expense'
import { deleteExpense } from '@/lib/actions/expenses'
import { formatCurrency } from '@/lib/utils/currency'

interface ExpenseTableProps {
    expenses: Expense[]
    onEdit: (expense: Expense) => void
}

const ITEMS_PER_PAGE = 20

export function ExpenseTable({ expenses, onEdit }: ExpenseTableProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)

    const handleDeleteClick = (expense: Expense) => {
        setExpenseToDelete(expense)
    }

    const handleConfirmDelete = async () => {
        if (!expenseToDelete) return

        setDeletingId(expenseToDelete.id)
        setExpenseToDelete(null)

        toast.promise(
            deleteExpense(expenseToDelete.id),
            {
                loading: 'Deleting expense...',
                success: () => {
                    setDeletingId(null)
                    return `Deleted ${formatCurrency(expenseToDelete.amount, expenseToDelete.currency)} expense`
                },
                error: (err) => {
                    setDeletingId(null)
                    return 'Failed to delete expense'
                },
            }
        )
    }

    // Sort expenses by date (newest first)
    const sortedExpenses = [...expenses].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    // Calculate pagination
    const totalPages = Math.ceil(sortedExpenses.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const displayedExpenses = sortedExpenses.slice(startIndex, endIndex)

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const maxPagesToShow = 5

        if (totalPages <= maxPagesToShow) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Always show first page
            pages.push(1)

            if (currentPage > 3) {
                pages.push('...')
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }

            if (currentPage < totalPages - 2) {
                pages.push('...')
            }

            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages)
            }
        }

        return pages
    }

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
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {sortedExpenses.length} total
                    </span>
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
                        {displayedExpenses.map((expense, index) => (
                            <tr
                                key={expense.id}
                                className="group hover:bg-gray-50 dark:hover:bg-[#2A2B2C] transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                        {format(new Date(expense.date + 'T00:00:00'), 'd MMM yyyy')}
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
                                    <div className="flex items-center justify-end gap-2">
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
                                            onClick={() => handleDeleteClick(expense)}
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

            {/* Pagination Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing {startIndex + 1} to {Math.min(endIndex, sortedExpenses.length)} of {sortedExpenses.length} expenses
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            {/* Previous Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="h-9 w-9 p-0 border-gray-200 dark:border-gray-700"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            {/* Page Numbers */}
                            {getPageNumbers().map((page, index) => (
                                page === '...' ? (
                                    <span key={`ellipsis-${index}`} className="px-2 text-gray-400">...</span>
                                ) : (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setCurrentPage(page as number)}
                                        className={`h-9 w-9 p-0 ${currentPage === page
                                                ? 'gradient-fb-blue text-white hover:opacity-90'
                                                : 'border-gray-200 dark:border-gray-700'
                                            }`}
                                    >
                                        {page}
                                    </Button>
                                )
                            ))}

                            {/* Next Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="h-9 w-9 p-0 border-gray-200 dark:border-gray-700"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!expenseToDelete} onOpenChange={(open) => !open && setExpenseToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this expense of{' '}
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {expenseToDelete && formatCurrency(expenseToDelete.amount, expenseToDelete.currency)}
                            </span>
                            ? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
