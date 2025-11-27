import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WaitingScreen = ({ membershipId, userEmail }) => {
  const [status, setStatus] = useState('in_review');
  const [assignedMemberId, setAssignedMemberId] = useState('');
  const [checkCount, setCheckCount] = useState(0);

  useEffect(() => {
    // Check status every 30 seconds
    const interval = setInterval(() => {
      checkApprovalStatus();
    }, 30000);

    // Initial check
    checkApprovalStatus();

    return () => clearInterval(interval);
  }, [membershipId]);

  const checkApprovalStatus = async () => {
    try {
      const response = await axios.get(`${API}/profiles/${membershipId}`);
      const profile = response.data;
      
      if (profile.userStatus === 3) {
        // Approved!
        setStatus('approved');
        setAssignedMemberId(profile.assignedMemberId || '');
        // Force page reload to update main app state
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else if (profile.paymentStatus === 'rejected') {
        setStatus('rejected');
      }
      
      setCheckCount(prev => prev + 1);
    } catch (error) {
      console.error('Error checking approval status:', error);
    }
  };

  if (status === 'approved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-4 border-green-500 shadow-2xl animate-bounce-slow">
          <CardHeader className="text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg p-8">
            <div className="mb-4">
              <span className="text-7xl">🎉</span>
            </div>
            <CardTitle className="text-4xl font-bold">Payment Confirmed!</CardTitle>
            <p className="text-green-100 mt-2 text-lg">Welcome to Clean Check</p>
          </CardHeader>
          
          <CardContent className="p-8 text-center space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-inner border-2 border-green-300">
              <p className="text-gray-600 text-sm mb-2">Your Official Member ID</p>
              <h2 className="text-5xl font-bold text-red-600 tracking-wider">{assignedMemberId}</h2>
              <p className="text-gray-500 text-xs mt-2">Save this ID for your records</p>
            </div>
            
            <div className="bg-emerald-50 p-6 rounded-lg border-2 border-emerald-300">
              <p className="text-emerald-900 font-semibold text-lg mb-3">
                ✨ You can now complete your profile!
              </p>
              <p className="text-emerald-700 text-sm">
                Redirecting you to profile creation in a few seconds...
              </p>
            </div>
            
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-green-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-4 border-red-500 shadow-2xl">
          <CardHeader className="text-center bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-t-lg p-8">
            <div className="mb-4">
              <span className="text-7xl">❌</span>
            </div>
            <CardTitle className="text-4xl font-bold">Payment Issue</CardTitle>
          </CardHeader>
          
          <CardContent className="p-8 text-center space-y-6">
            <p className="text-gray-700 text-lg">
              Unfortunately, we couldn't verify your payment at this time.
            </p>
            
            <div className="bg-red-50 p-6 rounded-lg border-2 border-red-300">
              <p className="text-red-900 font-semibold mb-2">What to do next:</p>
              <ul className="text-red-700 text-sm space-y-2 text-left max-w-md mx-auto">
                <li>• Check that your payment was successfully sent</li>
                <li>• Contact support at pitbossent@gmail.com</li>
                <li>• Include your membership ID: {membershipId}</li>
              </ul>
            </div>
            
            <Button 
              onClick={() => window.location.href = 'mailto:pitbossent@gmail.com'}
              className="bg-red-600 hover:bg-red-700"
            >
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // In Review - Waiting
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-4 border-yellow-400 shadow-2xl">
        <CardHeader className="text-center bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg p-8">
          <div className="mb-4 animate-pulse">
            <span className="text-7xl">⏳</span>
          </div>
          <CardTitle className="text-4xl font-bold">Payment Verification in Progress</CardTitle>
          <p className="text-yellow-100 mt-2 text-lg">Please wait while we confirm your payment</p>
        </CardHeader>
        
        <CardContent className="p-8 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md border-2 border-yellow-300">
            <h3 className="font-bold text-gray-800 text-xl mb-4 flex items-center justify-center">
              <span className="text-3xl mr-3">📋</span>
              What's Happening Now
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl flex-shrink-0">✅</span>
                <div>
                  <p className="font-semibold text-gray-800">Payment Submitted</p>
                  <p className="text-sm text-gray-600">Your payment information has been received</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-2xl flex-shrink-0 animate-pulse">🔄</span>
                <div>
                  <p className="font-semibold text-yellow-700">Admin Verification</p>
                  <p className="text-sm text-gray-600">Our team is verifying your payment right now</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-2xl flex-shrink-0 opacity-40">⏰</span>
                <div>
                  <p className="font-semibold text-gray-400">Profile Access</p>
                  <p className="text-sm text-gray-400">Unlocks after verification (next step)</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-300">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-blue-900 font-bold text-lg">Verification Time</p>
            </div>
            <p className="text-blue-700 text-center text-xl font-semibold">Up to 10 minutes</p>
            <p className="text-blue-600 text-center text-sm mt-2">Usually much faster!</p>
          </div>
          
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-300">
            <p className="text-yellow-900 font-semibold text-center mb-2">
              📧 What Happens Next?
            </p>
            <p className="text-yellow-800 text-sm text-center">
              You'll receive an email at <strong>{userEmail}</strong> with your Member ID once approved. 
              You can also stay on this page - it will automatically update!
            </p>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={checkApprovalStatus}
              variant="outline"
              className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
            >
              <span className="mr-2">🔄</span>
              Check Status Now
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Auto-checking every 30 seconds (Checked {checkCount} times)
            </p>
          </div>
          
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-500 text-xs">
              Need help? Contact support at pitbossent@gmail.com<br/>
              Your Membership ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{membershipId}</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitingScreen;
