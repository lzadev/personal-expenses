'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Pencil, Trash2 } from 'lucide-react'
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

    if (expenses.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground animate-fade-in">
                <p className="text-lg">No expenses found</p>
                <p className="text-sm mt-2">Add your first expense to get started</p>
            </div>
        )
    }

    return (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden animate-slide-up">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {expenses.map((expense) => (
                        <TableRow
                            key={expense.id}
                            className="transition-all duration-200 hover:bg-muted/50"
                        >
                            <TableCell className="font-medium">
                                {format(new Date(expense.date), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {expense.category?.icon && (
                                        <span className="text-lg">{expense.category.icon}</span>
                                    )}
                                    <span>{expense.category?.name || 'Uncategorized'}</span>
                                </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                                {expense.description || '—'}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                                {formatCurrency(expense.amount, expense.currency)}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit(expense)}
                                        className="h-8 w-8 p-0 hover:bg-primary/10 transition-all duration-200"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(expense.id)}
                                        disabled={deletingId === expense.id}
                                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
