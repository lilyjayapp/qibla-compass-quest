import React, { useState, useEffect } from 'react';
import { Compass as CompassIcon } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const MECCA_COORDS = {
  latitude: 21.4225,
  longitude: 39.8262,
};

const Compass = () => {
  const [heading, setHeading] = useState<number>(0);
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const { toast } = useToast();

  const calculateQiblaDirection = (userLat: number, userLong: number) => {
    const φ1 = userLat * (Math.PI / 180);
    const φ2 = MECCA_COORDS.latitude * (Math.PI / 180);
    const Δλ = (MECCA_COORDS.longitude - userLong) * (Math.PI / 180);

    const y = Math.sin(Δλ);
    const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
    let qibla = Math.atan2(y, x) * (180 / Math.PI);
    
    return (qibla + 360) % 360;
  };

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          const permission = await DeviceOrientationEvent.requestPermission();
          setHasPermission(permission === 'granted');
          if (permission === 'granted') {
            toast({
              title: "Permission granted",
              description: "You can now use the compass",
            });
          }
        } else {
          setHasPermission(true);
        }
      } catch (error) {
        console.error('Error requesting permission:', error);
        toast({
          variant: "destructive",
          title: "Permission denied",
          description: "Please enable device orientation access to use the compass",
        });
      }
    };

    const getLocation = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          const direction = calculateQiblaDirection(
            position.coords.latitude,
            position.coords.longitude
          );
          setQiblaDirection(direction);
        }, (error) => {
          console.error('Error getting location:', error);
          toast({
            variant: "destructive",
            title: "Location error",
            description: "Unable to get your location",
          });
        });
      }
    };

    requestPermissions();
    getLocation();

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.webkitCompassHeading) {
        // iOS
        setHeading(event.webkitCompassHeading);
      } else if (event.alpha) {
        // Android
        setHeading(360 - event.alpha);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [toast]);

  const compassStyle = {
    transform: `rotate(${-heading}deg)`,
  };

  const qiblaStyle = {
    transform: `rotate(${qiblaDirection}deg)`,
  };

  return (
    <div className="relative w-full max-w-sm mx-auto h-[400px] flex items-center justify-center">
      <div className="absolute w-72 h-72 rounded-full border-4 border-qibla-primary bg-white/90 shadow-lg">
        <div className="relative w-full h-full" style={compassStyle}>
          <CompassIcon className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-qibla-primary" />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-sm font-semibold">N</div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-semibold">S</div>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold">W</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold">E</div>
        </div>
        <div 
          className="absolute top-1/2 left-1/2 w-1 h-24 bg-qibla-secondary -translate-x-1/2 -translate-y-1/2 origin-bottom"
          style={qiblaStyle}
        />
      </div>
      <div className="absolute bottom-0 text-center">
        <p className="text-lg font-semibold text-qibla-primary">
          Qibla Direction: {Math.round(qiblaDirection)}°
        </p>
        {!hasPermission && (
          <p className="text-sm text-red-500 mt-2">
            Please enable device orientation access
          </p>
        )}
      </div>
    </div>
  );
};

export default Compass;