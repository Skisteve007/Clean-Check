import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [pendingPayments, setPendingPayments] = useState([]);

  useEffect(() => {
    // Check if already logged in (stored in session)
    const savedPassword = sessionStorage.getItem('adminPassword');
    if (savedPassword) {
      setAdminPassword(savedPassword);
      setIsLoggedIn(true);
      loadData(savedPassword);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/admin/login`, {
        password: password
      });

      if (response.data.success) {
        sessionStorage.setItem('adminPassword', password);
        setAdminPassword(password);
        setIsLoggedIn(true);
        toast.success('Welcome to Admin Panel!');
        loadData(password);
      } else {
        toast.error('Incorrect password. Please try again.');
      }
    } catch (error) {
      toast.error('Login failed. Please check your password.');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async (pwd) => {
    try {
      // Load stats
      const statsResponse = await axios.get(`${API}/admin/stats?password=${pwd}`);
      setStats(statsResponse.data);

      // Load profiles
      const profilesResponse = await axios.get(`${API}/admin/profiles?password=${pwd}`);
      setProfiles(profilesResponse.data);

      // Load pending payments
      const paymentsResponse = await axios.get(`${API}/admin/payments/pending?password=${pwd}`);
      setPendingPayments(paymentsResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
  };

  const handleSearch = async () => {
    if (!adminPassword) return;

    try {
      const response = await axios.get(
        `${API}/admin/profiles?password=${adminPassword}&search=${searchQuery}`
      );
      setProfiles(response.data);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const handleDelete = async (membershipId, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      await axios.delete(`${API}/admin/profiles/${membershipId}?password=${adminPassword}`);
      toast.success(`${name} deleted successfully`);
      loadData(adminPassword);
    } catch (error) {
      toast.error('Failed to delete profile');
    }
  };

  const handleApprovePayment = async (membershipId, name) => {
    // Prompt for Member ID
    const assignedMemberId = prompt(`Assign Member ID for ${name}:\n\n(Example: MEM-001, MEM-002, etc.)`);
    
    if (!assignedMemberId || assignedMemberId.trim() === '') {
      toast.error('Member ID is required to approve payment');
      return;
    }

    if (!window.confirm(`Confirm payment for ${name} with Member ID: ${assignedMemberId}?`)) {
      return;
    }

    try {
      await axios.post(`${API}/admin/payments/approve?password=${adminPassword}`, {
        membershipId: membershipId,
        assignedMemberId: assignedMemberId.trim()
      });
      toast.success(`Payment approved! ${name} assigned Member ID: ${assignedMemberId}. Email sent to user.`);
      loadData(adminPassword);
    } catch (error) {
      toast.error('Failed to approve payment: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleRejectPayment = async (membershipId, name) => {
    const reason = prompt(`Reject payment for ${name}? Enter reason (optional):`);
    if (reason === null) return; // Cancelled

    try {
      await axios.post(
        `${API}/admin/payments/reject/${membershipId}?password=${adminPassword}&reason=${encodeURIComponent(
          reason
        )}`
      );
      toast.success(`Payment rejected for ${name}`);
      loadData(adminPassword);
    } catch (error) {
      toast.error('Failed to reject payment');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminPassword');
    setIsLoggedIn(false);
    setPassword('');
    setAdminPassword('');
    setStats(null);
    setProfiles([]);
    toast.success('Logged out successfully');
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
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

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600 text-center">
              Clean Check Admin
            </CardTitle>
            <CardDescription className="text-center">Enter your password to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Admin Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-lg"
                  data-testid="admin-password-input"
                />
              </div>
              <Button
                type="submit"
                variant="destructive"
                className="w-full"
                disabled={loading}
                data-testid="admin-login-btn"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
            <p className="mt-4 text-xs text-center text-gray-500">
              Default password: admin123 (Change in backend/.env)
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-red-600">Clean Check Admin Panel</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-red-600">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total References</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-purple-600">{stats.totalReferences}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Site Visits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-600">{stats.totalVisits}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>QR Codes Generated</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600">{stats.qrCodesGenerated}</div>
              </CardContent>
            </Card>

            <Card className={pendingPayments.length > 0 ? 'border-2 border-yellow-500' : ''}>
              <CardHeader className="pb-2">
                <CardDescription>Pending Payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-yellow-600">{stats.pendingPayments || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pending Payments Section */}
        {pendingPayments.length > 0 && (
          <Card className="mb-6 border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-yellow-800">🔔 Pending Payment Confirmations</CardTitle>
              <CardDescription>Review and confirm user payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingPayments.map((payment) => (
                  <div
                    key={payment.membershipId}
                    className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50"
                    data-testid="pending-payment-item"
                  >
                    <div>
                      <h3 className="font-bold text-lg">{payment.name}</h3>
                      <p className="text-sm text-gray-600">
                        <strong>Method:</strong> {payment.paymentMethod} | <strong>Amount:</strong>{' '}
                        {payment.amount}
                      </p>
                      {payment.transactionId && (
                        <p className="text-sm text-gray-600">
                          <strong>Transaction ID:</strong> {payment.transactionId}
                        </p>
                      )}
                      {payment.notes && (
                        <p className="text-sm text-gray-600">
                          <strong>Notes:</strong> {payment.notes}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Submitted: {formatDate(payment.submittedAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprovePayment(payment.membershipId, payment.name)}
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        data-testid="approve-payment-btn"
                      >
                        ✓ Confirm
                      </Button>
                      <Button
                        onClick={() => handleRejectPayment(payment.membershipId, payment.name)}
                        variant="destructive"
                        size="sm"
                        data-testid="reject-payment-btn"
                      >
                        ✗ Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Bar */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Member Directory</CardTitle>
            <CardDescription>Search and manage all members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                data-testid="admin-search-input"
              />
              <Button onClick={handleSearch} variant="destructive">
                Search
              </Button>
              <Button onClick={() => { setSearchQuery(''); loadData(adminPassword); }} variant="outline">
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sponsor Management - ADMIN ONLY */}
        <Card className="mb-6 border-2 border-purple-400">
          <CardHeader>
            <CardTitle className="text-purple-800">🎨 Sponsor Logo Management</CardTitle>
            <CardDescription>Upload and manage sponsor logos (Admin Only)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((num) => (
                <SponsorUploadAdmin key={num} slotNumber={num} adminPassword={adminPassword} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle>All Members ({profiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {profiles.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No members found</p>
            ) : (
              <div className="space-y-3">
                {profiles.map((profile) => (
                  <div
                    key={profile.membershipId}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    data-testid="admin-profile-item"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={profile.photo || 'https://placehold.co/64x64/f87171/ffffff?text=U'}
                        alt={profile.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-red-300"
                      />
                      <div>
                        <h3 className="font-bold text-lg">{profile.name}</h3>
                        <p className="text-sm text-gray-600 font-mono">
                          ID: {profile.membershipId}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created: {formatDate(profile.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500">
                          References: {profile.references?.length || 0}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDelete(profile.membershipId, profile.name)}
                      variant="destructive"
                      size="sm"
                      data-testid="admin-delete-btn"
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Sponsor Upload Component - ADMIN ONLY
const SponsorUploadAdmin = ({ slotNumber, adminPassword }) => {
  const [logoSrc, setLogoSrc] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    loadLogo();
  }, [slotNumber]);

  const loadLogo = async () => {
    try {
      const response = await axios.get(`${API}/sponsors`);
      const logos = response.data;
      if (logos[slotNumber]) {
        setLogoSrc(logos[slotNumber]);
      }
    } catch (error) {
      console.error('Error loading sponsor logos:', error);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result;
      
      try {
        await axios.post(`${API}/admin/sponsors/${slotNumber}?password=${adminPassword}`, {
          logo: base64
        });
        setLogoSrc(base64);
        toast.success(`Sponsor Logo ${slotNumber} uploaded!`);
      } catch (error) {
        toast.error('Failed to upload sponsor logo');
        console.error('Upload error:', error);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = async () => {
    if (window.confirm('Remove this sponsor logo?')) {
      try {
        await axios.delete(`${API}/admin/sponsors/${slotNumber}?password=${adminPassword}`);
        setLogoSrc(null);
        toast.success(`Sponsor Logo ${slotNumber} removed`);
      } catch (error) {
        toast.error('Failed to remove sponsor logo');
        console.error('Remove error:', error);
      }
    }
  };

  const colors = [
    'bg-yellow-50 border-yellow-300',
    'bg-green-50 border-green-300',
    'bg-blue-50 border-blue-300'
  ];

  return (
    <div className="flex flex-col items-center space-y-2">
      <p className="text-sm font-semibold text-gray-700">Sponsor Slot {slotNumber}</p>
      <div className={`w-48 h-24 border-2 ${colors[slotNumber - 1]} rounded-lg overflow-hidden flex items-center justify-center`}>
        {logoSrc ? (
          <img src={logoSrc} alt={`Sponsor ${slotNumber}`} className="w-full h-full object-contain" />
        ) : (
          <p className="text-xs text-gray-400">No Logo</p>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => document.getElementById(`adminSponsorUpload${slotNumber}`).click()}
          variant="outline"
          size="sm"
          disabled={uploading}
          data-testid={`admin-sponsor-upload-btn-${slotNumber}`}
        >
          {uploading ? 'Uploading...' : logoSrc ? 'Change' : 'Upload'}
        </Button>
        {logoSrc && (
          <Button
            onClick={handleRemove}
            variant="destructive"
            size="sm"
            data-testid={`admin-sponsor-remove-btn-${slotNumber}`}
          >
            Remove
          </Button>
        )}
      </div>
      <input
        type="file"
        id={`adminSponsorUpload${slotNumber}`}
        className="hidden"
        accept="image/jpeg, image/png"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default AdminPanel;
