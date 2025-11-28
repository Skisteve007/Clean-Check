# Twilio SMS Setup Guide for Clean Check Admin Notifications

This guide will help you set up Twilio SMS notifications so admins receive text messages when new payment submissions are made.

## What You'll Need
- A Twilio account (free trial available)
- Admin phone numbers in the system

## Step 1: Create a Twilio Account

1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free account
3. Verify your email and phone number
4. You'll receive $15 in free credit (enough for ~500 SMS messages)

## Step 2: Get Your Twilio Credentials

After signing up:

1. Go to your Twilio Console Dashboard: https://console.twilio.com/
2. Find these three values on your dashboard:
   - **Account SID** (starts with "AC...")
   - **Auth Token** (click the eye icon to reveal it)
   - **Phone Number** (you'll get a free trial number)

## Step 3: Get a Twilio Phone Number

1. In the Twilio Console, navigate to **Phone Numbers** → **Manage** → **Buy a number**
2. Select your country
3. Check "SMS" capability
4. Click "Search"
5. Choose a number and click "Buy"
6. The free trial includes one phone number

**Note:** Trial accounts can only send SMS to verified phone numbers. To remove this restriction:
- Upgrade to a paid account ($20 minimum)
- Or verify each admin phone number in Twilio Console → **Phone Numbers** → **Verified Caller IDs**

## Step 4: Add Credentials to Your Application

1. Open `/app/backend/.env` file
2. Add your Twilio credentials:

```env
TWILIO_ACCOUNT_SID="your_account_sid_here"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_PHONE_NUMBER="+1234567890"
```

**Important:** 
- The phone number must be in E.164 format: `+[country code][number]`
- Example: `+12025551234` for a US number
- Don't include spaces or dashes

## Step 5: Restart the Backend

After adding the credentials:

```bash
sudo supervisorctl restart backend
```

## Step 6: Add Admin Phone Numbers

1. Log in to the Admin Panel at `/admin`
2. Go to the "Admin Users" tab
3. Create admin users with their phone numbers
4. Phone numbers should be in E.164 format: `+12025551234`

## Step 7: Test the SMS Notification

1. Have a test user submit a payment confirmation
2. Admin phone numbers should receive an SMS like:

```
🔔 Clean Check: New payment from John Doe - $39 via PayPal. Login to admin panel to approve.
```

## Troubleshooting

### SMS Not Sending?

1. **Check Backend Logs:**
   ```bash
   tail -n 50 /var/log/supervisor/backend.err.log
   ```

2. **Verify Credentials:**
   - Ensure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER are set correctly
   - Check for typos or extra spaces

3. **Trial Account Limitations:**
   - If using a trial account, verify recipient phone numbers in Twilio Console
   - Upgrade to paid account to remove restrictions

4. **Phone Number Format:**
   - Ensure all phone numbers use E.164 format: `+[country code][number]`
   - No spaces, dashes, or parentheses

5. **Check Twilio Console:**
   - Go to https://console.twilio.com/us1/monitor/logs/sms
   - View SMS logs to see delivery status and error messages

### Common Errors

**Error: "The number +1234567890 is unverified"**
- Solution: Add the number to verified caller IDs in Twilio Console, or upgrade account

**Error: "Unable to create record: Permission denied"**
- Solution: Your Twilio account may need verification or upgrade

**No Error But No SMS:**
- Check if TWILIO credentials are empty in `.env`
- Verify admin users have phone numbers in the database

## Pricing (After Free Trial)

- **SMS (US/Canada):** $0.0075 per message
- **SMS (International):** Varies by country (~$0.05-0.20 per message)
- **Phone Number:** $1.15/month for US number

For 100 new payment notifications per month:
- Cost: ~$1.00 (SMS) + $1.15 (phone number) = **$2.15/month**

## Alternative: Disable SMS Notifications

If you don't want SMS notifications, you can still use the system without Twilio:

1. Leave the Twilio variables empty in `.env`:
   ```env
   TWILIO_ACCOUNT_SID=""
   TWILIO_AUTH_TOKEN=""
   TWILIO_PHONE_NUMBER=""
   ```

2. Admins will still receive email notifications
3. Backend will log a warning but continue functioning normally

## Support

- **Twilio Documentation:** https://www.twilio.com/docs/sms
- **Twilio Support:** https://support.twilio.com/
- **Free Trial FAQ:** https://support.twilio.com/hc/en-us/articles/223136107

---

**Ready to Go!** Once configured, admins will automatically receive SMS alerts for new payment submissions, making the approval process much faster.
