# Payment Webhook Setup Guide for Clean Check

## 🎯 Overview
This guide will help you set up automatic payment notifications from PayPal and Venmo, so you get instant alerts when members make payments.

---

## 📋 What You Need

### PayPal Business Account
- You need a **PayPal Business Account** (not personal)
- Sign up at: https://www.paypal.com/business
- Upgrade your existing account to Business if needed

### Your Deployed App URL
- After deploying Clean Check, note your production URL
- Example: `https://your-app.emergent.host` or your custom domain

---

## 🔧 Step-by-Step Setup

### Part 1: PayPal Webhook Configuration

#### Step 1: Access PayPal Developer Dashboard
1. Go to: https://developer.paypal.com/
2. Log in with your PayPal Business account
3. Click **"Dashboard"** in the top right

#### Step 2: Create a REST API App
1. Click **"My Apps & Credentials"**
2. Make sure you're on **"Live"** tab (not Sandbox)
3. Click **"Create App"**
4. Enter app name: `Clean Check Payments`
5. Click **"Create App"**
6. **SAVE YOUR CLIENT ID AND SECRET** (you'll need these later)

#### Step 3: Configure Webhooks
1. In your app settings, scroll to **"Webhooks"**
2. Click **"Add Webhook"**
3. Enter webhook URL: `https://your-deployed-app-url.com/api/webhooks/paypal`
   - Replace with your actual deployed URL
   - Must include `/api/webhooks/paypal`
4. Select events to receive:
   - ✅ **PAYMENT.SALE.COMPLETED** (Most important!)
   - ✅ **PAYMENT.CAPTURE.COMPLETED**
   - ✅ **CHECKOUT.ORDER.COMPLETED**
5. Click **"Save"**

#### Step 4: Test Your Webhook
1. PayPal provides a webhook simulator
2. Send a test event of type **PAYMENT.SALE.COMPLETED**
3. Check your app logs to verify it was received

---

### Part 2: Venmo Setup (Limited Support)

**Important Note:** Venmo has very limited webhook/API access for non-enterprise accounts. 

**Current Options:**
1. **Manual Checking:** Continue with current email notification system
2. **Enterprise Account:** Contact Venmo business support for API access
3. **Alternative:** Most users have PayPal anyway (Venmo is owned by PayPal)

**If you get Venmo API access:**
- Webhook URL would be: `https://your-app-url.com/api/webhooks/venmo`
- Configuration would be similar to PayPal

---

## 🎨 What Happens Automatically

### When Payment is Received:

1. **PayPal sends webhook** to your app instantly
2. **Backend extracts info:**
   - Payer email
   - Amount paid
   - Transaction ID
   - Payment status

3. **Auto-matching:**
   - System searches for profile with matching email
   - If found and status is "In_Review" → Updates to "auto_verified"
   - Stores transaction ID and amount

4. **Admin notification:**
   - Email sent to pitbossent@gmail.com
   - Shows: Member name, email, amount, transaction ID
   - Reminds you to assign Member ID and fully approve

5. **User still waits:**
   - Stays on waiting screen
   - You still need to assign Member ID and approve
   - This gives you control and prevents fraud

---

## 🔒 Security Features

- **Webhook verification:** Each webhook is logged and verified
- **Email matching:** Only updates profiles with matching email addresses
- **Admin control:** You still must approve and assign Member ID
- **Unmatched payments:** Stored separately for manual review

---

## 📊 Admin Panel Updates Needed

After webhook is received, you'll see in admin panel:
- Payment status: "auto_verified" (instead of "in_review")
- Transaction ID visible
- Amount paid visible
- Easier to match and approve

---

## 🧪 Testing

### Test in Sandbox Mode (Before Going Live):

1. Use PayPal Sandbox accounts
2. Create test webhook URL: `https://your-app/api/webhooks/paypal`
3. Make test payments
4. Verify webhooks are received
5. Check database updates

### Go Live:

1. Switch to Live credentials in PayPal
2. Update webhook URL to production
3. Make real $1 test payment
4. Verify everything works
5. Deploy!

---

## 📝 Environment Variables

Add to `/app/backend/.env`:

```
PAYPAL_CLIENT_ID=your_live_client_id_here
PAYPAL_SECRET=your_live_secret_here
PAYPAL_WEBHOOK_ID=your_webhook_id_here
```

---

## ⚠️ Important Notes

1. **HTTPS Required:** Webhooks only work with HTTPS (secure) URLs
2. **Business Account:** Personal PayPal accounts cannot use webhooks
3. **Venmo Limitations:** Venmo API is very restricted for most users
4. **Keep Manual Backup:** Manual approval flow still works if webhooks fail
5. **Test Thoroughly:** Always test in sandbox before going live

---

## 🆘 Troubleshooting

### Webhook Not Receiving Events:
- Check webhook URL is correct and publicly accessible
- Verify HTTPS is enabled
- Check PayPal webhook logs in developer dashboard
- Review backend logs for errors

### Payments Not Auto-Matching:
- Verify email address in user profile matches PayPal payer email
- Check user status is "in_review"
- Look in `unmatched_payments` collection in database

### Need Help:
- Check backend logs: `/var/log/supervisor/backend.err.log`
- Check PayPal webhook activity in developer dashboard
- Contact PayPal developer support

---

## ✅ Benefits of Webhook Integration

- ⚡ **Instant notifications** - Know immediately when paid
- 🎯 **Auto-matching** - System finds the right user automatically  
- 📧 **Reduced email checking** - Less manual Venmo/PayPal monitoring
- 🔒 **Verified transactions** - Transaction IDs stored automatically
- 📊 **Better tracking** - Full payment history in database
- ⏱️ **Faster approvals** - Less time between payment and activation

---

## 🚀 Next Steps

1. Deploy your Clean Check app
2. Set up PayPal Business account (if not already)
3. Configure webhooks using this guide
4. Test with small payment
5. Monitor and enjoy automatic notifications!

---

**Created for Clean Check by Emergent AI**
