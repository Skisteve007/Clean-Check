import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

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
  const [adminUsers, setAdminUsers] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', phone: '', username: '', password: '' });

  useEffect(() => {
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
      const statsResponse = await axios.get(`${API}/admin/stats?password=${pwd}`);
      setStats(statsResponse.data);

      const profilesResponse = await axios.get(`${API}/admin/profiles?password=${pwd}`);
      setProfiles(profilesResponse.data);

      const paymentsResponse = await axios.get(`${API}/admin/payments/pending?password=${pwd}`);
      setPendingPayments(paymentsResponse.data);

      const adminUsersResponse = await axios.get(`${API}/admin/users?password=${pwd}`);
      setAdminUsers(adminUsersResponse.data);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    }
  };

  const handleApprovePayment = async (membershipId) => {
    try {
      await axios.post(`${API}/admin/payments/approve?password=${adminPassword}&membership_id=${membershipId}`);
      toast.success('Member approved! Email sent with Member ID.');
      loadData(adminPassword);
    } catch (error) {
      toast.error('Failed to approve payment');
    }
  };

  const handleRejectPayment = async (membershipId) => {
    const reason = prompt('Enter rejection reason (optional):');
    try {
      await axios.post(`${API}/admin/payments/reject/${membershipId}?password=${adminPassword}`, {
        reason: reason || ''
      });
      toast.success('Payment rejected');
      loadData(adminPassword);
    } catch (error) {
      toast.error('Failed to reject payment');
    }
  };

  const handleCreateAdminUser = async (e) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email || !newAdmin.phone || !newAdmin.username || !newAdmin.password) {
      toast.error('All fields are required');
      return;
    }

    try {
      await axios.post(`${API}/admin/users/create?password=${adminPassword}`, newAdmin);
      toast.success('Admin user created successfully!');
      setNewAdmin({ name: '', email: '', phone: '', username: '', password: '' });
      loadData(adminPassword);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create admin user');
    }
  };

  const handleDeleteAdminUser = async (username) => {
    if (!window.confirm(`Delete admin user "${username}"?`)) return;

    try {
      await axios.delete(`${API}/admin/users/${username}?password=${adminPassword}`);
      toast.success('Admin user deleted');
      loadData(adminPassword);
    } catch (error) {
      toast.error('Failed to delete admin user');
    }
  };

  const filteredProfiles = profiles.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.membershipId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-xl">
            <CardTitle className="text-3xl">🛡️ Admin Login</CardTitle>
            <CardDescription className="text-red-100">Enter admin password to continue</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Input
                  type="password"
                  placeholder="Admin Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-lg"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-lg"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-red-700">🛡️ Clean Check Admin Panel</h1>
          <Button
            variant="destructive"
            onClick={() => {
              sessionStorage.removeItem('adminPassword');
              setIsLoggedIn(false);
              setAdminPassword('');
            }}
          >
            Logout
          </Button>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
            <TabsTrigger value="pending" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              Pending Approvals ({pendingPayments.length})
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              Statistics
            </TabsTrigger>
            <TabsTrigger value="members" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              Members
            </TabsTrigger>
            <TabsTrigger value="admins" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              Admin Users
            </TabsTrigger>
            <TabsTrigger value="sponsors" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              Sponsor Logos
            </TabsTrigger>
          </TabsList>

          {/* PENDING APPROVALS TAB */}
          <TabsContent value="pending" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader className="bg-yellow-50 border-b-2 border-yellow-200">
                <CardTitle className="text-2xl text-yellow-800">⏳ Pending Member Approvals</CardTitle>
                <CardDescription>Review and approve member payment confirmations</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {pendingPayments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-xl">✅ No pending approvals</p>
                    <p className="text-sm mt-2">All payments have been processed!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingPayments.map((payment) => (
                      <Card key={payment.membershipId} className="border-2 border-yellow-300 bg-yellow-50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-bold text-gray-900">{payment.name}</h3>
                                <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full font-semibold">
                                  PENDING
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="font-semibold text-gray-700">Email:</span>
                                  <p className="text-gray-600">{payment.email}</p>
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-700">Membership ID:</span>
                                  <p className="text-gray-600 font-mono text-xs">{payment.membershipId}</p>
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-700">Payment Method:</span>
                                  <p className="text-gray-600">{payment.paymentMethod}</p>
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-700">Amount:</span>
                                  <p className="text-gray-600 font-bold">${payment.amount}</p>
                                </div>
                                <div className="col-span-2">
                                  <span className="font-semibold text-gray-700">Submitted:</span>
                                  <p className="text-gray-600 text-xs">
                                    {new Date(payment.submittedAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              <Button
                                onClick={() => handleApprovePayment(payment.membershipId)}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6"
                              >
                                ✓ Approve
                              </Button>
                              <Button
                                onClick={() => handleRejectPayment(payment.membershipId)}
                                variant="destructive"
                                className="px-6"
                              >
                                ✗ Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* STATISTICS TAB */}
          <TabsContent value="stats">
            <Card className="shadow-lg">
              <CardHeader className="bg-blue-50 border-b-2 border-blue-200">
                <CardTitle className="text-2xl text-blue-800">📊 Platform Statistics</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Total Members" value={stats.totalMembers} icon="👥" color="blue" />
                    <StatCard title="Approved Members" value={stats.approvedMembers} icon="✅" color="green" />
                    <StatCard title="Pending Approvals" value={stats.pendingMembers} icon="⏳" color="yellow" />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MEMBERS TAB */}
          <TabsContent value="members">
            <Card className="shadow-lg">
              <CardHeader className="bg-purple-50 border-b-2 border-purple-200">
                <CardTitle className="text-2xl text-purple-800">👥 All Members</CardTitle>
                <Input
                  placeholder="Search by name or membership ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-4"
                />
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredProfiles.map((profile) => (
                    <Card key={profile.membershipId} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {profile.photo && (
                            <img src={profile.photo} alt={profile.name} className="w-12 h-12 rounded-full object-cover" />
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{profile.name}</h4>
                            <p className="text-xs text-gray-500 font-mono">{profile.membershipId}</p>
                            {profile.assignedMemberId && (
                              <p className="text-sm text-blue-600 font-semibold">Member ID: {profile.assignedMemberId}</p>
                            )}
                          </div>
                          <div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                profile.paymentStatus === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {profile.paymentStatus}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ADMIN USERS TAB */}
          <TabsContent value="admins">
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader className="bg-indigo-50 border-b-2 border-indigo-200">
                  <CardTitle className="text-2xl text-indigo-800">🔑 Create New Admin User</CardTitle>
                  <CardDescription>Add authorized admin users with individual login credentials</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleCreateAdminUser} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Full Name"
                        value={newAdmin.name}
                        onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                        required
                      />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="Phone (for SMS)"
                        value={newAdmin.phone}
                        onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="Username"
                        value={newAdmin.username}
                        onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                        required
                      />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                        required
                        className="col-span-2"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                      Create Admin User
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="bg-indigo-50 border-b-2 border-indigo-200">
                  <CardTitle className="text-2xl text-indigo-800">👨‍💼 Existing Admin Users</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {adminUsers.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No admin users created yet</p>
                  ) : (
                    <div className="space-y-3">
                      {adminUsers.map((admin) => (
                        <Card key={admin.username} className="border-2">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-gray-900">{admin.name}</h4>
                                <p className="text-sm text-gray-600">@{admin.username}</p>
                                <p className="text-xs text-gray-500">{admin.email}</p>
                                <p className="text-xs text-gray-500">📱 {admin.phone}</p>
                              </div>
                              <Button
                                onClick={() => handleDeleteAdminUser(admin.username)}
                                variant="destructive"
                                size="sm"
                              >
                                Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SPONSOR LOGOS TAB */}
          <TabsContent value="sponsors">
            <Card className="shadow-lg">
              <CardHeader className="bg-green-50 border-b-2 border-green-200">
                <CardTitle className="text-2xl text-green-800">🏢 Sponsor Logos</CardTitle>
                <CardDescription>Upload and manage sponsor logos displayed on the main page</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-6">
                  <SponsorUploadAdmin slotNumber={1} adminPassword={adminPassword} />
                  <SponsorUploadAdmin slotNumber={2} adminPassword={adminPassword} />
                  <SponsorUploadAdmin slotNumber={3} adminPassword={adminPassword} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} text-white rounded-xl p-6 shadow-lg`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-4xl">{icon}</span>
        <span className="text-5xl font-bold">{value}</span>
      </div>
      <h3 className="text-lg font-semibold opacity-90">{title}</h3>
    </div>
  );
};

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
    <Card className={`${colors[slotNumber - 1]} border-2`}>
      <CardHeader>
        <CardTitle className="text-lg">Sponsor Logo {slotNumber}</CardTitle>
      </CardHeader>
      <CardContent>
        {logoSrc ? (
          <div className="space-y-3">
            <div className="w-full h-32 bg-white rounded-lg border-2 flex items-center justify-center overflow-hidden">
              <img src={logoSrc} alt={`Sponsor ${slotNumber}`} className="max-w-full max-h-full object-contain" />
            </div>
            <Button onClick={handleRemove} variant="destructive" size="sm" className="w-full">
              Remove Logo
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-full h-32 bg-white rounded-lg border-2 border-dashed flex items-center justify-center">
              <span className="text-gray-400">No logo</span>
            </div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="w-full"
            />
            {uploading && <p className="text-sm text-center text-gray-500">Uploading...</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPanel;
