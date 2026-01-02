'use client'

import { useRouter } from 'next/navigation'
import { LogOut, Menu, User, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'

export function Header() {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#242526] shadow-sm">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-4">
                    {/* Logo & Brand */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-fb-blue shadow-lg hover-lift">
                            <span className="text-2xl">💰</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold text-gradient-fb">
                                Expense Tracker
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Manage your finances</p>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        {/* Notifications */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-all"
                        >
                            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#F02849] ring-2 ring-white dark:ring-[#242526]"></span>
                        </Button>

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-all"
                                >
                                    <div className="h-9 w-9 rounded-full gradient-fb-blue flex items-center justify-center text-white font-semibold shadow-md">
                                        <User className="h-5 w-5" />
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 glass-card border-gray-200 dark:border-gray-700">
                                <div className="px-3 py-2">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">My Account</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Manage your expenses</p>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                    <Menu className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-[#F02849] focus:text-[#F02849] focus:bg-red-50 dark:focus:bg-red-950/20">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    )
}
