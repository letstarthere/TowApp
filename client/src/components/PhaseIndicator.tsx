import React, { useState, useEffect } from 'react';
import { TestPhase } from '../../shared/featureFlags';

interface PhaseIndicatorProps {
  className?: string;
}

interface PhaseStatus {
  currentPhase: TestPhase;
  description?: string;
  enabledDomains: string[];
  lockedDomains: string[];
  testAccountsOnly: boolean;
  isValid: boolean;
}

const PHASE_COLORS = {
  [TestPhase.PHASE_0_AUTH]: 'bg-blue-500',
  [TestPhase.PHASE_1_DRIVER]: 'bg-green-500',
  [TestPhase.PHASE_2_USER]: 'bg-yellow-500',
  [TestPhase.PHASE_3_REQUEST]: 'bg-orange-500',
  [TestPhase.PHASE_4_LIVE]: 'bg-purple-500',
  [TestPhase.PHASE_5_EDGE]: 'bg-red-500',
  [TestPhase.PHASE_6_ADMIN]: 'bg-pink-500',
  [TestPhase.PRODUCTION]: 'bg-gray-500'
};

const PHASE_NAMES = {
  [TestPhase.PHASE_0_AUTH]: 'Auth & Infrastructure',
  [TestPhase.PHASE_1_DRIVER]: 'Driver Core',
  [TestPhase.PHASE_2_USER]: 'User Core',
  [TestPhase.PHASE_3_REQUEST]: 'Service Request',
  [TestPhase.PHASE_4_LIVE]: 'Live Interaction',
  [TestPhase.PHASE_5_EDGE]: 'Edge Cases',
  [TestPhase.PHASE_6_ADMIN]: 'Admin Oversight',
  [TestPhase.PRODUCTION]: 'Production'
};

export default function PhaseIndicator({ className = '' }: PhaseIndicatorProps) {
  const [phaseStatus, setPhaseStatus] = useState<PhaseStatus | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [availableTransitions, setAvailableTransitions] = useState<TestPhase[]>([]);

  useEffect(() => {
    fetchPhaseStatus();
    fetchAvailableTransitions();
    
    // Refresh every 5 seconds
    const interval = setInterval(() => {
      fetchPhaseStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchPhaseStatus = async () => {
    try {
      const response = await fetch('/api/testing/phase/status');
      if (response.ok) {
        const status = await response.json();
        setPhaseStatus(status);
      }
    } catch (error) {
      console.error('Failed to fetch phase status:', error);
    }
  };

  const fetchAvailableTransitions = async () => {
    try {
      const response = await fetch('/api/testing/phase/transitions');
      if (response.ok) {
        const data = await response.json();
        setAvailableTransitions(data.availableTransitions);
      }
    } catch (error) {
      console.error('Failed to fetch available transitions:', error);
    }
  };

  const handlePhaseTransition = async (targetPhase: TestPhase) => {
    try {
      const response = await fetch('/api/testing/phase/transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPhase })
      });

      if (response.ok) {
        await fetchPhaseStatus();
        await fetchAvailableTransitions();
        setShowDetails(false);
      } else {
        const error = await response.json();
        alert(`Phase transition failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Phase transition error:', error);
      alert('Phase transition failed');
    }
  };

  if (!phaseStatus) {
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full bg-gray-200 ${className}`}>
        <div className="w-2 h-2 bg-gray-400 rounded-full mr-2 animate-pulse"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  const phaseColor = PHASE_COLORS[phaseStatus.currentPhase];
  const phaseName = PHASE_NAMES[phaseStatus.currentPhase];

  return (
    <div className={`relative ${className}`}>
      {/* Main Phase Indicator */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium ${phaseColor} hover:opacity-80 transition-opacity`}
      >
        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
        <span>Phase: {phaseName}</span>
        {!phaseStatus.isValid && (
          <span className="ml-2 text-red-200">⚠️</span>
        )}
      </button>

      {/* Details Dropdown */}
      {showDetails && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Testing Phase Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Current Phase Info */}
            <div className="mb-4">
              <div className={`inline-flex items-center px-2 py-1 rounded text-white text-xs ${phaseColor}`}>
                {phaseName}
              </div>
              {phaseStatus.description && (
                <p className="text-sm text-gray-600 mt-1">{phaseStatus.description}</p>
              )}
            </div>

            {/* Domain Status */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Domain Status</h4>
              <div className="space-y-1">
                {phaseStatus.enabledDomains.map(domain => (
                  <div key={domain} className="flex items-center text-xs">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-gray-700 capitalize">{domain.replace('_', ' ')}</span>
                  </div>
                ))}
                {phaseStatus.lockedDomains.map(domain => (
                  <div key={domain} className="flex items-center text-xs">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    <span className="text-gray-400 capitalize">{domain.replace('_', ' ')} (locked)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Account Mode */}
            {phaseStatus.testAccountsOnly && (
              <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex items-center text-xs text-yellow-800">
                  <span className="mr-2">⚠️</span>
                  Test accounts only
                </div>
              </div>
            )}

            {/* Phase Transitions */}
            {availableTransitions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Available Transitions</h4>
                <div className="grid grid-cols-2 gap-1">
                  {availableTransitions
                    .filter(phase => phase !== phaseStatus.currentPhase)
                    .map(phase => (
                      <button
                        key={phase}
                        onClick={() => handlePhaseTransition(phase)}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                      >
                        {PHASE_NAMES[phase]}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for accessing phase status in components
export function usePhaseStatus() {
  const [phaseStatus, setPhaseStatus] = useState<PhaseStatus | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/testing/phase/status');
        if (response.ok) {
          const status = await response.json();
          setPhaseStatus(status);
        }
      } catch (error) {
        console.error('Failed to fetch phase status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return phaseStatus;
}

// Component for showing phase restrictions
export function PhaseRestrictionBanner() {
  const phaseStatus = usePhaseStatus();

  if (!phaseStatus || phaseStatus.currentPhase === TestPhase.PRODUCTION) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="text-yellow-400">⚠️</span>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <strong>Testing Mode Active:</strong> {PHASE_NAMES[phaseStatus.currentPhase]}
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            Some features may be disabled or using mock data. 
            Locked domains: {phaseStatus.lockedDomains.join(', ') || 'none'}
          </p>
        </div>
      </div>
    </div>
  );
}