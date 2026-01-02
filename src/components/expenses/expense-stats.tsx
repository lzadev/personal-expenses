'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, Calendar, PieChart, ArrowUpRight } from 'lucide-react'
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
            gradient: 'gradient-fb-blue',
            trend: '+12.5%',
        },
        {
            title: 'This Month',
            value: `${stats.primaryCurrency} ${stats.monthlyTotal.toFixed(2)}`,
            icon: Calendar,
            description: format(new Date(), 'MMMM yyyy'),
            gradient: 'gradient-purple',
            trend: '+8.2%',
        },
        {
            title: 'Top Category',
            value: stats.topCategory ? `${stats.primaryCurrency} ${stats.topCategory.amount.toFixed(2)}` : `${stats.primaryCurrency} 0.00`,
            icon: PieChart,
            description: stats.topCategory?.name || 'No expenses yet',
            gradient: 'gradient-teal',
            trend: '+15.3%',
        },
        {
            title: 'Average',
            value: stats.count > 0 ? `${stats.primaryCurrency} ${(stats.total / stats.count).toFixed(2)}` : `${stats.primaryCurrency} 0.00`,
            icon: TrendingUp,
            description: 'Per transaction',
            gradient: 'gradient-orange',
            trend: '+5.7%',
        },
    ]

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8 animate-fade-in">
            {statCards.map((stat, index) => {
                const Icon = stat.icon
                return (
                    <Card
                        key={stat.title}
                        className={`relative overflow-hidden border-0 shadow-lg hover-lift cursor-pointer animate-slide-up`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className={`absolute inset-0 ${stat.gradient} opacity-100`} />

                        {/* Decorative circles */}
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
                        <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10" />

                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-white/90">
                                {stat.title}
                            </CardTitle>
                            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
                                <Icon className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="flex items-baseline gap-2 mb-2">
                                <div className="text-3xl font-bold text-white">
                                    {stat.value}
                                </div>
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                                    <ArrowUpRight className="h-3 w-3 text-white" />
                                    <span className="text-xs font-semibold text-white">{stat.trend}</span>
                                </div>
                            </div>
                            <p className="text-sm text-white/80 font-medium">{stat.description}</p>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
