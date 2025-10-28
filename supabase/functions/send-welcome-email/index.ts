// Supabase Edge Function: Send Welcome Email via Resend
// This function is triggered when a new user joins the waitlist

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Configuration - Set these as environment variables in Supabase
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'hello@wohoo.ai'

// Email template function
function getWelcomeEmailHtml(name: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to wohoo.ai</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #e3f2fd 0%, #f5f9ff 50%, #ffffff 100%);">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 20px rgba(66, 153, 225, 0.15); border: 1.5px solid rgba(66, 153, 225, 0.1);">
                    <!-- Header with Brand -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center;">
                            <table role="presentation" style="margin: 0 auto;">
                                <tr>
                                    <td>
                                        <div style="display: inline-flex; align-items: center; gap: 8px;">
                                            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); border-radius: 10px; color: white; font-size: 20px; font-weight: 600; display: flex; align-items: center; justify-content: center; float: left;">W</div>
                                            <h1 style="margin: 0; font-size: 32px; font-weight: 600; background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.02em; float: left; padding-top: 8px;">wohoo.ai</h1>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 20px 40px 40px;">
                            <h2 style="margin: 0 0 8px; font-size: 36px; font-weight: 300; color: #1565c0; letter-spacing: -0.03em; line-height: 1.2;">
                                Boarding pass
                            </h2>
                            <h3 style="margin: 0 0 24px; font-size: 36px; font-weight: 400; color: #1976d2; font-style: italic; font-family: 'Playfair Display', Georgia, serif; letter-spacing: -0.02em; line-height: 1.2;">
                                Delivered.
                            </h3>

                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: rgba(25, 118, 210, 0.85);">
                                Hey ${name}! Welcome to the wohoo.ai waitlist.
                            </p>

                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: rgba(25, 118, 210, 0.75);">
                                You're now part of an exclusive group who will get early access to automatic flight check-ins.
                            </p>

                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: rgba(25, 118, 210, 0.75);">
                                Our team is working on some awesome AI agents that can automatically check you in for your flight—no apps, no stress at all! Your flight reservations are super helpful because they let us test our agents across different airlines and formats. Real data is what makes our agent smarter and better for you!
                            </p>

                            <!-- Benefits Box -->
                            <table role="presentation" style="width: 100%; background: rgba(66, 153, 225, 0.08); border: 1.5px solid rgba(66, 153, 225, 0.15); border-radius: 12px; margin: 30px 0;">
                                <tr>
                                    <td style="padding: 28px;">
                                        <h4 style="margin: 0 0 16px; font-size: 18px; font-weight: 500; color: #1565c0; letter-spacing: -0.01em;">
                                            What's Next?
                                        </h4>
                                        <ul style="margin: 0; padding: 0 0 0 20px; color: rgba(25, 118, 210, 0.75); line-height: 1.8;">
                                            <li style="margin-bottom: 10px;">To get started forward flight reservations to <a href="mailto:hello@wohoo.ai" style="color: #1565c0; text-decoration: none; font-weight: 500;">hello@wohoo.ai</a> along with your seat preferences</li>
                                            <li style="margin-bottom: 10px;">Receive boarding passes 24 hours before your flight</li>
                                            <li>Plus, we're here to help with priority support and any feature requests you might have!</li>
                                        </ul>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: rgba(25, 118, 210, 0.75);">
                                We look forward to helping you take one thing off your plate for your next travel.
                            </p>

                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: rgba(25, 118, 210, 0.75);">
                                Know someone who travels frequently? Share wohoo.ai with them!
                            </p>

                            <!-- CTA Button -->
                            <table role="presentation" style="margin: 30px 0;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="https://wohoo.ai" style="display: inline-block; padding: 16px 36px; background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 500; font-size: 16px; letter-spacing: -0.01em; box-shadow: 0 4px 12px rgba(25, 118, 210, 0.25);">
                                            Visit Our Website
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 30px 0 0; font-size: 16px; line-height: 1.6; color: rgba(25, 118, 210, 0.75);">
                                Thanks for joining!<br>
                                <strong style="color: #1565c0;">The wohoo.ai Team</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background: rgba(66, 153, 225, 0.04); border-top: 1.5px solid rgba(66, 153, 225, 0.1); border-radius: 0 0 16px 16px;">
                            <!-- Social Links -->
                            <table role="presentation" style="width: 100%; margin-bottom: 16px;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="https://twitter.com/wohooai" style="display: inline-block; margin: 0 12px; color: rgba(25, 118, 210, 0.6); text-decoration: none; font-size: 14px; transition: color 0.2s;">X (Twitter)</a>
                                        <a href="https://instagram.com/wohooai" style="display: inline-block; margin: 0 12px; color: rgba(25, 118, 210, 0.6); text-decoration: none; font-size: 14px; transition: color 0.2s;">Instagram</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 12px; font-size: 12px; line-height: 1.5; color: rgba(25, 118, 210, 0.5); text-align: center;">
                                <strong style="color: rgba(25, 118, 210, 0.6);">© 2025 wohoo.ai</strong><br>
                                <a href="https://wohoo.ai/privacy.html" style="color: rgba(25, 118, 210, 0.6); text-decoration: none;">Privacy Policy</a> |
                                <a href="https://wohoo.ai/terms.html" style="color: rgba(25, 118, 210, 0.6); text-decoration: none;">Terms of Service</a>
                            </p>

                            <p style="margin: 0; font-size: 11px; line-height: 1.5; color: rgba(25, 118, 210, 0.4); text-align: center;">
                                You received this email because you joined the wohoo.ai waitlist.<br>
                                If you didn't sign up, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `
}

