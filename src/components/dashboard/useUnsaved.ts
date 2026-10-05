'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDashLang } from './DashLang'

/**
 * Whether an editor holds changes it has not saved, and a guard on leaving.
 *
 * Every editor kept its edits in the page and nowhere else, so a click on the
 * sidebar, Back, or the dark area around a dialog threw them away without a
 * word — and a client who loses an hour's writing once does not come back to
 * find out why. Compared by value against what was last saved: typing a word
 * and deleting it again is not a change.
 *
 * The sidebar's links are ordinary page loads, so the browser's own "leave
 * this page?" covers them along with closing the tab; `confirmLeave` covers
 * the in-page ways out (Back, Cancel, a dialog's backdrop).
 */
export function useUnsaved<T>(value: T) {
  const { t } = useDashLang()
  const [saved, setSaved] = useState(() => JSON.stringify(value))
  const dirty = useMemo(() => JSON.stringify(value) !== saved, [value, saved])

  useEffect(() => {
    if (!dirty) return
    const onLeave = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onLeave)
    return () => window.removeEventListener('beforeunload', onLeave)
  }, [dirty])

  /** Call after a successful save (or on opening something to edit): what is
   *  on screen is now what is stored. */
  const markSaved = useCallback((next: T = value) => setSaved(JSON.stringify(next)), [value])

  /** True when it is fine to leave — nothing unsaved, or the person said so. */
  const confirmLeave = useCallback(
    () =>
      !dirty ||
      window.confirm(t('عندك تعديلات ما اتحفظتش. تخرج من غير ما تحفظ؟', 'You have unsaved changes. Leave without saving?')),
    [dirty, t],
  )

  return { dirty, markSaved, confirmLeave }
}
