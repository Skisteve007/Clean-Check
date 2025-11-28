# Complete Testing Guide - No Real Money Required

This guide will help you test the entire Clean Check application flow without spending any real money using PayPal Sandbox.

---

## Quick Setup for Free Testing

### Step 1: Get PayPal Sandbox Credentials

1. Go to https://developer.paypal.com/
2. Log in with your PayPal account
3. Click "Dashboard" in top navigation
4. Go to "Apps & Credentials" tab
5. **Make sure "Sandbox" is selected** (toggle at top)

### Step 2: Get Your Sandbox Credentials

Under "REST API apps" section:
- Click on "Default Application" (or create new app)
- Copy your **Sandbox Client ID**
- Click "Show" under **Secret** and copy it

### Step 3: Create Test Accounts

In the left sidebar, click "Sandbox" → "Accounts"

You'll see two default accounts:
- **Business Account** (receives payments) - This is YOU
- **Personal Account** (makes payments) - This is TEST BUYER

Click on each account to see:
- Email address
- Password
- Available balance ($5,000 fake money by default)

### Step 4: Configure Your App for Sandbox

1. Open `/app/backend/.env`
2. Update these lines:

```env
PAYPAL_MODE="sandbox"
PAYPAL_CLIENT_ID="your_sandbox_client_id_here"
PAYPAL_SECRET="your_sandbox_secret_here"
```

3. Save the file
4. Restart backend:
```bash
sudo supervisorctl restart backend
```

---

## Complete Testing Flow

### Test 1: Age Consent & Initial Load

1. Visit your app URL
2. **Expected:** Age consent screen appears
3. Check the checkbox
4. Click "Enter Clean Check"
5. **Expected:** Main app loads with payment section

✅ **Pass:** Age consent works, main app loads
❌ **Fail:** If stuck, check browser console for errors

---

### Test 2: Mandatory Fields Validation

1. Try clicking "Continue to Payment" button
2. **Expected:** Button is disabled (grayed out)
3. Enter only name, leave email empty
4. **Expected:** Button still disabled
5. Enter name: "Test User"
6. Enter email: "test@example.com"
7. **Expected:** Button becomes active (clickable)
8. Click "Continue to Payment"
9. **Expected:** PayPal payment section appears

✅ **Pass:** Form validation works correctly
❌ **Fail:** If button not disabled, check form code

---

### Test 3: Pricing Display

1. Check for "💳 Membership Pricing" box at top
2. **Expected:** Shows two pricing cards:
   - $39 Single Member
   - $69 Joint/Couple
3. **Expected:** "Universal membership" note below pricing

✅ **Pass:** Pricing clearly visible
❌ **Fail:** If missing, check QRCodeTab component

---

### Test 4: Recurring Payment Disclaimer

1. Scroll to "⚠️ Important Payment Information" section
2. **Expected:** See clear disclaimer with:
   - "RECURRING CHARGES" in bold red
   - 30-day explanation
   - Cancellation instructions
   - Non-refundable policy

✅ **Pass:** Disclaimer visible and clear
❌ **Fail:** Check QRCodeTab payment section

---

### Test 5: Membership Selection

1. Look for membership selection cards ($39 / $69)
2. Click on $39 card
3. **Expected:** Card shows red border (selected)
4. Click on $69 card
5. **Expected:** $69 card now has red border, $39 deselected

✅ **Pass:** Selection works, visual feedback correct
❌ **Fail:** Check button onClick handlers

---

### Test 6: PayPal Sandbox Payment (FREE TEST)

1. Click the PayPal button
2. **Expected:** PayPal popup window opens
3. **Use Sandbox Buyer Account:**
   - Email: (from your sandbox accounts)
   - Password: (from your sandbox accounts)
4. Log in to sandbox PayPal
5. **Expected:** See payment details ($39 or $69)
6. Review the subscription/payment
7. Click "Subscribe" or "Complete Purchase"
8. **Expected:** Popup closes
9. **Expected:** App shows "Payment successful! 🎉"
10. **Expected:** Profile creation section appears

✅ **Pass:** Payment flow works, no real money charged
❌ **Fail:** Check console logs and backend logs

---

