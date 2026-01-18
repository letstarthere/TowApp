import { featureFlags, TestPhase } from './featureFlags.js';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export enum LogCategory {
  PHASE_TRANSITION = 'PHASE_TRANSITION',
  DOMAIN_EXECUTION = 'DOMAIN_EXECUTION',
  FEATURE_FLAG = 'FEATURE_FLAG',
  STATE_TRANSITION = 'STATE_TRANSITION',
  TEST_ACCOUNT = 'TEST_ACCOUNT',
  SIMULATION = 'SIMULATION',
  VERIFICATION = 'VERIFICATION',
  SECURITY = 'SECURITY'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  phase: TestPhase;
  domain?: string;
  message: string;
  data?: any;
  userId?: number;
  sessionId?: string;
  traceId?: string;
}

export class PhaseLogger {
  private static logs: LogEntry[] = [];
  private static maxLogs = 10000;
  private static sessionId = this.generateSessionId();

  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    data?: any,
    domain?: string,
    userId?: number,
    traceId?: string
  ): void {
    const entry: LogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level,
      category,
      phase: featureFlags.getCurrentPhase(),
      domain,
      message,
      data,
      userId,
      sessionId: this.sessionId,
      traceId
    };

    this.logs.push(entry);

    // Maintain log size limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output for debug mode
    if (featureFlags.isEnabled('DEBUG_LOGGING')) {
      this.outputToConsole(entry);
    }

    // Critical logs always output
    if (level === LogLevel.CRITICAL) {
      this.outputToConsole(entry);
    }
  }

  private static outputToConsole(entry: LogEntry): void {
    const prefix = `[${entry.level}][${entry.category}][${entry.phase}]`;
    const domainSuffix = entry.domain ? `[${entry.domain.toUpperCase()}]` : '';
    const message = `${prefix}${domainSuffix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(message, entry.data || '');
        break;
    }
  }

  // Convenience methods for different log types
  static logPhaseTransition(fromPhase: TestPhase, toPhase: TestPhase, success: boolean): void {
    this.log(
      success ? LogLevel.INFO : LogLevel.ERROR,
      LogCategory.PHASE_TRANSITION,
      `Phase transition: ${fromPhase} → ${toPhase}`,
      { fromPhase, toPhase, success }
    );
  }

  static logDomainExecution(domain: string, action: string, success: boolean, duration: number, data?: any): void {
    this.log(
      success ? LogLevel.DEBUG : LogLevel.ERROR,
      LogCategory.DOMAIN_EXECUTION,
      `${domain}.${action} ${success ? 'completed' : 'failed'} in ${duration}ms`,
      { domain, action, success, duration, ...data },
      domain
    );
  }

  static logFeatureFlagChange(flag: string, oldValue: any, newValue: any, userId?: number): void {
    this.log(
      LogLevel.INFO,
      LogCategory.FEATURE_FLAG,
      `Feature flag ${flag} changed: ${oldValue} → ${newValue}`,
      { flag, oldValue, newValue },
      undefined,
      userId
    );
  }

  static logStateTransition(entity: string, entityId: number, fromState: string, toState: string, reason?: string): void {
    this.log(
      LogLevel.INFO,
      LogCategory.STATE_TRANSITION,
      `${entity} ${entityId}: ${fromState} → ${toState}`,
      { entity, entityId, fromState, toState, reason }
    );
  }

  static logTestAccountAction(accountId: number, action: string, data?: any): void {
    this.log(
      LogLevel.DEBUG,
      LogCategory.TEST_ACCOUNT,
      `Test account ${accountId}: ${action}`,
      { accountId, action, ...data },
      undefined,
      accountId
    );
  }

  static logSimulation(simulator: string, action: string, data?: any): void {
    this.log(
      LogLevel.DEBUG,
      LogCategory.SIMULATION,
      `${simulator}: ${action}`,
      { simulator, action, ...data }
    );
  }

  static logVerification(testName: string, passed: boolean, details?: any): void {
    this.log(
      passed ? LogLevel.INFO : LogLevel.WARN,
      LogCategory.VERIFICATION,
      `Verification ${testName}: ${passed ? 'PASSED' : 'FAILED'}`,
      { testName, passed, details }
    );
  }

  static logSecurity(event: string, severity: 'low' | 'medium' | 'high' | 'critical', data?: any): void {
    const level = severity === 'critical' ? LogLevel.CRITICAL : 
                  severity === 'high' ? LogLevel.ERROR :
                  severity === 'medium' ? LogLevel.WARN : LogLevel.INFO;

    this.log(
      level,
      LogCategory.SECURITY,
      `Security event: ${event}`,
      { event, severity, ...data }
    );
  }

  // Query methods
  static getLogs(filters?: {
    level?: LogLevel;
    category?: LogCategory;
    phase?: TestPhase;
    domain?: string;
    userId?: number;
    since?: string;
    limit?: number;
  }): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filters.level);
      }
      if (filters.category) {
        filteredLogs = filteredLogs.filter(log => log.category === filters.category);
      }
      if (filters.phase) {
        filteredLogs = filteredLogs.filter(log => log.phase === filters.phase);
      }
      if (filters.domain) {
        filteredLogs = filteredLogs.filter(log => log.domain === filters.domain);
      }
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }
      if (filters.since) {
        const sinceDate = new Date(filters.since);
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= sinceDate);
      }
      if (filters.limit) {
        filteredLogs = filteredLogs.slice(-filters.limit);
      }
    }

    return filteredLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  static getLogSummary(): {
    totalLogs: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<LogCategory, number>;
    byPhase: Record<TestPhase, number>;
    recentErrors: LogEntry[];
  } {
    const summary = {
      totalLogs: this.logs.length,
      byLevel: {} as Record<LogLevel, number>,
      byCategory: {} as Record<LogCategory, number>,
      byPhase: {} as Record<TestPhase, number>,
      recentErrors: this.logs
        .filter(log => log.level === LogLevel.ERROR || log.level === LogLevel.CRITICAL)
        .slice(-10)
    };

    // Initialize counters
    Object.values(LogLevel).forEach(level => summary.byLevel[level] = 0);
    Object.values(LogCategory).forEach(category => summary.byCategory[category] = 0);
    Object.values(TestPhase).forEach(phase => summary.byPhase[phase] = 0);

    // Count logs
    this.logs.forEach(log => {
      summary.byLevel[log.level]++;
      summary.byCategory[log.category]++;
      summary.byPhase[log.phase]++;
    });

    return summary;
  }

  static exportLogs(format: 'json' | 'csv' = 'json', filters?: any): string {
    const logs = this.getLogs(filters);

    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'category', 'phase', 'domain', 'message', 'userId', 'sessionId'];
      const csvRows = [
        headers.join(','),
        ...logs.map(log => [
          log.timestamp,
          log.level,
          log.category,
          log.phase,
          log.domain || '',
          `"${log.message.replace(/"/g, '""')}"`,
          log.userId || '',
          log.sessionId
        ].join(','))
      ];
      return csvRows.join('\n');
    }

    return JSON.stringify(logs, null, 2);
  }

  static clearLogs(): void {
    if (featureFlags.getCurrentPhase() === TestPhase.PRODUCTION) {
      throw new Error('Cannot clear logs in production');
    }

    const logCount = this.logs.length;
    this.logs = [];
    this.sessionId = this.generateSessionId();

    this.log(
      LogLevel.INFO,
      LogCategory.VERIFICATION,
      `Logs cleared: ${logCount} entries removed`
    );
  }

  static startNewSession(): void {
    this.sessionId = this.generateSessionId();
    this.log(
      LogLevel.INFO,
      LogCategory.VERIFICATION,
      `New session started: ${this.sessionId}`
    );
  }
}

