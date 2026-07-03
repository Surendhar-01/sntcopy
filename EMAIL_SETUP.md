# Email Setup Guide for Sri Nikil Traders ERP

## Current Configuration
✅ Recipient Email: `anithaami1208@gmail.com`
✅ SMTP Host: `smtp.gmail.com`  
⚠️ **Pending**: Sender credentials

## How to Complete Email Setup

### Option 1: Using Gmail (Recommended)

1. **Enable 2-Step Verification**
   - Go to https://myaccount.google.com/security
   - Click "2-Step Verification" and follow prompts

2. **Generate App Password**
   - In Security settings, find "App passwords"
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password
   - Copy this password

3. **Update `server/.env.development`**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=karthickkumar2312@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx
   SMTP_FROM=karthickkumar2312@gmail.com
   SHIFT_REPORT_EMAIL=karthickkumar2312@gmail.com
   ```

### Option 2: Using Other Email Services

**Outlook/Office365:**
```
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

**Yahoo Mail:**
```
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

## Test Email Sending

Once configured, the system will automatically send shift reports:
- Triggered when any staff member ends their shift
- Includes CSV attachments with sales and stock data
- Sent to: `anithaami1208@gmail.com`

## Troubleshooting

If emails don't send:
1. Check server logs: `npm start` in `/server` directory
2. Verify SMTP credentials are correct
3. Ensure sender account allows "Less Secure Apps" (for Gmail)
4. Check firewall/ports - Port 587 must be accessible

## API Endpoint

**POST** `/api/shifts/end`
```json
{
  "user": "staff1",
  "role": "Staff",
  "shiftStart": "2026-04-10T09:00:00",
  "recipientEmail": "karthickkumar2312@gmail.com"
}
```

Response:
```json
{
  "success": true,
  "emailedTo": "karthickkumar2312@gmail.com",
  "billsCount": 5,
  "totalSalesAmount": 2500.00
}
```
