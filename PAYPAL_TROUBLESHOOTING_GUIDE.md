# 🔧 PayPal Button Troubleshooting Guide

## Issue: PayPal Button Appears Broken or Doesn't Open

If you're experiencing issues with the PayPal button not working or appearing "broken," here are the most common causes and solutions:

---

## 🎯 Most Common Issue: **Popup Blocker**

### **Symptoms:**
- Click PayPal button, nothing happens
- Brief flash but no PayPal window opens
- See message "Don't see the secure paypal browser?"

### **Solution:**
1. **Allow Popups for Your Site**
   - Look for popup blocker icon in address bar (usually shows as 🚫 or popup icon)
   - Click it and select "Always allow popups from this site"
   - Refresh the page and try again

2. **Browser-Specific Instructions:**

**Chrome:**
- Click the popup blocker icon in address bar (right side)
- Select "Always allow pop-ups and redirects from [your-site]"
- Or go to Settings → Privacy and security → Site Settings → Pop-ups and redirects → Allow

**Firefox:**
- Click the shield icon in address bar
- Turn off "Enhanced Tracking Protection" for this site
- Or go to Preferences → Privacy & Security → Permissions → Block pop-up windows → Exceptions

**Safari:**
- Safari → Preferences → Websites → Pop-up Windows
- Find your site and set to "Allow"

**Edge:**
- Click the popup icon in address bar
- Select "Always allow"
- Or Settings → Cookies and site permissions → Pop-ups and redirects → Allow

---

## 🔴 **CRITICAL: Sandbox Mode vs Live Mode**

### **Current Status: SANDBOX MODE (Test Payments)**

Your application is currently in **SANDBOX MODE**, which means:

❌ **Your regular PayPal account will NOT work**
❌ **Real payments will NOT be processed**  
✅ **Only Sandbox test accounts will work**
✅ **All transactions are fake (no real money)**

### **Why You Can't Use Your Real PayPal Account:**

Sandbox mode uses completely separate PayPal accounts specifically for testing. Your regular PayPal email and password will be rejected.

### **How to Test in Sandbox Mode:**

1. Get your Sandbox test buyer credentials:
   - Go to https://developer.paypal.com/dashboard/
   - Click "Sandbox" → "Accounts"
   - Find your "Personal" test account
   - Note the email and click to view password

2. Use these test credentials when the PayPal popup opens

3. Complete the test payment (uses fake money)

### **How to Switch to LIVE Mode (Accept Real Payments):**

**Option 1: Use the Script**
```bash
bash /app/switch_to_live.sh
```
Follow the prompts to enter your LIVE PayPal credentials.

**Option 2: Manual Update**
1. Open `/app/backend/.env`
2. Change `PAYPAL_MODE="sandbox"` to `PAYPAL_MODE="live"`
3. Update `PAYPAL_CLIENT_ID` with your LIVE client ID
4. Update `PAYPAL_SECRET` with your LIVE secret
5. Create LIVE subscription plans (see guide below)
6. Restart backend: `sudo supervisorctl restart backend`

---

## 🌐 **Network/Connectivity Issues**

### **Symptoms:**
- PayPal button doesn't load at all
- See "Loading payment options..." that never finishes
- Console shows network errors

### **Solutions:**

1. **Check Internet Connection**
   - Ensure stable internet connection
   - Try refreshing the page

2. **Check Backend is Running**
   ```bash
   sudo supervisorctl status backend
   ```
   Should show "RUNNING"

3. **Check PayPal API Endpoint**
   ```bash
   curl https://qrhealth-1.preview.emergentagent.com/api/payment/paypal/subscription-plans
   ```
   Should return JSON with clientId and plans

4. **Clear Browser Cache**
   - Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache completely

---

## 🔍 **Testing the PayPal Button**

### **Step-by-Step Test:**

1. **Open Browser Console** (F12)
2. **Navigate to your app**
3. **Complete age consent**
4. **Fill name and email**
5. **Click "Continue to Payment"**
6. **Wait for PayPal button to appear** (gold button with PayPal logo)
7. **Check console for errors** (look for red text)
8. **Click the PayPal button**
9. **Allow popups if prompted**
10. **PayPal window should open**

