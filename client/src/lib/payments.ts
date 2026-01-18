// Payment system scaffold - DO NOT implement live payments yet

export interface WalletBalance {
  available: number;
  pending: number;
  currency: 'ZAR';
}

export interface EarningsRecord {
  id: string;
  date: string;
  amount: number;
  jobId: string;
  status: 'pending' | 'paid' | 'disputed';
  description: string;
}

export interface PayoutRequest {
  id: string;
  amount: number;
  requestedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: 'bank_transfer' | 'ewallet';
}

export class PaymentManager {
  // Scaffold for future payment provider integration
  static async getWalletBalance(userId: string): Promise<WalletBalance> {
    // TODO: Integrate with PayFast/Stripe
    return {
      available: 1250.00,
      pending: 350.00,
      currency: 'ZAR'
    };
  }

  static async getEarningsHistory(userId: string): Promise<EarningsRecord[]> {
    // TODO: Fetch from database
    return [
      {
        id: '1',
        date: '2024-01-15',
        amount: 280,
        jobId: 'job_123',
        status: 'paid',
        description: 'Tow service - Honda Civic'
      }
    ];
  }

  static async requestPayout(amount: number, method: string): Promise<PayoutRequest> {
    // TODO: Integrate with payment provider
    return {
      id: 'payout_' + Date.now(),
      amount,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      method: method as any
    };
  }

  static async processPayment(jobId: string, amount: number): Promise<boolean> {
    // TODO: Process actual payment
    console.log(`Processing payment for job ${jobId}: R${amount}`);
    return true;
  }
}