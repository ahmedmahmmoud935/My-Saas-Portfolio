import type { Payload } from 'payload'

const SITE = process.env.NEXT_PUBLIC_SERVER_URL || 'https://viralpx.com'
const TTL_MS = 1000 * 60 * 60 * 24 * 3 // link + code valid for 3 days

/** Branded, RTL "set your password" email showing BOTH a link and a 6-digit code. */
function activationEmailHTML(url: string, code: string): string {
  return `
  <div dir="rtl" style="font-family:-apple-system,'Segoe UI',Tahoma,sans-serif;background:#0a0a0a;padding:32px 16px;">
    <div style="max-width:480px;margin:0 auto;background:#111;border:1px solid #1e1e1e;border-radius:16px;padding:34px;color:#fff;">
      <div style="font-size:22px;font-weight:800;letter-spacing:-0.5px;margin-bottom:22px;">Viral<span style="color:#F97316;">PX</span></div>
      <h1 style="font-size:20px;font-weight:800;margin:0 0 12px;">تعيين كلمة السر</h1>
      <p style="color:#999;line-height:1.9;margin:0 0 22px;font-size:15px;">اضغط الزر لتعيين كلمة سر لوحة التحكم بتاعتك — أو استخدم الكود بالأسفل. صالح لمدة ٣ أيام.</p>
      <a href="${url}" style="display:inline-block;background:#F97316;color:#fff;padding:13px 28px;border-radius:9px;text-decoration:none;font-weight:700;font-size:15px;">تعيين كلمة السر</a>
      <div style="margin:26px 0 6px;color:#888;font-size:13px;">أو أدخل هذا الكود يدويًا:</div>
      <div style="font-size:30px;font-weight:800;letter-spacing:10px;color:#F97316;background:#0a0a0a;border:1px solid #1e1e1e;border-radius:10px;padding:14px;text-align:center;">${code}</div>
      <p style="color:#666;font-size:12px;line-height:1.8;margin:22px 0 0;">لو الزر مش شغّال، انسخ الرابط:<br><span style="color:#888;word-break:break-all;">${url}</span></p>
      <p style="color:#666;font-size:12px;margin:16px 0 0;">لو مش أنت طلبت ده، تجاهل الرسالة بأمان.</p>
    </div>
  </div>`
}

/**
 * Generate a one-time token + 6-digit code, store them on the user, and email
 * the client a set-password link and the code. Used for onboarding, resend,
 * and the public "forgot password" flow.
 */
export async function sendActivation(payload: Payload, user: { id: number | string; email: string }) {
  const rnd = () => (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)).replace(/-/g, '')
  const token = rnd() + rnd()
  const code = String(Math.floor(100000 + Math.random() * 900000))
  await payload.update({
    collection: 'users',
    id: user.id,
    data: { resetToken: token, resetCode: code, resetExp: Date.now() + TTL_MS },
    overrideAccess: true,
  })
  const url = `${SITE}/set-password?token=${token}`
  try {
    await payload.sendEmail({
      to: user.email,
      subject: 'تعيين كلمة سر ViralPX',
      html: activationEmailHTML(url, code),
    })
  } catch (e) {
    console.error('[activation] email failed:', e)
  }
}
