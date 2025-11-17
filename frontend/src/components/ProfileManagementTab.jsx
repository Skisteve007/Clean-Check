import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProfileManagementTab = ({ membershipId, createMembershipId }) => {
  const [profile, setProfile] = useState(null);
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (membershipId) {
      loadProfile();
    }
  }, [membershipId]);

  const loadProfile = async () => {
    if (!membershipId) return;

    try {
      const response = await axios.get(`${API}/profiles/${membershipId}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
      // Profile might not exist yet, which is fine
    }
  };

  const handleLookup = async () => {
    if (!lookupId.trim()) {
      toast.error('Enter a Membership ID to look up.');
      return;
    }

    if (lookupId === membershipId) {
      toast.error('That is your own ID! Cannot reference yourself.');
      return;
    }

    setLoading(true);
    setLookupResult(null);

    try {
      const response = await axios.get(`${API}/profiles/${lookupId}`);
      const data = response.data;

      // Check if already saved
      const isAlreadySaved = profile?.references?.some(
        (ref) => ref.membershipId === lookupId
      );

      setLookupResult({
        ...data,
        isAlreadySaved
      });

      toast.success(`Found member: ${data.name}`);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Error: ID not found or invalid.');
      } else {
        toast.error('An error occurred during lookup.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReference = async () => {
    if (!membershipId) {
      // Need to create membership first
      const localProfile = localStorage.getItem('cleanCheckDonorProfile');
      if (localProfile) {
        try {
          const parsed = JSON.parse(localProfile);
          const newId = await createMembershipId(parsed.name, parsed.photo);
          if (!newId) {
            toast.error('Failed to create membership. Please try again.');
            return;
          }
          // Will retry after state updates
          toast.info('Membership created. Please save the reference again.');
          return;
        } catch (e) {
          toast.error('Please set your profile first in the QR Code tab.');
          return;
        }
      } else {
        toast.error('Please set your profile first in the QR Code tab.');
        return;
      }
    }

    if (!lookupResult) return;

    setLoading(true);

    try {
      await axios.post(`${API}/profiles/${membershipId}/references`, {
        membershipId: lookupResult.membershipId,
        name: lookupResult.name
      });

      toast.success(`Successfully saved ${lookupResult.name}!`);
      setLookupResult(null);
      setLookupId('');
      loadProfile(); // Reload to get updated references
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('Reference already exists.');
      } else {
        toast.error('Failed to save reference. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveReference = async (refId, refName) => {
    if (!membershipId) return;

    try {
      await axios.delete(`${API}/profiles/${membershipId}/references/${refId}`);
      toast.success(`Removed ${refName} from references.`);
      loadProfile(); // Reload to get updated references
    } catch (error) {
      toast.error('Failed to remove reference.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-red-600">Membership and Reference Management</h2>

      {/* Membership ID Display */}
      <div className="p-4 bg-gray-100 rounded-lg shadow-inner">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">
          Your Unique Membership ID (UID)
        </h3>
        <p
          className="font-mono text-base text-red-700 break-all select-all"
          data-testid="membership-id-display"
        >
          {membershipId || 'Not yet created - Set your profile in QR Code tab'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Use this ID to be verified by other members.
        </p>
      </div>

      <hr className="border-gray-200" />

      {/* Reference Lookup Box */}
      <div>
        <h3 className="text-xl font-bold text-purple-600 mb-4">1. Reference Lookup Box</h3>
        <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
          <p className="text-gray-700 mb-4">
            Enter a member's **Membership ID** to verify their profile and save it as a permanent
            reference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              placeholder="Enter Member's Unique ID Here"
              className="flex-grow font-mono"
              data-testid="lookup-input"
            />
            <Button
              onClick={handleLookup}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600"
              data-testid="lookup-btn"
            >
              {loading ? 'Looking Up...' : 'Look Up ID'}
            </Button>
          </div>

          {/* Lookup Result */}
          {lookupResult && (
            <div
              className="mt-4 p-4 bg-white rounded-lg border-2 border-green-400 flex flex-col sm:flex-row items-start sm:items-center shadow-md justify-between"
              data-testid="lookup-result"
            >
              <div className="flex items-center mb-3 sm:mb-0">
                <img
                  src={lookupResult.photo || 'https://placehold.co/48x48/fca5a5/ffffff?text=U'}
                  alt="Thumbnail"
                  className="lookup-thumbnail"
                />
                <div>
                  <p className="text-lg font-semibold text-gray-800">Referenced Member:</p>
                  <p className="text-xl font-bold text-green-700">{lookupResult.name}</p>
                </div>
              </div>

              <Button
                onClick={handleSaveReference}
                disabled={loading || lookupResult.isAlreadySaved}
                className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600"
                data-testid="save-reference-btn"
              >
                {lookupResult.isAlreadySaved ? 'Already Saved' : 'Save as Permanent Reference'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Saved References Display */}
      <div>
        <h3 className="text-xl font-bold text-teal-600 mb-4 flex items-center">
          2. Your Saved References (
          <span data-testid="references-count">{profile?.references?.length || 0}</span>)
        </h3>
        <div
          className="p-4 bg-teal-50 rounded-lg border border-teal-200 min-h-20"
          data-testid="references-list"
        >
          {!profile?.references || profile.references.length === 0 ? (
            <p className="text-gray-500 italic">
              No permanent references saved yet. Use the lookup box above to add one.
            </p>
          ) : (
            <ul className="space-y-2">
              {profile.references.map((ref) => (
                <li
                  key={ref.membershipId}
                  className="flex justify-between items-center p-3 bg-white rounded-md shadow-sm border border-teal-100"
                  data-testid="reference-item"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-semibold text-gray-800 mr-4">{ref.name}</span>
                    <span className="font-mono text-xs text-teal-600 break-all">
                      ID: {ref.membershipId}
                      <span className="ml-2 text-gray-400">
                        | Added: {formatDate(ref.addedOn)}
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveReference(ref.membershipId, ref.name)}
                    className="p-2 ml-4 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full text-xl"
                    title={`Remove ${ref.name}`}
                    data-testid="remove-reference-btn"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    return new Date(isoString).toLocaleDateString('en-US');
  } catch {
    return 'N/A';
  }
};

export default ProfileManagementTab;
