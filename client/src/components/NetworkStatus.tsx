import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';

export default function NetworkStatus() {
  const { isOnline, isReconnecting } = useNetworkStatus();

  if (isOnline && !isReconnecting) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-2 text-center text-sm">
      <div className="flex items-center justify-center space-x-2">
        {isReconnecting ? (
          <>
            <Wifi className="w-4 h-4 animate-pulse" />
            <span>Connection lost, retrying...</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>No internet connection</span>
          </>
        )}
      </div>
    </div>
  );
}