import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QRCodeTab from './QRCodeTab';
import ProfileManagementTab from './ProfileManagementTab';
import AgeConsent from './AgeConsent';
import BiometricSetup from './BiometricSetup';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CleanCheckApp = () => {
  const [membershipId, setMembershipId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consentGiven = localStorage.getItem('cleanCheckAgeConsent');
    if (consentGiven === 'true') {
      setHasConsented(true);
    }

    // Track site visit
    axios.post(`${API}/track-visit`, { page: window.location.pathname }).catch(err => {
      console.log('Failed to track visit:', err);
    });

    // Check if we have a membership ID in localStorage
    const storedId = localStorage.getItem('cleanCheckMembershipId');
    
    if (storedId) {
      setMembershipId(storedId);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  // Show age consent screen first
  if (!hasConsented) {
    return <AgeConsent onConsent={() => setHasConsented(true)} />;
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
    <div className="bg-gray-900 min-h-screen p-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-red-100">
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

        {/* Sponsors Section */}
        <div className="mt-6 p-3 rounded-lg bg-gray-50 border border-gray-200">
          <h4 className="text-xs font-semibold text-center text-gray-700 mb-2">
            This Month's Sponsors
          </h4>
          <div className="flex justify-around items-center space-x-2">
            {[1, 2, 3].map((num) => (
              <SponsorSlot key={num} slotNumber={num} />
            ))}
          </div>
          <p className="mt-2 text-xs text-center text-gray-500 italic">
            Support partners helping ensure safe and informed intimacy.
          </p>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-4 p-2 text-center text-xs text-gray-500">
          **Legal Disclaimer:** By using this service, the donor acknowledges and agrees that
          Clean Check is a peer-to-peer data sharing tool and not a medical or financial
          service provider. The donor releases Clean Check from all liability for any health,
          financial, or informational consequences resulting from the use or alteration of this
          service. All membership contributions are non-refundable and final.
        </div>
      </div>
    </div>
  );
};

// Sponsor Slot Component - READ ONLY for users
const SponsorSlot = ({ slotNumber }) => {
  const [logoSrc, setLogoSrc] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(`sponsorLogo${slotNumber}`);
    if (saved) {
      setLogoSrc(saved);
    }
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
