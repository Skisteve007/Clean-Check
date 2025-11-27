import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AgeConsent = ({ onConsent }) => {
  const [agreed, setAgreed] = useState(false);

  const handleEnter = () => {
    if (!agreed) {
      return;
    }
    localStorage.setItem('cleanCheckAgeConsent', 'true');
    onConsent();
  };

  const handleExit = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-4 border-red-600">
        <CardHeader className="text-center bg-red-600 text-white rounded-t-lg">
          <CardTitle className="text-3xl font-bold flex items-center justify-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zM10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>Clean Check</span>
          </CardTitle>
          <CardDescription className="text-white text-lg font-semibold mt-2">
            Age Verification Required
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          {/* Warning Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-5xl">⚠️</span>
            </div>
          </div>

          {/* Age Requirement */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">18+ Only</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              This application contains sensitive health information and is intended for adults only.
              You must be 18 years of age or older to use Clean Check.
            </p>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
            <h4 className="font-bold text-gray-800 mb-2">Terms of Service & Consent</h4>
            <ul className="text-xs text-gray-700 space-y-2 list-disc list-inside">
              <li>I confirm that I am 18 years of age or older</li>
              <li>I understand this is a peer-to-peer health information sharing platform</li>
              <li>Clean Check is not a medical or financial service provider</li>
              <li>I release Clean Check from all liability for health, financial, or informational consequences</li>
              <li>All membership contributions are non-refundable and final</li>
              <li>I agree to provide accurate and truthful health information</li>
              <li>I understand that sharing false information may have legal consequences</li>
            </ul>
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start space-x-3 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
            <Checkbox
              id="consent"
              checked={agreed}
              onCheckedChange={setAgreed}
              className="mt-1"
              data-testid="age-consent-checkbox"
            />
            <Label htmlFor="consent" className="text-sm font-semibold text-gray-800 cursor-pointer leading-tight">
              I am 18 years of age or older and I agree to the Terms of Service and Privacy Policy
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleExit}
              variant="outline"
              className="w-full"
              data-testid="exit-btn"
            >
              ❌ I'm Under 18 / Exit
            </Button>
            <Button
              onClick={handleEnter}
              variant="destructive"
              className="w-full"
              disabled={!agreed}
              data-testid="enter-btn"
            >
              ✅ Enter Clean Check
            </Button>
          </div>

          {/* Legal Notice */}
          <p className="text-center text-xs text-gray-500 italic">
            By clicking "Enter Clean Check", you acknowledge that you have read and agreed to our terms.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgeConsent;
