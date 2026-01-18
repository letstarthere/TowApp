interface ErrorLog {
  timestamp: string;
  error: string;
  stack?: string;
  userAgent: string;
  url: string;
  userId?: string;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: ErrorLog[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  logError(error: Error, context?: string) {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId()
    };

    this.errorQueue.push(errorLog);
    console.error(`[${context || 'APP'}]`, error);
    
    // Send to server if online
    if (navigator.onLine) {
      this.flushErrors();
    }
  }

  private getCurrentUserId(): string | undefined {
    try {
      const tokens = localStorage.getItem('auth_tokens');
      if (tokens) {
        const parsed = JSON.parse(tokens);
        return parsed.userId;
      }
    } catch (e) {
      // Ignore
    }
    return undefined;
  }

  private async flushErrors() {
    if (this.errorQueue.length === 0) return;

    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors: this.errorQueue })
      });
      this.errorQueue = [];
    } catch (e) {
      // Keep errors in queue for retry
    }
  }
}

export const errorHandler = ErrorHandler.getInstance();

// Global error handlers
window.addEventListener('error', (event) => {
  errorHandler.logError(new Error(event.message), 'GLOBAL');
});

window.addEventListener('unhandledrejection', (event) => {
  errorHandler.logError(new Error(event.reason), 'PROMISE');
});