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

const QRCodeTab = ({ membershipId, createMembershipId, updateMembershipProfile }) => {
  const [urlInput, setUrlInput] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [localProfile, setLocalProfile] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [isPartnerView, setIsPartnerView] = useState(false);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const fileInputRef = useRef(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    age: '',
    sex: '',
    photo: '',
    relationshipStatus: [],
    sexualOrientation: [],
    isCovidVaccinated: false,
    instagramUrl: '',
    tiktokUrl: '',
    facebookUrl: '',
    onlyFansUrl: '',
    xUrl: '',
    acknowledgedStds: '',
    recentReferences: '',
    preferences: ''
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
    }
  }, []);

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

    // Sync to database
    if (membershipId) {
      await updateMembershipProfile(profile.name, profile.photo);
    } else if (profile.name) {
      const newId = await createMembershipId(profile.name, profile.photo);
      if (newId) {
        toast.success('Membership ID created!');
      }
    }

    // Update QR code
    if (urlInput) {
      updateQRCodeWithProfile(urlInput.split('?')[0], profile);
    }

    toast.success('Profile saved successfully!');
  };

  const updateQRCodeWithProfile = (baseUrl, profile) => {
    if (!baseUrl) return;

    const profileJson = JSON.stringify(profile);
    const encoded = b64EncodeUnicode(profileJson);
    const shareableUrl = `${baseUrl}?profile=${encoded}`;

    setUrlInput(shareableUrl);
    localStorage.setItem('cleanCheckSecureLink', shareableUrl);
    generateQRCode(shareableUrl);
  };

  const generateQRCode = async (url) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#dc2626',
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
        updateQRCodeWithProfile(mockUrl, localProfile);
      } else {
        generateQRCode(mockUrl);
      }

      toast.success('Link generated & QR code updated!');
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

    if (!profileForm.name || !profileForm.age || !profileForm.sex) {
      toast.error('Please fill out all required fields (Name, Age, Sex).');
      return;
    }

    if (
      !profileForm.instagramUrl ||
      !profileForm.tiktokUrl ||
      !profileForm.facebookUrl ||
      !profileForm.onlyFansUrl ||
      !profileForm.xUrl
    ) {
      toast.error('Please provide all social media links.');
      return;
    }

    saveLocalProfile(profileForm);
    setProfileModalOpen(false);
  };

  if (isPartnerView && partnerProfile) {
    return <PartnerView profile={partnerProfile} examLink={urlInput} />;
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
                {localProfile.age}, {localProfile.sex}
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

      {!localProfile && (
        <div className="text-center">
          <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" data-testid="set-profile-btn">
                Set Profile to Get Started
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

      {/* Payment Workflow */}
      {membershipId && (
        <PaymentWorkflow
          membershipId={membershipId}
          onStatusChange={(status) => setPaymentStatus(status)}
        />
      )}

      {/* Security Seals */}
      <SecuritySeals />

      {/* Payment Section */}
      <PaymentSection />

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

      {/* File Upload */}
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          Generate Shareable Link (Optional)
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
          className="w-full"
          data-testid="upload-btn"
        >
          Upload & Get Link
        </Button>
        <p className="mt-2 text-xs text-gray-500 italic">
          *Note: This feature simulates a successful upload and link generation.*
        </p>
      </div>

      {/* QR Code Display */}
      {qrCodeDataUrl && (
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-white border border-gray-200 rounded-lg qr-code-container">
            <img src={qrCodeDataUrl} alt="QR Code" data-testid="qr-code-image" />
          </div>
          <p className="text-sm font-semibold text-red-600 text-center">
            Scan the QR code to access and share the validated health information.
          </p>
          <Button
            onClick={handleShareLink}
            variant="destructive"
            className="w-full max-w-xs"
            data-testid="share-btn"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.88 12.753 9 12.175 9 11.5c0-1.415-.221-2.812-.647-4.103M19 11.5a7.5 7.5 0 01-15 0M4.5 11.5h15"
              />
            </svg>
            Share Final Link
          </Button>
        </div>
      )}

      {!qrCodeDataUrl && (
        <div className="p-8 text-center text-gray-500 text-sm border border-gray-200 rounded-lg">
          Please enter a secure exam link and save your profile to generate a QR code.
        </div>
      )}
    </div>
  );
};

// Profile Modal Component
const ProfileModal = ({ profileForm, setProfileForm, handlePhotoUpload, handleProfileSubmit }) => {
  const toggleArrayValue = (field, value) => {
    const current = profileForm[field] || [];
    if (current.includes(value)) {
      setProfileForm({ ...profileForm, [field]: current.filter((v) => v !== value) });
    } else {
      setProfileForm({ ...profileForm, [field]: [...current, value] });
    }
  };

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

      {/* Photo */}
      <div className="flex items-center space-x-4">
        <img
          src={profileForm.photo || 'https://placehold.co/96x96/f87171/ffffff?text=Add+Photo'}
          alt="Profile Preview"
          className="profile-pic-preview"
        />
        <div className="flex-grow">
          <Label>Profile Photo (Optional)</Label>
          <Input type="file" accept="image/*" onChange={handlePhotoUpload} className="mt-1" />
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

      {/* Age & Sex */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="donorAge">Age *</Label>
          <Input
            id="donorAge"
            type="number"
            min="18"
            max="120"
            value={profileForm.age}
            onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="donorSex">Identifying Sex *</Label>
          <Select
            value={profileForm.sex}
            onValueChange={(value) => setProfileForm({ ...profileForm, sex: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Non-Binary">Non-Binary</SelectItem>
              <SelectItem value="Prefer Not to Say">Prefer Not to Say</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Social Media Links */}
      <h3 className="text-lg font-bold text-gray-700 pt-2 border-t border-gray-200">
        Social Media Links (for Verification)
      </h3>

      <div>
        <Label htmlFor="instagramUrl">Instagram URL *</Label>
        <Input
          id="instagramUrl"
          type="url"
          value={profileForm.instagramUrl}
          onChange={(e) => setProfileForm({ ...profileForm, instagramUrl: e.target.value })}
          placeholder="https://instagram.com/..."
          required
        />
      </div>

      <div>
        <Label htmlFor="tiktokUrl">TikTok URL *</Label>
        <Input
          id="tiktokUrl"
          type="url"
          value={profileForm.tiktokUrl}
          onChange={(e) => setProfileForm({ ...profileForm, tiktokUrl: e.target.value })}
          placeholder="https://tiktok.com/@..."
          required
        />
      </div>

      <div>
        <Label htmlFor="facebookUrl">Facebook URL *</Label>
        <Input
          id="facebookUrl"
          type="url"
          value={profileForm.facebookUrl}
          onChange={(e) => setProfileForm({ ...profileForm, facebookUrl: e.target.value })}
          placeholder="https://facebook.com/..."
          required
        />
      </div>

      <div>
        <Label htmlFor="onlyFansUrl">OnlyFans URL *</Label>
        <Input
          id="onlyFansUrl"
          type="url"
          value={profileForm.onlyFansUrl}
          onChange={(e) => setProfileForm({ ...profileForm, onlyFansUrl: e.target.value })}
          placeholder="https://onlyfans.com/..."
          required
        />
      </div>

      <div>
        <Label htmlFor="xUrl">X/Twitter URL *</Label>
        <Input
          id="xUrl"
          type="url"
          value={profileForm.xUrl}
          onChange={(e) => setProfileForm({ ...profileForm, xUrl: e.target.value })}
          placeholder="https://x.com/..."
          required
        />
      </div>

      {/* Relationship Status */}
      <div>
        <Label>Relationship Status (Select all that apply)</Label>
        <div className="flex flex-wrap gap-4 p-2 bg-gray-100 rounded-lg mt-1">
          {['Single', 'Married', 'Poly'].map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox
                id={`rel-${status}`}
                checked={(profileForm.relationshipStatus || []).includes(status)}
                onCheckedChange={() => toggleArrayValue('relationshipStatus', status)}
              />
              <Label htmlFor={`rel-${status}`} className="text-sm">
                {status}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Sexual Orientation */}
      <div>
        <Label>Sexual Orientation (Select all that apply)</Label>
        <div className="flex flex-wrap gap-4 p-2 bg-gray-100 rounded-lg mt-1">
          {['Gay', 'Bi', 'Straight'].map((orientation) => (
            <div key={orientation} className="flex items-center space-x-2">
              <Checkbox
                id={`orient-${orientation}`}
                checked={(profileForm.sexualOrientation || []).includes(orientation)}
                onCheckedChange={() => toggleArrayValue('sexualOrientation', orientation)}
              />
              <Label htmlFor={`orient-${orientation}`} className="text-sm">
                {orientation}
              </Label>
            </div>
          ))}
        </div>
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
      <div>
        <Label htmlFor="recentReferences">Recent References (Optional for Verification)</Label>
        <Textarea
          id="recentReferences"
          rows={2}
          value={profileForm.recentReferences}
          onChange={(e) => setProfileForm({ ...profileForm, recentReferences: e.target.value })}
          placeholder="e.g., Contact information for 1-2 character references..."
        />
      </div>

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

      <Button type="submit" variant="destructive" className="w-full" data-testid="save-profile-btn">
        Save Profile and Update QR Code
      </Button>
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
            {profile.relationshipStatus && profile.relationshipStatus.length > 0
              ? profile.relationshipStatus.join(', ')
              : 'Not specified'}
          </p>
          <p className="text-sm font-semibold text-gray-700 mb-1">Sexual Orientation:</p>
          <p className="text-sm text-gray-600 italic mb-2">
            {profile.sexualOrientation && profile.sexualOrientation.length > 0
              ? profile.sexualOrientation.join(', ')
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
            Recent References (Self-Reported):
          </p>
          <p className="text-sm text-gray-600 italic whitespace-pre-wrap">
            {profile.recentReferences && profile.recentReferences.trim()
              ? profile.recentReferences
              : 'None provided.'}
          </p>
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
    <p className="text-sm text-gray-700 mb-4">
      This is a **Clean Check Membership** with a **recurring charge of $39 every 30 days** per
      donor to cover secure hosting and verification processing.
      <br />
      Membership can **only be canceled** by clicking the link below.
    </p>

    <div className="mb-4">
      <a
        href="https://your-cancellation-portal.com/cancel"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-bold text-red-600 hover:text-red-700 underline"
      >
        Click Here to Manage/Cancel Membership
      </a>
    </div>

    <div className="flex flex-col space-y-3">
      <a
        href="https://paypal.me/YOUR_PAYPAL_USERNAME"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full p-3 font-semibold rounded-lg text-white bg-blue-700 hover:bg-blue-800 flex items-center justify-center"
      >
        Single Contribution (PayPal)
      </a>

      <a
        href="https://paypal.me/YOUR_PAYPAL_USERNAME/69"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full p-3 font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 flex items-center justify-center"
      >
        Joint/Companion Contribution ($69 via PayPal)
      </a>

      <button className="w-full p-3 font-semibold rounded-lg text-red-800 bg-red-200 hover:bg-red-300">
        Zelle: Single ($39) or Joint ($69)
      </button>
    </div>

    <p className="mt-3 text-xs font-medium text-gray-700">
      For Zelle (Manual Entry): Please use the recipient identifier:{' '}
      <span className="font-bold text-red-800">[YOUR ZELLE EMAIL/PHONE]</span>
    </p>
    <p className="mt-1 text-xs text-red-600 italic">
      **ACTION REQUIRED:** Replace all placeholder links and Zelle identifier with your actual
      payment information, including the **cancellation link**.
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
