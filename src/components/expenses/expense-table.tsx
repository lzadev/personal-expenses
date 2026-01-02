'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Pencil, Trash2 } from 'lucide-react'
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
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
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'date', desc: true }
    ])

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

    const columns = useMemo<ColumnDef<Expense>[]>(
        () => [
            {
                accessorKey: 'date',
                header: () => <div className="font-semibold text-gray-900 dark:text-gray-100">Date</div>,
                cell: ({ row }) => (
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {format(new Date(row.getValue('date')), 'MMM dd, yyyy')}
                    </div>
                ),
                sortingFn: 'datetime',
            },
            {
                accessorKey: 'category',
                header: () => <div className="font-semibold text-gray-900 dark:text-gray-100">Category</div>,
                cell: ({ row }) => {
                    const expense = row.original
                    return (
                        <div className="flex items-center gap-2">
                            {expense.category?.icon && (
                                <span className="text-xl">{expense.category.icon}</span>
                            )}
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                {expense.category?.name || 'Uncategorized'}
                            </span>
                        </div>
                    )
                },
                sortingFn: (rowA, rowB) => {
                    const a = rowA.original.category?.name || 'Uncategorized'
                    const b = rowB.original.category?.name || 'Uncategorized'
                    return a.localeCompare(b)
                },
            },
            {
                accessorKey: 'description',
                header: () => <div className="font-semibold text-gray-900 dark:text-gray-100">Description</div>,
                cell: ({ row }) => (
                    <div className="max-w-md text-gray-600 dark:text-gray-400 font-medium">
                        {row.getValue('description') || '—'}
                    </div>
                ),
            },
            {
                accessorKey: 'amount',
                header: () => <div className="font-semibold text-right text-gray-900 dark:text-gray-100">Amount</div>,
                cell: ({ row }) => {
                    const expense = row.original
                    return (
                        <div className="text-right">
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {formatCurrency(expense.amount, expense.currency)}
                            </span>
                        </div>
                    )
                },
                sortingFn: 'basic',
            },
            {
                id: 'actions',
                header: () => <div className="text-right font-semibold text-gray-900 dark:text-gray-100">Actions</div>,
                cell: ({ row }) => {
                    const expense = row.original
                    return (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(expense)}
                                className="h-9 w-9 p-0 rounded-lg hover:bg-blue-50 hover:text-[#1877F2] dark:hover:bg-blue-950/30 dark:hover:text-blue-400 transition-all duration-200"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(expense.id)}
                                disabled={deletingId === expense.id}
                                className="h-9 w-9 p-0 rounded-lg hover:bg-red-50 hover:text-[#F02849] dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-all duration-200"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )
                },
            },
        ],
        [deletingId, onEdit]
    )

    const table = useReactTable({
        data: expenses,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    if (expenses.length === 0) {
        return (
            <div className="text-center py-16 bg-white dark:bg-[#242526] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 animate-fade-in">
                <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full gradient-fb-blue flex items-center justify-center">
                        <span className="text-3xl">📊</span>
                    </div>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">No expenses found</p>
                <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">Add your first expense to get started</p>
            </div>
        )
    }

    return (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#242526] overflow-hidden shadow-lg animate-fade-in">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="bg-gray-50 dark:bg-[#3A3B3C] hover:bg-gray-50 dark:hover:bg-[#3A3B3C] border-b border-gray-200 dark:border-gray-800">
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id} className="text-gray-900 dark:text-gray-100 font-semibold text-sm h-14">
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.map((row, index) => (
                        <TableRow
                            key={row.id}
                            className="transition-all duration-200 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 border-b border-gray-100 dark:border-gray-800 last:border-0 group animate-slide-up"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className="py-5 text-sm">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Pagination info */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#3A3B3C] text-sm text-gray-600 dark:text-gray-400 font-medium">
                Showing 1 to {expenses.length} of {expenses.length} expenses
            </div>
        </div>
    )
}
