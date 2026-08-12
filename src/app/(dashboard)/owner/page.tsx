import { redirect } from 'next/navigation'

/** /owner has no landing screen of its own — go to the first admin page. */
export default function OwnerIndex() {
  redirect('/owner/landing')
}
