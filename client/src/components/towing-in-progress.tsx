import { useEffect, useState } from "react";
import towingCarSvg from "../../../attached_assets/towing-car.svg";

interface TowingInProgressProps {
  onComplete: () => void;
}

export default function TowingInProgress({ onComplete }: TowingInProgressProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const messages = [
    "The driver is currently taking pictures for proof",
    "The driver is securing the vehicle onto the truck",
    "Identifying the damages"
  ];

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        setIsVisible(true);
      }, 1000);
    }, 5000);

    // Complete after 30 seconds
    const completeTimer = setTimeout(() => {
      clearInterval(messageInterval);
      onComplete();
    }, 30000);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="bg-white p-6 flex flex-col items-center justify-center text-center" style={{ height: '40vh' }}>
      <h2 className="text-2xl font-bold text-black mb-6">Towing in Progress</h2>
      
      {/* Towing car image with loader */}
      <div className="relative mb-8">
        <div className="w-32 h-32 border-4 border-orange-500 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
        <div className="w-32 h-32 flex items-center justify-center">
          <img 
            src={towingCarSvg} 
            alt="Towing Car" 
            className="w-24 h-24 object-contain"
          />
        </div>
      </div>
      
      {/* Rotating messages */}
      <p 
        className={`text-lg text-gray-700 transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {messages[currentMessageIndex]}
      </p>
    </div>
  );
}