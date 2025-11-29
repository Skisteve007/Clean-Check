# 🧪 PayPal Sandbox Testing Instructions - FREE TESTING

## ✅ Setup Complete!

Your Clean Check application is now configured for **FREE PayPal Sandbox testing** with **RECURRING SUBSCRIPTIONS**!

### What's Been Configured:

✅ **PayPal Sandbox Mode:** Active (no real money)
✅ **Subscription Plans Created:**
   - Single Member: $39/month (Plan ID: P-97G78203Y5097251UNEVA5PA)
   - Joint/Couple: $69/month (Plan ID: P-31V75538RX956934BNEVA5PA)
✅ **Recurring Billing:** Every 30 days (automated)
✅ **Frontend:** PayPal Smart Buttons integrated
✅ **Backend:** Subscription verification enabled

---

## 🎯 How to Test (Step by Step)

### Step 1: Get Your Sandbox Test Account

1. Go to https://developer.paypal.com/dashboard/
2. Click on **"Sandbox"** in the left sidebar
3. Click on **"Accounts"**
4. You'll see test accounts (usually 2):
   - **Business Account** (This is YOU - receives payments)
   - **Personal Account** (This is TEST BUYER - makes payments)
5. Click on the **Personal Account** (test buyer)
6. Note the **Email** and click **"View/Edit Account"** to see the **Password**
7. Write these down:
   - Test Buyer Email: ___________________
   - Test Buyer Password: ___________________

---

### Step 2: Test the Complete Payment Flow

1. **Open Your App:** https://healthqr-3.preview.emergentagent.com

2. **Age Consent:**
   - Check the checkbox
   - Click "Enter Clean Check"

3. **Get Started:**
   - Enter Name: "Test User"
   - Enter Email: "test@example.com"
   - Click "Continue to Payment"

4. **Select Membership:**
   - Click on the **$39 Single** pricing box (or $69 if you prefer)
   - The box should highlight with a red border

5. **PayPal Payment:**
   - Click the blue **PayPal** button
   - A PayPal popup window will open
   - **IMPORTANT:** Use your **Sandbox Personal Account** credentials from Step 1
   - Log in with the test buyer email and password
   - You'll see the subscription details:
     - Clean Check - Single Member (or Joint)
     - $39.00 USD (or $69.00) per month
   - Click **"Subscribe"** or **"Agree & Subscribe"**
   - The popup will close

6. **Automatic Approval:**
   - You should see: "Payment successful! 🎉"
   - Your account status changes to "Active"
   - You can now create your profile and generate QR code

---

### Step 3: Verify the Subscription

1. Go to https://www.sandbox.paypal.com/
2. Log in with your **Sandbox Business Account** (not the personal one)
3. Click on **"Activity"**
4. You should see the subscription payment received ($39 or $69)
5. Click on **"Manage subscriptions"** to see active subscriptions

---

## 🔍 What to Look For

### ✅ PASS Criteria:
- PayPal popup opens without errors
- Can log in with sandbox test account
- Subscription details show correct amount and frequency
- After subscribing, app shows success message
- Profile creation section appears
- Payment shows in sandbox PayPal dashboard

### ❌ FAIL Indicators:
- PayPal button doesn't load (blank space)
- Error message when clicking PayPal button
- Can't log into sandbox account
- Subscription doesn't show in PayPal dashboard
- App doesn't activate account after payment

---

## 🛑 Important Notes

### This is 100% FREE Testing:
- ✅ No real money is charged
- ✅ All payments are fake (sandbox money)
- ✅ Test as many times as you want
- ✅ Can't accidentally charge real money in sandbox mode

### Recurring Billing:
- In sandbox mode, subscriptions are fake
- In live mode (after switching), users will be charged every 30 days
- Users can cancel anytime through their PayPal account

### Sandbox Test Accounts:
- Have $5,000 fake balance by default
- Can make unlimited transactions
- Completely separate from live PayPal

---

## 🔄 After Testing: Switch to Live Mode

**When you're ready to accept REAL payments:**

1. Go to https://developer.paypal.com/dashboard/
2. Switch toggle from **"Sandbox"** to **"Live"**
3. Get your **LIVE** credentials:
   - Live Client ID
   - Live Secret
4. Run this command:
   ```bash
   bash /app/switch_to_live.sh
   ```
5. Enter your LIVE credentials when prompted
6. Create LIVE subscription plans:
   ```bash
   curl -X POST "https://healthqr-3.preview.emergentagent.com/api/payment/paypal/create-subscription-plans"
   ```
7. Copy the LIVE Plan IDs and add to `/app/backend/.env`
8. Restart: `sudo supervisorctl restart backend`

**OR** you can manually update `/app/backend/.env`:
```env
PAYPAL_MODE="live"
PAYPAL_CLIENT_ID="your_live_client_id"
PAYPAL_SECRET="your_live_secret"
PAYPAL_PLAN_ID_39="your_live_plan_id_39"
PAYPAL_PLAN_ID_69="your_live_plan_id_69"
```

---

## 📊 Testing Checklist

Copy and check off as you test:

```
[ ] Got sandbox test buyer credentials
[ ] Opened app and passed age consent
[ ] Entered name and email in Get Started
[ ] Selected membership tier ($39 or $69)
[ ] Clicked PayPal button
[ ] PayPal popup opened
[ ] Logged in with sandbox test account
[ ] Saw subscription details (amount, frequency)
[ ] Clicked "Subscribe"
[ ] App showed success message
[ ] Account status changed to Active
[ ] Can create profile
[ ] Can generate QR code
[ ] Verified payment in sandbox PayPal dashboard
```

---

## 🆘 Troubleshooting

### PayPal Button Not Loading
**Check:**
- Browser console for errors (F12)
- Backend logs: `tail -n 100 /var/log/supervisor/backend.err.log`
- Verify sandbox mode: `cat /app/backend/.env | grep PAYPAL_MODE`

### "Subscription Failed" Error
**Check:**
- Plan IDs are correct in `.env`
- Using sandbox credentials, not live
- Backend is running: `sudo supervisorctl status backend`

### Can't Log Into Sandbox Account
**Solution:**
- Go back to https://developer.paypal.com/dashboard/
- Go to Sandbox → Accounts
- Click "..." on Personal Account → "View/Edit Account"
- Get the correct email and password

---

## 📞 Need Help?

- PayPal Sandbox Docs: https://developer.paypal.com/docs/api-basics/sandbox/
- Backend Logs: `tail -f /var/log/supervisor/backend.err.log`
- Frontend Console: F12 → Console tab

---

## 🎉 Summary

You're all set for **FREE, SAFE testing** of your PayPal recurring subscription system!

**Current Status:**
- ✅ Sandbox mode active
- ✅ Subscription plans created
- ✅ Recurring billing configured ($39 and $69/month)
- ✅ Frontend PayPal buttons working
- ✅ Backend verification ready

**Next Step:** Follow Step 2 above to test a complete payment!

Happy Testing! 🧪✨
