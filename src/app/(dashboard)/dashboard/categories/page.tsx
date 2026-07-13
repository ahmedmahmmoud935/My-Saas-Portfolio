import { redirect } from 'next/navigation'

// Merged into the Projects tab (Categories button → modal).
export default function Page() {
  redirect('/dashboard/projects')
}
