'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, Calendar, PieChart } from 'lucide-react'
import type { Expense } from '@/lib/types/expense'
import { format, startOfMonth, endOfMonth } from 'date-fns'

interface ExpenseStatsProps {
    expenses: Expense[]
}

export function ExpenseStats({ expenses }: ExpenseStatsProps) {
    const stats = useMemo(() => {
        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0)

        // Detect primary currency (most common)
        const currencyCounts = expenses.reduce((acc, exp) => {
            acc[exp.currency] = (acc[exp.currency] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const primaryCurrency = Object.entries(currencyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'USD'
        const hasMultipleCurrencies = Object.keys(currencyCounts).length > 1

        const now = new Date()
        const monthStart = startOfMonth(now)
        const monthEnd = endOfMonth(now)

        const monthlyExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.date)
            return expDate >= monthStart && expDate <= monthEnd
        })

        const monthlyTotal = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0)

        const categoryTotals = expenses.reduce((acc, exp) => {
            const categoryName = exp.category?.name || 'Uncategorized'
            acc[categoryName] = (acc[categoryName] || 0) + exp.amount
            return acc
        }, {} as Record<string, number>)

        const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]

        return {
            total,
            monthlyTotal,
            count: expenses.length,
            primaryCurrency,
            hasMultipleCurrencies,
            topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
        }
    }, [expenses])

    const statCards = [
        {
            title: 'Total Expenses',
            value: `${stats.primaryCurrency} ${stats.total.toFixed(2)}`,
            icon: DollarSign,
            description: stats.hasMultipleCurrencies
                ? `${stats.count} transactions (mixed currencies)`
                : `${stats.count} transactions`,
        },
        {
            title: 'This Month',
            value: `${stats.primaryCurrency} ${stats.monthlyTotal.toFixed(2)}`,
            icon: Calendar,
            description: format(new Date(), 'MMMM yyyy'),
        },
        {
            title: 'Top Category',
            value: stats.topCategory ? `${stats.primaryCurrency} ${stats.topCategory.amount.toFixed(2)}` : `${stats.primaryCurrency} 0.00`,
            icon: PieChart,
            description: stats.topCategory?.name || 'No expenses yet',
        },
        {
            title: 'Average',
            value: stats.count > 0 ? `${stats.primaryCurrency} ${(stats.total / stats.count).toFixed(2)}` : `${stats.primaryCurrency} 0.00`,
            icon: TrendingUp,
            description: 'Per transaction',
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-slide-up">
            {statCards.map((stat, index) => {
                const Icon = stat.icon
                return (
                    <Card
                        key={stat.title}
                        className="transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
