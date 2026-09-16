'use client'

import React from 'react'
import { useDashLang } from './DashLang'
import { quotaState } from '@/lib/quota'

/**
 * A line across the top of the dashboard once storage is running out.
 *
 * The only sign used to be a thin bar at the foot of the sidebar, below the
 * fold on most screens; a client found out they were full when an upload
 * failed. This says it where they are looking, early enough to do something.
 * The platform owner sees nothing — their storage is theirs to spend.
 */
export default function StorageNotice({
  usedMb,
  limitMb,
  isOwner,
}: {
  usedMb: number
  limitMb: number
  isOwner: boolean
}) {
  const { t } = useDashLang()
  const state = quotaState(usedMb, limitMb)
  if (isOwner || state === 'ok') return null
  const pct = Math.min(100, Math.round((usedMb / limitMb) * 100))
  const leftMb = Math.max(0, limitMb - usedMb)
  // Whole megabytes read fine until there are only a few of them left.
  const left = leftMb < 10 ? leftMb.toFixed(1) : String(Math.round(leftMb))

  return (
    <div className={`storage-notice ${state}`} role="status">
      <strong>
        {state === 'full'
          ? t('المساحة خلصت', 'Storage is full')
          : t(`استخدمت ${pct}٪ من المساحة`, `${pct}% of your storage used`)}
      </strong>
      <span>
        {state === 'full'
          ? t(
              'مش هتقدر ترفع ملفات جديدة. امسح صور أو فيديوهات مش محتاجها، أو كلّم الإدارة عشان تزوّد المساحة.',
              'New uploads are refused. Delete pictures or videos you no longer need, or ask the admin for more room.',
            )
          : t(
              `فاضل حوالي ${left} ميجا. الفيديوهات الطويلة الأفضل تتحط كلينك يوتيوب بدل ما تترفع.`,
              `About ${left} MB left. Long videos are better linked from YouTube than uploaded.`,
            )}
      </span>
      <div className="storage-notice-bar">
        <i style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
