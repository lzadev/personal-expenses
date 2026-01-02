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
        const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
        const count = expenses.length

        // Get current month expenses
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        const monthlyExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date)
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
        })
        const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0)

        // Get top category
        const categoryTotals = expenses.reduce((acc, expense) => {
            const categoryName = expense.category?.name || 'Uncategorized'
            acc[categoryName] = (acc[categoryName] || 0) + expense.amount
            return acc
        }, {} as Record<string, number>)

        const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]

        // Calculate average
        const average = count > 0 ? total / count : 0

        // Determine primary currency (most common)
        const currencyCounts = expenses.reduce((acc, expense) => {
            acc[expense.currency] = (acc[expense.currency] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const primaryCurrency = Object.entries(currencyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'USD'
        const hasMultipleCurrencies = Object.keys(currencyCounts).length > 1

        return {
            total,
            count,
            monthlyTotal,
            topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
            average,
            primaryCurrency,
            hasMultipleCurrencies,
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
            description: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            gradient: 'gradient-purple',
            trend: '+8.2%',
        },
        {
            title: 'Top Category',
            value: stats.topCategory
                ? `${stats.primaryCurrency} ${stats.topCategory.amount.toFixed(2)}`
                : 'N/A',
            icon: PieChart,
            description: stats.topCategory?.name || 'No expenses yet',
            gradient: 'gradient-teal',
            trend: '+15.3%',
        },
        {
            title: 'Average',
            value: `${stats.primaryCurrency} ${stats.average.toFixed(2)}`,
            icon: TrendingUp,
            description: 'Per transaction',
            gradient: 'gradient-orange',
            trend: '+5.7%',
        },
    ]

    return (
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
                                <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                                    <ArrowUpRight className="h-2.5 w-2.5 text-white" />
                                    <span className="text-[10px] font-semibold text-white">{stat.trend}</span>
                                </div>
                            </div>
                            <p className="text-xs text-white/80 font-medium">{stat.description}</p>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
