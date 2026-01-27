import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import logoPath from "../../../attached_assets/getstarted logo_1752240922747.png";

export default function Splash() {
  const [, setLocation] = useLocation();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    
    const timer = setTimeout(() => {
      setFadeOut(true);
      
      setTimeout(() => {
        setLocation('/user-map');
      }, 800);
    }, 2500);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className={`min-h-screen bg-black flex items-center justify-center transition-opacity duration-700 ease-in-out ${
      fadeOut ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="text-center">
        <img 
          src={logoPath} 
          alt="TowApp Logo" 
          className="w-64 h-auto mx-auto"
        />
      </div>
    </div>
  );
}
