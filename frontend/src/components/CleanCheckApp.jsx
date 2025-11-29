import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QRCodeTab from './QRCodeTab';
import ProfileManagementTab from './ProfileManagementTab';
import AgeConsent from './AgeConsent';
import BiometricSetup from './BiometricSetup';
import Footer from './Footer';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CleanCheckApp = () => {
  const [membershipId, setMembershipId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasConsented, setHasConsented] = useState(false);
  const { isSupported, authenticateWithBiometric } = useBiometricAuth();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    // Check for reset parameter (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reset') === 'true') {
      localStorage.clear();
      window.location.href = window.location.pathname;
      return;
    }

    // Check if user has already consented
    const consentGiven = localStorage.getItem('cleanCheckAgeConsent');
    if (consentGiven === 'true') {
      setHasConsented(true);
    } else {
      // Explicitly set to false if not present to ensure consent screen shows
      setHasConsented(false);
    }

    // Track site visit
    axios.post(`${API}/track-visit`, { page: window.location.pathname }).catch(err => {
      console.log('Failed to track visit:', err);
    });

    // Try biometric authentication first if supported and enabled
    if (isSupported) {
      try {
        const biometricId = await authenticateWithBiometric();
        if (biometricId) {
          setMembershipId(biometricId);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log('Biometric auth skipped or failed:', error);
      }
    }

    // Fallback to regular localStorage check
    const storedId = localStorage.getItem('cleanCheckMembershipId');
    
    if (storedId) {
      setMembershipId(storedId);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  // Show age consent screen first - always check before showing any content
  if (!loading && !hasConsented) {
    return <AgeConsent onConsent={() => setHasConsented(true)} />;
  }

  // Show loading only briefly during initialization
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Clean Check...</p>
        </div>
      </div>
    );
  }

  const createMembershipId = async (name, email, photo) => {
    try {
      const response = await axios.post(`${API}/profiles`, {
        name: name,
        email: email,
        photo: photo || ''
      });
      
      const newId = response.data.membershipId;
      localStorage.setItem('cleanCheckMembershipId', newId);
      setMembershipId(newId);
      
      return newId;
    } catch (error) {
      console.error('Error creating membership ID:', error);
      return null;
    }
  };

  const updateMembershipProfile = async (name, photo) => {
    if (!membershipId) return;
    
    try {
      await axios.put(`${API}/profiles/${membershipId}`, {
        name: name,
        photo: photo || ''
      });
    } catch (error) {
      console.error('Error updating membership profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen p-2 sm:p-4 flex items-center justify-center overflow-x-hidden">
      <div className="w-full max-w-md bg-white p-4 sm:p-8 rounded-xl shadow-2xl border border-red-100">
        {/* Header */}
        <div className="mb-4 flex items-center justify-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-red-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zM10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <h1 className="text-3xl font-bold text-red-600">Clean Check</h1>
        </div>

        {/* Mission Statement */}
        <div className="p-3 mb-6 rounded-lg bg-red-600 shadow-lg">
          <p className="text-center font-semibold text-white text-sm">
            Elevating Intimacy through Verified Transparency and Mutual Trust.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="qr" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="qr" data-testid="tab-qr">QR Code</TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="qr" className="mt-0">
            <QRCodeTab
              membershipId={membershipId}
              createMembershipId={createMembershipId}
              updateMembershipProfile={updateMembershipProfile}
            />
          </TabsContent>

          <TabsContent value="profile" className="mt-0">
            <ProfileManagementTab
              membershipId={membershipId}
              createMembershipId={createMembershipId}
            />
          </TabsContent>
        </Tabs>

        {/* Important Payment Information */}
        <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
          <p className="text-sm font-bold text-yellow-900 mb-2">⚠️ Important Payment Information:</p>
          <ul className="text-xs text-gray-800 space-y-2 text-left">
            <li>
              <strong className="text-red-600">• RECURRING CHARGES:</strong> This is a subscription that automatically charges 
              every 30 days from your initial payment date. Your membership will renew monthly unless you cancel.
            </li>
            <li>
              <strong>• How to Cancel:</strong> You must cancel through PayPal by going to your PayPal account → 
              Settings → Payments → Manage automatic payments → Cancel Clean Check subscription.
            </li>
            <li>
              <strong>• Non-Refundable:</strong> All membership contributions are non-refundable and final once processed.
            </li>
            <li>
              <strong>• Instant Activation:</strong> Your account activates immediately upon first payment.
            </li>
            <li>• Venmo option available on mobile devices</li>
          </ul>
        </div>

        {/* Combined Legal Disclaimer */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
          <h4 className="text-xs font-bold text-gray-800 mb-2 text-center">⚖️ LEGAL DISCLAIMER</h4>
          <div className="text-xs text-gray-700 space-y-2">
            <p>
              <strong>By using Clean Check, you acknowledge and agree that:</strong>
            </p>
            
            {/* Clean Check Service Nature */}
            <p>
              <strong>Service Nature:</strong> Clean Check is a peer-to-peer data sharing tool and not a medical or financial
              service provider. The donor releases Clean Check from all liability for any health,
              financial, or informational consequences resulting from the use or alteration of this
              service. All membership contributions are <strong>non-refundable and final</strong>.
            </p>
            
            {/* Sponsor Protection */}
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Platform Sponsors and Partners:</strong> All sponsors, advertisers, and supporting partners of Clean Check 
                (collectively "Sponsors") are held with <strong>NO LIABILITY</strong> for any health, financial, informational, 
                or other consequences resulting from your use of this service.
              </li>
              <li>
                <strong>Health Decisions:</strong> Neither Clean Check nor Sponsors are responsible for any health-related outcomes, medical conditions, 
                infections, or diseases that may result from interactions facilitated through this platform.
              </li>
              <li>
                <strong>Financial Matters:</strong> Neither Clean Check nor Sponsors bear responsibility for membership fees, payment processing issues, 
                refund disputes, or any financial losses incurred.
              </li>
              <li>
                <strong>Information Accuracy:</strong> Neither Clean Check nor Sponsors are liable for the accuracy, completeness, or reliability of 
                information shared by users, including health status, test results, or personal data.
              </li>
              <li>
                <strong>Independent Service:</strong> Sponsors provide advertising or financial support only and are completely 
                separate from the operation, management, and content of Clean Check. Their participation does not constitute 
                endorsement of user behavior or platform practices.
              </li>
            </ul>
            
            <p className="mt-3 font-semibold text-gray-900">
              You agree to hold harmless and indemnify Clean Check, its operators, and all Sponsors from any claims, damages, 
              or liabilities arising from your use of this service. Use at your own risk.
            </p>
          </div>
        </div>
      </div>

      {/* Footer - Visible on all pages */}
      <Footer />
    </div>
  );
};

// Sponsor Slot Component - READ ONLY for users (REMOVED - sponsors now only in QRCodeTab SecuritySeals)
const SponsorSlot = ({ slotNumber }) => {
  const [logoSrc, setLogoSrc] = useState(null);

  useEffect(() => {
    const loadSponsorLogos = async () => {
      try {
        const response = await axios.get(`${API}/sponsors`);
        const logos = response.data;
        if (logos[slotNumber]) {
          setLogoSrc(logos[slotNumber]);
        }
      } catch (error) {
        console.error('Error loading sponsor logos:', error);
        // Fallback to localStorage if API fails
        const saved = localStorage.getItem(`sponsorLogo${slotNumber}`);
        if (saved) {
          setLogoSrc(saved);
        }
      }
    };

    loadSponsorLogos();
  }, [slotNumber]);

  const colors = [
    'bg-yellow-50 border-yellow-300',
    'bg-green-50 border-green-300',
    'bg-blue-50 border-blue-300'
  ];

  return (
    <div className="w-1/3 p-1 flex justify-center">
      <div
        className={`sponsor-slot border ${colors[slotNumber - 1]}`}
        data-testid={`sponsor-slot-${slotNumber}`}
      >
        <img
          src={logoSrc || `https://placehold.co/150x60/${slotNumber === 1 ? 'fef3c7/a16207' : slotNumber === 2 ? 'd1fae5/065f46' : 'e0e7ff/3730a3'}?text=Logo+${slotNumber}`}
          alt={`Sponsor ${slotNumber} Logo`}
          onError={(e) => {
            e.target.src = `https://placehold.co/150x60/cccccc/666666?text=Logo+${slotNumber}`;
          }}
        />
      </div>
    </div>
  );
};

export default CleanCheckApp;
