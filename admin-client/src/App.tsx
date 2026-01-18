import { Switch, Route, useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, Users, UserCheck, LogOut, Truck, MapPin, 
  AlertTriangle, DollarSign, Megaphone, Settings, FileText,
  Zap, Bell, BarChart3, Shield
} from 'lucide-react';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DriverApplications from './pages/DriverApplications';
import UserSignups from './pages/UserSignups';
import LiveOperations from './pages/LiveOperations';
import JobManagement from './pages/JobManagement';
import DriverManagement from './pages/DriverManagement';
import UserManagement from './pages/UserManagement';
import Disputes from './pages/Disputes';
import Finance from './pages/Finance';
import Campaigns from './pages/Campaigns';
import Notifications from './pages/Notifications';
import SystemConfig from './pages/SystemConfig';
import AuditLogs from './pages/AuditLogs';

function AdminLayout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    const adminData = localStorage.getItem('admin_user');
    if (adminData) {
      setAdmin(JSON.parse(adminData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setLocation('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, section: 'main' },
    { name: 'Live Operations', href: '/live-operations', icon: MapPin, section: 'operations' },
    { name: 'Job Management', href: '/jobs', icon: Truck, section: 'operations' },
    { name: 'Driver Applications', href: '/driver-applications', icon: UserCheck, section: 'drivers' },
    { name: 'Driver Management', href: '/drivers', icon: Shield, section: 'drivers' },
    { name: 'User Management', href: '/users', icon: Users, section: 'users' },
    { name: 'Disputes & Incidents', href: '/disputes', icon: AlertTriangle, section: 'support' },
    { name: 'Finance & Earnings', href: '/finance', icon: DollarSign, section: 'finance' },
    { name: 'Campaigns & Pricing', href: '/campaigns', icon: Zap, section: 'marketing' },
    { name: 'Notifications', href: '/notifications', icon: Bell, section: 'communications' },
    { name: 'System Configuration', href: '/system', icon: Settings, section: 'system' },
    { name: 'Audit Logs', href: '/audit', icon: FileText, section: 'compliance' },
  ];

  const navigationSections = {
    main: 'Overview',
    operations: 'Operations',
    drivers: 'Driver Management',
    users: 'User Management', 
    support: 'Support',
    finance: 'Financial',
    marketing: 'Marketing',
    communications: 'Communications',
    system: 'System',
    compliance: 'Compliance'
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white">TOWAPP Admin</h1>
          {admin && (
            <div className="mt-4 p-3 bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-300">{admin.email}</p>
              <p className="text-xs text-gray-400 capitalize">{admin.role.replace('_', ' ')}</p>
            </div>
          )}
        </div>

        <nav className="mt-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {Object.entries(navigationSections).map(([sectionKey, sectionName]) => {
            const sectionItems = navigation.filter(item => item.section === sectionKey);
            if (sectionItems.length === 0) return null;
            
            return (
              <div key={sectionKey} className="mb-6">
                <h3 className="px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {sectionName}
                </h3>
                {sectionItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setLocation(item.href)}
                    className="w-full flex items-center px-6 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.name}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setLocation('/');
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, [setLocation]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <AdminLayout>{children}</AdminLayout> : null;
}

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard">
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      </Route>
      <Route path="/live-operations">
        <ProtectedRoute><LiveOperations /></ProtectedRoute>
      </Route>
      <Route path="/jobs">
        <ProtectedRoute><JobManagement /></ProtectedRoute>
      </Route>
      <Route path="/driver-applications">
        <ProtectedRoute><DriverApplications /></ProtectedRoute>
      </Route>
      <Route path="/drivers">
        <ProtectedRoute><DriverManagement /></ProtectedRoute>
      </Route>
      <Route path="/users">
        <ProtectedRoute><UserManagement /></ProtectedRoute>
      </Route>
      <Route path="/disputes">
        <ProtectedRoute><Disputes /></ProtectedRoute>
      </Route>
      <Route path="/finance">
        <ProtectedRoute><Finance /></ProtectedRoute>
      </Route>
      <Route path="/campaigns">
        <ProtectedRoute><Campaigns /></ProtectedRoute>
      </Route>
      <Route path="/notifications">
        <ProtectedRoute><Notifications /></ProtectedRoute>
      </Route>
      <Route path="/system">
        <ProtectedRoute><SystemConfig /></ProtectedRoute>
      </Route>
      <Route path="/audit">
        <ProtectedRoute><AuditLogs /></ProtectedRoute>
      </Route>
      <Route>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">404 - Page Not Found</h1>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="text-orange-400 hover:text-orange-300"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </Route>
    </Switch>
  );
}