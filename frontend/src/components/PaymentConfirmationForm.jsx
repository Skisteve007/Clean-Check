import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PaymentConfirmationForm = ({ onConfirmationSubmitted }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error('Please enter your name and email');
      return;
    }

    setLoading(true);

    try {
      // Create a basic profile with name and email
      const profileResponse = await axios.post(`${API}/profiles`, {
        name: formData.name,
        email: formData.email,
        photo: ''
      });

      const membershipId = profileResponse.data.membershipId;
      localStorage.setItem('cleanCheckMembershipId', membershipId);

      // Submit payment confirmation
      await axios.post(`${API}/payment/confirm`, {
        membershipId: membershipId,
        paymentMethod: 'PayPal/Venmo',
        amount: 'To be verified'
      });

      toast.success('Payment confirmation submitted! Awaiting admin verification (up to 5 minutes).');
      
      // Notify parent component
      if (onConfirmationSubmitted) {
        onConfirmationSubmitted(membershipId, formData.email);
      }
    } catch (error) {
      toast.error('Failed to submit confirmation. Please try again.');
      console.error('Payment confirmation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-green-500 bg-green-50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-green-800 text-center flex items-center justify-center">
          <span className="text-2xl mr-2">✅</span>
          Confirm Your Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-700 font-semibold">
              Your Full Name *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="border-green-300 focus:border-green-500"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-gray-700 font-semibold">
              Your Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="border-green-300 focus:border-green-500"
            />
            <p className="text-xs text-gray-600 mt-1">
              We'll send your membership confirmation to this email
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 text-lg shadow-lg transform transition hover:scale-105"
              disabled={loading}
              data-testid="submit-confirmation-btn"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  <span>Submitting...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span className="text-2xl">✅</span>
                  <span>I Made Payment - Confirm</span>
                </span>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-gray-600 mt-2">
            By confirming, you acknowledge you've completed payment via PayPal or Venmo
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentConfirmationForm;