// Plain text version (fallback)
function getWelcomeEmailText(name: string): string {
  return `
wohoo.ai - Boarding pass. Delivered.

Hey ${name}! Welcome to the wohoo.ai waitlist.

You're now part of an exclusive group who will get early access to automatic flight check-ins.

Our team is working on some awesome AI agents that can automatically check you in for your flight—no apps, no stress at all! Your flight reservations are super helpful because they let us test our agents across different airlines and formats. Real data is what makes our agent smarter and better for you!

What's Next?
- To get started forward flight reservations to hello@wohoo.ai along with your seat preferences
- Receive boarding passes 24 hours before your flight
- Plus, we're here to help with priority support and any feature requests you might have!

We look forward to helping you take one thing off your plate for your next travel.

Know someone who travels frequently? Share wohoo.ai with them!

Thanks for joining!
The wohoo.ai Team

---
© 2025 wohoo.ai
X (Twitter): https://twitter.com/wohooai
Instagram: https://instagram.com/wohooai

Privacy Policy: https://wohoo.ai/privacy.html
Terms of Service: https://wohoo.ai/terms.html

You received this email because you joined the wohoo.ai waitlist.
If you didn't sign up, you can safely ignore this email.
  `
}

// Send email via Resend API
async function sendEmail(to: string, name: string): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set')
    return { success: false, error: 'RESEND_API_KEY not configured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: 'Welcome to wohoo.ai - You\'re on the list! ✈️',
        html: getWelcomeEmailHtml(name),
        text: getWelcomeEmailText(name),
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Resend API error:', errorData)
      return { success: false, error: errorData.message || 'Failed to send email' }
    }

    const data = await response.json()
    console.log('Email sent successfully:', data)
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error.message }
  }
}

// Update email_sent flag in database
async function markEmailSent(userId: string): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase credentials not set')
    return
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const { error } = await supabase
    .from('waitlist')
    .update({ email_sent: true })
    .eq('id', userId)

  if (error) {
    console.error('Error updating email_sent flag:', error)
  } else {
    console.log('Successfully marked email as sent for user:', userId)
  }
}

// Main handler
serve(async (req) => {
  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      })
    }

    // Parse request body
    const payload = await req.json()
    console.log('Received payload:', payload)

    // Extract data from payload
    // The payload structure depends on how you trigger this function
    // If triggered by Database Webhook, it will have this structure:
    const record = payload.record || payload
    const { id, name, email, email_sent } = record

    // Validate required fields
    if (!id || !name || !email) {
      console.error('Missing required fields:', { id, name, email })
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if email was already sent
    if (email_sent) {
      console.log('Email already sent to:', email)
      return new Response(
        JSON.stringify({ message: 'Email already sent' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Send welcome email
    console.log('Sending welcome email to:', email)
    const result = await sendEmail(email, name)

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error || 'Failed to send email' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Mark email as sent
    await markEmailSent(id)

    return new Response(
      JSON.stringify({ message: 'Welcome email sent successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-welcome-email function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})