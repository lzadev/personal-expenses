'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { Category, Expense, ExpenseFormData } from '@/lib/types/expense'
import { createExpense, updateExpense } from '@/lib/actions/expenses'
import { format } from 'date-fns'

interface AddExpenseDialogProps {
    categories: Category[]
    editingExpense?: Expense | null
    onClose?: () => void
}

export function AddExpenseDialog({ categories, editingExpense, onClose }: AddExpenseDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<ExpenseFormData>({
        amount: 0,
        currency: 'DOP',
        category_id: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
    })

    useEffect(() => {
        if (editingExpense) {
            setFormData({
                amount: editingExpense.amount,
                currency: editingExpense.currency,
                category_id: editingExpense.category_id || '',
                date: editingExpense.date,
                description: editingExpense.description || '',
            })
            setOpen(true)
        }
    }, [editingExpense])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (editingExpense) {
                await updateExpense(editingExpense.id, formData)
                toast.success('Expense updated successfully!')
            } else {
                await createExpense(formData)
                toast.success('Expense added successfully!')
            }

            setOpen(false)
            setFormData({
                amount: 0,
                currency: 'DOP',
                category_id: '',
                date: format(new Date(), 'yyyy-MM-dd'),
                description: '',
            })
            onClose?.()
        } catch (error) {
            console.error('Failed to save expense:', error)
            toast.error('Failed to save expense. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            setFormData({
                amount: 0,
                currency: 'USD',
                category_id: '',
                date: format(new Date(), 'yyyy-MM-dd'),
                description: '',
            })
            onClose?.()
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="gradient-fb-blue hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover-lift rounded-xl h-11 px-6 font-semibold">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Expense
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] animate-scale-in glass-card border-gray-200 dark:border-gray-700">
                <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl gradient-fb-blue flex items-center justify-center shadow-lg">
                            <Plus className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                            </DialogTitle>
                            <DialogDescription className="text-gray-500 dark:text-gray-400">
                                {editingExpense ? 'Update the expense details below.' : 'Enter the details of your expense.'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-5 py-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2.5">
                                <Label htmlFor="amount" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={formData.amount || ''}
                                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                    required
                                    className="h-11 rounded-xl bg-gray-50 dark:bg-[#3A3B3C] border-gray-200 dark:border-gray-700 focus-visible:ring-[#1877F2] transition-all"
                                />
                            </div>
                            <div className="grid gap-2.5">
                                <Label htmlFor="currency" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Currency</Label>
                                <Select
                                    value={formData.currency}
                                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                                    required
                                >
                                    <SelectTrigger id="currency" className="h-11 rounded-xl bg-gray-50 dark:bg-[#3A3B3C] border-gray-200 dark:border-gray-700">
                                        <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DOP">DOP ($)</SelectItem>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2.5">
                            <Label htmlFor="category" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Category</Label>
                            <Select
                                value={formData.category_id}
                                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                                required
                            >
                                <SelectTrigger id="category" className="h-11 rounded-xl bg-gray-50 dark:bg-[#3A3B3C] border-gray-200 dark:border-gray-700">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
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
                        </div>
                        <div className="grid gap-2.5">
                            <Label htmlFor="date" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                                className="h-11 rounded-xl bg-gray-50 dark:bg-[#3A3B3C] border-gray-200 dark:border-gray-700 focus-visible:ring-[#1877F2] transition-all"
                            />
                        </div>
                        <div className="grid gap-2.5">
                            <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description (optional)</Label>
                            <Input
                                id="description"
                                placeholder="What was this expense for?"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="h-11 rounded-xl bg-gray-50 dark:bg-[#3A3B3C] border-gray-200 dark:border-gray-700 focus-visible:ring-[#1877F2] transition-all"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-3">
                        <Button type="submit" disabled={loading} className="gradient-fb-blue hover:opacity-90 text-white h-11 px-6 rounded-xl font-semibold transition-all hover-lift">
                            {loading ? 'Saving...' : editingExpense ? 'Update Expense' : 'Add Expense'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
