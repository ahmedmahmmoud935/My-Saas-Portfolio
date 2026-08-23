/**
 * Client-safe helpers for reporting server-action failures.
 *
 * The most common failure in practice isn't the upload itself: after a deploy,
 * a page that's been open in a tab calls an action id that no longer exists and
 * Next rejects it. That surfaced as a bare "upload failed", which sends people
 * hunting for a problem with their file.
 */

/** True when the failure is just a page left open across a deployment. */
export function isStaleDeployment(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? '')
  return /Failed to find Server Action|older or newer deployment/i.test(msg)
}

/** Message to show for a failed action, in the dashboard's language. */
export function actionErrorMessage(err: unknown, lang: 'ar' | 'en'): string {
  if (isStaleDeployment(err)) {
    return lang === 'ar'
      ? 'الموقع اتحدّث والصفحة دي قديمة. هنعمل تحديث ونكمّل.'
      : 'The site was updated and this page is out of date. Reloading…'
  }
  const msg = err instanceof Error ? err.message : ''
  return lang === 'ar'
    ? `فشل الرفع${msg ? `: ${msg}` : ''}`
    : `Upload failed${msg ? `: ${msg}` : ''}`
}
