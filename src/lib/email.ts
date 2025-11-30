export async function sendEmail(to: string, subject: string, html: string) {
  // Stub implementation
  console.log(`[Email Stub] To: ${to}, Subject: ${subject}`)
  // In production, use Resend, SendGrid, etc.
  return true
}

export async function sendVerificationEmail(to: string, token: string) {
  const link = `${process.env.NEXTAUTH_URL}/verify?token=${token}`
  return sendEmail(to, "Verify your email", `<p>Click <a href="${link}">here</a> to verify your email.</p>`)
}
