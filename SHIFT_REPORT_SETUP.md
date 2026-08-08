# End Shift & Email Report Setup Guide

## What Happens When You Click "End Shift"

```
1. Collect all bills from the shift time period
2. Analyze stock movements (sales + refills)
3. Generate Shift Sales Report with:
   - Bills count & items sold
   - Payment breakdown (Cash/Card/etc)
   - Stock summary (healthy/low/out of stock)
4. Send HTML + CSV report email to SHIFT_REPORT_EMAIL
5. Record shift report in database
6. Enable "Next Shift" button for staff (not admin)
```

## Deploy Note

The deployed Vercel link only updates the React frontend. End Shift email and Excel report generation runs from the backend service configured in `vercel.json`:

```txt
https://snt-backend-raur.onrender.com
```

If you change End Shift, Excel report, email, stock summary, or any `/api/shifts/end` logic, redeploy the Render backend also. A Vercel-only deploy will not update the Excel report behavior.

## Current Issue: Gmail SMTP Authentication Failed

**Error**: `535-5.7.8 Username and Password not accepted`

**Root Cause**: `.env.development` has placeholder password: `SMTP_PASS=your-app-password-16chars`

### Solution: Create Gmail App Password

#### Step 1: Enable 2-Factor Authentication
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security** (left sidebar)
3. Find **2-Step Verification** and enable it (if not already done)

#### Step 2: Generate App Password
1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select:
   - **App**: Mail
   - **Device**: Windows Computer (or your device type)
3. Click **Generate**
4. Google shows a 16-character password: `xxxx xxxx xxxx xxxx`
5. Copy this password (remove spaces)

#### Step 3: Update .env.development

Replace `paste-16-char-app-password-here` with your generated password:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=karthickkumar2312@gmail.com
SMTP_PASS=YOUR_16_CHAR_PASSWORD_NO_SPACES
SMTP_FROM=karthickkumar2312@gmail.com
SHIFT_REPORT_EMAIL=surendharkavin01@gmail.com
```

#### Step 4: Restart Server

```powershell
# Kill existing server (if running)
# Then restart:
npm run server
```

## Testing the Shift End Flow

### Test Scenario
1. **Login** as `staff1` / `Staff1@SNT2026!`
2. **Create a bill** (add some products)
3. **Wait a few seconds** (so shift duration > 0)
4. **Click "End Shift"** button
5. **Check email** for the shift report

### Expected Result
✅ Email arrives with:
- Shift Sales Report (HTML)
- sales_shift_staff1_YYYY-MM-DD-HH-MM-SS.csv
- stock_shift_staff1_YYYY-MM-DD-HH-MM-SS.csv

✅ "Next Shift" button appears (for Staff)
✅ Shift report saved in `shift_reports` table with `email_status='sent'`

## Shift Reports Database

The `shift_reports` table tracks all shift closures:

```sql
SELECT * FROM shift_reports;
```

Columns:
- `session_id` - Login session reference
- `user` - Staff member username
- `role` - Admin/Staff
- `shift_start` - Shift start timestamp
- `shift_end` - Shift end timestamp
- `total_bills` - Count of bills during shift
- `total_items_sold` - Total quantity of items
- `total_sales_amount` - Total revenue
- `email_status` - 'sent' or 'failed'
- `email_error` - Error message if failed
- `email_sent_at` - When email was sent

## Troubleshooting

### Email Still Not Sending?

1. **Check SMTP credentials are valid**
   ```powershell
   # View .env.development
   cat .env.development | grep SMTP
   ```

2. **Verify Gmail account settings**
   - Go to [myaccount.google.com/security](https://myaccount.google.com/security)
   - Check "Less secure app access" is enabled (or use App Passwords)

3. **Check server logs** for detailed error
   ```
   Look for: "Failed to end shift:"
   ```

4. **Verify recipient email is set**
   ```env
   SHIFT_REPORT_EMAIL=anithaami1208@gmail.com
   ```

5. **Test direct email sending** (optional)
   ```javascript
   // In server terminal
   const nodemailer = require('nodemailer');
   const transporter = nodemailer.createTransport({
     host: 'smtp.gmail.com',
     port: 587,
     secure: false,
     auth: {
       user: 'anithaami1208@gmail.com',
       pass: 'YOUR_APP_PASSWORD'
     }
   });
   // Try sending test email
   ```

## Next Shift Workflow

After staff clicks "End Shift":

1. ✅ Email sent
2. ✅ Shift report saved
3. ✅ **"Next Shift" button appears**
4. Click "Next Shift" to:
   - Start new shift
   - Reset login time
   - Clear previous session
   - Ready for next set of bills

**Admin users** do NOT see "Next Shift" button (they don't work shifts).

## Configuration Summary

**File**: `.env.development`

```env
# Gmail SMTP (for shift report emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=karthickkumar2312@gmail.com
SMTP_PASS=YOUR_16_CHAR_APP_PASSWORD
SMTP_FROM=karthickkumar2312@gmail.com

# Report destination
SHIFT_REPORT_EMAIL=anithaami1208@gmail.com
```

**Key Files**:
- Server: `server/mongo-server.js`
- Client: `client/src/components/Topbar.jsx` (lines 79-110)
- API Hook: `client/src/hooks/useERPData.js` (line 694)
