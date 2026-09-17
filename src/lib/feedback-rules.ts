// Client-safe: the form checks these before sending, and the server again after.

export const FEEDBACK_LIMITS = { maxFiles: 5, maxBytes: 10 * 1024 * 1024 }

const TYPES = [
  /^image\//,
  /^application\/pdf$/,
  /^text\/plain$/,
  /^application\/(zip|x-zip-compressed)$/,
  /^application\/msword$/,
  /^application\/vnd\.openxmlformats-officedocument\./,
  /^application\/vnd\.ms-(excel|powerpoint)$/,
]
const EXT = /\.(png|jpe?g|webp|gif|heic|pdf|txt|zip|docx?|xlsx?|pptx?)$/i

/** A screenshot, a PDF, an office document, a zip — nothing that runs. */
export function isAllowedAttachment(type: string, name: string): boolean {
  if (type && TYPES.some((re) => re.test(type))) return true
  // Some browsers send no type for office files; the extension decides then.
  return !type && EXT.test(name)
}

/** What the file picker offers. */
export const FEEDBACK_ACCEPT = 'image/*,.pdf,.txt,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx'

const BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  txt: 'text/plain',
  zip: 'application/zip',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  heic: 'image/heic',
}

/** The type to store a file as, when the browser did not say. */
export function attachmentType(type: string, name: string): string {
  if (type) return type
  const ext = name.split('.').pop()?.toLowerCase() || ''
  return BY_EXT[ext] || 'application/octet-stream'
}
