# PayPal Recurring Subscription Setup Guide

This guide will help you set up recurring monthly subscriptions for Clean Check memberships that automatically charge every 30 days.

## Why Subscriptions?

**Current Setup:** One-time payments (users pay once)
**New Setup:** Recurring subscriptions (users pay every 30 days automatically)

With subscriptions, members are automatically charged monthly until they cancel through their PayPal account.

---

## Step 1: Create Subscription Plans in PayPal

### Log into PayPal Business Account

1. Go to https://www.paypal.com/businessmanage/account/products
2. Click "Create Product or Plan"

### Create $39 Single Member Plan

1. **Product Type:** Select "Subscription"
2. **Product Name:** `Clean Check - Single Member`
3. **Product Description:** `Monthly subscription for single Clean Check membership with health verification and QR code access`
4. Click "Continue"

**Plan Details:**
- **Plan Name:** `Single Member - Monthly`
- **Billing Cycle:** Every 1 month
- **Price:** $39 USD
- **Setup Fee:** None
- **Trial Period:** None (instant activation)
- **Total Billing Cycles:** Until cancelled

**Advanced Settings:**
- **Auto Billing:** ON
- **Payment Failure:** Retry 3 times
- **Cancel After Failures:** Yes

5. Click "Save" and copy the **Plan ID** (format: P-XXXXXXXXXXXXXXXXXXXX)

### Create $69 Joint/Couple Plan

Repeat the above steps with:
- **Product Name:** `Clean Check - Joint/Couple`
- **Plan Name:** `Joint Member - Monthly`
- **Price:** $69 USD

Copy this **Plan ID** as well.

---

## Step 2: Add Plan IDs to Your Application

1. Open `/app/backend/.env`
2. Add your Plan IDs:

```env
PAYPAL_PLAN_ID_39="P-XXXXXXXXXXXXXXXXXXXX"
PAYPAL_PLAN_ID_69="P-YYYYYYYYYYYYYYYYYYYY"
```

Replace the X's and Y's with your actual Plan IDs from Step 1.

3. Save the file

---

## Step 3: Restart Backend

```bash
sudo supervisorctl restart backend
```

---

## Step 4: Test the Subscription

1. Visit your application
2. Complete age consent and enter name/email
3. Select a membership level ($39 or $69)
4. Click PayPal button
5. Complete subscription approval in PayPal popup
6. Verify account activates immediately
7. Check PayPal account shows active subscription

---

## How Members Cancel Subscriptions

Members must cancel through PayPal (not your app):

1. Log into PayPal account
2. Go to **Settings** → **Payments**
3. Click **Manage automatic payments**
4. Find "Clean Check" subscription
5. Click **Cancel**

**Important:** Cancellation stops future charges but does NOT refund current month.

---

## Subscription Lifecycle

### Active Subscription Flow:
```
Day 1: User subscribes → Charged $39/$69 → Account activated
Day 30: Auto-charge $39/$69 → Subscription renewed
Day 60: Auto-charge $39/$69 → Subscription renewed
...continues until cancelled
```

### Payment Failure Flow:
```
Payment fails → PayPal retries 3 times over 7 days
If still fails → Subscription cancelled → User loses access
```

---

## Backend Webhooks (Optional Advanced Setup)

For real-time subscription updates, set up PayPal webhooks:

### Events to Subscribe To:
1. `BILLING.SUBSCRIPTION.ACTIVATED` - User subscribed
2. `BILLING.SUBSCRIPTION.CANCELLED` - User cancelled
3. `BILLING.SUBSCRIPTION.SUSPENDED` - Payment failed
4. `BILLING.SUBSCRIPTION.EXPIRED` - Subscription ended
5. `PAYMENT.SALE.COMPLETED` - Monthly payment processed

### Webhook URL:
```
https://your-domain.com/api/webhooks/paypal/subscription
```

**Note:** Webhook implementation is optional. The current setup verifies subscriptions at activation time.

---

## Pricing Comparison

### One-Time Payment (Old):
- User pays once
- Manual renewal required
- High churn rate

### Subscription (New):
- Auto-charges every 30 days
- No manual renewal needed
- Lower churn, predictable revenue

---

## Testing Subscriptions

### Sandbox Testing (Recommended):
1. Create sandbox plans in PayPal Developer Dashboard
2. Use sandbox credentials in `.env`:
   ```env
   PAYPAL_MODE="sandbox"
   PAYPAL_CLIENT_ID="sandbox_client_id"
   PAYPAL_SECRET="sandbox_secret"
   PAYPAL_PLAN_ID_39="sandbox_plan_id_39"
   PAYPAL_PLAN_ID_69="sandbox_plan_id_69"
   ```
3. Test with sandbox buyer account
4. Verify subscription activates
5. Check sandbox seller dashboard for subscription

### Live Testing:
- Use your own PayPal account
- Subscribe to verify flow
- Cancel immediately if needed
- You'll be charged real money!

---

## Troubleshooting

### "Subscription plan not found"
- Verify Plan IDs are correct in `.env`
- Ensure Plan IDs match your PayPal mode (sandbox vs live)
- Check plans are "Active" in PayPal dashboard

### "Subscription not active"
- User may have cancelled during approval
- Payment method may have failed
- Check PayPal account for subscription status

### No recurring charges happening
- Verify Plan IDs are configured correctly
- Check if billing cycle is set to 30 days
- Review PayPal dashboard for subscription status

---

## Monitoring Subscriptions

### In PayPal Dashboard:
- View all active subscriptions
- See upcoming billing dates
- Monitor payment failures
- Track cancellations

### In Your Database:
```javascript
// Find users with active subscriptions
db.profiles.find({
  paymentStatus: "confirmed",
  paypalSubscriptionId: { $exists: true }
})

// Check subscription status
db.profiles.find({
  subscriptionStatus: "ACTIVE"
})
```

---

## Important Notes

1. **Plan IDs are Environment-Specific:**
   - Sandbox plans only work in sandbox mode
   - Live plans only work in live mode
   - Don't mix them!

2. **Subscription Modification:**
   - Cannot change subscription amount
   - User must cancel and re-subscribe at new price

3. **Refunds:**
   - Membership is non-refundable per terms
   - If issuing refund, manually process in PayPal

4. **Grace Period:**
   - Consider 3-day grace period for payment failures
   - Current setup: immediate access loss on failure

---

## Summary

Once setup is complete:

✅ Users automatically charged every 30 days
✅ No manual renewals needed
✅ Members can cancel anytime via PayPal
✅ Predictable recurring revenue
✅ Better user retention
✅ Professional subscription management

**Next Step:** Create your subscription plans in PayPal dashboard and add Plan IDs to `.env`!
