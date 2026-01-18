import { useEffect, useState } from 'react';
import { Search, Filter, MoreHorizontal, MapPin, Clock, User, Truck, AlertTriangle } from 'lucide-react';

interface Job {
  id: number;
  userId: number;
  driverId?: number;
  status: string;
  pickupAddress: string;
  dropoffAddress: string;
  estimatedPrice: string;
  actualPrice?: string;
  createdAt: string;
  completedAt?: string;
  user: { name: string; email: string; phone: string };
  driver?: { name: string; email: string; phone: string };
  isStuck: boolean;
  priority: 'normal' | 'high' | 'urgent';
}

export default function JobManagement() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockJobs: Job[] = [
        {
          id: 1,
          userId: 101,
          driverId: 201,
          status: 'completed',
          pickupAddress: '123 Main St, Cape Town',
          dropoffAddress: '456 Oak Ave, Cape Town',
          estimatedPrice: 'R350',
          actualPrice: 'R350',
          createdAt: '2024-01-15T10:30:00Z',
          completedAt: '2024-01-15T11:15:00Z',
          user: { name: 'John Smith', email: 'john@example.com', phone: '+27123456789' },
          driver: { name: 'Mike Johnson', email: 'mike@towapp.co.za', phone: '+27987654321' },
          isStuck: false,
          priority: 'normal'
        },
        {
          id: 2,
          userId: 102,
          driverId: 202,
          status: 'in_progress',
          pickupAddress: '789 Pine St, Cape Town',
          dropoffAddress: '321 Elm St, Cape Town',
          estimatedPrice: 'R420',
          createdAt: '2024-01-15T14:20:00Z',
          user: { name: 'Alice Brown', email: 'alice@example.com', phone: '+27555123456' },
          driver: { name: 'Sarah Wilson', email: 'sarah@towapp.co.za', phone: '+27555987654' },
          isStuck: false,
          priority: 'high'
        },
        {
          id: 3,
          userId: 103,
          status: 'assigned',
          pickupAddress: '555 Cedar Ave, Cape Town',
          dropoffAddress: '777 Birch Rd, Cape Town',
          estimatedPrice: 'R280',
          createdAt: '2024-01-15T09:00:00Z',
          user: { name: 'Emma Davis', email: 'emma@example.com', phone: '+27444555666' },
          isStuck: true,
          priority: 'urgent'
        }
      ];

      setJobs(mockJobs);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setLoading(false);
    }
  };

  const handleJobAction = async (jobId: number, action: string, data?: any) => {
    try {
      console.log(`Performing ${action} on job ${jobId}:`, data);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh jobs list
      fetchJobs();
      setShowJobModal(false);
      
      alert(`Job ${action} completed successfully`);
    } catch (error) {
      console.error(`Failed to ${action} job:`, error);
      alert(`Failed to ${action} job`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'en_route': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'normal': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.id.toString().includes(searchTerm) ||
                         job.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.driver?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Job Management</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="accepted">Accepted</option>
            <option value="en_route">En Route</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Job ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Pickup Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-white font-medium">#{job.id}</span>
                      {job.isStuck && (
                        <AlertTriangle className="w-4 h-4 text-red-400 ml-2" title="Stuck job" />
                      )}
                      <div className={`w-2 h-2 rounded-full ml-2 ${getPriorityColor(job.priority)}`}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                      {job.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-white text-sm">{job.user.name}</div>
                        <div className="text-gray-400 text-xs">{job.user.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {job.driver ? (
                      <div className="flex items-center">
                        <Truck className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-white text-sm">{job.driver.name}</div>
                          <div className="text-gray-400 text-xs">{job.driver.phone}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-white text-sm">{job.pickupAddress}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white text-sm">
                      {job.actualPrice || job.estimatedPrice}
                      {job.actualPrice && job.actualPrice !== job.estimatedPrice && (
                        <div className="text-gray-400 text-xs">Est: {job.estimatedPrice}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setShowJobModal(true);
                      }}
                      className="text-orange-400 hover:text-orange-300"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job Actions Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              Job #{selectedJob.id} Actions
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={() => handleJobAction(selectedJob.id, 'override', { status: 'completed' })}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Override Status
              </button>
              
              {!selectedJob.driverId && (
                <button
                  onClick={() => {
                    const driverId = prompt('Enter Driver ID to assign:');
                    if (driverId) {
                      handleJobAction(selectedJob.id, 'reassign', { driverId: parseInt(driverId) });
                    }
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Assign Driver
                </button>
              )}
              
              {selectedJob.driverId && (
                <button
                  onClick={() => {
                    const driverId = prompt('Enter new Driver ID:');
                    if (driverId) {
                      handleJobAction(selectedJob.id, 'reassign', { driverId: parseInt(driverId) });
                    }
                  }}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Reassign Driver
                </button>
              )}
              
              <button
                onClick={() => {
                  const reason = prompt('Enter cancellation reason:');
                  if (reason) {
                    handleJobAction(selectedJob.id, 'cancel', { reason });
                  }
                }}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Cancel Job
              </button>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowJobModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}