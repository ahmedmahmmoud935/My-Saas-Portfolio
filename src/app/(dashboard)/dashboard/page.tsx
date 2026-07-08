import { redirect } from 'next/navigation'

// The dashboard opens on the Projects tab (matches the original).
export default function DashboardHome() {
  redirect('/dashboard/projects')
}
