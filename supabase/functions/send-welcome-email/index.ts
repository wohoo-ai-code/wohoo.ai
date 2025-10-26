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
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e5e5;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #0a0a0a;">
                                ✈️ wohoo.ai
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #0a0a0a;">
                                Welcome to the Waitlist, ${name}! 🎉
                            </h2>

                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #404040;">
                                Thank you for joining the wohoo.ai waitlist! You're now part of an exclusive group who will get early access to automatic flight check-ins.
                            </p>

                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #404040;">
                                <strong>What is wohoo.ai?</strong><br>
                                We automatically check you in for your flights 24 hours before departure, ensuring you get the best boarding positions without setting alarms or remembering check-in times.
                            </p>

                            <!-- Benefits Box -->
                            <table role="presentation" style="width: 100%; background-color: #f8f9fa; border-radius: 8px; margin: 30px 0;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #0a0a0a;">
                                            What's Next?
                                        </h3>
                                        <ul style="margin: 0; padding: 0 0 0 20px; color: #404040;">
                                            <li style="margin-bottom: 10px;">We'll notify you when we're ready to launch</li>
                                            <li style="margin-bottom: 10px;">Early access to test the service before public release</li>
                                            <li style="margin-bottom: 10px;">Special founding member pricing (exclusive to waitlist)</li>
                                            <li>Priority support and feature requests</li>
                                        </ul>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #404040;">
                                In the meantime, feel free to spread the word! Know someone who travels frequently? Share wohoo.ai with them.
                            </p>

                            <!-- CTA Button -->
                            <table role="presentation" style="margin: 30px 0;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="https://wohoo.ai" style="display: inline-block; padding: 14px 32px; background-color: #0099ff; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                            Visit Our Website
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 30px 0 0; font-size: 16px; line-height: 1.6; color: #404040;">
                                Thanks again for your interest!<br>
                                <strong>The wohoo.ai Team</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-top: 1px solid #e5e5e5; border-radius: 0 0 12px 12px;">
                            <!-- Social Links -->
                            <table role="presentation" style="width: 100%; margin-bottom: 20px;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="https://twitter.com/wohooai" style="display: inline-block; margin: 0 10px; color: #0099ff; text-decoration: none; font-size: 14px;">X (Twitter)</a>
                                        <a href="https://instagram.com/wohooai" style="display: inline-block; margin: 0 10px; color: #0099ff; text-decoration: none; font-size: 14px;">Instagram</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #737373; text-align: center;">
                                wohoo.ai - Never miss your flight check-in<br>
                                <a href="https://wohoo.ai/privacy.html" style="color: #0099ff; text-decoration: none;">Privacy Policy</a> |
                                <a href="https://wohoo.ai/terms.html" style="color: #0099ff; text-decoration: none;">Terms of Service</a>
                            </p>

                            <p style="margin: 15px 0 0; font-size: 12px; line-height: 1.5; color: #a3a3a3; text-align: center;">
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
Welcome to the Waitlist, ${name}!

Thank you for joining the wohoo.ai waitlist! You're now part of an exclusive group who will get early access to automatic flight check-ins.

What is wohoo.ai?
We automatically check you in for your flights 24 hours before departure, ensuring you get the best boarding positions without setting alarms or remembering check-in times.

What's Next?
- We'll notify you when we're ready to launch
- Early access to test the service before public release
- Special founding member pricing (exclusive to waitlist)
- Priority support and feature requests

In the meantime, feel free to spread the word! Know someone who travels frequently? Share wohoo.ai with them.

Thanks again for your interest!
The wohoo.ai Team

---
wohoo.ai - Never miss your flight check-in
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