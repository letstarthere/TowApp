import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { User, History, Navigation, Star, Truck, ChevronDown, CreditCard, Search, X, Home, MapPin, Calendar, Package, Fuel, Wrench, Zap } from "lucide-react";
import applePayLogo from "@assets/Apple_Pay-Logo.wine.svg";
import mastercardLogo from "../../../attached_assets/mastercard.jpg";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import Map from "@/components/map";
import scheduleIcon from "../../../attached_assets/schedule.png";
import storageTruckIcon from "../../../attached_assets/storage-truck.png";
import fuelIcon from "../../../attached_assets/fuel.png";
import tireChangeIcon from "../../../attached_assets/tire-change-icon.png";
import batteryJumpIcon from "../../../attached_assets/battery-jump.png";
import warehouseIcon from "../../../attached_assets/towapp-warehouse.png";
import RequestModal from "@/components/request-modal";
import SearchingDriver from "@/components/searching-driver";
import DriverOnWay from "@/components/driver-on-way";
import TowingInProgress from "@/components/towing-in-progress";
import DrivingToDestination from "@/components/driving-to-destination";
import DestinationArrived from "@/components/destination-arrived";
import RoadAssistanceConcluded from "@/components/road-assistance-concluded";
import TowTruckCard from "@/components/tow-truck-card";
import WelcomePopup from "@/components/welcome-popup";
import { pushNotificationManager } from "@/lib/pushNotifications";
import type { DriverWithUser, MockDriver } from "@/lib/types";

declare global {
  interface Window {
    google: any;
  }
}

