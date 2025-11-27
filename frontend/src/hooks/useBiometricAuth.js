import { useState, useEffect } from 'react';

export const useBiometricAuth = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
    checkIfEnabled();
  }, []);

  const checkBiometricSupport = () => {
    // Check if Web Authentication API is available
    const supported = window.PublicKeyCredential !== undefined &&
                     navigator.credentials !== undefined;
    setIsSupported(supported);
  };

  const checkIfEnabled = () => {
    const enabled = localStorage.getItem('biometricAuthEnabled') === 'true';
    setIsEnabled(enabled);
  };

  const setupBiometric = async (membershipId) => {
    if (!isSupported) {
      throw new Error('Biometric authentication is not supported on this device');
    }

    try {
      // Create a credential
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const publicKeyCredentialCreationOptions = {
        challenge: challenge,
        rp: {
          name: 'Clean Check',
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(membershipId),
          name: membershipId,
          displayName: 'Clean Check Member',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },  // ES256
          { alg: -257, type: 'public-key' } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        timeout: 60000,
        attestation: 'none'
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });

      if (credential) {
        // Store credential info
        const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
        localStorage.setItem('biometricCredentialId', credentialId);
        localStorage.setItem('biometricAuthEnabled', 'true');
        localStorage.setItem('biometricMembershipId', membershipId);
        setIsEnabled(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Biometric setup failed:', error);
      throw error;
    }
  };

  const authenticateWithBiometric = async () => {
    if (!isSupported || !isEnabled) {
      return null;
    }

    try {
      const credentialId = localStorage.getItem('biometricCredentialId');
      if (!credentialId) {
        return null;
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions = {
        challenge: challenge,
        allowCredentials: [{
          id: Uint8Array.from(atob(credentialId), c => c.charCodeAt(0)),
          type: 'public-key',
        }],
        timeout: 60000,
        userVerification: 'required'
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      });

      if (assertion) {
        // Return the stored membershipId
        return localStorage.getItem('biometricMembershipId');
      }
      return null;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return null;
    }
  };

  const disableBiometric = () => {
    localStorage.removeItem('biometricAuthEnabled');
    localStorage.removeItem('biometricCredentialId');
    localStorage.removeItem('biometricMembershipId');
    setIsEnabled(false);
  };

  return {
    isSupported,
    isEnabled,
    setupBiometric,
    authenticateWithBiometric,
    disableBiometric
  };
};
