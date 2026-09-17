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

/**
 * How a save action declines. Returned rather than thrown: a production build
 * replaces a thrown action error's message with a generic one, so the page
 * could never say whether the session ran out or a value was rejected.
 */
export type SaveRefusal = { ok: false; code: 'unauthorized' | 'invalid' | 'failed'; fields?: string[] }

/** Server side: turn whatever a save threw into a refusal the page can explain. */
export function refusalFrom(err: unknown): SaveRefusal {
  const e = err as { name?: string; message?: string; data?: { errors?: { path?: string }[] } }
  if (e?.message === 'unauthorized') return { ok: false, code: 'unauthorized' }
  if (e?.name === 'ValidationError') {
    const fields = (e.data?.errors ?? []).map((f) => f.path ?? '').filter(Boolean)
    return { ok: false, code: 'invalid', fields }
  }
  console.error('[save]', err)
  return { ok: false, code: 'failed' }
}

type T = (ar: string, en: string) => string

/** Client side: what to tell the person, for a refusal or for a thrown failure. */
export function saveFailureText(failure: SaveRefusal | unknown, t: T): string {
  const r = failure as Partial<SaveRefusal>
  if (r && r.ok === false) {
    if (r.code === 'unauthorized')
      return t('انتهت الجلسة. سجّل الدخول تاني في تبويب جديد وبعدين احفظ.', 'Session expired. Sign in again in a new tab, then save.')
    if (r.code === 'invalid')
      return t(
        `في قيمة مش مقبولة${r.fields?.length ? ` في: ${r.fields.join('، ')}` : ''}. عدّلها وجرّب تاني.`,
        `A value was not accepted${r.fields?.length ? `: ${r.fields.join(', ')}` : ''}. Fix it and try again.`,
      )
    return t('حصلت مشكلة في السيرفر وماتحفظش. جرّب تاني بعد شوية.', 'The server had a problem and nothing was saved. Try again shortly.')
  }
  if (isStaleDeployment(failure))
    return t('الموقع اتحدّث والصفحة دي قديمة. حدّث الصفحة وبعدين احفظ.', 'The site was updated. Refresh the page, then save.')
  return t('مفيش اتصال بالسيرفر. اتأكد من النت وجرّب تاني.', 'Could not reach the server. Check your connection and try again.')
}
