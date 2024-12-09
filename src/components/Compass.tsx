import React, { useState, useEffect } from 'react';
import { ArrowBigUp } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Qibla, Coordinates } from 'adhan';

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
          const coordinates = new Coordinates(
            position.coords.latitude,
            position.coords.longitude
          );
          const qibla = Qibla(coordinates);
          console.log('Qibla direction:', qibla);
          setQiblaDirection(qibla);
          
          toast({
            title: "Location found",
            description: "Qibla direction calculated successfully",
          });
        }, (error) => {
          console.error('Location error:', error);
          toast({
            variant: "destructive",
            title: "Location error",
            description: "Please enable location services to find Qibla direction",
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
      <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border-8 border-green-600 bg-white/90 shadow-lg">
        <div className="relative w-full h-full" style={compassStyle}>
          {/* North indicator */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <ArrowBigUp className="w-24 h-24 text-green-600 -mt-4 stroke-[4]" />
            <span className="text-2xl font-bold mt-1">N</span>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-2xl font-bold">S</div>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold">W</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold">E</div>
        </div>
        {/* Qibla direction indicator */}
        <div className="absolute top-1/2 left-1/2" style={qiblaStyle}>
          <div className="absolute -translate-x-1/2 -translate-y-1/2">
            <div className="w-6 h-48 bg-green-600 rounded-full" />
            <ArrowBigUp className="w-32 h-32 text-green-600 absolute -top-24 left-1/2 -translate-x-1/2 stroke-[4]" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 text-center">
        <p className="text-xl font-semibold text-green-600">
          Qibla Direction: {Math.round(qiblaDirection)}°
        </p>
        <p className="text-lg text-gray-600">
          Compass Heading: {Math.round(heading)}°
        </p>
        {!hasPermission && (
          <p className="text-lg text-red-500 mt-2">
            Please enable device orientation access
          </p>
        )}
      </div>
    </div>
  );
};

export default Compass;