export default function UserMap() {
  const [, setLocation] = useLocation();
  const [pickupLocation, setPickupLocation] = useState("Current Location");
  const [dropoffLocation, setDropoffLocation] = useState(() => localStorage.getItem('dropoffLocation') || '');
  
  // Save dropoff location to localStorage
  useEffect(() => {
    localStorage.setItem('dropoffLocation', dropoffLocation);
  }, [dropoffLocation]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<MockDriver | null>(null);
  const [nearestDriver, setNearestDriver] = useState<MockDriver | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentView, setCurrentView] = useState<'car' | 'location' | 'confirmAddress' | 'trucks' | 'confirm'>(() => {
    const saved = localStorage.getItem('currentView');
    return (saved as any) || 'car';
  });
  
  // Save current view to localStorage
  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [isCardTransitioning, setIsCardTransitioning] = useState(false);
  const [selectedStandardDriver, setSelectedStandardDriver] = useState<number>(1); // Auto-select first standard driver
  const [isSearching, setIsSearching] = useState(false);
  const [driverFound, setDriverFound] = useState(false);
  const [assignedDriver, setAssignedDriver] = useState<any>(null);
  const [driverAccepted, setDriverAccepted] = useState(false);
  const [driverArrived, setDriverArrived] = useState(false);
  const [towingInProgress, setTowingInProgress] = useState(false);
  const [drivingToDestination, setDrivingToDestination] = useState(false);
  const [destinationArrived, setDestinationArrived] = useState(false);
  const [serviceCompleted, setServiceCompleted] = useState(false);
  const [routePhase, setRoutePhase] = useState<'pickup' | 'delivery'>('pickup');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('Apple Pay');
  const [selectedPremiumProvider, setSelectedPremiumProvider] = useState<string | null>(null);
  const [truckPricing, setTruckPricing] = useState<Record<number, number>>({});
  const [dragHeight, setDragHeight] = useState(70); // Height as percentage
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(40);
  const dropoffInputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<any>(null);
  const [mapKey, setMapKey] = useState(0);
  const [shouldDrawRoute, setShouldDrawRoute] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(() => {
    const hasShown = localStorage.getItem('welcomeShown');
    const shouldShow = !hasShown;
    if (shouldShow) {
      localStorage.setItem('welcomeShown', 'true');
    }
    return shouldShow;
  });
  
  const { user } = useAuth();
  const { location, error: locationError } = useGeolocation();
  const { toast } = useToast();
  
  // Animate bottom sheet on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBottomSheetVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  // WebSocket connection
  useWebSocket(user?.id || 0, (message) => {
    if (message.type === 'request_accepted') {
      const driver = {
        id: 1,
        name: 'Sean Bampoe',
        vehicleType: 'Flatbed Truck',
        licensePlate: 'GT-1234-GP',
        rating: 4.8,
        phone: '+27123456700',
        currentLatitude: -25.7483, // 9 Havelock Rd, Willow Park Manor, Pretoria
        currentLongitude: 28.2299
      };
      
      setAssignedDriver(driver);
      setDriverAccepted(true);
      setIsSearching(false);
      setDriverFound(false);
      setShowRequestModal(false);
    }
  });

  // Mapbox geocoding for address suggestions
  useEffect(() => {
    const recentLocations = [
      'Sandton City Mall, Johannesburg',
      'OR Tambo International Airport'
    ];
    
    if (!showSuggestions) {
      setAddressSuggestions([]);
      return;
    }
    
    if (!dropoffLocation || dropoffLocation.length < 3) {
      setAddressSuggestions(recentLocations);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(dropoffLocation)}.json?access_token=pk.eyJ1Ijoic2VhbmJhbXBvZS0xMjMiLCJhIjoiY21rbnkzNWZ3MDBrYjNscW4yNGJsbHBxYiJ9.BJHCl5yY8vUv_1lwOgMjuA&country=za&limit=5`
        );
        const data = await response.json();
        if (data.features) {
          setAddressSuggestions(data.features.map((f: any) => f.place_name));
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [dropoffLocation, showSuggestions]);

  // Load service selection from localStorage
  useEffect(() => {
    const requestType = localStorage.getItem('requestType');
    const pickup = localStorage.getItem('pickupLocation');
    const dropoff = localStorage.getItem('dropoffLocation');
    
    setPickupLocation(pickup || 'Current Location');
    setDropoffLocation(dropoff || '');
  }, []);

  // Calculate dynamic pricing for all trucks
  useEffect(() => {
    if (!location) return;

    const calculatePricing = async () => {
      const carType = localStorage.getItem('carType') || 'sedan';
      const distanceInKm = 12; // Mock distance
      
      const pricingPromises = allDrivers.map(async (driver) => {
        try {
          const baseFare = 300;
          const transactionFee = 30;
          const baseKmRate = driver.towType === 'hook' ? 20 : 22.5;
          const vehicleMultiplier = carType.toLowerCase() === 'suv' || carType.toLowerCase().includes('bakkie') ? 1.2 : 1.0;
          
          const timeModifier = calculateTimeModifier();
          const adjustedKmRate = baseKmRate * 1.15 * vehicleMultiplier * timeModifier;
          const distanceCost = adjustedKmRate * distanceInKm;
          const tripSubtotal = baseFare + transactionFee + distanceCost;
          const bookingFee = tripSubtotal * 0.08;
          let totalFare = tripSubtotal + bookingFee;
          
          if (driver.premiumProvider === 'Outsurance') {
            totalFare = totalFare * 1.15;
          } else if (driver.premiumProvider === 'FirstHelp') {
            totalFare = totalFare * 1.18;
          }
          
          return { id: driver.id, price: Math.round(totalFare) };
        } catch (error) {
          return { id: driver.id, price: 350 };
        }
      });
      
      const results = await Promise.all(pricingPromises);
      const pricingMap = results.reduce((acc, { id, price }) => {
        acc[id] = price;
        return acc;
      }, {} as Record<number, number>);
      
      setTruckPricing(pricingMap);
    };

    calculatePricing();
  }, [location]);

  const calculateTimeModifier = (): number => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 6 && hour <= 18) {
      return 1.0; // Normal hours
    } else if (hour >= 19 && hour <= 21) {
      return 1.1; // Evening
    } else if (hour >= 22 || hour <= 4) {
      return 1.25; // Late night / after-hours
    } else if (hour === 5) {
      return 1.15; // Early morning
    }
    
    return 1.0; // Fallback
  };

  const standardDrivers: MockDriver[] = [
    {
      id: 1,
      type: 'standard',
      name: 'Standard Tow Service',
      towType: 'hook',
      eta: '15-20 min',
      rating: 4.2,
      currentLatitude: -26.1956,
      currentLongitude: 28.0342
    },
    {
      id: 4,
      type: 'standard',
      name: 'Flatbed Tow Truck',
      towType: 'flatbed',
      eta: '18-25 min',
      rating: 4.3,
      currentLatitude: -26.2100,
      currentLongitude: 28.0500
    },
    {
      id: 5,
      type: 'standard',
      name: 'Hook-and-Chain Tow Truck',
      towType: 'hook',
      eta: '12-18 min',
      rating: 4.1,
      currentLatitude: -26.1800,
      currentLongitude: 28.0200
    }
  ];

  const premiumDrivers: (MockDriver & { premiumProvider: string })[] = [
    {
      id: 2,
      type: 'premium',
      name: 'Outsurance',
      towType: 'flatbed',
      eta: '8-12 min',
      rating: 4.9,
      premiumProvider: 'Outsurance',
      currentLatitude: -25.7483,
      currentLongitude: 28.2299
    },
    {
      id: 3,
      type: 'premium', 
      name: 'FirstHelp',
      towType: 'hook',
      eta: '10-15 min',
      rating: 4.8,
      premiumProvider: 'FirstHelp',
      currentLatitude: -25.7490,
      currentLongitude: 28.2315
    },
    {
      id: 6,
      type: 'premium', 
      name: 'MiWay',
      towType: 'flatbed',
      eta: '12-18 min',
      rating: 4.7,
      premiumProvider: 'MiWay',
      currentLatitude: -25.7500,
      currentLongitude: 28.2280
    }
  ];
  
  let allDrivers: MockDriver[] = [...standardDrivers, ...premiumDrivers];
  const nearbyDrivers = allDrivers;
  const driversLoading = false;

  // Find nearest driver automatically after login
  useEffect(() => {
    if (location && allDrivers.length > 0 && !nearestDriver) {
      const distances = allDrivers.map(driver => {
        const distance = Math.sqrt(
          Math.pow(location.latitude - (driver.currentLatitude || 0), 2) +
          Math.pow(location.longitude - (driver.currentLongitude || 0), 2)
        );
        return { driver, distance };
      });
      const nearest = distances.sort((a, b) => a.distance - b.distance)[0]?.driver;
      setNearestDriver(nearest);
    }
  }, [location, nearbyDrivers, nearestDriver]);

  // Create request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      return apiRequest("POST", "/api/requests", requestData);
    },
    onSuccess: () => {
      toast({
        title: "Request Sent!",
        description: "Your tow request has been sent to nearby drivers",
      });
      setShowRequestModal(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [selectedCar, setSelectedCar] = useState<'current' | 'different' | null>(() => {
    const saved = localStorage.getItem('selectedCar');
    return (saved as any) || 'current';
  });
  
  // Save selected car to localStorage
  useEffect(() => {
    if (selectedCar) {
      localStorage.setItem('selectedCar', selectedCar);
    }
  }, [selectedCar]);
  const [showCarDetails, setShowCarDetails] = useState(false);
  const [carPhotos, setCarPhotos] = useState<{[key: string]: string}>(() => {
    const saved = localStorage.getItem('carPhotos');
    return saved ? JSON.parse(saved) : {};
  });
  
  // Save photos to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(carPhotos).length > 0) {
      localStorage.setItem('carPhotos', JSON.stringify(carPhotos));
    }
  }, [carPhotos]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [currentPhotoSide, setCurrentPhotoSide] = useState<string>('');
  const [vehicleSearch, setVehicleSearch] = useState(() => localStorage.getItem('vehicleSearch') || '');
  const [selectedVehicle, setSelectedVehicle] = useState<any>(() => {
    const saved = localStorage.getItem('selectedVehicle');
    return saved ? JSON.parse(saved) : null;
  });
  const [licensePlate, setLicensePlate] = useState(() => localStorage.getItem('licensePlate') || '');
  
  // Save vehicle data to localStorage
  useEffect(() => {
    localStorage.setItem('vehicleSearch', vehicleSearch);
  }, [vehicleSearch]);
  
  useEffect(() => {
    if (selectedVehicle) {
      localStorage.setItem('selectedVehicle', JSON.stringify(selectedVehicle));
    }
  }, [selectedVehicle]);
  
  useEffect(() => {
    localStorage.setItem('licensePlate', licensePlate);
  }, [licensePlate]);
  
  // Vehicle database for fuzzy search
  const vehicleDatabase = [
    // Toyota
    { name: 'Corolla', category: 'Sedan', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Corolla Quest', category: 'Sedan', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Camry', category: 'Sedan', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Hilux', category: 'Bakkie', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    { name: 'Fortuner', category: 'SUV', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    { name: 'RAV4', category: 'SUV', towClass: 'Light', axleCount: 2, driveType: '4WD' },
    { name: 'Prado', category: 'SUV', towClass: 'Heavy', axleCount: 2, driveType: '4WD' },
    { name: 'Yaris', category: 'Hatchback', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Avanza', category: 'MPV', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    
    // Volkswagen
    { name: 'Polo', category: 'Hatchback', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Golf', category: 'Hatchback', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Jetta', category: 'Sedan', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Tiguan', category: 'SUV', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    { name: 'Amarok', category: 'Bakkie', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    
    // BMW
    { name: 'BMW 1 Series', category: 'Hatchback', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'BMW 3 Series', category: 'Sedan', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'BMW 5 Series', category: 'Sedan', towClass: 'Medium', axleCount: 2, driveType: '2WD' },
    { name: 'BMW X1', category: 'SUV', towClass: 'Light', axleCount: 2, driveType: '4WD' },
    { name: 'BMW X3', category: 'SUV', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    { name: 'BMW X5', category: 'SUV', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    
    // Ford
    { name: 'Ranger', category: 'Bakkie', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    { name: 'EcoSport', category: 'SUV', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Everest', category: 'SUV', towClass: 'Heavy', axleCount: 2, driveType: '4WD' },
    { name: 'Fiesta', category: 'Hatchback', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Focus', category: 'Hatchback', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    
    // Nissan
    { name: 'Micra', category: 'Hatchback', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Almera', category: 'Sedan', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Qashqai', category: 'SUV', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'X-Trail', category: 'SUV', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    { name: 'Navara', category: 'Bakkie', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    
    // Hyundai
    { name: 'i10', category: 'Hatchback', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'i20', category: 'Hatchback', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Accent', category: 'Sedan', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Tucson', category: 'SUV', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    { name: 'Creta', category: 'SUV', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    
    // Kia
    { name: 'Picanto', category: 'Hatchback', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Rio', category: 'Hatchback', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Cerato', category: 'Sedan', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Sportage', category: 'SUV', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    { name: 'Sorento', category: 'SUV', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    
    // Honda
    { name: 'Brio', category: 'Hatchback', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Ballade', category: 'Sedan', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Civic', category: 'Sedan', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'HR-V', category: 'SUV', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'CR-V', category: 'SUV', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    
    // Mazda
    { name: 'Mazda2', category: 'Hatchback', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Mazda3', category: 'Hatchback', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'CX-3', category: 'SUV', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'CX-5', category: 'SUV', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    
    // Isuzu
    { name: 'D-Max', category: 'Bakkie', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    { name: 'MU-X', category: 'SUV', towClass: 'Heavy', axleCount: 2, driveType: '4WD' },
    
    // Mitsubishi
    { name: 'Mirage', category: 'Hatchback', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'ASX', category: 'SUV', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Outlander', category: 'SUV', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    { name: 'Triton', category: 'Bakkie', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    
    // Suzuki
    { name: 'Swift', category: 'Hatchback', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Vitara', category: 'SUV', towClass: 'Light', axleCount: 2, driveType: '4WD' },
    { name: 'Jimny', category: 'SUV', towClass: 'Light', axleCount: 2, driveType: '4WD' },
    
    // Renault
    { name: 'Kwid', category: 'Hatchback', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Sandero', category: 'Hatchback', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Duster', category: 'SUV', towClass: 'Light', axleCount: 2, driveType: '4WD' },
    
    // Chevrolet
    { name: 'Spark', category: 'Hatchback', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Aveo', category: 'Sedan', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Captiva', category: 'SUV', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    
    // Mahindra
    { name: 'KUV100', category: 'SUV', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'XUV300', category: 'SUV', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Scorpio', category: 'SUV', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    { name: 'Pik Up', category: 'Bakkie', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    
    // Haval
    { name: 'H1', category: 'SUV', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'H2', category: 'SUV', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    { name: 'H6', category: 'SUV', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    
    // GWM
    { name: 'Steed', category: 'Bakkie', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    { name: 'P Series', category: 'Bakkie', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    
    // Datsun
    { name: 'Go', category: 'Hatchback', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Go+', category: 'MPV', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    
    // Chery
    { name: 'QQ', category: 'Hatchback', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Tiggo', category: 'SUV', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    
    // JAC
    { name: 'J2', category: 'Hatchback', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'T6', category: 'Bakkie', towClass: 'Medium', axleCount: 2, driveType: '4WD' },
    
    // Tata
    { name: 'Bolt', category: 'Hatchback', towClass: 'Light', axleCount: 2, driveType: '2WD' },
    { name: 'Xenon', category: 'Bakkie', towClass: 'Medium', axleCount: 2, driveType: '4WD' }
  ];
  
  const fuzzySearch = (query: string) => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return vehicleDatabase
      .filter(vehicle => 
        vehicle.name.toLowerCase().includes(lowerQuery) ||
        vehicle.category.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => {
        const aStartsWith = a.name.toLowerCase().startsWith(lowerQuery);
        const bStartsWith = b.name.toLowerCase().startsWith(lowerQuery);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 8);
  };
  
  const handleVehicleSelect = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setVehicleSearch(vehicle.name);
    setShowSuggestions(false);
  };
  
  const handlePhotoCapture = async (side: string) => {
    setCurrentPhotoSide(side);
    setShowCameraModal(true);
  };
  
  const takePicture = async () => {
    try {
      setIsUploadingPhoto(true);
      
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      
      const permissions = await Camera.requestPermissions({ permissions: ['camera'] });
      if (permissions.camera !== 'granted') {
        toast({
          title: "Permission Denied",
          description: "Camera permission is required to take photos.",
          variant: "destructive"
        });
        setShowCameraModal(false);
        setIsUploadingPhoto(false);
        return;
      }
      
      const image = await Camera.getPhoto({
        quality: 30,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        width: 480,
        height: 360,
        saveToGallery: false
      });
      
      if (image.base64String) {
        const base64 = `data:image/jpeg;base64,${image.base64String}`;
        setCarPhotos(prev => ({ ...prev, [currentPhotoSide]: base64 }));
      }
      
      setShowCameraModal(false);
      setIsUploadingPhoto(false);
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
      setShowCameraModal(false);
      setIsUploadingPhoto(false);
    }
  };
  
  const selectFromGallery = async () => {
    try {
      setIsUploadingPhoto(true);
      
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      
      const permissions = await Camera.requestPermissions({ permissions: ['photos'] });
      if (permissions.photos !== 'granted') {
        toast({
          title: "Permission Denied",
          description: "Photo library permission is required.",
          variant: "destructive"
        });
        setShowCameraModal(false);
        setIsUploadingPhoto(false);
        return;
      }
      
      const image = await Camera.getPhoto({
        quality: 30,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
        width: 480,
        height: 360
      });
      
      if (image.base64String) {
        const base64 = `data:image/jpeg;base64,${image.base64String}`;
        setCarPhotos(prev => ({ ...prev, [currentPhotoSide]: base64 }));
      }
      
      setShowCameraModal(false);
      setIsUploadingPhoto(false);
    } catch (error: any) {
      console.error('Gallery error:', error);
      
      // User cancelled - just close modal without error
      if (error.message && error.message.includes('cancel')) {
        setShowCameraModal(false);
        setIsUploadingPhoto(false);
        return;
      }
      
      toast({
        title: "Gallery Error",
        description: "Unable to access photo gallery. Please check permissions.",
        variant: "destructive"
      });
      setShowCameraModal(false);
      setIsUploadingPhoto(false);
    }
  };

  const isPhotosComplete = () => {
    const requiredSides = ['Front', 'Back', 'Left Side', 'Right Side'];
    return requiredSides.every(side => carPhotos[side]);
  };

  const currentCar = {
    make: 'Toyota',
    model: 'Camry',
    year: '2020',
    color: 'Silver',
    licensePlate: 'ABC-123-GP',
    vin: 'JT2BF28K123456789',
    vehicleType: 'Sedan'
  };

  const homeAddress = '3234 Tshepo Street Nellmapius Ext4 Pretoria';
  const warehouseAddress = 'TowTech Warehouse, Centurion';

  const handleCarSelect = (carType: 'current' | 'different') => {
    setSelectedCar(carType);
    if (carType === 'different') {
      setShowCarDetails(true);
      setDragHeight(95);
    } else {
      setShowCarDetails(true);
      setDragHeight(80);
    }
  };

  const handleCarConfirm = () => {
    setCurrentView('location');
    setDragHeight(50);
    setShowCarDetails(false);
  };

  const handleLocationSelect = (location: string) => {
    setDropoffLocation(location);
    setShowSuggestions(false);
    setCurrentView('confirmAddress');
    setDragHeight(30);
    setShouldDrawRoute(true);
  };

  const handleConfirmAddress = () => {
    setCurrentView('trucks');
    setDragHeight(80);
  };

  const handleDriverSelect = (driver: MockDriver) => {
    setSelectedDriver(driver);
    setIsCardTransitioning(true);
    setCurrentView('confirm');
    setDragHeight(70);
    
    // Reset blur after transition completes
    setTimeout(() => {
      setIsCardTransitioning(false);
    }, 1000);
  };

  const handleBackToTrucks = () => {
    setCurrentView('trucks');
  };

  const handleBackToLocation = () => {
    setCurrentView('location');
    setDragHeight(50);
  };

  const handleRequestConfirm = async () => {
    if (!location || !selectedDriver) return;

    // Show simulating popup
    toast({
      title: "Simulating Request",
      description: "This is a simulation for testing purposes",
      duration: 3000,
    });

    // Play success sound
    pushNotificationManager.playNotificationSound();

    // Clear dropoff location to trigger pill transition
    setDropoffLocation('');
    
    setIsSearching(true);
    setDragHeight(40); // Slide down to 40% when searching
    
    // For testing, simulate the request process
    setTimeout(() => {
      // Simulate sending request to driver (this would trigger WebSocket in real app)
      console.log('Request sent to driver:', selectedDriver.name);
      
      // For testing, auto-accept after 3 seconds
      setTimeout(() => {
        const driver = {
          id: 1,
          name: 'Sean Bampoe',
          vehicleType: 'Flatbed Truck',
          licensePlate: 'GT-1234-GP',
          rating: 4.8,
          phone: '+27123456700',
          currentLatitude: -25.7483, // 9 Havelock Rd, Willow Park Manor, Pretoria
          currentLongitude: 28.2299
        };
        
        setAssignedDriver(driver);
        setDriverAccepted(true);
        setIsSearching(false);
        setDriverFound(false);
        setRoutePhase('pickup');
        
        // Show notification that driver is on the way
        pushNotificationManager.showLocalNotification({
          title: 'Driver On The Way',
          body: `${driver.name} is heading to your location. ETA: 8-12 min`,
          icon: '/assets/blackapplogo.png'
        });
        
        // Simulate driver arrival after 10 seconds
        setTimeout(() => {
          setDriverArrived(true);
          setRoutePhase('delivery');
          
          // Show notification that driver has arrived
          pushNotificationManager.showLocalNotification({
            title: 'Driver Arrived',
            body: `${driver.name} has arrived at your location`,
            icon: '/assets/blackapplogo.png'
          });
          
          // Start towing process after 10 more seconds
          setTimeout(() => {
            setTowingInProgress(true);
            setDragHeight(50);
          }, 10000);
        }, 10000);
      }, 3000);
    }, 1000);
  };

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartY(clientY);
    setStartHeight(dragHeight);
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = startY - clientY;
    const windowHeight = window.innerHeight;
    const deltaPercent = (deltaY / windowHeight) * 100;
    
    let newHeight = startHeight + deltaPercent;
    newHeight = Math.max(20, Math.min(80, newHeight)); // Limit between 20% and 80%
    
    setDragHeight(newHeight);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    
    // Define snap positions based on current view
    const snapPositions = currentView === 'location' ? [20, 40] : currentView === 'car' && showCarDetails && selectedCar === 'different' ? [95] : currentView === 'car' && showCarDetails ? [80] : currentView === 'car' ? [20, 50] : [20, 40, 80];
    
    // Find closest snap position
    let closestPosition = snapPositions[0];
    let minDistance = Math.abs(dragHeight - snapPositions[0]);
    
    for (const position of snapPositions) {
      const distance = Math.abs(dragHeight - position);
      if (distance < minDistance) {
        minDistance = distance;
        closestPosition = position;
      }
    }
    
    setDragHeight(closestPosition);
    setIsMinimized(closestPosition === 20);
  };

  const getBrandColors = (provider: string) => {
    switch (provider) {
      case 'Outsurance':
        return 'bg-green-600 text-white border-green-600';
      case 'FirstHelp':
        return 'bg-gradient-to-r from-black to-red-600 text-white border-red-600';
      case 'MiWay':
        return 'bg-pink-500 text-white border-pink-500';
      default:
        return 'border-gray-200';
    }
  };

  const handleProfileClick = () => {
    setLocation("/personal-info");
  };
  
  const handleMenuClick = () => {
    setLocation("/user-profile");
  };

  if (locationError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Location Access Required</h2>
            <p className="text-gray-600 mb-4">
              Please enable location access to find nearby tow trucks.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <>
      {showWelcomePopup && (
        <WelcomePopup
          onClose={() => setShowWelcomePopup(false)}
        />
      )}
      
      {/* DEV NAVIGATION PANEL */}
      <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white z-[100] p-2 shadow-lg">
        <div className="flex gap-2 overflow-x-auto text-xs">
          <button onClick={() => { setCurrentView('car'); setShowCarDetails(false); setDragHeight(50); }} className="px-3 py-1 bg-blue-700 rounded whitespace-nowrap">Car Select</button>
          <button onClick={() => { setCurrentView('car'); setShowCarDetails(true); setSelectedCar('current'); setDragHeight(80); }} className="px-3 py-1 bg-blue-700 rounded whitespace-nowrap">Car Details</button>
          <button onClick={() => { setCurrentView('location'); setDragHeight(40); }} className="px-3 py-1 bg-blue-700 rounded whitespace-nowrap">Location</button>
          <button onClick={() => { setCurrentView('trucks'); setDragHeight(80); }} className="px-3 py-1 bg-blue-700 rounded whitespace-nowrap">Trucks</button>
          <button onClick={() => { setCurrentView('confirm'); setSelectedDriver(standardDrivers[0]); setDragHeight(80); }} className="px-3 py-1 bg-blue-700 rounded whitespace-nowrap">Confirm</button>
          <button onClick={() => { setIsSearching(true); setDragHeight(40); }} className="px-3 py-1 bg-blue-700 rounded whitespace-nowrap">Searching</button>
          <button onClick={() => { setIsSearching(false); setDriverAccepted(true); setAssignedDriver({ id: 1, name: 'Sean Bampoe', vehicleType: 'Flatbed', licensePlate: 'GT-1234-GP', rating: 4.8, phone: '+27123456700', currentLatitude: -25.7483, currentLongitude: 28.2299 }); }} className="px-3 py-1 bg-blue-700 rounded whitespace-nowrap">Driver On Way</button>
          <button onClick={() => { setDriverArrived(true); setTowingInProgress(true); setDragHeight(80); }} className="px-3 py-1 bg-blue-700 rounded whitespace-nowrap">Towing</button>
          <button onClick={() => { setTowingInProgress(false); setDrivingToDestination(true); setDragHeight(40); }} className="px-3 py-1 bg-blue-700 rounded whitespace-nowrap">To Destination</button>
          <button onClick={() => { setDestinationArrived(true); setDragHeight(80); }} className="px-3 py-1 bg-blue-700 rounded whitespace-nowrap">Arrived</button>
          <button onClick={() => { setServiceCompleted(true); }} className="px-3 py-1 bg-blue-700 rounded whitespace-nowrap">Completed</button>
          <button onClick={() => { setCarPhotos({ 'Front': 'skip', 'Back': 'skip', 'Left Side': 'skip', 'Right Side': 'skip' }); }} className="px-3 py-1 bg-green-700 rounded whitespace-nowrap">Skip Photos</button>
        </div>
      </div>
      {/* Road Assistance Concluded - Full Screen */}
      {serviceCompleted ? (
        <RoadAssistanceConcluded
          driver={{
            ...assignedDriver,
            type: selectedDriver?.type || 'standard',
            premiumProvider: selectedPremiumProvider || undefined
          }}
          serviceDetails={{
            pickupLocation,
            dropoffLocation,
            distance: '2.5 km',
            totalCost: truckPricing[selectedDriver?.id || 1] || 350,
            bookingFee: Math.round((truckPricing[selectedDriver?.id || 1] || 350) * 0.15),
            cancellationFee: 50,
            serviceDate: new Date().toLocaleDateString(),
            serviceTime: new Date().toLocaleTimeString()
          }}
          onComplete={() => {
            // Reset all states and go back to initial view
            setServiceCompleted(false);
            setDestinationArrived(false);
            setDrivingToDestination(false);
            setTowingInProgress(false);
            setDriverAccepted(false);
            setAssignedDriver(null);
            setCurrentView('car');
            setDragHeight(40);
          }}
        />
      ) : (
        <div className="min-h-screen bg-white relative">
        {/* Map Container */}
        <div className={`relative transition-all duration-300 ${isMinimized ? 'h-[calc(100vh-5rem)]' : 'h-[60vh]'} mt-10`}>
          <Map
            key={mapKey}
            center={location ? { lat: location.latitude, lng: location.longitude } : undefined}
            drivers={[]}
            userLocation={location}
            onDriverClick={() => {}}
            selectedDriver={null}
            isMinimized={isMinimized}
            destination={dropoffLocation}
            driverLocation={assignedDriver ? {
              latitude: assignedDriver.currentLatitude,
              longitude: assignedDriver.currentLongitude
            } : undefined}
            showRoute={driverAccepted}
            routePhase={routePhase}
            drawRoute={shouldDrawRoute}
            currentView={currentView}
          />
          
          {/* Top Navigation */}
          <div className={`absolute top-0 left-0 right-0 flex items-center p-4 z-10 transition-opacity duration-300 ${
            currentView === 'car' && showCarDetails && selectedCar === 'different' ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}>
            {/* Menu Icon */}
            <div className="transition-all duration-500 ease-in-out bg-white shadow-lg flex items-center cursor-pointer w-10 h-10 rounded-full overflow-hidden" onClick={handleMenuClick}>
              <svg className="w-6 h-6 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
          </div>
          
          {/* Location Button */}
          <div className="hidden">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 bg-orange-500 rounded-full shadow-lg hover:bg-orange-600"
            >
              <Navigation className="w-5 h-5 text-white" />
            </Button>
          </div>
        </div>
        
        {/* Bottom Sheet */}
        <div 
          className={`fixed left-0 right-0 shadow-2xl transition-all duration-500 ease-out z-50 overflow-hidden border-t-4 border-gray-200 ${
            isBottomSheetVisible ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ 
            bottom: 0,
            height: `${dragHeight}vh`,
            transform: isDragging ? 'none' : undefined,
            background: 'white',
            borderTopLeftRadius: '1.5rem',
            borderTopRightRadius: '1.5rem'
          }}
        >
          {/* Drag Handle - only show when not on initial car view */}
          {!isSearching && !towingInProgress && currentView !== 'car' && (
            <div 
              className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-6 cursor-grab active:cursor-grabbing hover:bg-gray-400 transition-colors"
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
            ></div>
          )}
          
          {/* Driver Accepted State */}
          {destinationArrived ? (
            <DestinationArrived
              onComplete={() => {
                setDestinationArrived(false);
                setServiceCompleted(true);
              }}
            />
          ) : towingInProgress ? (
            <TowingInProgress
              onComplete={() => {
                setTowingInProgress(false);
                setDrivingToDestination(true);
                setDragHeight(40);
              }}
            />
          ) : drivingToDestination ? (
            <DrivingToDestination
              driver={assignedDriver}
              onDriverNotified={(name, number) => {
                console.log(`Driver notified: Delegate ${name} (${number}) will receive the vehicle`);
              }}
              onDestinationArrived={() => {
                setDrivingToDestination(false);
                setDestinationArrived(true);
                setDragHeight(80);
              }}
            />
          ) : driverAccepted && assignedDriver && location ? (
            <DriverOnWay
              driver={assignedDriver}
              userLocation={location}
              estimatedArrival="8-12 min"
              hasArrived={driverArrived}
            />
          ) : isSearching ? (
            <div className="px-6 pb-6 h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6"></div>
              <h2 className="text-xl font-bold text-black mb-2">
                Looking for the nearest available driver...
              </h2>
              <p className="text-gray-600">
                Please wait while we find you a driver
              </p>
            </div>
          ) : isMinimized ? (
            <div className="px-6 h-full flex flex-col">
              {currentView === 'car' && (
                <>
                  <div className="mb-3 mt-4">
                    <h3 className="font-bold text-black text-2xl">Hey there, need help?</h3>
                  </div>
                  <div className="space-y-4 flex-1">
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-300 ${
                        selectedCar === 'current' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                      }`}
                      onClick={() => {
                        setIsMinimized(false);
                        setDragHeight(50);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Tow Your Car</h3>
                          <p className="text-sm text-gray-600">{currentCar.make} {currentCar.model} • {currentCar.licensePlate}</p>
                        </div>
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </>
              )}
              {currentView !== 'car' && (
                <div className="mb-4 mt-4">
                {currentView === 'car' && (
                  <h3 className="font-bold text-black text-2xl">Vehicle Information</h3>
                )}
                {currentView === 'location' && (
                  <h3 className="font-bold text-black text-2xl">Where should the vehicle be taken?</h3>
                )}
                {currentView === 'confirm' && selectedDriver && (
                  <h3 className="font-bold text-black text-2xl">Confirm Request</h3>
                )}
                {currentView === 'trucks' && (
                  <h3 className="font-bold text-black text-2xl">Standard Tow Service</h3>
                )}
              </div>
              )}
              {currentView === 'car' ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{currentCar.make} {currentCar.model}</p>
                    <p className="text-sm text-gray-600">{currentCar.year} • {currentCar.color}</p>
                  </div>
                  <p className="text-sm text-gray-600">{currentCar.licensePlate}</p>
                </div>
              ) : currentView === 'location' ? (
                <div className="relative">
                  <Input
                    ref={dropoffInputRef}
                    placeholder="Enter destination"
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                    className="w-full p-4 pr-12 text-lg border-2 border-gray-200 rounded-xl"
                  />
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              ) : currentView === 'confirm' && selectedDriver ? (
                <div>
                  {selectedDriver.type !== 'premium' && (
                    <div className="flex justify-center mb-4">
                      <img 
                        src="../../../attached_assets/towing-car.svg" 
                        alt="Towing Car" 
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                  )}
                  
                  <Card 
                    className={`p-3 mb-4 ${
                      selectedDriver.type === 'premium' 
                        ? getBrandColors(selectedPremiumProvider || '') 
                        : 'border-2 border-orange-500 bg-white'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{selectedDriver.name}</p>
                          <p className={`text-sm ${
                            selectedDriver.type === 'premium' ? 'opacity-90' : 'text-gray-600'
                          }`}>{selectedDriver.eta} • ⭐ {selectedDriver.rating}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Distance</span>
                          <span className="font-medium">2.5 km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Booking Fee (%)</span>
                          <span className="font-medium">15%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cancellation Fee</span>
                          <span className="font-medium">R50</span>
                        </div>
                        <div className="border-t pt-1 flex justify-between">
                          <span className="text-gray-600">Payment:</span>
                          <span className={`font-bold ${
                            selectedDriver.type === 'premium' ? '' : 'text-orange-500'
                          }`}>R{truckPricing[selectedDriver.id] || 350}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  <div className="mb-4">
                    <div 
                      className="flex items-center space-x-2 text-sm text-blue-600 cursor-pointer hover:underline"
                      onClick={() => setShowPaymentModal(true)}
                    >
                      <span>Payment:</span>
                      {selectedPayment === 'Apple Pay' ? (
                        <img 
                          src={applePayLogo} 
                          alt="Apple Pay" 
                          className="w-8 h-5 object-contain"
                        />
                      ) : (
                        <img 
                          src={mastercardLogo} 
                          alt="Mastercard" 
                          className="w-8 h-5 object-contain"
                        />
                      )}
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleRequestConfirm}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold"
                    disabled={createRequestMutation.isPending}
                  >
                    {createRequestMutation.isPending ? 'Requesting...' : 'Confirm Request'}
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">15-20 min • ⭐ 4.2</p>
                    </div>
                    <p className="font-bold text-orange-500 text-xl">R{truckPricing[selectedStandardDriver] || 350}</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-800">Payment:</span>
                      <span className="text-gray-600">{selectedPayment}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              )}
              
              {/* Integrated Navigation */}
              <div className="border-t border-gray-200 mt-auto pt-3">
                <div className="flex items-center justify-around">
                  <button
                    onClick={() => {
                      setCurrentView('car');
                      setShowCarDetails(false);
                      setDragHeight(50);
                    }}
                    className="flex flex-col items-center space-y-1"
                  >
                    <Home className={`w-6 h-6 ${currentView === 'car' && !showCarDetails ? 'text-orange-500' : 'text-gray-400'}`} />
                    <span className={`text-xs ${currentView === 'car' && !showCarDetails ? 'text-orange-500 font-semibold' : 'text-gray-600'}`}>Home</span>
                  </button>
                  <button
                    onClick={() => setLocation('/trip-history')}
                    className="flex flex-col items-center space-y-1"
                  >
                    <History className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-600">Trips</span>
                  </button>
                  <button
                    onClick={() => setLocation('/user-profile')}
                    className="flex flex-col items-center space-y-1"
                  >
                    <User className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-600">Profile</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden h-full">
              {/* Car Selection View */}
              <div className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                currentView === 'car' ? 'translate-y-0' : 'translate-y-full'
              }`}>
                <div className="px-6 pb-6 h-full flex flex-col">
                  <div className="flex items-center mb-6 mt-4">
                    {showCarDetails && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowCarDetails(false);
                          setSelectedCar('current');
                          setDragHeight(70);
                        }}
                        className="mr-2 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200"
                      >
                        ←
                      </Button>
                    )}
                    <h3 className="font-bold text-black text-2xl">
                      {showCarDetails ? 'Vehicle Information' : 'Hey there, need help?'}
                    </h3>
                  </div>
                  
                  {!showCarDetails && (
                    <div className="space-y-4 mb-6 overflow-y-auto flex-1">
                      <div 
                        className={`p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-300 ${
                          selectedCar === 'current' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                        }`}
                        onClick={() => handleCarSelect('current')}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">Tow Your Car</h3>
                            <p className="text-sm text-gray-600">{currentCar.make} {currentCar.model} • {currentCar.licensePlate}</p>
                          </div>
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      
                      <div 
                        className={`p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-300 ${
                          selectedCar === 'different' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                        }`}
                        onClick={() => handleCarSelect('different')}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">Tow Another Car</p>
                            <p className="text-sm text-gray-600">Enter vehicle details</p>
                          </div>
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-3">Other Services</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-gray-100 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200">
                            <img src={scheduleIcon} alt="Schedule" className="w-12 h-12 mb-1" />
                            <span className="text-xs text-gray-700">Schedule</span>
                          </div>
                          <div className="bg-gray-100 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200">
                            <img src={storageTruckIcon} alt="Pickup & Delivery" className="w-12 h-12 mb-1" />
                            <span className="text-xs text-gray-700">Pickup & Delivery</span>
                          </div>
                          <div className="bg-gray-100 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200">
                            <img src={fuelIcon} alt="Fuel Delivery" className="w-12 h-12 mb-1" />
                            <span className="text-xs text-gray-700">Fuel Delivery</span>
                          </div>
                          <div className="bg-gray-100 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200">
                            <img src={tireChangeIcon} alt="Flat Tire" className="w-12 h-12 mb-1" />
                            <span className="text-xs text-gray-700">Flat Tire</span>
                          </div>
                          <div className="bg-gray-100 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200">
                            <img src={batteryJumpIcon} alt="Battery Jump" className="w-12 h-12 mb-1" />
                            <span className="text-xs text-gray-700">Battery Jump</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {showCarDetails && selectedCar === 'current' && (
                    <div className="animate-in fade-in duration-500">
                      <div className="mb-6">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="font-semibold text-lg">{currentCar.make} {currentCar.model}</p>
                          <p className="text-gray-600">{currentCar.year} • {currentCar.color} • {currentCar.licensePlate}</p>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="font-medium mb-4">Vehicle Photos</h3>
                        <p className="text-sm text-gray-600 mb-4">Take photos of your vehicle from all angles</p>
                        <div className="grid grid-cols-2 gap-2">
                          {['Front', 'Back', 'Left Side', 'Right Side'].map((side, index) => (
                            <div 
                              key={side} 
                              className={`aspect-video rounded-lg flex items-center justify-center border-2 cursor-pointer transition-colors ${
                                carPhotos[side] ? 'border-green-500 bg-green-50' : 'border-dashed border-gray-300 bg-gray-100 hover:bg-gray-200'
                              }`}
                              onClick={() => handlePhotoCapture(side)}
                            >
                              {carPhotos[side] ? (
                                <img 
                                  src={carPhotos[side]} 
                                  alt={`${side} view`}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="text-center">
                                  <p className="text-xs text-gray-500">{side}</p>
                                  <p className="text-xs text-gray-400">Tap to add photo</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Button
                        onClick={handleCarConfirm}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold text-lg mb-6 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        disabled={!isPhotosComplete()}
                      >
                        Continue
                      </Button>
                    </div>
                  )}
                  
                  {showCarDetails && selectedCar === 'different' && (
                    <div className="animate-in fade-in duration-500">
                      <div className="mb-6">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Search your vehicle</label>
                        <div className="relative">
                          <Input 
                            value={vehicleSearch}
                            onChange={(e) => {
                              setVehicleSearch(e.target.value);
                              setShowSuggestions(true);
                            }}
                            placeholder="Type vehicle name (e.g. Corolla, Hilux, BMW)"
                            className="w-full p-3 text-lg border-2 border-gray-200 rounded-xl"
                          />
                          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          
                          {showSuggestions && vehicleSearch && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                              {fuzzySearch(vehicleSearch).map((vehicle, index) => (
                                <div
                                  key={index}
                                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  onClick={() => handleVehicleSelect(vehicle)}
                                >
                                  <p className="font-medium">{vehicle.name}</p>
                                  <p className="text-sm text-gray-600">({vehicle.category})</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {selectedVehicle && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium mb-3">Auto-filled Details</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Category:</span>
                              <p className="font-medium">{selectedVehicle.category}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Tow Class:</span>
                              <p className="font-medium">{selectedVehicle.towClass}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Drive Type:</span>
                              <p className="font-medium">{selectedVehicle.driveType}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Axle Count:</span>
                              <p className="font-medium">{selectedVehicle.axleCount}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mb-6">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">License Plate</label>
                        <Input 
                          value={licensePlate}
                          onChange={(e) => setLicensePlate(e.target.value)}
                          placeholder="Enter license plate"
                          className="w-full p-3 text-lg border-2 border-gray-200 rounded-xl"
                        />
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="font-medium mb-4">Vehicle Photos</h3>
                        <p className="text-sm text-gray-600 mb-4">Take photos of your vehicle from all angles</p>
                        <div className="grid grid-cols-2 gap-2">
                          {['Front', 'Back', 'Left Side', 'Right Side'].map((side, index) => (
                            <div 
                              key={side} 
                              className={`aspect-video rounded-lg flex items-center justify-center border-2 cursor-pointer transition-colors ${
                                carPhotos[side] ? 'border-green-500 bg-green-50' : 'border-dashed border-gray-300 bg-gray-100 hover:bg-gray-200'
                              }`}
                              onClick={() => handlePhotoCapture(side)}
                            >
                              {carPhotos[side] ? (
                                <img 
                                  src={carPhotos[side]} 
                                  alt={`${side} view`}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="text-center">
                                  <p className="text-xs text-gray-500">{side}</p>
                                  <p className="text-xs text-gray-400">Tap to add photo</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Button
                        onClick={handleCarConfirm}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold text-lg mb-6 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        disabled={!selectedVehicle || !licensePlate || !isPhotosComplete()}
                      >
                        Continue
                      </Button>
                    </div>
                  )}
                  
                  

                </div>
              </div>
              
              {/* Location Selection View */}
              <div className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                currentView === 'location' ? 'translate-y-0' : 'translate-y-full'
              }`}>
                <div className="px-6 pb-6 h-full flex flex-col">
                  <h3 className="font-bold text-black mb-6 mt-4 text-2xl">Where should the vehicle be taken?</h3>
                  
                  <div className="mb-4 relative">
                    <Input
                      ref={dropoffInputRef}
                      placeholder="Enter destination"
                      value={dropoffLocation}
                      onChange={(e) => setDropoffLocation(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && dropoffLocation) {
                          handleLocationSelect(dropoffLocation);
                          setShowSuggestions(false);
                        }
                      }}
                      className="w-full p-4 pr-12 text-lg border-2 border-gray-200 rounded-xl"
                    />
                    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    
                    {showSuggestions && addressSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 max-h-60 overflow-y-auto">
                        {addressSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => {
                              setDropoffLocation(suggestion);
                              setShowSuggestions(false);
                              handleLocationSelect(suggestion);
                            }}
                          >
                            <p className="text-sm">{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div 
                        className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 flex flex-col items-center justify-center aspect-square"
                        onClick={() => handleLocationSelect(homeAddress)}
                      >
                        <Home className="w-8 h-8 text-orange-500 mb-2" />
                        <p className="font-semibold text-sm">Home</p>
                      </div>
                      
                      <div 
                        className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 flex flex-col items-center justify-center aspect-square"
                        onClick={() => handleLocationSelect(warehouseAddress)}
                      >
                        <img src={warehouseIcon} alt="Warehouse" className="w-12 h-12 mb-2" />
                        <p className="font-semibold text-sm">Warehouse</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Confirm Address View */}
              <div className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                currentView === 'confirmAddress' ? 'translate-y-0' : 'translate-y-full'
              }`}>
                <div className="px-6 pb-6 h-full flex flex-col">
                  <div className="mb-4 mt-4">
                    <p className="text-sm text-gray-600 mb-1">Destination</p>
                    <p className="text-lg font-semibold text-black">{dropoffLocation}</p>
                  </div>
                  
                  <Button
                    onClick={handleConfirmAddress}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold text-lg"
                  >
                    Confirm Address
                  </Button>
                </div>
              </div>
              
              {/* Available Trucks View */}
              <div className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                currentView === 'trucks' ? 'translate-y-0' : currentView === 'location' ? 'translate-y-full' : '-translate-y-full'
              }`}>
                <div className="px-6 pb-6 h-full overflow-hidden flex flex-col">
                  <div className="flex items-center mb-6 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToLocation}
                      className="mr-2 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200"
                    >
                      ←
                    </Button>
                    <h3 className="font-bold text-black text-lg">Available Tow Trucks</h3>
                  </div>
                  
                  <div className="mb-4 space-y-2 flex-shrink-0 transition-all duration-300 ${
                    isCardTransitioning ? 'blur-sm opacity-50' : ''
                  }">
                    <p className="text-sm text-gray-600">From: {pickupLocation}</p>
                    {dropoffLocation && <p className="text-sm text-gray-600">To: {dropoffLocation}</p>}
                  </div>
                  
                  <div className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${
                    isCardTransitioning ? 'blur-sm opacity-50' : ''
                  } pb-20`}>
                    {driversLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      </div>
                    ) : nearbyDrivers?.length === 0 ? (
                      <p className="text-gray-600 text-center py-8">No tow trucks available nearby</p>
                    ) : (
                      <div className="space-y-4 flex-1 overflow-y-auto pb-4 max-h-[50vh]">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Standard</h4>
                          {standardDrivers.map((driver: MockDriver, index: number) => {
                            const price = truckPricing[driver.id] || 350;
                            const isSelected = selectedStandardDriver === driver.id;
                            
                            return (
                              <div key={driver.id}>
                                <Card 
                                  className={`p-3 cursor-pointer hover:shadow-md ${isSelected ? 'border-2 border-orange-500 bg-white' : 'border border-gray-200 bg-white'}`} 
                                  onClick={() => {
                                    setSelectedStandardDriver(driver.id);
                                    handleDriverSelect(driver);
                                  }}
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="font-semibold">{driver.name}</p>
                                      <p className="text-sm text-gray-600">{driver.eta} • ⭐ {driver.rating}</p>
                                    </div>
                                    <p className="font-bold text-orange-500">R{price}</p>
                                  </div>
                                </Card>
                                {index < standardDrivers.length - 1 && <div className="h-px bg-gray-300 my-2"></div>}
                              </div>
                            );
                          })}
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Premium</h4>
                          {premiumDrivers.map((driver: MockDriver & { premiumProvider: string }) => {
                            const price = truckPricing[driver.id] || 450;
                            const brandColors = getBrandColors(driver.premiumProvider);
                            
                            return (
                              <Card 
                                key={driver.id} 
                                className={`p-3 cursor-pointer hover:shadow-md mb-2 ${brandColors}`} 
                                onClick={() => {
                                  setSelectedPremiumProvider(driver.premiumProvider);
                                  handleDriverSelect(driver);
                                }}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-semibold">{driver.name}</p>
                                    <p className="text-sm opacity-90">{driver.eta} • ⭐ {driver.rating}</p>
                                  </div>
                                  <p className="font-bold">R{price}</p>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Confirm Request View */}
              <div className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                currentView === 'confirm' ? 'translate-y-0' : 'translate-y-full'
              }`}>
                <div className="px-6 pb-6 h-full flex flex-col">
                  <div className="flex items-center mb-6 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToTrucks}
                      className="mr-2 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200"
                    >
                      ←
                    </Button>
                    <h3 className="font-bold text-black text-lg">Confirm Request</h3>
                  </div>
                  
                  {selectedDriver && (
                    <div className="flex-1 flex flex-col">
                      {/* Selected Driver Card - slides up from trucks view */}
                      <div className="mb-4">
                        {/* Add towing car image for standard services */}
                        {selectedDriver.type !== 'premium' && (
                          <div className="flex justify-center mb-4">
                            <img 
                              src="/assets/towing-car.svg" 
                              alt="Towing Car" 
                              className="w-24 h-24 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        <Card 
                          className={`p-3 ${
                            selectedDriver.type === 'premium' 
                              ? getBrandColors(selectedPremiumProvider || '') 
                              : 'border-2 border-orange-500 bg-white'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold">{selectedDriver.name}</p>
                                <p className={`text-sm ${
                                  selectedDriver.type === 'premium' ? 'opacity-90' : 'text-gray-600'
                                }`}>{selectedDriver.eta} • ⭐ {selectedDriver.rating}</p>
                              </div>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className={selectedDriver.type === 'premium' ? 'opacity-90' : 'text-gray-600'}>Distance</span>
                                <span className="font-medium">2.5 km</span>
                              </div>
                              <div className="flex justify-between">
                                <span className={selectedDriver.type === 'premium' ? 'opacity-90' : 'text-gray-600'}>Booking Fee (%)</span>
                                <span className="font-medium">15%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className={selectedDriver.type === 'premium' ? 'opacity-90' : 'text-gray-600'}>Cancellation Fee</span>
                                <span className="font-medium">R50</span>
                              </div>
                              <div className="border-t pt-1 flex justify-between">
                                <span className={selectedDriver.type === 'premium' ? 'opacity-90' : 'text-gray-600'}>Payment:</span>
                                <span className={`font-bold text-lg ${
                                  selectedDriver.type === 'premium' ? '' : 'text-orange-500'
                                }`}>R{truckPricing[selectedDriver.id] || 350}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                      
                      {/* Service Benefits - fade in after card animation */}
                      <div className="mb-6 animate-in fade-in duration-500 delay-1000">
                        {selectedDriver.type === 'premium' ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <p className="text-sm text-gray-700">Ideal for insurance claims</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <p className="text-sm text-gray-700">Faster response</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <p className="text-sm text-gray-700">Top-rated drivers</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <p className="text-sm text-gray-700">Nearest available driver</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <p className="text-sm text-gray-700">Cheaper</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <p className="text-sm text-gray-700">Rating after trip</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Trip Details - fade in after card animation */}
                      <div className="space-y-2 mb-6 animate-in fade-in duration-500 delay-1000">
                        <p className="text-sm text-gray-600">From: {pickupLocation}</p>
                        <p className="text-sm text-gray-600">To: {dropoffLocation}</p>
                        <div 
                          className="flex items-center space-x-2 text-sm text-blue-600 cursor-pointer hover:underline"
                          onClick={() => setShowPaymentModal(true)}
                        >
                          <span>Payment:</span>
                          {selectedPayment === 'Apple Pay' ? (
                            <img 
                              src={applePayLogo} 
                              alt="Apple Pay" 
                              className="w-8 h-5 object-contain"
                            />
                          ) : (
                            <img 
                              src={mastercardLogo} 
                              alt="Mastercard" 
                              className="w-8 h-5 object-contain"
                            />
                          )}
                        </div>
                      </div>
                      
                      <Button
                        onClick={handleRequestConfirm}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold text-lg animate-in fade-in duration-500 delay-1000"
                        disabled={createRequestMutation.isPending}
                      >
                        {createRequestMutation.isPending ? 'Requesting...' : 'Confirm Request'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Request Modal - Remove this since we're using inline confirm view */}
      
      {/* Remove the Driver Search Overlay - now integrated in bottom component */}
      
      {/* Driver Found Bottom Sheet */}
      {driverFound && assignedDriver && (
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 p-6">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mr-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-black">
                Your driver is on the way!
              </h2>
              <p className="text-gray-600">ETA: 8-12 minutes</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
            <img 
              src="/shared/assets/yellow-tow-truck-icon.png" 
              alt="Tow truck" 
              className="w-12 h-12"
            />
            <div className="flex-1">
              <p className="font-semibold text-black">{assignedDriver.name}</p>
              <p className="text-sm text-gray-600">{assignedDriver.vehicleType} • {assignedDriver.licensePlate}</p>
              <p className="text-sm text-gray-600">⭐ {assignedDriver.rating}/5</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col">
          <div className="flex-1 relative flex items-center justify-center">
            <div className="absolute top-4 left-4 right-4 z-10">
              <div className="bg-black bg-opacity-50 text-white p-3 rounded-lg text-center">
                <p className="font-semibold">Add {currentPhotoSide} Photo</p>
                <p className="text-sm opacity-90">Choose how to add your {currentPhotoSide.toLowerCase()} photo</p>
              </div>
            </div>
            
            <div className="flex flex-col space-y-4 px-8">
              <Button
                onClick={selectFromGallery}
                disabled={isUploadingPhoto}
                className="w-full h-16 bg-white hover:bg-gray-100 text-black flex items-center justify-center space-x-3 rounded-xl"
              >
                {isUploadingPhoto ? (
                  <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-semibold">Choose from Gallery</span>
                  </>
                )}
              </Button>
              
              <Button
                onClick={takePicture}
                disabled={isUploadingPhoto}
                className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center space-x-3 rounded-xl"
              >
                {isUploadingPhoto ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-semibold">Take Photo</span>
                  </>
                )}
              </Button>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCameraModal(false);
                  setIsUploadingPhoto(false);
                }}
                className="bg-black bg-opacity-50 text-white hover:bg-opacity-70 px-8"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Payment Method Card - Only show during trucks view */}
      {currentView === 'trucks' && !isMinimized && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] p-4">
          <Card 
            className="bg-orange-500 border-orange-500 cursor-pointer hover:bg-orange-600 transition-colors shadow-lg"
            onClick={() => setShowPaymentModal(true)}
          >
            <CardContent className="p-4">
              <div className="mb-2">
                <p className="text-white text-sm opacity-90">Paying with</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {selectedPayment === 'Apple Pay' ? (
                    <img 
                      src={applePayLogo} 
                      alt="Apple Pay" 
                      className="w-10 h-6 object-contain"
                    />
                  ) : (
                    <img 
                      src={mastercardLogo} 
                      alt="Mastercard" 
                      className="w-10 h-6 object-contain"
                    />
                  )}
                  <span className="font-semibold text-white">{selectedPayment}</span>
                </div>
                <ChevronDown className="w-5 h-5 text-white" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full h-[80vh] rounded-t-3xl p-6">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-black mb-6">Payment Method</h2>
            
            <div className="space-y-4">
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer ${
                  selectedPayment === 'Apple Pay' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedPayment('Apple Pay')}
              >
                <div className="flex items-center space-x-3">
                  <img 
                    src={applePayLogo} 
                    alt="Apple Pay" 
                    className="w-12 h-8 object-contain"
                  />
                  <span className="font-semibold">Apple Pay</span>
                </div>
              </div>
              
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer ${
                  selectedPayment === 'Card Payment' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedPayment('Card Payment')}
              >
                <div className="flex items-center space-x-3">
                  <img 
                    src={mastercardLogo} 
                    alt="Mastercard" 
                    className="w-12 h-8 object-contain"
                  />
                  <span className="font-semibold">Card Payment</span>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => setShowPaymentModal(false)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg mt-8"
            >
              Confirm
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar - Removed, integrated into bottom sheet */}
    </>
  );
}