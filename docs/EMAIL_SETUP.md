# Email Setup Guide - TalentHR

## Overview

TalentHR uses Nodemailer to send OTP verification emails. This guide explains how to configure email sending.

---

## Setup Options

### Option 1: Gmail SMTP (Recommended for Development/Testing)

**Easiest to set up, good for testing**

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "TalentHR" as the name
   - Copy the 16-character password

3. **Add to `.env.local`:**
   ```env
   SMTP_HOST=gmail
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   SMTP_FROM=TalentHR <your-email@gmail.com>
   ```

### Option 2: Custom SMTP Server

**For production or custom email servers**

Add to `.env.local`:
```env
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password
SMTP_FROM=TalentHR <noreply@yourdomain.com>
```

### Option 3: Development Mode (No Email)

**If no email config, OTP is logged to console**

In development, if no email service is configured, the OTP will be:
- Logged to console
- Returned in API response (for testing)

---

## Environment Variables

Add these to your `.env.local` file:

```env
# Email Configuration (Gmail Example)
SMTP_HOST=gmail
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=TalentHR <your-email@gmail.com>

# Or Custom SMTP
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=noreply@example.com
# SMTP_PASS=your-password
# SMTP_FROM=TalentHR <noreply@example.com>
```

---

## Testing

### Test Email Sending

1. Configure email in `.env.local`
2. Restart your dev server: `npm run dev`
3. Try signing up as Company Admin
4. Check your email inbox for the OTP code

### Development Mode

If email is not configured:
- OTP is logged to console
- OTP is returned in API response (check Network tab)
- You can use the OTP from console/response

---

## Production Recommendations

### Recommended Services:

1. **Resend** (Modern, simple)
   - Easy API
   - Good free tier
   - Great for startups

2. **SendGrid** (Popular, reliable)
   - 100 emails/day free
   - Good deliverability
   - Easy integration

3. **AWS SES** (Scalable)
   - Very cheap
   - Highly scalable
   - Requires AWS setup

4. **Mailgun** (Developer-friendly)
   - Good API
   - 5,000 emails/month free
   - Easy setup

---

## Troubleshooting

### Gmail Issues

**Error: "Invalid login"**
- Make sure you're using an App Password, not your regular password
- Enable 2FA first

**Error: "Less secure app access"**
- Gmail no longer supports "less secure apps"
- Use App Password instead

### Email Not Received

1. Check spam folder
2. Verify email address is correct
3. Check console logs for errors
4. Verify SMTP credentials are correct

### Development Testing

If emails aren't working:
- Check console for OTP code
- Check Network tab in browser DevTools
- OTP is returned in API response in dev mode

---

## Security Notes

- **Never commit** `.env.local` to git
- **Use App Passwords** for Gmail (not regular password)
- **Rotate passwords** regularly
- **Use environment variables** for all credentials

---

## Next Steps

1. Set up email service (Gmail or custom SMTP)
2. Add credentials to `.env.local`
3. Restart dev server
4. Test OTP sending
5. For production, consider using Resend/SendGrid

