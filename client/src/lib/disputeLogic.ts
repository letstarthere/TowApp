// Dispute and cancellation logic - prevents real-world conflicts

export type JobStatus = 'pending' | 'accepted' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';

export interface CancellationRule {
  timeLimit: number; // minutes
  fee: number; // ZAR
  reason: string;
}

export interface DisputeReason {
  code: string;
  description: string;
  requiresEvidence: boolean;
}

export class DisputeManager {
  private static cancellationRules: Record<JobStatus, CancellationRule> = {
    pending: { timeLimit: 5, fee: 0, reason: 'Free cancellation within 5 minutes' },
    accepted: { timeLimit: 0, fee: 50, reason: 'Driver dispatched - cancellation fee applies' },
    en_route: { timeLimit: 0, fee: 100, reason: 'Driver en route - higher cancellation fee' },
    arrived: { timeLimit: 0, fee: 150, reason: 'Driver arrived - arrival fee applies' },
    in_progress: { timeLimit: 0, fee: 200, reason: 'Service in progress - full cancellation fee' },
    completed: { timeLimit: 0, fee: 0, reason: 'Cannot cancel completed job' },
    cancelled: { timeLimit: 0, fee: 0, reason: 'Already cancelled' },
    disputed: { timeLimit: 0, fee: 0, reason: 'Under dispute resolution' }
  };

  private static disputeReasons: DisputeReason[] = [
    { code: 'NO_SHOW_DRIVER', description: 'Driver did not arrive', requiresEvidence: false },
    { code: 'NO_SHOW_USER', description: 'User not at pickup location', requiresEvidence: false },
    { code: 'VEHICLE_DAMAGE', description: 'Vehicle damaged during tow', requiresEvidence: true },
    { code: 'OVERCHARGE', description: 'Charged more than agreed price', requiresEvidence: true },
    { code: 'POOR_SERVICE', description: 'Unprofessional or unsafe service', requiresEvidence: false },
    { code: 'WRONG_LOCATION', description: 'Incorrect pickup or dropoff', requiresEvidence: false }
  ];

  static canUserCancel(status: JobStatus, requestTime: Date): { allowed: boolean; fee: number; reason: string } {
    const rule = this.cancellationRules[status];
    const minutesElapsed = (Date.now() - requestTime.getTime()) / (1000 * 60);
    
    if (status === 'completed' || status === 'disputed') {
      return { allowed: false, fee: 0, reason: rule.reason };
    }
    
    if (rule.timeLimit > 0 && minutesElapsed <= rule.timeLimit) {
      return { allowed: true, fee: 0, reason: 'Free cancellation period' };
    }
    
    return { allowed: true, fee: rule.fee, reason: rule.reason };
  }

  static canDriverCancel(status: JobStatus, reason: string): { allowed: boolean; penalty: number } {
    const validReasons = ['safety_concern', 'vehicle_inaccessible', 'user_no_show', 'emergency'];
    
    if (!validReasons.includes(reason)) {
      return { allowed: false, penalty: 0 };
    }
    
    if (status === 'completed') {
      return { allowed: false, penalty: 0 };
    }
    
    // Driver penalties for cancellation
    const penalties: Record<JobStatus, number> = {
      pending: 0,
      accepted: 25,
      en_route: 50,
      arrived: 100,
      in_progress: 200,
      completed: 0,
      cancelled: 0,
      disputed: 0
    };
    
    return { allowed: true, penalty: penalties[status] };
  }

  static calculatePartialPayout(originalAmount: number, status: JobStatus, completionPercentage: number): number {
    if (status === 'completed') return originalAmount;
    if (status === 'pending' || status === 'cancelled') return 0;
    
    // Partial payout based on service completion
    const basePayouts: Record<JobStatus, number> = {
      pending: 0,
      accepted: 0.1, // 10% for acceptance
      en_route: 0.3, // 30% for traveling
      arrived: 0.5, // 50% for arrival
      in_progress: 0.7 + (completionPercentage * 0.3), // 70% + completion
      completed: 1.0,
      cancelled: 0,
      disputed: 0.5 // Hold 50% during dispute
    };
    
    return Math.round(originalAmount * basePayouts[status]);
  }

  static getDisputeReasons(): DisputeReason[] {
    return this.disputeReasons;
  }

  static validateDispute(reason: string, evidence?: string[]): { valid: boolean; message: string } {
    const disputeReason = this.disputeReasons.find(r => r.code === reason);
    
    if (!disputeReason) {
      return { valid: false, message: 'Invalid dispute reason' };
    }
    
    if (disputeReason.requiresEvidence && (!evidence || evidence.length === 0)) {
      return { valid: false, message: 'Evidence required for this dispute type' };
    }
    
    return { valid: true, message: 'Dispute is valid' };
  }
}