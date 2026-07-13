import { redirect } from 'next/navigation'

// Merged into the Content tab (Clients / Achievements / Testimonials sub-tabs).
export default function Page() {
  redirect('/dashboard/content')
}
