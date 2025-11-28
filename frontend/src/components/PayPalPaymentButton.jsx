import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PayPalPaymentButton = ({ membershipId, amount, onSuccess }) => {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Get PayPal Client ID from backend
    const fetchClientId = async () => {
      try {
        const response = await axios.get(`${API}/payment/paypal/client-id`);
        setClientId(response.data.clientId);
      } catch (error) {
        console.error('Failed to get PayPal Client ID:', error);
        toast.error('Payment system not configured');
      }
    };

    fetchClientId();
  }, []);

  useEffect(() => {
    if (!clientId || sdkLoaded) return;

    // Load PayPal SDK
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&enable-funding=venmo&currency=USD`;
    script.async = true;
    
    script.onload = () => {
      setSdkLoaded(true);
    };

    script.onerror = () => {
      toast.error('Failed to load PayPal SDK');
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [clientId, sdkLoaded]);

  useEffect(() => {
    if (!sdkLoaded || !window.paypal || processing) return;

    // Render PayPal buttons
    const container = document.getElementById(`paypal-button-container-${amount}`);
    if (!container || container.innerHTML) return;

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal'
      },
      
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: amount.toString(),
              currency_code: 'USD'
            },
            description: amount === 39 
              ? 'Clean Check Membership - Single ($39/month)' 
              : 'Clean Check Membership - Joint ($69/month)'
          }]
        });
      },

      onApprove: async (data, actions) => {
        setProcessing(true);
        
        try {
          // Payment completed on PayPal side
          toast.loading('Verifying payment...');
          
          // Verify payment with backend
          const response = await axios.post(`${API}/payment/paypal/verify`, {
            orderID: data.orderID,
            membershipId: membershipId
          });

          if (response.data.success) {
            toast.dismiss();
            toast.success('Payment successful! Your account is now active! 🎉');
            
            // Call onSuccess callback
            if (onSuccess) {
              onSuccess({
                membershipId: membershipId,
                assignedMemberId: response.data.assignedMemberId,
                amount: response.data.amount
              });
            }
          } else {
            toast.dismiss();
            toast.error('Payment verification failed');
            setProcessing(false);
          }
        } catch (error) {
          toast.dismiss();
          console.error('Payment verification error:', error);
          toast.error(error.response?.data?.detail || 'Payment verification failed');
          setProcessing(false);
        }
      },

      onError: (err) => {
        console.error('PayPal error:', err);
        toast.error('Payment failed. Please try again.');
        setProcessing(false);
      },

      onCancel: () => {
        toast.info('Payment cancelled');
        setProcessing(false);
      }
    }).render(`#paypal-button-container-${amount}`);
  }, [sdkLoaded, amount, membershipId, onSuccess, processing]);

  if (!clientId) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">Loading payment options...</p>
      </div>
    );
  }

  return (
    <div>
      <div id={`paypal-button-container-${amount}`} className="paypal-button-container"></div>
      {processing && (
        <div className="text-center mt-3">
          <p className="text-sm font-semibold text-blue-600">Processing payment...</p>
          <p className="text-xs text-gray-500">Please wait, do not close this page</p>
        </div>
      )}
    </div>
  );
};

export default PayPalPaymentButton;
