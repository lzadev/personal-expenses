export interface Category {
  id: string
  name: string
  icon?: string
  color?: string
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  amount: number
  currency: string
  category_id?: string
  category?: Category
  date: string
  description?: string
  created_at: string
  updated_at: string
}

export interface ExpenseFilter {
  categoryId?: string
  startDate?: string
  endDate?: string
  search?: string
}

export interface ExpenseFormData {
  amount: number
  currency: string
  category_id: string
  date: string
  description?: string
}