### Test 7: Automatic Approval & Member ID

1. After payment success
2. **Expected:** Account status changes to "Active"
3. **Expected:** Toast notification shows success
4. Check email inbox (use sandbox email)
5. **Expected:** Welcome email with Member ID (6 digits)

✅ **Pass:** Auto-approval works, email sent
❌ **Fail:** Check backend logs for verification issues

---

### Test 8: Profile Creation

1. After approval, you should see profile form
2. Fill in:
   - Full Name
   - Upload photo (optional)
   - Add health document
   - Select status color
3. Click "Save Profile"
4. **Expected:** Profile saved successfully

✅ **Pass:** Profile creation works
❌ **Fail:** Check network tab for API errors

---

### Test 9: QR Code Generation

1. After profile saved
2. **Expected:** QR code appears
3. **Expected:** Can download QR code
4. **Expected:** QR code contains member ID

✅ **Pass:** QR generation works
❌ **Fail:** Check QR code library errors

---

### Test 10: Admin Panel Access

1. Navigate to `/admin`
2. Enter password: `admin123`
3. Click Login
4. **Expected:** Admin panel loads with 5 tabs

✅ **Pass:** Admin access works
❌ **Fail:** Check admin password in backend/.env

---

### Test 11: Admin - View Members

1. In admin panel, click "Members" tab
2. **Expected:** See your test user listed
3. **Expected:** Shows:
   - Member name
   - Email
   - Member ID (6 digits)
   - Payment status (confirmed)

✅ **Pass:** Members display correctly
❌ **Fail:** Check database connection

---

### Test 12: Admin - View Statistics

1. Click "Statistics" tab
2. **Expected:** See three stat cards:
   - Total Members: 1
   - Approved Members: 1
   - Pending Approvals: 0

✅ **Pass:** Stats accurate
❌ **Fail:** Check stats API endpoint

---

### Test 13: Sponsor Logo Management

1. In admin panel, click "Sponsor Logos" tab
2. Upload test image to Slot 1
3. **Expected:** Success message
4. **Expected:** Logo appears in slot
5. Go back to main app (/)
6. **Expected:** Logo shows in "Trusted By Community Sponsors"
7. Return to admin, remove logo
8. **Expected:** Logo disappears from main page

✅ **Pass:** Logo management works
❌ **Fail:** Check API endpoints and localStorage

---

### Test 14: Legal Disclaimer

1. Scroll to bottom of main app
2. **Expected:** Single "⚖️ LEGAL DISCLAIMER" section
3. **Expected:** Contains:
   - Service nature info
   - Sponsor protection (NO LIABILITY)
   - Hold harmless clause
4. **Expected:** NO duplicate disclaimers

✅ **Pass:** Single comprehensive disclaimer
❌ **Fail:** Check for duplicate sections

---

### Test 15: Verify Sandbox Payment in PayPal

1. Go to https://www.sandbox.paypal.com/
2. Log in with your **sandbox business account**
3. Go to "Activity"
4. **Expected:** See payment received ($39 or $69)
5. **Expected:** From your test buyer account
6. **Expected:** No real money involved

✅ **Pass:** Payment shows in sandbox
❌ **Fail:** Check PayPal credentials

---

### Test 16: Test Subscription Cancellation (If Configured)

**Note:** Only if you've set up subscription plans

1. Log into sandbox buyer account at https://www.sandbox.paypal.com/
2. Go to Settings → Payments → Manage automatic payments
3. Find "Clean Check" subscription
4. Click Cancel
5. **Expected:** Subscription cancelled
6. **Expected:** No future charges (all fake anyway)

✅ **Pass:** Cancellation works
❌ **Fail:** Check subscription setup

---

## Testing Checklist

Copy this checklist and mark as you test:

