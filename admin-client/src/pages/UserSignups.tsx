import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Ban, CheckCircle } from 'lucide-react';

interface UserSignup {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  userType: 'user';
  signupDate: string;
  status: 'active' | 'suspended';
}

export default function UserSignups() {
  const [users, setUsers] = useState<UserSignup[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSignup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:4000/api/users/signups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (id: number) => {
    const reason = prompt('Reason for suspension:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`http://localhost:4000/api/users/${id}/suspend`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to suspend user:', error);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`http://localhost:4000/api/users/${id}/activate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to activate user:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">User Signups</h1>
        <p className="text-gray-400">Manage user accounts and activity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users List */}
        <div className="space-y-4">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No User Signups</h3>
              <p className="text-gray-500">New user registrations will appear here</p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className={`bg-gray-800 p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedUser?.id === user.id ? 'border-orange-500' : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{user.fullName}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                  }`}>
                    {user.status}
                  </span>
                </div>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>{user.email}</p>
                  <p>{user.phone}</p>
                  <p>Joined: {new Date(user.signupDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* User Details */}
        {selectedUser && (
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">User Details</h2>
              <div className="flex space-x-2">
                {selectedUser.status === 'active' ? (
                  <button
                    onClick={() => handleSuspend(selectedUser.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Ban className="w-4 h-4" />
                    <span>Suspend</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivate(selectedUser.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Activate</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-orange-400" />
                    <p className="text-white">{selectedUser.fullName}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-orange-400" />
                    <p className="text-white">{selectedUser.email}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-orange-400" />
                    <p className="text-white">{selectedUser.phone}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Signup Date</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    <p className="text-white">{new Date(selectedUser.signupDate).toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Account Status</label>
                  <div className="flex items-center space-x-2">
                    {selectedUser.status === 'active' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Ban className="w-4 h-4 text-red-400" />
                    )}
                    <p className={`font-medium ${
                      selectedUser.status === 'active' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}