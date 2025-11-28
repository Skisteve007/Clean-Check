import React, { useState, useEffect } from 'react';
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

const PaymentWorkflow = ({ membershipId, onStatusChange }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: '',
    amount: '',
    transactionId: '',
    notes: ''
  });
  const [documentFile, setDocumentFile] = useState(null);

  useEffect(() => {
    if (membershipId) {
      loadStatus();
    }
  }, [membershipId]);

  const loadStatus = async () => {
    try {
      const response = await axios.get(`${API}/profile/status/${membershipId}`);
      setStatus(response.data);
      if (onStatusChange) {
        onStatusChange(response.data);
      }
    } catch (error) {
      console.error('Error loading status:', error);
    }
  };

  const handlePaymentConfirm = async (e) => {
    e.preventDefault();

    if (!paymentForm.paymentMethod || !paymentForm.amount) {
      toast.error('Please fill in payment method and amount');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API}/payment/confirm`, {
        membershipId,
        ...paymentForm
      });

      toast.success('Payment confirmation submitted! Awaiting admin confirmation.');
      loadStatus();
      setPaymentForm({ paymentMethod: '', amount: '', transactionId: '', notes: '' });
    } catch (error) {
      toast.error('Failed to submit payment confirmation');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async () => {
    if (!documentFile) {
      toast.error('Please select a document to upload');
      return;
    }

    setLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result;

        await axios.post(`${API}/document/upload`, {
          membershipId,
          documentData: base64Data,
          documentType: documentFile.type
        });

        toast.success('Document uploaded! QR code is now available.');
        setDocumentFile(null);
        loadStatus();
      };
      reader.readAsDataURL(documentFile);
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  // Status: Pending - Need to confirm payment
  if (!status || status.paymentStatus === 'pending') {
    return (
      <div className="text-center my-6">
        <Button
          onClick={handlePaymentConfirm}
          variant="default"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg transform transition hover:scale-105"
          disabled={loading}
          data-testid="confirm-payment-btn"
        >
          {loading ? (
            <span className="flex items-center space-x-2">
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              <span>Submitting...</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <span className="text-2xl">✅</span>
              <span>I Made Payment</span>
            </span>
          )}
        </Button>
        <p className="text-xs text-gray-600 mt-3">
          Click after you've completed your payment via PayPal or Venmo
        </p>
      </div>
    );
  }

  // Status: Pending Confirmation - Waiting for admin
  if (status.paymentStatus === 'pending_approval') {
    return (
      <Card className="border-2 border-blue-400 bg-blue-50" data-testid="payment-pending-approval-card">
        <CardHeader>
          <CardTitle className="text-blue-800">⏳ Awaiting Admin Confirmation</CardTitle>
          <CardDescription>
            Your payment confirmation has been submitted. Admin will review and confirm shortly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Please wait for admin confirmation...</p>
              <Button
                onClick={loadStatus}
                variant="outline"
                className="mt-4"
                data-testid="refresh-status-btn"
              >
                Refresh Status
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Status: Rejected
  if (status.paymentStatus === 'rejected') {
    return (
      <Card className="border-2 border-red-400 bg-red-50" data-testid="payment-rejected-card">
        <CardHeader>
          <CardTitle className="text-red-800">❌ Payment Rejected</CardTitle>
          <CardDescription>
            Your payment confirmation was rejected. Please contact admin or resubmit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => {
              setStatus({ ...status, paymentStatus: 'pending' });
            }}
            variant="destructive"
            className="w-full"
          >
            Resubmit Payment Confirmation
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Status: Confirmed - Can upload document
  if (status.paymentStatus === 'confirmed' && !status.documentUploaded) {
    return (
      <Card className="border-2 border-green-400 bg-green-50" data-testid="document-upload-card">
        <CardHeader>
          <CardTitle className="text-green-800">✅ Payment Confirmed!</CardTitle>
          <CardDescription>Upload your health document to unlock QR code</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="documentUpload">Upload Health Document (PDF, JPG, PNG)</Label>
              <Input
                id="documentUpload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setDocumentFile(e.target.files[0])}
                className="mt-2"
                data-testid="document-file-input"
              />
              {documentFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {documentFile.name} ({(documentFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <Button
              onClick={handleDocumentUpload}
              variant="default"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading || !documentFile}
              data-testid="upload-document-btn"
            >
              {loading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Status: Document uploaded and QR code enabled
  if (status.qrCodeEnabled) {
    return (
      <Card className="border-2 border-purple-400 bg-purple-50" data-testid="qr-enabled-card">
        <CardHeader>
          <CardTitle className="text-purple-800">🎉 All Set!</CardTitle>
          <CardDescription>
            Your payment is confirmed and document is uploaded. QR code is ready!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-green-600 mx-auto mb-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <p className="text-lg font-bold text-gray-800">QR Code Enabled</p>
              <p className="text-sm text-gray-600">You can now generate and share your QR code</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default PaymentWorkflow;
