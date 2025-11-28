import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const InitialPayment = ({ onPaymentSubmitted }) => {
  const [loading, setLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    email: '',
    paymentMethod: '',
    amount: '',
    transactionId: '',
    notes: ''
  });

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!paymentForm.email || !paymentForm.paymentMethod || !paymentForm.amount) {
      toast.error('Please fill in email, payment method, and amount');
      return;
    }

    setLoading(true);

    try {
      // Create a basic profile with email to get membershipId
      const profileResponse = await axios.post(`${API}/profiles`, {
        name: 'Pending Member',
        email: paymentForm.email,
        photo: ''
      });

      const membershipId = profileResponse.data.membershipId;
      localStorage.setItem('cleanCheckMembershipId', membershipId);

      // Submit payment confirmation
      await axios.post(`${API}/payment/confirm`, {
        membershipId,
        paymentMethod: paymentForm.paymentMethod,
        amount: paymentForm.amount,
        transactionId: paymentForm.transactionId,
        notes: paymentForm.notes
      });

      toast.success('Payment confirmation submitted! Awaiting admin verification (up to 10 minutes).');
      
      // Notify parent component
      if (onPaymentSubmitted) {
        onPaymentSubmitted(membershipId);
      }
    } catch (error) {
      toast.error('Failed to submit payment confirmation. Please try again.');
      console.error('Payment submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-yellow-400 bg-yellow-50" data-testid="initial-payment-card">
      <CardHeader>
        <CardTitle className="text-yellow-800">💳 Step 1: Complete Payment First</CardTitle>
        <CardDescription>
          Please make your payment and confirm below to unlock profile creation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Your Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={paymentForm.email}
              onChange={(e) => setPaymentForm({ ...paymentForm, email: e.target.value })}
              required
            />
            <p className="text-xs text-gray-600 mt-1">We'll use this to create your membership account</p>
          </div>

          <div>
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <Select
              value={paymentForm.paymentMethod}
              onValueChange={(value) =>
                setPaymentForm({ ...paymentForm, paymentMethod: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PayPal">PayPal</SelectItem>
                <SelectItem value="Venmo">Venmo</SelectItem>
                <SelectItem value="CashApp">Cash App</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount Paid *</Label>
            <Select
              value={paymentForm.amount}
              onValueChange={(value) => setPaymentForm({ ...paymentForm, amount: value })}
            >
              <SelectTrigger id="amount">
                <SelectValue placeholder="Select amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="$39">$39 - Single Membership</SelectItem>
                <SelectItem value="$69">$69 - Combined/Joint Membership</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
            <Input
              id="transactionId"
              type="text"
              placeholder="e.g., PayPal transaction ID or Venmo transaction ID"
              value={paymentForm.transactionId}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, transactionId: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information..."
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg">
            <p className="text-xs text-blue-800 font-semibold">
              ⏱️ Verification Time: Allow up to 10 minutes for admin to confirm your payment. 
              You'll then be able to create your donor profile.
            </p>
          </div>

          <Button
            type="submit"
            variant="default"
            className="w-full bg-yellow-600 hover:bg-yellow-700"
            disabled={loading}
            data-testid="submit-payment-btn"
          >
            {loading ? 'Submitting...' : 'I Made Payment - Confirm'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InitialPayment;
