import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const MECCA_COORDS = {
  latitude: 21.4225,
  longitude: 39.8262,
};

const calculateQiblaDirection = (userLat: number, userLong: number) => {
  const φ1 = userLat * (Math.PI / 180);
  const φ2 = MECCA_COORDS.latitude * (Math.PI / 180);
  const Δλ = (MECCA_COORDS.longitude - userLong) * (Math.PI / 180);

  const y = Math.sin(Δλ);
  const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
  let qibla = Math.atan2(y, x) * (180 / Math.PI);
  
  return (qibla + 360) % 360;
};

const Compass = () => {
  const [heading, setHeading] = useState<number>(0);
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        if (typeof (window.DeviceOrientationEvent as any).requestPermission === 'function') {
          const permission = await (window.DeviceOrientationEvent as any).requestPermission();
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
          console.log('Got location:', position.coords);
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
            description: "Unable to get your location. Please enable location services.",
          });
        });
      }
    };

    requestPermissions();
    getLocation();

    const handleOrientation = (event: DeviceOrientationEvent) => {
      console.log('Orientation event:', event.alpha, event.webkitCompassHeading);
      if (event.webkitCompassHeading) {
        setHeading(event.webkitCompassHeading);
      } else if (event.alpha !== null) {
        setHeading(360 - event.alpha);
      }
    };

    if (hasPermission) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [hasPermission, toast]);

  const compassStyle = {
    transform: `rotate(${-heading}deg)`,
    transition: 'transform 0.5s ease-out',
  };

  const qiblaStyle = {
    transform: `rotate(${qiblaDirection}deg)`,
    transition: 'transform 0.5s ease-out',
  };

  return (
    <div className="relative w-full max-w-sm mx-auto h-[400px] flex items-center justify-center">
      <div className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border-8 border-green-600 bg-white/90 shadow-lg">
        <div className="relative w-full h-full" style={compassStyle}>
          {/* North indicator */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <ArrowUp className="w-12 h-12 text-green-600 -mt-2 stroke-[4]" />
            <span className="text-lg font-bold mt-1">N</span>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-lg font-bold">S</div>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold">W</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold">E</div>
        </div>
        {/* Qibla direction indicator */}
        <div className="absolute top-1/2 left-1/2" style={qiblaStyle}>
          <div className="absolute -translate-x-1/2 -translate-y-1/2">
            <div className="w-3 h-32 bg-green-600 rounded-full" />
            <ArrowUp className="w-16 h-16 text-green-600 absolute -top-14 left-1/2 -translate-x-1/2 stroke-[4]" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 text-center">
        <p className="text-lg font-semibold text-green-600">
          Qibla Direction: {Math.round(qiblaDirection)}°
        </p>
        <p className="text-sm text-gray-600">
          Compass Heading: {Math.round(heading)}°
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