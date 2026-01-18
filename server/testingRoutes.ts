import express from 'express';
import { featureFlags, TestPhase } from '../shared/featureFlags.js';
import { PhaseEnforcer, PhaseController, phaseMiddleware } from '../shared/phaseEnforcement.js';
import { TestAccountManager, TestAdminCommands } from '../shared/testAccounts.js';
import { DebugController } from '../shared/debugTools.js';
import { PhaseLogger, VerificationLogger, LogLevel, LogCategory } from '../shared/phaseLogging.js';

const router = express.Router();

// Phase status endpoint
router.get('/phase/status', (req, res) => {
  try {
    const status = PhaseController.getCurrentPhaseStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Phase transition endpoint
router.post('/phase/transition', async (req, res) => {
  try {
    const { targetPhase } = req.body;
    
    if (!Object.values(TestPhase).includes(targetPhase)) {
      return res.status(400).json({ error: 'Invalid phase' });
    }

    const success = await PhaseController.transitionTo(targetPhase);
    
    if (success) {
      PhaseLogger.logPhaseTransition(featureFlags.getCurrentPhase(), targetPhase, true);
      res.json({ success: true, newPhase: targetPhase });
    } else {
      res.status(400).json({ error: 'Phase transition failed' });
    }
  } catch (error) {
    PhaseLogger.logPhaseTransition(featureFlags.getCurrentPhase(), req.body.targetPhase, false);
    res.status(400).json({ error: (error as Error).message });
  }
});

// Available transitions
router.get('/phase/transitions', (req, res) => {
  const transitions = PhaseController.getAvailableTransitions();
  res.json({ availableTransitions: transitions });
});

// Feature flags management
router.get('/flags', (req, res) => {
  const flags = featureFlags.getFlags();
  const testConfig = featureFlags.getTestConfig();
  
  res.json({
    flags,
    testConfig,
    currentPhase: featureFlags.getCurrentPhase()
  });
});

router.put('/flags/:flagName', (req, res) => {
  try {
    const { flagName } = req.params;
    const { value } = req.body;
    
    if (typeof value !== 'boolean') {
      return res.status(400).json({ error: 'Flag value must be boolean' });
    }

    const oldValue = featureFlags.isEnabled(flagName as any);
    featureFlags.updateFlag(flagName as any, value);
    
    PhaseLogger.logFeatureFlagChange(flagName, oldValue, value);
    
    res.json({ success: true, flag: flagName, value });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Test accounts management
router.get('/test-accounts', (req, res) => {
  try {
    const { type, phase } = req.query;
    const accounts = TestAccountManager.getTestAccounts(
      type as any, 
      phase as TestPhase
    );
    
    res.json({
      accounts: accounts.map(acc => ({
        id: acc.id,
        type: acc.type,
        email: acc.email,
        name: acc.name,
        phase: acc.phase
      })),
      currentPhase: featureFlags.getCurrentPhase()
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/test-accounts/summary', (req, res) => {
  try {
    const summary = TestAdminCommands.getTestAccountSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Test admin commands
router.post('/test-admin/create-request', async (req, res) => {
  try {
    const { userId, driverId } = req.body;
    const request = await TestAdminCommands.createTestRequest(userId, driverId);
    
    PhaseLogger.logTestAccountAction(userId, 'create_request', { requestId: request.requestId });
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.post('/test-admin/driver-response', async (req, res) => {
  try {
    const { driverId, requestId, action } = req.body;
    const response = await TestAdminCommands.simulateDriverResponse(driverId, requestId, action);
    
    PhaseLogger.logTestAccountAction(driverId, `driver_${action}`, { requestId });
    res.json(response);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.post('/test-admin/reset-data', async (req, res) => {
  try {
    await TestAdminCommands.resetTestData();
    PhaseLogger.log(LogLevel.INFO, LogCategory.TEST_ACCOUNT, 'Test data reset by admin');
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.post('/test-admin/driver-status', async (req, res) => {
  try {
    const { driverId, status } = req.body;
    await TestAdminCommands.setDriverStatus(driverId, status);
    
    PhaseLogger.logStateTransition('driver', driverId, 'unknown', status, 'admin_override');
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.post('/test-admin/move-driver', async (req, res) => {
  try {
    const { driverId, latitude, longitude } = req.body;
    await TestAdminCommands.moveDriver(driverId, latitude, longitude);
    
    PhaseLogger.logTestAccountAction(driverId, 'location_update', { latitude, longitude });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Debug tools
router.get('/debug/status', (req, res) => {
  try {
    const status = DebugController.getSystemStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/debug/reset', (req, res) => {
  try {
    DebugController.resetAllSimulators();
    PhaseLogger.log(LogLevel.INFO, LogCategory.SIMULATION, 'All simulators reset');
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.post('/debug/enable', (req, res) => {
  try {
    DebugController.enableDebugMode();
    res.json({ success: true, debugMode: true });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.post('/debug/disable', (req, res) => {
  try {
    DebugController.disableDebugMode();
    res.json({ success: true, debugMode: false });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Logging endpoints
router.get('/logs', (req, res) => {
  try {
    const { level, category, phase, domain, userId, since, limit } = req.query;
    
    const filters = {
      level: level as any,
      category: category as any,
      phase: phase as TestPhase,
      domain: domain as string,
      userId: userId ? parseInt(userId as string) : undefined,
      since: since as string,
      limit: limit ? parseInt(limit as string) : undefined
    };

    const logs = PhaseLogger.getLogs(filters);
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/logs/summary', (req, res) => {
  try {
    const summary = PhaseLogger.getLogSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/logs/export', (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const logs = PhaseLogger.exportLogs(format as any);
    
    const filename = `towapp_logs_${Date.now()}.${format}`;
    const contentType = format === 'csv' ? 'text/csv' : 'application/json';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(logs);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/logs', (req, res) => {
  try {
    PhaseLogger.clearLogs();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Verification endpoints
router.get('/verification/results', (req, res) => {
  try {
    const { phase } = req.query;
    const results = VerificationLogger.getVerificationResults(phase as TestPhase);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/verification/summary/:testSuite', (req, res) => {
  try {
    const { testSuite } = req.params;
    const summary = VerificationLogger.getTestSuiteSummary(testSuite);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/verification/results', (req, res) => {
  try {
    VerificationLogger.clearVerifications();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Domain-specific routes with phase enforcement
router.use('/auth', phaseMiddleware('auth'));
router.use('/driver', phaseMiddleware('driver'));
router.use('/user', phaseMiddleware('user'));
router.use('/request', phaseMiddleware('request_lifecycle'));
router.use('/notifications', phaseMiddleware('notifications'));
router.use('/admin', phaseMiddleware('admin'));

export default router;