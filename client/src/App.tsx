import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Splash from "@/pages/splash";
import RoleSelection from "@/pages/role-selection";
import UserAuth from "@/pages/user-auth";
import DriverAuth from "@/pages/driver-auth";
import UserMap from "@/pages/user-map";
import DriverMap from "@/pages/driver-map";
import UserProfile from "@/pages/user-profile";
import DriverProfile from "@/pages/driver-profile";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-towapp-orange"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!user ? (
        <>
          <Route path="/" component={Splash} />
          <Route path="/role-selection" component={RoleSelection} />
          <Route path="/user-auth" component={UserAuth} />
          <Route path="/driver-auth" component={DriverAuth} />
        </>
      ) : (
        <>
          {user.userType === 'user' ? (
            <>
              <Route path="/" component={UserMap} />
              <Route path="/profile" component={UserProfile} />
            </>
          ) : (
            <>
              <Route path="/" component={DriverMap} />
              <Route path="/profile" component={DriverProfile} />
            </>
          )}
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
