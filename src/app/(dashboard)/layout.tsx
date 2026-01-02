import { Header } from '@/components/layout/header'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <Header />
            <main className="container py-6 md:py-8">
                {children}
            </main>
        </div>
    )
}
