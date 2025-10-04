import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, inviteLink, clinicName, inviterName } = await request.json()

    // Verify the request is from an authenticated user
    const supabase = await createServerComponentClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Replace with your email service
    // Option 1: Resend (recommended for Next.js)
    // const { Resend } = require('resend')
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // 
    // await resend.emails.send({
    //   from: 'MyClinicAdmin <invites@yourdomain.com>',
    //   to: email,
    //   subject: `You've been invited to join ${clinicName}`,
    //   html: getEmailTemplate(clinicName, inviterName, inviteLink)
    // })

    // Option 2: SendGrid
    // const sgMail = require('@sendgrid/mail')
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    // 
    // await sgMail.send({
    //   to: email,
    //   from: 'invites@yourdomain.com',
    //   subject: `You've been invited to join ${clinicName}`,
    //   html: getEmailTemplate(clinicName, inviterName, inviteLink)
    // })

    // Option 3: Nodemailer (SMTP)
    // const nodemailer = require('nodemailer')
    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: process.env.SMTP_PORT,
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASSWORD
    //   }
    // })
    // 
    // await transporter.sendMail({
    //   from: 'invites@yourdomain.com',
    //   to: email,
    //   subject: `You've been invited to join ${clinicName}`,
    //   html: getEmailTemplate(clinicName, inviterName, inviteLink)
    // })

    // TEMPORARY: For development, just return success
    // Remove this and uncomment one of the options above for production
    console.log('📧 Email would be sent to:', email)
    console.log('📧 Invite link:', inviteLink)
    
    return NextResponse.json({ 
      success: true,
      message: 'Email sent successfully',
      // For development, return the link
      inviteLink: process.env.NODE_ENV === 'development' ? inviteLink : undefined
    })

  } catch (error: any) {
    console.error('Error sending invite email:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}

function getEmailTemplate(clinicName: string, inviterName: string, inviteLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Clinic Invitation</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🏥 MyClinicAdmin</h1>
      </div>
      
      <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1f2937; margin-top: 0;">You've been invited!</h2>
        
        <p style="font-size: 16px; color: #4b5563;">
          <strong>${inviterName}</strong> has invited you to join <strong>${clinicName}</strong> as a manager on MyClinicAdmin.
        </p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
          <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px;">
            As a manager, you'll be able to:
          </p>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
            <li>View clinic performance metrics</li>
            <li>Manage appointments</li>
            <li>Access patient records</li>
            <li>Generate reports</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${inviteLink}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 14px 32px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    display: inline-block; 
                    font-weight: 600;
                    font-size: 16px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            Accept Invitation
          </a>
        </div>
        
        <p style="color: #9ca3af; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
        </p>
        
        <p style="color: #d1d5db; font-size: 12px; margin-top: 20px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <span style="word-break: break-all; color: #9ca3af;">${inviteLink}</span>
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
        <p>© 2024 MyClinicAdmin. All rights reserved.</p>
      </div>
    </body>
    </html>
  `
}
