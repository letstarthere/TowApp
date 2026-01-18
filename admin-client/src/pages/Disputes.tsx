import { useEffect, useState } from 'react';
import { Search, Filter, MessageSquare, FileText, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';

interface Dispute {
  id: number;
  jobId: number;
  reportedBy: 'user' | 'driver';
  type: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  resolvedAt?: string;
  payoutAdjustment?: number;
}

export default function Disputes() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockDisputes: Dispute[] = [
        {
          id: 1,
          jobId: 123,
          reportedBy: 'user',
          type: 'payment',
          description: 'Driver charged more than estimated price without explanation',
          status: 'open',
          priority: 'medium',
          createdAt: '2024-01-15T14:30:00Z'
        },
        {
          id: 2,
          jobId: 124,
          reportedBy: 'driver',
          type: 'behavior',
          description: 'User was aggressive and refused to pay after service completion',
          status: 'investigating',
          priority: 'high',
          createdAt: '2024-01-15T16:45:00Z'
        },
        {
          id: 3,
          jobId: 125,
          reportedBy: 'user',
          type: 'service',
          description: 'Driver arrived 2 hours late and was unprofessional',
          status: 'resolved',
          priority: 'low',
          createdAt: '2024-01-14T10:20:00Z',
          resolvedAt: '2024-01-15T09:30:00Z',
          payoutAdjustment: -5000 // R50 deduction
        }
      ];

      setDisputes(mockDisputes);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
      setLoading(false);
    }
  };

  const handleResolveDispute = async (disputeId: number) => {
    try {
      if (!resolutionNote.trim()) {
        alert('Please enter a resolution note');
        return;
      }

      console.log(`Resolving dispute ${disputeId}:`, resolutionNote);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update dispute status
      setDisputes(disputes.map(dispute => 
        dispute.id === disputeId 
          ? { ...dispute, status: 'resolved' as const, resolvedAt: new Date().toISOString() }
          : dispute
      ));
      
      setShowDisputeModal(false);
      setResolutionNote('');
      alert('Dispute resolved successfully');
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
      alert('Failed to resolve dispute');
    }
  };

  const handleAdjustPayout = async (disputeId: number) => {
    try {
      const adjustment = prompt('Enter payout adjustment amount (in cents, negative for deduction):');
      const reason = prompt('Enter adjustment reason:');
      
      if (!adjustment || !reason) return;

      console.log(`Adjusting payout for dispute ${disputeId}:`, { adjustment: parseInt(adjustment), reason });
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Payout adjustment processed successfully');
      fetchDisputes();
    } catch (error) {
      console.error('Failed to adjust payout:', error);
      alert('Failed to adjust payout');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return <DollarSign className="w-4 h-4" />;
      case 'service': return <FileText className="w-4 h-4" />;
      case 'behavior': return <AlertTriangle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = dispute.id.toString().includes(searchTerm) ||
                         dispute.jobId.toString().includes(searchTerm) ||
                         dispute.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
    
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
        <h1 className="text-2xl font-bold text-white">Disputes & Incidents</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search disputes..."
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
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Disputes Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Open Disputes</p>
              <p className="text-2xl font-bold text-red-400">
                {disputes.filter(d => d.status === 'open').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Investigating</p>
              <p className="text-2xl font-bold text-yellow-400">
                {disputes.filter(d => d.status === 'investigating').length}
              </p>
            </div>
            <MessageSquare className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Resolved</p>
              <p className="text-2xl font-bold text-green-400">
                {disputes.filter(d => d.status === 'resolved').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Resolution</p>
              <p className="text-2xl font-bold text-blue-400">2.5d</p>
            </div>
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Disputes Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Dispute ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Job ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Reported By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Priority
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
              {filteredDisputes.map((dispute) => (
                <tr key={dispute.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-white font-medium">#{dispute.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-blue-400">#{dispute.jobId}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTypeIcon(dispute.type)}
                      <span className="ml-2 text-white capitalize">{dispute.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      dispute.reportedBy === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {dispute.reportedBy.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(dispute.status)}`}>
                      {dispute.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${getPriorityColor(dispute.priority)}`}>
                      {dispute.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                    {new Date(dispute.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDispute(dispute);
                          setShowDisputeModal(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        View
                      </button>
                      {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
                        <>
                          <button
                            onClick={() => handleAdjustPayout(dispute.id)}
                            className="text-yellow-400 hover:text-yellow-300 text-sm"
                          >
                            Adjust
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispute Details Modal */}
      {showDisputeModal && selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">
              Dispute #{selectedDispute.id} - Job #{selectedDispute.jobId}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <p className="text-white bg-gray-700 p-3 rounded-lg">{selectedDispute.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                  <p className="text-white capitalize">{selectedDispute.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Reported By</label>
                  <p className="text-white capitalize">{selectedDispute.reportedBy}</p>
                </div>
              </div>

              {selectedDispute.status !== 'resolved' && selectedDispute.status !== 'closed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Resolution Notes</label>
                  <textarea
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="Enter resolution details..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    rows={4}
                  />
                </div>
              )}

              {selectedDispute.payoutAdjustment && (
                <div className="bg-yellow-900 bg-opacity-30 p-3 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    Payout Adjustment: R{Math.abs(selectedDispute.payoutAdjustment / 100).toFixed(2)} 
                    {selectedDispute.payoutAdjustment < 0 ? ' (Deduction)' : ' (Bonus)'}
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDisputeModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Close
              </button>
              {selectedDispute.status !== 'resolved' && selectedDispute.status !== 'closed' && (
                <button
                  onClick={() => handleResolveDispute(selectedDispute.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Resolve Dispute
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}