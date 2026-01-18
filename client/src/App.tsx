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
import ServiceSelection from "@/pages/service-selection";
import PhotoCapture from "@/pages/photo-capture";
import Home from "@/pages/home";
import UserMap from "@/pages/user-map";
import DriverMap from "@/pages/driver-map";
import UserProfile from "@/pages/user-profile";
import DriverProfile from "@/pages/driver-profile";
import PaymentMethods from "@/pages/payment-methods";
import TripHistory from "@/pages/trip-history";
import DriverEarnings from "@/pages/driver/earnings";
import JobHistory from "@/pages/driver/job-history";
import ActiveCampaigns from "@/pages/driver/campaigns";
import ScheduledJobs from "@/pages/driver/scheduled-jobs";
import DriverSupport from "@/pages/driver/support";
import InviteDrivers from "@/pages/driver/invite-drivers";
import DriverSettings from "@/pages/driver/settings";
import PermissionsConsent from "@/pages/permissions-consent";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import NetworkStatus from "@/components/NetworkStatus";
import DriverSignup from "@/pages/driver-signup";
import DriverVerificationPending from "@/pages/driver-verification-pending";
import UserSignup from "@/pages/user-signup";
import UserVehicleSetup from "@/pages/user-vehicle-setup";
import UserVehicles from "@/pages/user-vehicles";
import DriverArrival from "@/pages/driver-arrival";
import DriverInTransit from "@/pages/driver-in-transit";
import DriverDestinationArrival from "@/pages/driver-destination-arrival";
import TripInvoice from "@/pages/trip-invoice";
import TripRating from "@/pages/trip-rating";
import TestInvoice from "@/pages/test-invoice";

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
    <>
      <NetworkStatus />
      <Switch>
        <Route path="/" component={Splash} />
        <Route path="/permissions-consent" component={PermissionsConsent} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/role-selection" component={RoleSelection} />
        <Route path="/driver-signup" component={DriverSignup} />
        <Route path="/driver-verification-pending" component={DriverVerificationPending} />
        <Route path="/user-signup" component={UserSignup} />
        <Route path="/user-vehicle-setup" component={UserVehicleSetup} />
        <Route path="/user-vehicles" component={UserVehicles} />
        <Route path="/driver-arrival" component={DriverArrival} />
        <Route path="/driver-in-transit" component={DriverInTransit} />
        <Route path="/driver-destination-arrival" component={DriverDestinationArrival} />
        <Route path="/trip-invoice" component={TripInvoice} />
        <Route path="/trip-rating" component={TripRating} />
        <Route path="/test-invoice" component={TestInvoice} />
        <Route path="/user-auth" component={UserAuth} />
        <Route path="/driver-auth" component={DriverAuth} />
        <Route path="/home" component={Home} />
        <Route path="/service-selection" component={ServiceSelection} />
        <Route path="/photo-capture" component={PhotoCapture} />
        <Route path="/user-map" component={UserMap} />
        <Route path="/driver-map" component={DriverMap} />
        
        {user && (
          <>
            {user.userType === 'user' ? (
              <>
                <Route path="/profile" component={UserProfile} />
                <Route path="/payment-methods" component={PaymentMethods} />
                <Route path="/trip-history" component={TripHistory} />
              </>
            ) : (
              <>
                <Route path="/profile" component={DriverProfile} />
                <Route path="/driver/earnings" component={DriverEarnings} />
                <Route path="/driver/job-history" component={JobHistory} />
                <Route path="/driver/campaigns" component={ActiveCampaigns} />
                <Route path="/driver/scheduled-jobs" component={ScheduledJobs} />
                <Route path="/driver/support" component={DriverSupport} />
                <Route path="/driver/invite-drivers" component={InviteDrivers} />
                <Route path="/driver/settings" component={DriverSettings} />
              </>
            )}
          </>
        )}
        
        <Route component={NotFound} />
      </Switch>
    </>
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
