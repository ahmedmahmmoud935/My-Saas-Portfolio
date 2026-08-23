'use client'

import { useRef, useState, type DragEvent } from 'react'

/**
 * Drag-to-reorder for a list of thumbnails.
 *
 * Reorders live as you drag over a neighbour (rather than only on drop), so the
 * row shows the result while you're still holding the item.
 *
 * HTML5 drag events don't fire on touch, so callers keep the arrow buttons for
 * touch devices — see `.thumb-move` in dashboard.css.
 */
export function useDragReorder<T>(items: T[], onReorder: (next: T[]) => void) {
  const from = useRef<number | null>(null)
  const [dragging, setDragging] = useState<number | null>(null)

  return (index: number) => ({
    draggable: true,
    onDragStart: (e: DragEvent) => {
      from.current = index
      setDragging(index)
      // Firefox needs data set or the drag never starts.
      e.dataTransfer.effectAllowed = 'move'
      try {
        e.dataTransfer.setData('text/plain', String(index))
      } catch {
        /* some browsers restrict this — the ref is what we actually use */
      }
    },
    onDragOver: (e: DragEvent) => {
      e.preventDefault()
      const start = from.current
      if (start === null || start === index) return
      const next = [...items]
      const [moved] = next.splice(start, 1)
      next.splice(index, 0, moved)
      from.current = index
      setDragging(index)
      onReorder(next)
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault()
      from.current = null
      setDragging(null)
    },
    onDragEnd: () => {
      from.current = null
      setDragging(null)
    },
    'data-dragging': dragging === index ? '' : undefined,
  })
}