```
Phase 1: Basic Flow
[ ] Age consent works
[ ] Mandatory fields enforced
[ ] Pricing clearly displayed
[ ] Recurring disclaimer visible

Phase 2: Payment
[ ] Membership selection works
[ ] PayPal sandbox button loads
[ ] Can log into sandbox PayPal
[ ] Payment processes successfully (FREE)
[ ] Automatic approval works
[ ] Welcome email received

Phase 3: Profile & QR
[ ] Profile creation works
[ ] Can upload documents
[ ] QR code generates
[ ] QR code downloadable

Phase 4: Admin
[ ] Admin login works
[ ] Can view members
[ ] Statistics accurate
[ ] Sponsor logos work
[ ] Pending approvals show (if any)

Phase 5: Legal & Polish
[ ] Legal disclaimer present
[ ] No duplicate disclaimers
[ ] Universal membership mentioned
[ ] All UI elements styled correctly
```

---

## Common Issues & Solutions

### PayPal Button Not Loading

**Problem:** Blank space where button should be
**Solution:**
1. Check browser console for errors
2. Verify `PAYPAL_CLIENT_ID` in `.env`
3. Restart backend: `sudo supervisorctl restart backend`
4. Clear browser cache

### "Payment system not configured" Error

**Problem:** Can't proceed to payment
**Solution:**
1. Verify sandbox credentials in `.env`
2. Check `PAYPAL_MODE="sandbox"`
3. Test backend endpoint:
   ```bash
   curl https://your-app-url.com/api/payment/paypal/subscription-plans
   ```

### Payment Succeeds But Account Not Activated

**Problem:** Payment goes through but status doesn't update
**Solution:**
1. Check backend logs:
   ```bash
   tail -n 100 /var/log/supervisor/backend.err.log
   ```
2. Look for verification errors
3. Verify PayPal API is reachable from backend

### No Welcome Email Received

**Problem:** Payment succeeded but no email
**Solution:**
1. Check email configuration in backend
2. Check spam/junk folder
3. Verify email service is configured
4. Check backend logs for email errors

---

## Switching Back to Live Mode

**After testing is complete:**

1. Get your **LIVE** PayPal credentials
2. Update `/app/backend/.env`:
   ```env
   PAYPAL_MODE="live"
   PAYPAL_CLIENT_ID="your_live_client_id"
   PAYPAL_SECRET="your_live_secret"
   ```
3. Restart backend
4. **Test ONE MORE TIME in sandbox before going live!**

---

## Advanced Testing: Automated Script

Create `/app/test_complete_flow.sh`:

```bash
#!/bin/bash

echo "🧪 Clean Check Complete Flow Test"
echo "=================================="

# Test 1: Backend Health
echo "\n1. Testing backend health..."
curl -s https://your-app-url.com/api/payment/paypal/subscription-plans > /dev/null
if [ $? -eq 0 ]; then
  echo "✅ Backend responding"
else
  echo "❌ Backend not responding"
fi

# Test 2: Frontend Load
echo "\n2. Testing frontend..."
curl -s https://your-app-url.com > /dev/null
if [ $? -eq 0 ]; then
  echo "✅ Frontend loading"
else
  echo "❌ Frontend not loading"
fi

# Test 3: Admin Login
echo "\n3. Testing admin login..."
RESPONSE=$(curl -s -X POST https://your-app-url.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"admin123"}')
if [[ $RESPONSE == *"success"* ]]; then
  echo "✅ Admin login works"
else
  echo "❌ Admin login failed"
fi

echo "\n=================================="
echo "Manual testing required for:"
echo "- PayPal sandbox payment"
echo "- Profile creation"
echo "- QR code generation"
echo "- Admin panel features"
```

Make it executable:
```bash
chmod +x /app/test_complete_flow.sh
./test_complete_flow.sh
```

---

## Summary

✅ **Free Testing:** Use PayPal Sandbox - no real money
✅ **Complete Coverage:** Test all features end-to-end
✅ **Safe:** All payments are fake, no charges
✅ **Realistic:** Simulates real user experience
✅ **Admin Testing:** Full access to admin features
✅ **Repeatable:** Test as many times as needed

**Remember:** Always test in sandbox mode before going live with real payments!

---

## Need Help?

- **PayPal Sandbox Issues:** https://developer.paypal.com/docs/api-basics/sandbox/
- **Backend Logs:** `tail -f /var/log/supervisor/backend.err.log`
- **Frontend Logs:** Browser Developer Console (F12)
- **Database Check:** Use MongoDB shell or admin tools

Happy Testing! 🧪✅
