import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getExpenses } from '@/lib/actions/expenses'
import { getCategories } from '@/lib/actions/categories'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const [expenses, categories] = await Promise.all([
        getExpenses(),
        getCategories(),
    ])

    return (
        <div className="animate-fade-in">
            <DashboardClient initialExpenses={expenses} categories={categories} />
        </div>
    )
}
