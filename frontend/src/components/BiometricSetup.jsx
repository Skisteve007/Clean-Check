import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { Fingerprint, Shield, Lock } from 'lucide-react';

const BiometricSetup = ({ membershipId }) => {
  const { isSupported, isEnabled, setupBiometric, disableBiometric } = useBiometricAuth();
  const [loading, setLoading] = useState(false);

  const handleEnableBiometric = async () => {
    setLoading(true);
    try {
      await setupBiometric(membershipId);
      toast.success('Biometric authentication enabled! You can now use Face ID/Touch ID to sign in quickly.');
    } catch (error) {
      if (error.message.includes('not supported')) {
        toast.error('Biometric authentication is not available on this device');
      } else if (error.name === 'NotAllowedError') {
        toast.error('Permission denied. Please try again.');
      } else {
        toast.error('Failed to setup biometric authentication');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisableBiometric = () => {
    disableBiometric();
    toast.success('Biometric authentication disabled');
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Card className="border-2 border-purple-400 bg-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center text-purple-800">
          <Fingerprint className="w-6 h-6 mr-2" />
          Biometric Sign-In
        </CardTitle>
        <CardDescription>
          Enable Face ID, Touch ID, or fingerprint for quick and secure access
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isEnabled ? (
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-purple-200">
              <Shield className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">Enhanced Security</p>
                <p className="text-xs text-gray-600">
                  Your biometric data stays on your device. We never store fingerprints or face scans.
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleEnableBiometric}
              variant="default"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? (
                'Setting up...'
              ) : (
                <>
                  <Fingerprint className="w-5 h-5 mr-2" />
                  Enable Biometric Sign-In
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-white text-xl">✓</span>
              </div>
              <div>
                <p className="font-semibold text-green-800">Biometric Enabled</p>
                <p className="text-xs text-green-600">Quick sign-in is active</p>
              </div>
            </div>

            <Button
              onClick={handleDisableBiometric}
              variant="outline"
              className="w-full border-red-300 text-red-700 hover:bg-red-50"
            >
              <Lock className="w-4 h-4 mr-2" />
              Disable Biometric Sign-In
            </Button>
          </div>
        )}

        <p className="mt-3 text-xs text-gray-500 text-center">
          Use your device's biometric features for faster access while maintaining security.
        </p>
      </CardContent>
    </Card>
  );
};

export default BiometricSetup;