// Verification Logger - specialized for test verification
export class VerificationLogger {
  private static verifications: Array<{
    id: string;
    testSuite: string;
    testName: string;
    phase: TestPhase;
    passed: boolean;
    duration: number;
    details: any;
    timestamp: string;
  }> = [];

  static recordVerification(
    testSuite: string,
    testName: string,
    passed: boolean,
    duration: number,
    details?: any
  ): void {
    const verification = {
      id: `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      testSuite,
      testName,
      phase: featureFlags.getCurrentPhase(),
      passed,
      duration,
      details,
      timestamp: new Date().toISOString()
    };

    this.verifications.push(verification);
    PhaseLogger.logVerification(`${testSuite}.${testName}`, passed, { duration, details });
  }

  static getVerificationResults(phase?: TestPhase): typeof VerificationLogger.verifications {
    if (phase) {
      return this.verifications.filter(v => v.phase === phase);
    }
    return [...this.verifications];
  }

  static getTestSuiteSummary(testSuite: string): {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
    avgDuration: number;
  } {
    const suiteTests = this.verifications.filter(v => v.testSuite === testSuite);
    const passed = suiteTests.filter(v => v.passed).length;
    const total = suiteTests.length;
    const avgDuration = total > 0 ? 
      suiteTests.reduce((sum, v) => sum + v.duration, 0) / total : 0;

    return {
      total,
      passed,
      failed: total - passed,
      passRate: total > 0 ? (passed / total) * 100 : 0,
      avgDuration
    };
  }

  static clearVerifications(): void {
    this.verifications = [];
    PhaseLogger.log(LogLevel.INFO, LogCategory.VERIFICATION, 'Verification results cleared');
  }
}