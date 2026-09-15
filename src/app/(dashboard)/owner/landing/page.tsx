import { redirect } from 'next/navigation'

/** The old address of what is now two pages; the words are the larger half. */
export default function LandingPage() {
  redirect('/owner/content')
}
