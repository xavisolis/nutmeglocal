import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'NutmegLocal <onboarding@resend.dev>';
const ADMIN_EMAIL = 'xavisolis@proton.me';

export async function sendWelcomeEmail(to: string, businessName: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Welcome to NutmegLocal — ${businessName} is now yours!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3a7d44; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🌿 NutmegLocal</h1>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
          <h2>Welcome aboard!</h2>
          <p>Your claim for <strong>${businessName}</strong> has been received. We're reviewing it now and will get back to you shortly.</p>
          <p>Once approved, you'll be able to:</p>
          <ul>
            <li>Update your business hours and description</li>
            <li>Add photos and respond to reviews</li>
            <li>Access analytics about your listing</li>
          </ul>
          <p style="color: #666; font-size: 14px;">— The NutmegLocal Team</p>
        </div>
      </div>
    `,
  });
}

export async function sendClaimNotification(businessName: string, claimerEmail: string, proof: string) {
  return resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New Claim: ${businessName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2>New Business Claim</h2>
        <p><strong>Business:</strong> ${businessName}</p>
        <p><strong>Claimer:</strong> ${claimerEmail}</p>
        <p><strong>Proof:</strong></p>
        <blockquote style="background: #f5f5f5; padding: 12px; border-left: 3px solid #3a7d44; margin: 0;">${proof}</blockquote>
        <p style="margin-top: 16px;"><a href="https://nutmeglocal.com/admin" style="background: #3a7d44; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;">Review in Admin</a></p>
      </div>
    `,
  });
}

export async function sendEarlyAccessConfirmation(to: string, type: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "You're on the NutmegLocal waitlist! 🌿",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3a7d44; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🌿 NutmegLocal</h1>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
          <h2>You're on the list!</h2>
          <p>Thanks for signing up ${type === 'business' ? 'as a business owner' : 'as a local'}. We'll let you know as soon as NutmegLocal launches in Greater Danbury.</p>
          <p>In the meantime, spread the word — the more locals who join, the better the directory!</p>
          <p style="color: #666; font-size: 14px;">— The NutmegLocal Team</p>
        </div>
      </div>
    `,
  });
}
