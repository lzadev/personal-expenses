'use client'

import { useMemo, useState } from 'react'
import { DollarSign, TrendingUp, Calendar, PieChart, ArrowUpRight, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import type { Expense } from '@/lib/types/expense'
import { format, startOfMonth, endOfMonth } from 'date-fns'

interface ExpenseStatsProps {
    expenses: Expense[]
}

export function ExpenseStats({ expenses }: ExpenseStatsProps) {
    const [showCurrencyModal, setShowCurrencyModal] = useState(false)
    const [selectedCard, setSelectedCard] = useState<'total' | 'monthly' | 'average' | null>(null)

    const stats = useMemo(() => {
        const count = expenses.length

        // Group expenses by currency
        const byCurrency = expenses.reduce((acc, expense) => {
            if (!acc[expense.currency]) {
                acc[expense.currency] = []
            }
            acc[expense.currency].push(expense)
            return acc
        }, {} as Record<string, Expense[]>)

        // Calculate totals per currency
        const currencyTotals = Object.entries(byCurrency).map(([currency, exps]) => ({
            currency,
            total: exps.reduce((sum, exp) => sum + exp.amount, 0),
            count: exps.length,
        }))

        // Get current month expenses by currency
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        const monthlyByCurrency = expenses
            .filter(expense => {
                const expenseDate = new Date(expense.date + 'T00:00:00')
                return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
            })
            .reduce((acc, expense) => {
                if (!acc[expense.currency]) {
                    acc[expense.currency] = []
                }
                acc[expense.currency].push(expense)
                return acc
            }, {} as Record<string, Expense[]>)

        const monthlyTotals = Object.entries(monthlyByCurrency).map(([currency, exps]) => ({
            currency,
            total: exps.reduce((sum, exp) => sum + exp.amount, 0),
        }))

        // Get top category (across all currencies, just by count)
        const categoryTotals = expenses.reduce((acc, expense) => {
            const categoryName = expense.category?.name || 'Uncategorized'
            acc[categoryName] = (acc[categoryName] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]

        // Calculate average per currency
        const averages = currencyTotals.map(ct => ({
            currency: ct.currency,
            average: ct.count > 0 ? ct.total / ct.count : 0,
        }))

        // Determine primary currency (most common)
        const primaryCurrency = currencyTotals.sort((a, b) => b.count - a.count)[0]?.currency || 'DOP'
        const hasMultipleCurrencies = currencyTotals.length > 1

        return {
            count,
            currencyTotals,
            monthlyTotals,
            topCategory: topCategory ? { name: topCategory[0], count: topCategory[1] } : null,
            averages,
            primaryCurrency,
            hasMultipleCurrencies,
        }
    }, [expenses])

    // Format number with commas and decimals
    const formatNumber = (num: number) => {
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    }

    const formatCurrencyTotals = (totals: { currency: string; total: number }[], maxDisplay = 1) => {
        if (totals.length === 0) return 'No expenses'
        if (totals.length === 1) {
            return `${totals[0].currency} $${formatNumber(totals[0].total)}`
        }
        // Always show DOP if available, otherwise show the first currency
        const dopTotal = totals.find(t => t.currency === 'DOP')
        const displayTotal = dopTotal || totals[0]
        return `${displayTotal.currency} $${formatNumber(displayTotal.total)}`
    }

    const handleViewDetails = (cardType: 'total' | 'monthly' | 'average') => {
        setSelectedCard(cardType)
        setShowCurrencyModal(true)
    }

    const getModalData = () => {
        if (!selectedCard) return { title: '', data: [] }

        switch (selectedCard) {
            case 'total':
                return {
                    title: 'Total Expenses by Currency',
                    data: stats.currencyTotals.map(ct => ({
                        currency: ct.currency,
                        amount: ct.total,
                        label: `${ct.count} transactions`,
                    })),
                }
            case 'monthly':
                return {
                    title: 'This Month by Currency',
                    data: stats.monthlyTotals.map(mt => ({
                        currency: mt.currency,
                        amount: mt.total,
                        label: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                    })),
                }
            case 'average':
                return {
                    title: 'Average per Transaction',
                    data: stats.averages.map(a => ({
                        currency: a.currency,
                        amount: a.average,
                        label: 'Per transaction',
                    })),
                }
            default:
                return { title: '', data: [] }
        }
    }

    const statCards = [
        {
            id: 'total' as const,
            title: 'Total Expenses',
            value: formatCurrencyTotals(stats.currencyTotals),
            icon: DollarSign,
            description: `${stats.count} transactions`,
            gradient: 'gradient-fb-blue',
            trend: '+12.5%',
            hasMultiple: stats.currencyTotals.length > 1,
        },
        {
            id: 'monthly' as const,
            title: 'This Month',
            value: formatCurrencyTotals(stats.monthlyTotals),
            icon: Calendar,
            description: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            gradient: 'gradient-purple',
            trend: '+8.2%',
            hasMultiple: stats.monthlyTotals.length > 1,
        },
        {
            id: null,
            title: 'Top Category',
            value: stats.topCategory ? `${stats.topCategory.count} expenses` : 'N/A',
            icon: PieChart,
            description: stats.topCategory?.name || 'No expenses yet',
            gradient: 'gradient-teal',
            trend: '+15.3%',
            hasMultiple: false,
        },
        {
            id: 'average' as const,
            title: 'Average',
            value: formatCurrencyTotals(stats.averages.map(a => ({ currency: a.currency, total: a.average }))),
            icon: TrendingUp,
            description: 'Per transaction',
            gradient: 'gradient-orange',
            trend: '+5.7%',
            hasMultiple: stats.averages.length > 1,
        },
    ]

    const modalData = getModalData()

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6 animate-fade-in">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <Card
                            key={stat.title}
                            className={`relative overflow-hidden border-0 shadow-md hover-lift cursor-pointer animate-slide-up`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className={`absolute inset-0 ${stat.gradient} opacity-100`} />

                            {/* Decorative circles */}
                            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                            <div className="absolute -right-3 -bottom-3 h-20 w-20 rounded-full bg-white/10" />

                            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-medium text-white/90">
                                    {stat.title}
                                </CardTitle>
                                <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm shadow-md">
                                    <Icon className="h-4 w-4 text-white" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative pb-3">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <div className="text-xl font-bold text-white">
                                        {stat.value}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-white/80 font-medium">{stat.description}</p>
                                    {stat.hasMultiple && stat.id && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleViewDetails(stat.id!)}
                                            className="h-6 px-2 text-xs text-white/90 hover:text-white hover:bg-white/20"
                                        >
                                            <Eye className="h-3 w-3 mr-1" />
                                            Details
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Currency Breakdown Modal */}
            <Dialog open={showCurrencyModal} onOpenChange={setShowCurrencyModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{modalData.title}</DialogTitle>
                        <DialogDescription>
                            Detailed breakdown by currency
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        {modalData.data.map((item, index) => (
                            <div
                                key={item.currency}
                                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 animate-slide-up"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div>
                                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                                        {item.currency}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {item.label}
                                    </div>
                                </div>
                                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
