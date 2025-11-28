import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import PaymentWorkflow from './PaymentWorkflow';
import InitialPayment from './InitialPayment';
import WaitingScreen from './WaitingScreen';
import ReferencesSearch from './ReferencesSearch';

const QRCodeTab = ({ membershipId, createMembershipId, updateMembershipProfile }) => {
  const [urlInput, setUrlInput] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [localProfile, setLocalProfile] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [isPartnerView, setIsPartnerView] = useState(false);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [userStatus, setUserStatus] = useState(null); // 0=Guest, 1=Pending_Payment, 2=In_Review, 3=Approved
  const [userEmail, setUserEmail] = useState('');
  const fileInputRef = useRef(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    currentHome: '',
    secondHome: '',
    birthdayDay: '',
    birthdayMonth: '',
    birthdayYear: '',
    sex: '',
    photo: '',
    galleryPhotos: [],
    relationshipStatus: '',
    sexualOrientation: '',
    partnerPreferences: [],
    isCovidVaccinated: false,
    instagramUrl: '',
    tiktokUrl: '',
    facebookUrl: '',
    onlyFansUrl: '',
    xUrl: '',
    acknowledgedStds: '',
    recentReferences: [],
    preferences: '',
    healthStatusColor: 'green'
  });

  useEffect(() => {
    // Check URL for profile parameter (partner view)
    const urlParams = new URLSearchParams(window.location.search);
    const profileParam = urlParams.get('profile');

    if (profileParam) {
      setIsPartnerView(true);
      const decoded = b64DecodeUnicode(profileParam);
      if (decoded) {
        try {
          const profile = JSON.parse(decoded);
          setPartnerProfile(profile);
          // Extract base URL
          const baseUrl = window.location.href.split('?')[0];
          setUrlInput(baseUrl);
        } catch (e) {
          console.error('Failed to parse profile:', e);
        }
      }
    } else {
      // Donor view - load from localStorage
      loadLocalProfile();
      
      // Fetch user status if membershipId exists
      if (membershipId) {
        fetchUserStatusForId(membershipId);
      }
    }
  }, [membershipId]);

  const fetchUserStatusForId = async (id) => {
    try {
      const response = await axios.get(`${API}/profiles/${id}`);
      const profile = response.data;
      setUserStatus(profile.userStatus || 1);
      setUserEmail(profile.email || '');
      setPaymentStatus({
        paymentStatus: profile.paymentStatus,
        qrCodeEnabled: profile.qrCodeEnabled
      });
    } catch (error) {
      console.error('Failed to fetch user status:', error);
    }
  };

  const fetchUserStatus = async () => {
    try {
      const response = await axios.get(`${API}/profiles/${membershipId}`);
      const profile = response.data;
      setUserStatus(profile.userStatus || 1);
      setUserEmail(profile.email || '');
      setPaymentStatus({
        paymentStatus: profile.paymentStatus,
        qrCodeEnabled: profile.qrCodeEnabled
      });
    } catch (error) {
      console.error('Failed to fetch user status:', error);
    }
  };

  const loadLocalProfile = () => {
    const saved = localStorage.getItem('cleanCheckDonorProfile');
    if (saved) {
      try {
        const profile = JSON.parse(saved);
        setLocalProfile(profile);
        setProfileForm(profile);

        // Load saved link
        const savedLink = localStorage.getItem('cleanCheckSecureLink');
        if (savedLink) {
          setUrlInput(savedLink);
          generateQRCode(savedLink);
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
      }
    }
  };

  const saveLocalProfile = async (formData) => {
    const now = new Date();
    const expirationDate = new Date();
    expirationDate.setDate(now.getDate() + 30);

    const profile = {
      ...formData,
      lastUpdated: now.toISOString(),
      expiresOn: expirationDate.toISOString()
    };

    localStorage.setItem('cleanCheckDonorProfile', JSON.stringify(profile));
    setLocalProfile(profile);

    // **Sync to database and create membership if needed**
    if (membershipId && profile.name && profile.email) {
      await updateMembershipProfile(profile.name, profile.photo);
    } else if (profile.name && profile.email) {
      const newId = await createMembershipId(profile.name, profile.email, profile.photo);
      if (newId) {
        toast.success('✉️ Welcome email sent! Check your inbox.');
      }
    }

    // Update QR code
    if (urlInput) {
      updateQRCodeWithProfile(urlInput.split('?')[0], profile);
    }

    toast.success('Profile saved successfully!');
  };

  const updateQRCodeWithProfile = (baseUrl, profile, healthColor = 'green') => {
    if (!baseUrl) return;

    const profileJson = JSON.stringify(profile);
    const encoded = b64EncodeUnicode(profileJson);
    const shareableUrl = `${baseUrl}?profile=${encoded}`;

    setUrlInput(shareableUrl);
    localStorage.setItem('cleanCheckSecureLink', shareableUrl);
    generateQRCode(shareableUrl, healthColor);
  };

  const generateQRCode = async (url, healthColor = 'green') => {
    try {
      const colorMap = {
        red: '#dc2626',     // Stop - STD warning
        yellow: '#f59e0b',  // Caution
        green: '#10b981'    // All clear
      };

      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: colorMap[healthColor] || colorMap.green,
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrlInput(newUrl);

    if (localProfile) {
      const baseUrl = newUrl.split('?')[0];
      updateQRCodeWithProfile(baseUrl, localProfile);
    } else if (newUrl) {
      generateQRCode(newUrl);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    toast.info(`Uploading ${file.name}...`);

    setTimeout(() => {
      const mockUrl = `https://secure-results.com/cleancheck/${crypto.randomUUID()}`;
      setUrlInput(mockUrl);

      if (localProfile) {
        updateQRCodeWithProfile(mockUrl, localProfile, localProfile.healthStatusColor || 'green');
      } else {
        generateQRCode(mockUrl, 'green');
      }

      toast.success('🎉 QR Code Generated! Scan to share your health status.');
    }, 1500);
  };

  const handleShareLink = () => {
    if (!urlInput) {
      toast.error('Please set your profile and secure link first.');
      return;
    }

    navigator.clipboard
      .writeText(urlInput)
      .then(() => {
        toast.success('Link copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy. Please manually copy the URL.');
      });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileForm({ ...profileForm, photo: event.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();

    if (!profileForm.name || !profileForm.email || !profileForm.sex) {
      toast.error('Please fill out all required fields (Name, Email, Identity).');
      return;
    }

    if (!profileForm.photo) {
      toast.error('Profile photo is required. Please upload a photo.');
      return;
    }

    if (!profileForm.birthdayDay || !profileForm.birthdayMonth || !profileForm.birthdayYear) {
      toast.error('Please enter your complete birthday (Day, Month, Year).');
      return;
    }

    if (!profileForm.sexualOrientation || !profileForm.relationshipStatus) {
      toast.error('Please select your sexual orientation and relationship status.');
      return;
    }

    saveLocalProfile(profileForm);
    setProfileModalOpen(false);
  };

  if (isPartnerView && partnerProfile) {
    return <PartnerView profile={partnerProfile} examLink={urlInput} />;
  }

  // Show Waiting Screen if user status is In_Review (Status 2)
  if (membershipId && userStatus === 2) {
    return <WaitingScreen membershipId={membershipId} userEmail={userEmail} />;
  }

  return (
    <div className="space-y-6">
      {/* Donor Summary */}
      {localProfile && (
        <div className="flex items-center justify-between" data-testid="donor-summary">
          <div className="flex items-center space-x-3 p-2 rounded-lg bg-red-50 flex-grow">
            <img
              src={localProfile.photo || 'https://placehold.co/96x96/f87171/ffffff?text=U'}
              alt="Donor"
              className="profile-pic-preview"
            />
            <div>
              <p className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-red-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zM10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span>Donor:</span>
              </p>
              <p className="text-lg font-bold text-red-700">{localProfile.name}</p>
              <p className="text-sm text-gray-600">
                {localProfile.age}, {localProfile.sex} {localProfile.sexualOrientation ? `• ${localProfile.sexualOrientation}` : ''}
              </p>
              <p className="text-xs italic text-gray-500">
                Last Updated: {formatDate(localProfile.lastUpdated)}
              </p>
            </div>
          </div>

          <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="ml-2" data-testid="profile-btn">
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <ProfileModal
                profileForm={profileForm}
                setProfileForm={setProfileForm}
                handlePhotoUpload={handlePhotoUpload}
                handleProfileSubmit={handleProfileSubmit}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Tagline */}
      <p className="text-center text-gray-700 text-sm">
        **Confidently share verified health status information for mutual safety and informed
        intimacy.**
      </p>

      {/* Step 1: Payment Section - Show if no membershipId */}
      {!membershipId && (
        <>
          {/* Security Seals */}
          <SecuritySeals />
          
          {/* Payment Section with Value Props */}
          <PaymentSection />
        </>
      )}

      {/* Step 2: Payment Workflow - Show if membershipId exists */}
      {membershipId && (
        <>
          <PaymentWorkflow
            membershipId={membershipId}
            onStatusChange={(status) => setPaymentStatus(status)}
          />
          
          {/* Show payment section again if payment not confirmed */}
          {(!paymentStatus || paymentStatus.paymentStatus !== 'confirmed') && (
            <>
              <SecuritySeals />
              <PaymentSection />
            </>
          )}
        </>
      )}

      {/* Profile Creation - Only show after payment is confirmed AND userStatus is Approved (Status 3) */}
      {!localProfile && userStatus === 3 && paymentStatus && paymentStatus.paymentStatus === 'confirmed' && (
        <div className="text-center mt-4">
          <div className="p-4 bg-green-50 border-2 border-green-400 rounded-lg mb-4">
            <p className="text-green-800 font-bold mb-2">🎉 Payment Confirmed!</p>
            <p className="text-sm text-green-700">You can now create your donor profile to get started.</p>
          </div>
          <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" data-testid="set-profile-btn" className="w-full max-w-md">
                Create Your Donor Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <ProfileModal
                profileForm={profileForm}
                setProfileForm={setProfileForm}
                handlePhotoUpload={handlePhotoUpload}
                handleProfileSubmit={handleProfileSubmit}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Only show document upload and QR code generation if payment is confirmed */}
      {paymentStatus && paymentStatus.paymentStatus === 'confirmed' && paymentStatus.qrCodeEnabled && (
        <>
          {/* URL Input */}
          <div>
            <Label htmlFor="urlInput" className="block text-sm font-medium text-gray-700 mb-2">
              Secure Link to Exam Results
            </Label>
            <Input
              id="urlInput"
              type="text"
              value={urlInput}
              onChange={handleUrlChange}
              placeholder="Paste the secure link to your recent lab results here..."
              className="border-red-400"
              data-testid="url-input"
            />
          </div>

          {/* File Upload - Generate QR Code */}
          <div className="p-4 border-2 border-red-400 rounded-lg bg-red-50">
            <Label className="block text-sm font-bold text-red-700 mb-2">
              📄 Upload Health Document
            </Label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
            />
            <Button
              onClick={handleFileUpload}
              variant="destructive"
              className="w-full text-sm py-3"
              data-testid="upload-btn"
            >
              📤 Upload & Create QR Code
            </Button>
            <p className="mt-2 text-xs text-gray-600 italic text-center">
              Upload document to generate your QR code
            </p>
          </div>
        </>
      )}

      {/* QR Code Display with Color Selection - Only show if payment confirmed and QR enabled */}
      {qrCodeDataUrl && paymentStatus && paymentStatus.paymentStatus === 'confirmed' && paymentStatus.qrCodeEnabled && (
        <div className="space-y-4">
          {/* Health Status Color Selector */}
          <div className="p-4 bg-gray-50 border-2 border-gray-300 rounded-lg">
            <Label className="block text-sm font-bold text-gray-800 mb-6">
              🎨 Choose Your Health Status Color
            </Label>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <Button
                type="button"
                onClick={() => {
                  const color = 'green';
                  const updated = { ...localProfile, healthStatusColor: color };
                  setLocalProfile(updated);
                  localStorage.setItem('cleanCheckDonorProfile', JSON.stringify(updated));
                  if (urlInput) {
                    updateQRCodeWithProfile(urlInput.split('?')[0], updated, color);
                  }
                  toast.success('QR Code set to GREEN - 100% Clean');
                }}
                className="flex flex-col items-center p-4 bg-green-500 hover:bg-green-600 text-white"
                data-testid="qr-color-green"
              >
                <span className="text-3xl mb-1">✅</span>
                <span className="text-sm font-bold">GREEN</span>
                <span className="text-xs">100% Clean</span>
              </Button>

              <Button
                type="button"
                onClick={() => {
                  const color = 'yellow';
                  const updated = { ...localProfile, healthStatusColor: color };
                  setLocalProfile(updated);
                  localStorage.setItem('cleanCheckDonorProfile', JSON.stringify(updated));
                  if (urlInput) {
                    updateQRCodeWithProfile(urlInput.split('?')[0], updated, color);
                  }
                  toast.success('QR Code set to YELLOW - Proceed with Caution');
                }}
                className="flex flex-col items-center p-4 bg-yellow-500 hover:bg-yellow-600 text-white"
                data-testid="qr-color-yellow"
              >
                <span className="text-3xl mb-1">⚠️</span>
                <span className="text-sm font-bold">YELLOW</span>
                <span className="text-xs">Proceed with Caution</span>
              </Button>

              <Button
                type="button"
                onClick={() => {
                  const color = 'red';
                  const updated = { ...localProfile, healthStatusColor: color };
                  setLocalProfile(updated);
                  localStorage.setItem('cleanCheckDonorProfile', JSON.stringify(updated));
                  if (urlInput) {
                    updateQRCodeWithProfile(urlInput.split('?')[0], updated, color);
                  }
                  toast.success('QR Code set to RED - Review Exams in Detail');
                }}
                className="flex flex-col items-center p-4 bg-red-500 hover:bg-red-600 text-white"
                data-testid="qr-color-red"
              >
                <span className="text-3xl mb-1">🛑</span>
                <span className="text-sm font-bold">RED</span>
                <span className="text-xs">Review Exams in Detail</span>
              </Button>
            </div>
            <p className="text-xs text-gray-600 mt-3 text-center">
              Current: <span className="font-bold uppercase">{localProfile?.healthStatusColor || 'GREEN'}</span>
            </p>
          </div>

          {/* QR Code Display */}
          <div className="flex flex-col items-center space-y-4 p-6 bg-white border-4 rounded-lg" style={{borderColor: localProfile?.healthStatusColor === 'red' ? '#dc2626' : localProfile?.healthStatusColor === 'yellow' ? '#f59e0b' : '#10b981'}}>
            <h3 className="text-xl font-bold text-gray-800">Your Shareable QR Code</h3>
            <div className="p-4 bg-white border-2 border-gray-300 rounded-lg qr-code-container">
              <img src={qrCodeDataUrl} alt="QR Code" data-testid="qr-code-image" />
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full" style={{backgroundColor: localProfile?.healthStatusColor === 'red' ? '#fee2e2' : localProfile?.healthStatusColor === 'yellow' ? '#fef3c7' : '#d1fae5'}}>
              <span className="text-2xl">
                {localProfile?.healthStatusColor === 'red' ? '🛑' : localProfile?.healthStatusColor === 'yellow' ? '⚠️' : '✅'}
              </span>
              <span className="font-bold text-sm" style={{color: localProfile?.healthStatusColor === 'red' ? '#991b1b' : localProfile?.healthStatusColor === 'yellow' ? '#92400e' : '#065f46'}}>
                {localProfile?.healthStatusColor === 'red' ? 'STOP - STD Warning' : localProfile?.healthStatusColor === 'yellow' ? 'CAUTION - Proceed Carefully' : 'ALL CLEAR - 100% Clean'}
              </span>
            </div>
            <p className="text-sm text-gray-600 text-center max-w-sm">
              Partners can scan this QR code to view your health verification and profile information
            </p>
            <Button
              onClick={handleShareLink}
              variant="destructive"
              className="w-full max-w-xs"
              data-testid="share-btn"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.88 12.753 9 12.175 9 11.5c0-1.415-.221-2.812-.647-4.103M19 11.5a7.5 7.5 0 01-15 0M4.5 11.5h15" />
              </svg>
              Share QR Code Link
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Profile Modal Component
const ProfileModal = ({ profileForm, setProfileForm, handlePhotoUpload, handleProfileSubmit }) => {
  return (
    <form onSubmit={handleProfileSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-red-600">
          Donor Profile Setup
        </DialogTitle>
        <p className="text-gray-600 text-sm">
          This information is saved locally and embedded in your shareable QR code link.
        </p>
      </DialogHeader>

      {/* Photo - REQUIRED */}
      <div className="flex items-center space-x-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
        <img
          src={profileForm.photo || 'https://placehold.co/96x96/f87171/ffffff?text=Required'}
          alt="Profile Preview"
          className="profile-pic-preview"
        />
        <div className="flex-grow">
          <Label className="text-red-700 font-bold">Profile Photo *REQUIRED</Label>
          <Input 
            type="file" 
            accept="image/*" 
            onChange={handlePhotoUpload} 
            className="mt-1 border-red-400" 
            required 
          />
          <p className="text-xs text-red-600 mt-1">📸 You must upload a profile photo to continue</p>
        </div>
      </div>

      {/* Name */}
      <div>
        <Label htmlFor="donorName">Full Name *</Label>
        <Input
          id="donorName"
          value={profileForm.name}
          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
          required
        />
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="donorEmail">Email Address *</Label>
        <Input
          id="donorEmail"
          type="email"
          value={profileForm.email}
          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
          placeholder="your.email@example.com"
          required
        />
      </div>

      {/* Current Home */}
      <div>
        <Label htmlFor="currentHome">🏠 Current Home</Label>
        <Input
          id="currentHome"
          type="text"
          value={profileForm.currentHome || ''}
          onChange={(e) => setProfileForm({ ...profileForm, currentHome: e.target.value })}
          placeholder="e.g., Los Angeles, CA"
        />
      </div>

      {/* Second Home */}
      <div>
        <Label htmlFor="secondHome">🌍 Second Home</Label>
        <Input
          id="secondHome"
          type="text"
          value={profileForm.secondHome || ''}
          onChange={(e) => setProfileForm({ ...profileForm, secondHome: e.target.value })}
          placeholder="e.g., Miami, FL"
        />
      </div>

      {/* Birthday 🎂 */}
      <div>
        <Label className="flex items-center space-x-2">
          <span>🎂 Birthday *</span>
        </Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          <div>
            <Label htmlFor="birthdayDay" className="text-xs text-gray-600">Day</Label>
            <Select
              value={profileForm.birthdayDay}
              onValueChange={(value) => setProfileForm({ ...profileForm, birthdayDay: value })}
            >
              <SelectTrigger id="birthdayDay">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={String(day)}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="birthdayMonth" className="text-xs text-gray-600">Month</Label>
            <Select
              value={profileForm.birthdayMonth}
              onValueChange={(value) => setProfileForm({ ...profileForm, birthdayMonth: value })}
            >
              <SelectTrigger id="birthdayMonth">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, idx) => (
                  <SelectItem key={month} value={String(idx + 1)}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="birthdayYear" className="text-xs text-gray-600">Year</Label>
            <Select
              value={profileForm.birthdayYear}
              onValueChange={(value) => setProfileForm({ ...profileForm, birthdayYear: value })}
            >
              <SelectTrigger id="birthdayYear">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 83 }, (_, i) => 2006 - i).map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Gender Identity - Buttons */}
      <div>
        <Label>I Identify As *</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {['Male', 'Female', 'Transgender'].map((gender) => (
            <Button
              key={gender}
              type="button"
              variant={profileForm.sex === gender ? 'default' : 'outline'}
              className={profileForm.sex === gender ? 'bg-red-600' : ''}
              onClick={() => setProfileForm({ ...profileForm, sex: gender })}
            >
              {gender}
            </Button>
          ))}
        </div>
      </div>

      {/* Sexual Orientation - Buttons */}
      <div>
        <Label>Sexual Orientation *</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {['Gay', 'Bi', 'Straight', 'Pansexual', 'Asexual'].map((orientation) => (
            <Button
              key={orientation}
              type="button"
              variant={profileForm.sexualOrientation === orientation ? 'default' : 'outline'}
              className={profileForm.sexualOrientation === orientation ? 'bg-red-600' : ''}
              onClick={() => setProfileForm({ ...profileForm, sexualOrientation: orientation })}
            >
              {orientation}
            </Button>
          ))}
        </div>
      </div>

      {/* Relationship Status - Dropdown */}
      <div>
        <Label htmlFor="relationshipStatus">Relationship Status *</Label>
        <Select
          value={profileForm.relationshipStatus}
          onValueChange={(value) => setProfileForm({ ...profileForm, relationshipStatus: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Single">Single</SelectItem>
            <SelectItem value="Married">Married</SelectItem>
            <SelectItem value="Separated">Separated</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Poly">Poly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Partner Preferences - Checkboxes */}
      <div>
        <Label>I Prefer (Select all that apply)</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {['Couples', 'Females', 'Males'].map((pref) => (
            <div key={pref} className="flex items-center space-x-2 p-2 border rounded">
              <Checkbox
                id={`pref-${pref}`}
                checked={(profileForm.partnerPreferences || []).includes(pref)}
                onCheckedChange={(checked) => {
                  const current = profileForm.partnerPreferences || [];
                  if (checked) {
                    setProfileForm({ ...profileForm, partnerPreferences: [...current, pref] });
                  } else {
                    setProfileForm({
                      ...profileForm,
                      partnerPreferences: current.filter((p) => p !== pref)
                    });
                  }
                }}
              />
              <Label htmlFor={`pref-${pref}`} className="text-sm cursor-pointer">
                {pref}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* COVID Vaccination */}
      <div className="border border-red-200 p-3 rounded-lg bg-red-50">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="covidCheck"
            checked={profileForm.isCovidVaccinated}
            onCheckedChange={(checked) =>
              setProfileForm({ ...profileForm, isCovidVaccinated: checked })
            }
          />
          <Label htmlFor="covidCheck" className="text-sm font-bold text-red-700">
            COVID Vaccination Status: {profileForm.isCovidVaccinated ? 'Yes' : 'No'}
          </Label>
        </div>
      </div>

      {/* Social Media Links - OPTIONAL */}
      <h3 className="text-lg font-bold text-gray-700 pt-2 border-t border-gray-200">
        Social Media Links (Optional for Verification)
      </h3>

      <div>
        <Label htmlFor="instagramUrl">Instagram URL</Label>
        <Input
          id="instagramUrl"
          type="url"
          value={profileForm.instagramUrl || ''}
          onChange={(e) => setProfileForm({ ...profileForm, instagramUrl: e.target.value })}
          placeholder="https://instagram.com/..."
        />
      </div>

      <div>
        <Label htmlFor="tiktokUrl">TikTok URL</Label>
        <Input
          id="tiktokUrl"
          type="url"
          value={profileForm.tiktokUrl || ''}
          onChange={(e) => setProfileForm({ ...profileForm, tiktokUrl: e.target.value })}
          placeholder="https://tiktok.com/@..."
        />
      </div>

      <div>
        <Label htmlFor="facebookUrl">Facebook URL</Label>
        <Input
          id="facebookUrl"
          type="url"
          value={profileForm.facebookUrl || ''}
          onChange={(e) => setProfileForm({ ...profileForm, facebookUrl: e.target.value })}
          placeholder="https://facebook.com/..."
        />
      </div>

      <div>
        <Label htmlFor="onlyFansUrl">OnlyFans URL</Label>
        <Input
          id="onlyFansUrl"
          type="url"
          value={profileForm.onlyFansUrl || ''}
          onChange={(e) => setProfileForm({ ...profileForm, onlyFansUrl: e.target.value })}
          placeholder="https://onlyfans.com/..."
        />
      </div>

      <div>
        <Label htmlFor="xUrl">X/Twitter URL</Label>
        <Input
          id="xUrl"
          type="url"
          value={profileForm.xUrl || ''}
          onChange={(e) => setProfileForm({ ...profileForm, xUrl: e.target.value })}
          placeholder="https://x.com/..."
        />
      </div>

      {/* Acknowledged STDs */}
      <div>
        <Label htmlFor="acknowledgedStds" className="font-bold text-red-700">
          Acknowledged STDs (For Transparency)
        </Label>
        <Textarea
          id="acknowledgedStds"
          rows={2}
          value={profileForm.acknowledgedStds}
          onChange={(e) => setProfileForm({ ...profileForm, acknowledgedStds: e.target.value })}
          placeholder="e.g., None, HPV - managed/dormant, Herpes - outbreak frequency is low..."
        />
      </div>

      {/* Recent References */}
      <ReferencesSearch
        selectedReferences={profileForm.recentReferences || []}
        onReferencesChange={(refs) => setProfileForm({ ...profileForm, recentReferences: refs })}
      />

      {/* Sexual Preferences */}
      <div>
        <Label htmlFor="sexualPreferences">Sexual Preferences (Optional)</Label>
        <Textarea
          id="sexualPreferences"
          rows={3}
          value={profileForm.preferences}
          onChange={(e) => setProfileForm({ ...profileForm, preferences: e.target.value })}
          placeholder="e.g., Seeking LTR, prefers open communication, specific interests..."
        />
      </div>

      {/* Sponsors Section in Profile Modal */}
      <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
        <h4 className="text-xs font-semibold text-center text-gray-700 mb-3">
          This Month's Sponsors
        </h4>
        <div className="flex justify-around items-center space-x-2">
          {[1, 2, 3].map((num) => {
            const [logoSrc, setLogoSrc] = React.useState(null);
            
            React.useEffect(() => {
              const saved = localStorage.getItem(`sponsorLogo${num}`);
              if (saved) setLogoSrc(saved);
            }, []);

            const colors = [
              'bg-yellow-50 border-yellow-300',
              'bg-green-50 border-green-300',
              'bg-blue-50 border-blue-300'
            ];

            return (
              <div key={num} className="w-1/3 p-1 flex justify-center">
                <div className={`sponsor-slot border ${colors[num - 1]}`}>
                  <img
                    src={logoSrc || `https://placehold.co/150x60/${num === 1 ? 'fef3c7/a16207' : num === 2 ? 'd1fae5/065f46' : 'e0e7ff/3730a3'}?text=Logo+${num}`}
                    alt={`Sponsor ${num}`}
                    onError={(e) => {
                      e.target.src = `https://placehold.co/150x60/cccccc/666666?text=Logo+${num}`;
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-center text-gray-500 italic">
          Support partners helping ensure safe and informed intimacy.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={(e) => {
            e.preventDefault();
            saveLocalProfile(profileForm);
            toast.success('Progress saved! You can continue editing.');
          }}
          data-testid="save-progress-btn"
        >
          💾 Save Progress
        </Button>
        <Button type="submit" variant="destructive" className="w-full" data-testid="save-profile-btn">
          ✅ Save & Close
        </Button>
      </div>
    </form>
  );
};

// Partner View Component
const PartnerView = ({ profile, examLink }) => {
  const now = new Date();
  const expiresOn = profile.expiresOn ? new Date(profile.expiresOn) : null;
  const isExpired = expiresOn && now > expiresOn;

  const createSocialIcon = (url, type, color) => {
    if (!url) return null;

    const icons = {
      instagram: 'M12 2.163c3.204 0 3.584.01 4.85.071 3.544.17 5.27 1.957 5.438 5.438.06 1.266.07 1.646.07 4.85s-.01 3.584-.071 4.85c-.17 3.544-1.957 5.27-5.438 5.438-1.266.06-1.646.07-4.85.07s-3.584-.01-4.85-.071c-3.544-.17-5.27-1.957-5.438-5.438-.06-1.266-.07-1.646-.07-4.85s.01-3.584.071-4.85c.17-3.544 1.957-5.27 5.438-5.438 1.266-.06 1.646-.07 4.85-.07zm0 2.138c-3.196 0-3.56.012-4.821.07-3.21.156-4.223 1.256-4.38 4.382-.058 1.261-.07 1.625-.07 4.821s.012 3.56.07 4.821c.156 3.21 1.256 4.223 4.382 4.38 1.261.058 1.625.07 4.821.07s3.56-.012 4.821-.07c3.21-.156 4.223-1.256 4.38-4.382.058-1.261.07-1.625.07-4.821s-.012-3.56-.07-4.821c-.156-3.21-1.256-4.223-4.382-4.38-1.261-.058-1.625-.07-4.821-.07zM5.317 12c0-3.693 2.99-6.683 6.683-6.683s6.683 2.99 6.683 6.683c0 3.693-2.99 6.683-6.683 6.683s-6.683-2.99-6.683-6.683zm2.138 0c0 2.502 2.043 4.545 4.545 4.545s4.545-2.043 4.545-4.545-2.043-4.545-4.545-4.545-4.545 2.043-4.545 4.545zm10.871-6.758c-.52 0-.94.42-.94.94s.42.94.94.94.94-.42.94-.94-.42-.94-.94-.94z',
      tiktok: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z',
      facebook: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3 8h-2v2h2v2h-2v6h-2v-6H8v-2h3V8.5C11 7.42 11.43 6 13.5 6H16v4z',
      onlyfans: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.48 16.5c-3.13 0-5.68-2.55-5.68-5.68 0-3.13 2.55-5.68 5.68-5.68s5.68 2.55 5.68 5.68c0 3.13-2.55 5.68-5.68 5.68z',
      x: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'
    };

    const names = {
      instagram: 'Instagram',
      tiktok: 'TikTok',
      facebook: 'Facebook',
      onlyfans: 'OnlyFans',
      x: 'X (Twitter)'
    };

    return (
      <a
        key={type}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-sm font-semibold hover:opacity-75"
      >
        <svg className="w-5 h-5 mr-1" fill={color} viewBox="0 0 24 24">
          <path d={icons[type]} />
        </svg>
        {names[type]}
      </a>
    );
  };

  return (
    <div className="space-y-6" data-testid="partner-view">
      <p className="text-center text-gray-700 text-sm">
        This is a Verified Health Share from the donor listed below.
      </p>

      <div className="bg-red-50 border border-red-300 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-red-700 mb-3 flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zM10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span>Donor Verification</span>
        </h3>

        {isExpired && (
          <div className="p-3 mb-4 rounded-lg bg-red-200 border border-red-600 text-red-800 font-bold text-sm text-center">
            ⚠️ STATUS EXPIRED: Request a fresh link from the Donor.
          </div>
        )}

        <div className="flex items-start space-x-4 mb-4">
          <img
            src={profile.photo || 'https://placehold.co/64x64/fca5a5/ffffff?text=U'}
            alt="Donor"
            className="partner-profile-photo"
          />
          <div>
            <p className="text-sm font-semibold text-gray-700">Name:</p>
            <p className="text-lg font-bold text-red-700">{profile.name || 'N/A'}</p>
            <p className="text-sm text-gray-600">
              {profile.age || 'N/A'}, {profile.sex || 'N/A'}
            </p>
            <p className="text-xs text-gray-500 italic mt-1">
              Last Verified: {formatDate(profile.lastUpdated)}
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-red-200 pt-3">
          <p className="text-sm font-semibold text-gray-700 mb-1">Relationship Status:</p>
          <p className="text-sm text-gray-600 italic mb-2">
            {profile.relationshipStatus || 'Not specified'}
          </p>
          <p className="text-sm font-semibold text-gray-700 mb-1">Sexual Orientation:</p>
          <p className="text-sm text-gray-600 italic mb-2">
            {profile.sexualOrientation || 'Not specified'}
          </p>
          <p className="text-sm font-semibold text-gray-700 mb-1">Partner Preferences:</p>
          <p className="text-sm text-gray-600 italic mb-2">
            {profile.partnerPreferences && profile.partnerPreferences.length > 0
              ? profile.partnerPreferences.join(', ')
              : 'Not specified'}
          </p>
        </div>

        {/* COVID Status */}
        <div className="mt-4 border-t border-red-200 pt-3">
          <p className="text-sm font-extrabold text-red-800 mb-1">COVID Vaccination Status:</p>
          <p className="text-sm text-gray-700 font-medium">
            {profile.isCovidVaccinated ? 'Yes' : 'No'}
          </p>
        </div>

        {/* Social Media */}
        <div className="mt-4 border-t border-red-200 pt-3">
          <p className="text-sm font-extrabold text-red-800 mb-2">Social Media Verification:</p>
          <div className="flex flex-wrap gap-3">
            {profile.instagramUrl && createSocialIcon(profile.instagramUrl, 'instagram', '#E1306C')}
            {profile.tiktokUrl && createSocialIcon(profile.tiktokUrl, 'tiktok', '#000000')}
            {profile.facebookUrl && createSocialIcon(profile.facebookUrl, 'facebook', '#4267B2')}
            {profile.onlyFansUrl && createSocialIcon(profile.onlyFansUrl, 'onlyfans', '#00AFF0')}
            {profile.xUrl && createSocialIcon(profile.xUrl, 'x', '#000000')}
            {!profile.instagramUrl &&
              !profile.tiktokUrl &&
              !profile.facebookUrl &&
              !profile.onlyFansUrl &&
              !profile.xUrl && (
                <p className="text-xs text-gray-500 italic">No social media links provided.</p>
              )}
          </div>
        </div>

        {/* Health Status */}
        <div className="mt-4 border-t border-red-200 pt-3">
          <p className="text-sm font-extrabold text-red-800 mb-1">
            Donor Health Status (Self-Reported):
          </p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap font-medium">
            {profile.acknowledgedStds && profile.acknowledgedStds.trim()
              ? profile.acknowledgedStds
              : 'The donor reported no known or acknowledged STDs.'}
          </p>
        </div>

        {/* References */}
        <div className="mt-4 border-t border-red-200 pt-3">
          <p className="text-sm font-semibold text-gray-700 mb-1">
            Recent References (Verified Members):
          </p>
          {profile.recentReferences && Array.isArray(profile.recentReferences) && profile.recentReferences.length > 0 ? (
            <div className="space-y-2 mt-2">
              {profile.recentReferences.map((ref, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {ref.photo ? (
                      <img src={ref.photo} alt={ref.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-500 text-lg">👤</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{ref.name}</p>
                    <p className="text-xs text-gray-500">ID: {ref.membershipId}</p>
                  </div>
                  <span className="text-xs text-green-600 font-semibold">✓ Verified</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 italic">None provided.</p>
          )}
        </div>

        {/* Preferences */}
        <div className="mt-4 border-t border-red-200 pt-3">
          <p className="text-sm font-semibold text-gray-700 mb-1">Stated Preferences:</p>
          <p className="text-sm text-gray-600 italic whitespace-pre-wrap">
            {profile.preferences || 'The donor did not provide specific preferences.'}
          </p>
        </div>
      </div>

      {/* Payment Section */}
      <PaymentSection />

      {/* Access Exam Link */}
      <a
        href={examLink.split('?')[0]}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full p-3 font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 flex items-center justify-center"
        data-testid="access-exam-link"
      >
        Access Secure Exam Results
      </a>
    </div>
  );
};

// Security Seals Component
const SecuritySeals = () => (
  <div className="p-4 bg-gray-100 rounded-xl text-center border-2 border-green-200">
    <h3 className="text-sm font-bold text-gray-700 mb-3">DIGITAL TRUST & ASSURANCE</h3>
    <div className="flex justify-around items-center space-x-2">
      <div className="flex flex-col items-center">
        <svg
          className="w-8 h-8 text-green-600 mb-1"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <p className="text-xs text-gray-600 font-semibold">SSL Secured</p>
      </div>
      <div className="flex flex-col items-center">
        <svg className="w-8 h-8 text-green-600 mb-1" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8.61l-9 9z" />
        </svg>
        <p className="text-xs text-gray-600 font-semibold">Data Verified</p>
      </div>
      <div className="flex flex-col items-center">
        <svg
          className="w-8 h-8 text-green-600 mb-1"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9 10h6" />
        </svg>
        <p className="text-xs text-gray-600 font-semibold">Privacy Assured</p>
      </div>
    </div>
  </div>
);

// Payment Section Component
const PaymentSection = () => (
  <div className="p-4 border border-red-400 rounded-xl bg-red-50 text-center">
    <h3 className="text-xl font-bold text-red-700 mb-3">Service Contribution (Membership)</h3>
    <p className="text-sm text-gray-700 mb-2">
      This is a **Clean Check Membership** with a **recurring charge of $39 every 30 days** per
      donor to cover secure hosting and verification processing.
    </p>
    
    {/* Nonrefundable Disclaimer */}
    <div className="mb-3 p-3 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
      <p className="text-sm font-bold text-yellow-900 mb-1">⚠️ Important Payment Information:</p>
      <ul className="text-xs text-gray-800 space-y-1">
        <li>• <strong>All membership contributions are non-refundable and final</strong></li>
        <li>• Recurring $39 charge every 30 days</li>
        <li>• To cancel: Log into your PayPal account → Settings → Payments → Manage automatic payments → Cancel Clean Check subscription</li>
        <li>• Cancellation must be done through PayPal directly</li>
      </ul>
    </div>

    {/* Value Propositions - Why Join Clean Check */}
    <div className="mb-5 p-4 bg-white rounded-lg border-2 border-red-300 shadow-sm">
      <h4 className="text-lg font-bold text-red-600 mb-3 flex items-center justify-center">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        Why Join Clean Check?
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
        <div className="flex items-start space-x-2">
          <span className="text-2xl flex-shrink-0">✅</span>
          <div>
            <p className="font-bold text-sm text-gray-800">Verified Health Status</p>
            <p className="text-xs text-gray-600">Share your clean status with confidence using QR codes</p>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-2xl flex-shrink-0">🔒</span>
          <div>
            <p className="font-bold text-sm text-gray-800">Private & Secure</p>
            <p className="text-xs text-gray-600">Your data is encrypted and stored securely on your terms</p>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-2xl flex-shrink-0">🤝</span>
          <div>
            <p className="font-bold text-sm text-gray-800">Member References</p>
            <p className="text-xs text-gray-600">Build trust with verified references from other members</p>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-2xl flex-shrink-0">⚡</span>
          <div>
            <p className="font-bold text-sm text-gray-800">Instant Verification</p>
            <p className="text-xs text-gray-600">Partners scan your QR code for immediate transparency</p>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-2xl flex-shrink-0">💜</span>
          <div>
            <p className="font-bold text-sm text-gray-800">Peace of Mind</p>
            <p className="text-xs text-gray-600">Navigate intimacy with informed consent and mutual safety</p>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <span className="text-2xl flex-shrink-0">🌟</span>
          <div>
            <p className="font-bold text-sm text-gray-800">Premium Features</p>
            <p className="text-xs text-gray-600">Photo gallery, social links, and customizable status colors</p>
          </div>
        </div>
      </div>
      <div className="mt-4 p-3 bg-gradient-to-r from-red-100 to-pink-100 rounded-lg border border-red-300">
        <p className="text-sm font-bold text-red-800">
          🎯 Join a community committed to transparency, safety, and informed intimacy.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <a
        href="https://paypal.me/pitbossent"
        target="_blank"
        rel="noopener noreferrer"
        className="p-4 font-semibold rounded-lg text-white bg-blue-700 hover:bg-blue-800 flex flex-col items-center justify-center text-center"
        data-testid="paypal-btn"
      >
        <span className="text-3xl mb-2">💳</span>
        <span className="text-base">Pay by PayPal</span>
        <span className="text-xs font-normal mt-1 opacity-90">@pitbossent</span>
      </a>

      <a
        href="https://venmo.com/u/skisteve007"
        target="_blank"
        rel="noopener noreferrer"
        className="p-4 font-semibold rounded-lg text-white bg-sky-600 hover:bg-sky-700 flex flex-col items-center justify-center text-center"
        data-testid="venmo-btn"
      >
        <span className="text-3xl mb-2">💰</span>
        <span className="text-base">Pay by Venmo</span>
        <span className="text-xs font-normal mt-1 opacity-90">@skisteve007</span>
      </a>
    </div>

    <p className="mt-3 text-xs text-center font-medium text-gray-700">
      Select your amount below: <strong>$39 Single</strong> or <strong>$69 Combined</strong>
    </p>
    <p className="mt-2 text-xs text-gray-600 font-semibold">
      ⏱️ After payment, enter your name and email below to notify admin. Allow up to 5 minutes for verification.
    </p>
  </div>
);

// Utility Functions
const b64EncodeUnicode = (str) => {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) =>
      String.fromCharCode('0x' + p1)
    )
  );
};

const b64DecodeUnicode = (str) => {
  try {
    return decodeURIComponent(
      atob(str)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (e) {
    console.error('Failed to decode:', e);
    return null;
  }
};

const formatDate = (isoString) => {
  if (!isoString) return 'Never';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'N/A';
  }
};

export default QRCodeTab;
