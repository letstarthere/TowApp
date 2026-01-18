import { useState, useEffect } from 'react';
import { Check, X, Eye, FileText, User, Phone, Car } from 'lucide-react';

interface DriverApplication {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  towTruckType: string;
  vehicleRegistration: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  documents: {
    driverLicenseFront?: string;
    driverLicenseBack?: string;
    vehicleRegistrationDoc?: string;
    profilePhoto?: string;
  };
}

export default function DriverApplications() {
  const [applications, setApplications] = useState<DriverApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<DriverApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:4000/api/drivers/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`http://localhost:4000/api/drivers/applications/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchApplications();
      setSelectedApp(null);
    } catch (error) {
      console.error('Failed to approve application:', error);
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`http://localhost:4000/api/drivers/applications/${id}/reject`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      fetchApplications();
      setSelectedApp(null);
    } catch (error) {
      console.error('Failed to reject application:', error);
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
        <h1 className="text-2xl font-bold text-white mb-2">Driver Applications</h1>
        <p className="text-gray-400">Review and approve new driver registrations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications List */}
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className={`bg-gray-800 p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedApp?.id === app.id ? 'border-orange-500' : 'border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => setSelectedApp(app)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">{app.fullName}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  app.status === 'pending' ? 'bg-orange-900 text-orange-300' :
                  app.status === 'approved' ? 'bg-green-900 text-green-300' :
                  'bg-red-900 text-red-300'
                }`}>
                  {app.status}
                </span>
              </div>
              <div className="text-sm text-gray-400 space-y-1">
                <p>{app.email}</p>
                <p>{app.towTruckType} • {app.vehicleRegistration}</p>
                <p>Submitted: {new Date(app.submittedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Application Details */}
        {selectedApp && (
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Application Details</h2>
              {selectedApp.status === 'pending' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(selectedApp.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleReject(selectedApp.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                  <p className="text-white">{selectedApp.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <p className="text-white">{selectedApp.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                  <p className="text-white">{selectedApp.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">License Number</label>
                  <p className="text-white">{selectedApp.licenseNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">License Expiry</label>
                  <p className="text-white">{selectedApp.licenseExpiry}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Truck Type</label>
                  <p className="text-white">{selectedApp.towTruckType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Vehicle Registration</label>
                  <p className="text-white">{selectedApp.vehicleRegistration}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Documents</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedApp.documents).map(([key, value]) => (
                    value && (
                      <div key={key} className="bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="w-4 h-4 text-orange-400" />
                          <span className="text-sm text-gray-300">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                        </div>
                        <button className="text-orange-400 hover:text-orange-300 text-sm flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>View Document</span>
                        </button>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}