### **What Should Happen:**

✅ PayPal popup window opens
✅ Shows PayPal login screen
✅ Can log in with Sandbox account (if in sandbox mode)
✅ Can subscribe to plan
✅ Popup closes, account activates

### **If Nothing Happens:**

1. Check console for errors
2. Allow popups for the site
3. Verify you're using correct PayPal mode (sandbox test account or live account)
4. Try a different browser
5. Disable browser extensions that might block PayPal

---

## 🐛 **Common Error Messages**

### **"Payment system not configured"**
- **Cause:** Backend can't reach PayPal API or credentials are missing
- **Fix:** Check `.env` file has `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET`

### **"Failed to load PayPal SDK"**
- **Cause:** Network issue or PayPal servers unreachable
- **Fix:** Check internet connection, try again in a few minutes

### **"Subscription plan not found"**
- **Cause:** Plan IDs in `.env` are incorrect or missing
- **Fix:** Verify `PAYPAL_PLAN_ID_39` and `PAYPAL_PLAN_ID_69` are set correctly

### **"Invalid client credentials"**
- **Cause:** Client ID or Secret is wrong for the current mode
- **Fix:** Verify you're using SANDBOX credentials for sandbox mode, or LIVE credentials for live mode

---

## 📊 **Debugging Checklist**

Copy and check off as you troubleshoot:

```
[ ] Popup blocker disabled for this site
[ ] Using correct PayPal account type (Sandbox test account if in sandbox mode)
[ ] Internet connection is stable
[ ] Backend service is running
[ ] PayPal API endpoint returns valid data
[ ] Browser console shows no errors
[ ] Tried in a different browser
[ ] Cleared browser cache
[ ] Disabled browser extensions
[ ] PayPal button appears (gold with PayPal logo)
[ ] Can see PayPal iframes loading (2 iframes)
```

---

## 🆘 **Still Not Working?**

### **Collect This Information:**

1. **Browser & Version:** (e.g., Chrome 120, Firefox 115)
2. **PayPal Mode:** Sandbox or Live?
3. **Console Errors:** (F12 → Console tab, copy any red errors)
4. **Network Tab:** (F12 → Network tab, check for failed requests)
5. **What Happens:** Describe exactly what you see when clicking PayPal button

### **Advanced Debugging:**

**Check Backend Logs:**
```bash
tail -n 100 /var/log/supervisor/backend.err.log
```

**Test PayPal Configuration:**
```bash
curl -s https://qrhealth-1.preview.emergentagent.com/api/payment/paypal/subscription-plans | python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin), indent=2))"
```

**Verify PayPal Mode:**
```bash
cat /app/backend/.env | grep PAYPAL
```

---

## 💡 **Quick Fixes Summary**

| Problem | Quick Fix |
|---------|-----------|
| Button doesn't open PayPal | Allow popups in browser |
| "Wrong account" error | Use Sandbox test account (sandbox mode) or real account (live mode) |
| Button doesn't load | Check backend is running, verify internet connection |
| "Plan not found" | Verify Plan IDs in `.env` |
| Works in test but not live | Switch to live mode with correct credentials |

---

## ✅ **Expected Behavior**

When everything is working correctly:

1. ✅ Age consent → Main app loads
2. ✅ Fill name/email → Continue button activates
3. ✅ Click Continue → Payment section shows
4. ✅ Select price ($39 or $69) → Box highlights
5. ✅ PayPal button appears (gold with PayPal logo)
6. ✅ Click PayPal button → Popup opens immediately
7. ✅ Log in with correct account type
8. ✅ Subscribe → Popup closes
9. ✅ "Subscription activated!" message
10. ✅ Account active, can create profile

---

## 📞 **Resources**

- **Sandbox Testing Guide:** `/app/SANDBOX_TESTING_INSTRUCTIONS.md`
- **Subscription Setup:** `/app/PAYPAL_SUBSCRIPTION_SETUP_GUIDE.md`
- **Complete Testing Guide:** `/app/TESTING_GUIDE_FREE.md`
- **Setup Summary:** `/app/SETUP_COMPLETE.md`

---

_Last Updated: 2025-11-28_
_Current Mode: SANDBOX (Test Payments Only)_
