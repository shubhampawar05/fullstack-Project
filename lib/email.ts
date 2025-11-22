/**
 * Email Service - TalentHR
 * Handles sending emails using Nodemailer
 */

import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Create email transporter
 * Supports Gmail SMTP and custom SMTP servers
 * Supports both SMTP_* and EMAIL_* environment variables
 */
function createTransporter() {
  // Get config values (support both SMTP_* and EMAIL_* variables)
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || "587");
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || user;

  // Use Gmail SMTP if credentials are provided
  if (host === "gmail" || (user && pass && user.includes("@gmail.com"))) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: user,
        pass: pass, // Gmail App Password
      },
    });
  }

  // Use custom SMTP if provided
  if (host && user && pass) {
    return nodemailer.createTransport({
      host: host,
      port: port,
      secure: secure, // true for 465, false for other ports
      auth: {
        user: user,
        pass: pass,
      },
    });
  }

  // No email service configured
  return null;
}

/**
 * Send email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();

    // If no transporter (no email config), log in development
    if (!transporter) {
      if (process.env.NODE_ENV === "development") {
        console.log("📧 [Email] No email service configured. Email would be sent:");
        console.log("To:", options.to);
        console.log("Subject:", options.subject);
        console.log("Body:", options.text || options.html);
        return true; // Return true in dev mode
      }
      throw new Error("Email service not configured");
    }

    const from =
      process.env.SMTP_FROM ||
      process.env.EMAIL_FROM ||
      process.env.SMTP_USER ||
      process.env.EMAIL_USER ||
      "noreply@talenthrm.com";

    const mailOptions = {
      from: from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ""), // Plain text version
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Email sending error:", error);
    throw error;
  }
}

/**
 * Send OTP email
 */
export async function sendOTPEmail(
  email: string,
  otpCode: string,
  purpose: string
): Promise<boolean> {
  const purposeText =
    purpose === "company_admin_signup"
      ? "Company Admin Signup"
      : purpose === "invitation_signup"
      ? "Invitation Signup"
      : purpose === "password_reset"
      ? "Password Reset"
      : "Login";

  const subject = `Your TalentHR Verification Code - ${otpCode}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">TalentHR</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333; margin-top: 0;">Email Verification</h2>
          <p>Hello,</p>
          <p>You're ${purposeText.toLowerCase()} for TalentHR. Use the verification code below to complete your registration:</p>
          <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea;">
              ${otpCode}
            </div>
          </div>
          <p style="color: #666; font-size: 14px;">
            This code will expire in <strong>10 minutes</strong>.
          </p>
          <p style="color: #666; font-size: 14px;">
            If you didn't request this code, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            This is an automated message from TalentHR. Please do not reply to this email.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
TalentHR - Email Verification

Hello,

You're ${purposeText.toLowerCase()} for TalentHR. Use the verification code below to complete your registration:

${otpCode}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

---
This is an automated message from TalentHR.
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

/**
 * Send invitation email
 */
export async function sendInvitationEmail(
  email: string,
  invitationLink: string,
  role: string,
  companyName: string,
  invitedBy: string
): Promise<boolean> {
  const roleDisplay = role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const subject = `You've been invited to join ${companyName} on TalentHR`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation to TalentHR</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">TalentHR</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333; margin-top: 0;">You've Been Invited!</h2>
          <p>Hello,</p>
          <p><strong>${invitedBy}</strong> has invited you to join <strong>${companyName}</strong> on TalentHR as a <strong>${roleDisplay}</strong>.</p>
          <p>Click the button below to accept the invitation and create your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);">
              Accept Invitation
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:
          </p>
          <p style="background: white; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #667eea; border: 1px solid #e0e0e0;">
            ${invitationLink}
          </p>
          <p style="color: #666; font-size: 14px;">
            This invitation will expire in <strong>7 days</strong>.
          </p>
          <p style="color: #666; font-size: 14px;">
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            This is an automated message from TalentHR. Please do not reply to this email.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
TalentHR - Invitation

Hello,

${invitedBy} has invited you to join ${companyName} on TalentHR as a ${roleDisplay}.

Click the link below to accept the invitation and create your account:

${invitationLink}

This invitation will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.

---
This is an automated message from TalentHR.
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

