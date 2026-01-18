interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

class AuthManager {
  private static instance: AuthManager;
  private tokens: AuthTokens | null = null;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  setTokens(tokens: AuthTokens) {
    this.tokens = tokens;
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
  }

  getTokens(): AuthTokens | null {
    if (!this.tokens) {
      const stored = localStorage.getItem('auth_tokens');
      if (stored) {
        this.tokens = JSON.parse(stored);
      }
    }
    return this.tokens;
  }

  getAuthHeader(): Record<string, string> {
    const tokens = this.getTokens();
    if (!tokens) return {};
    
    return {
      'Authorization': `Bearer ${tokens.accessToken}`
    };
  }

  clearTokens() {
    this.tokens = null;
    localStorage.removeItem('auth_tokens');
  }

  isAuthenticated(): boolean {
    return !!this.getTokens();
  }
}

export const authManager = AuthManager.getInstance();