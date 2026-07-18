import type { EmailAdapter, SendEmailOptions } from 'payload'

const FROM = process.env.RESEND_FROM || 'ViralPX <onboarding@resend.dev>'
const parsed = FROM.match(/^\s*(.*?)\s*<(.+)>\s*$/)

/**
 * Minimal Payload email adapter that sends through the Resend REST API (same
 * key the contact form uses) — no extra dependency, no SMTP setup.
 */
export const resendEmailAdapter: EmailAdapter = () => ({
  name: 'resend-rest',
  defaultFromName: parsed?.[1] || 'ViralPX',
  defaultFromAddress: parsed?.[2] || 'onboarding@resend.dev',
  sendEmail: async (message: SendEmailOptions) => {
    const key = process.env.RESEND_API_KEY
    if (!key) {
      console.warn('[email] RESEND_API_KEY missing — email not sent:', message.subject)
      return {}
    }
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: typeof message.from === 'string' && message.from ? message.from : FROM,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    })
    return res.json().catch(() => ({}))
  },
})

/** Branded, RTL "set / reset your password" email. */
export function passwordEmailHTML(url: string): string {
  return `
  <div dir="rtl" style="font-family:-apple-system,'Segoe UI',Tahoma,sans-serif;background:#0a0a0a;padding:32px 16px;">
    <div style="max-width:480px;margin:0 auto;background:#111;border:1px solid #1e1e1e;border-radius:16px;padding:34px;color:#fff;">
      <div style="font-size:22px;font-weight:800;letter-spacing:-0.5px;margin-bottom:22px;">
        Viral<span style="color:#F97316;">PX</span>
      </div>
      <h1 style="font-size:20px;font-weight:800;margin:0 0 12px;">تعيين كلمة السر</h1>
      <p style="color:#999;line-height:1.9;margin:0 0 24px;font-size:15px;">
        اضغط الزر لتعيين كلمة سر لوحة التحكم الخاصة بموقعك. الرابط صالح لمدة محدودة.
      </p>
      <a href="${url}" style="display:inline-block;background:#F97316;color:#fff;padding:13px 28px;border-radius:9px;text-decoration:none;font-weight:700;font-size:15px;">
        تعيين كلمة السر
      </a>
      <p style="color:#666;font-size:12px;line-height:1.8;margin:26px 0 0;">
        لو الزر مش شغّال، انسخ الرابط ده في المتصفح:<br>
        <span style="color:#888;word-break:break-all;">${url}</span>
      </p>
      <p style="color:#666;font-size:12px;margin:18px 0 0;">لو مش أنت طلبت ده، تجاهل الرسالة بأمان.</p>
    </div>
  </div>`
}
