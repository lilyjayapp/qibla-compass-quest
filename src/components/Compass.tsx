import React, { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { ArrowBigUp } from "lucide-react";

const Compass = () => {
  const [heading, setHeading] = useState<number | null>(null);
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateQibla = (lat: number, lng: number) => {
    // Mecca coordinates
    const meccaLat = 21.4225;
    const meccaLng = 39.8262;

    // Convert to radians
    const φ1 = (lat * Math.PI) / 180;
    const φ2 = (meccaLat * Math.PI) / 180;
    const Δλ = ((meccaLng - lng) * Math.PI) / 180;

    // Calculate Qibla direction
    const y = Math.sin(Δλ);
    const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
    let qibla = Math.atan2(y, x);

    // Convert to degrees
    qibla = (qibla * 180) / Math.PI;
    return (qibla + 360) % 360;
  };

  useEffect(() => {
    let orientationPermissionGranted = false;

    const requestPermission = async () => {
      try {
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            orientationPermissionGranted = true;
            console.log('Orientation permission granted');
            toast({
              title: "Permission granted",
              description: "Compass is now active"
            });
          } else {
            setError('Permission denied for compass access');
            toast({
              variant: "destructive",
              title: "Permission denied",
              description: "Please allow compass access to use this feature"
            });
          }
        } else {
          // For devices that don't require permission
          orientationPermissionGranted = true;
        }
      } catch (err) {
        console.error('Error requesting permission:', err);
        setError('Error accessing compass');
      }
    };

    const getLocation = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const qibla = calculateQibla(position.coords.latitude, position.coords.longitude);
            setQiblaAngle(qibla);
            console.log('Location and Qibla calculated:', { 
              lat: position.coords.latitude, 
              lng: position.coords.longitude, 
              qibla 
            });
          },
          (err) => {
            console.error('Location error:', err);
            setError('Unable to get location');
            toast({
              variant: "destructive",
              title: "Location error",
              description: "Please enable location services"
            });
          }
        );
      }
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (!orientationPermissionGranted) return;

      console.log('Raw orientation data:', {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
        absolute: event.absolute,
        webkitCompassHeading: (event as any).webkitCompassHeading
      });

      // Handle iOS devices
      if (typeof (event as any).webkitCompassHeading === 'number') {
        const iOSHeading = (event as any).webkitCompassHeading;
        console.log('iOS heading:', iOSHeading);
        setHeading(iOSHeading);
        return;
      }

      // Handle Android devices
      if (event.alpha !== null) {
        // Convert alpha angle to compass heading
        // Alpha returns degrees from north going clockwise
        // We need to convert it to counter-clockwise for compass display
        let androidHeading = 360 - event.alpha;
        
        if (!event.absolute) {
          // If the device doesn't provide absolute readings,
          // we need to do additional calculations
          const rotation = window.screen.orientation?.angle || 0;
          androidHeading = (androidHeading + rotation) % 360;
        }

        console.log('Android heading:', androidHeading);
        setHeading(androidHeading);
      }
    };

    // Initialize compass
    requestPermission();
    getLocation();

    // Add event listeners with high frequency updates
    window.addEventListener('deviceorientation', handleOrientation, { capture: true });
    window.addEventListener('orientationchange', () => {
      console.log('Orientation changed:', window.screen.orientation?.angle);
    });

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('orientationchange', () => {});
    };
  }, []);

  // Calculate relative angle between true north and Qibla
  const relativeQiblaAngle = qiblaAngle !== null && heading !== null
    ? (qiblaAngle - heading + 360) % 360
    : 0;

  const compassStyle = {
    transform: `rotate(${heading !== null ? heading : 0}deg)`,
    transition: 'transform 0.05s linear' // Faster, smoother transitions
  };

  const qiblaStyle = {
    transform: `rotate(${relativeQiblaAngle}deg)`,
    transition: 'transform 0.05s linear'
  };

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 text-lg">{error}</p>
        <p className="mt-2 text-gray-600">Please ensure location services and device orientation are enabled.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm mx-auto h-[400px] flex items-center justify-center">
      <div className="absolute w-72 h-72 rounded-full border-8 border-blue-600 bg-white/90 shadow-lg">
        {/* Compass rose */}
        <div className="relative w-full h-full" style={compassStyle}>
          {/* North indicator */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2">
            <div className="w-8 h-32 bg-blue-600 rounded-t-full" />
            <span className="text-3xl font-bold mt-2">N</span>
          </div>
          {/* Cardinal points */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-2xl font-bold">S</div>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold">W</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold">E</div>
        </div>
        
        {/* Qibla indicator with arrow */}
        <div className="absolute top-1/2 left-1/2" style={qiblaStyle}>
          <div className="absolute -translate-x-1/2 -translate-y-1/2">
            <div className="flex flex-col items-center">
              <div className="w-2 h-32 bg-green-600" />
              <ArrowBigUp className="w-12 h-12 text-green-600 rotate-180 -mt-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Readings display */}
      <div className="absolute bottom-0 text-center w-full">
        <p className="text-xl font-semibold text-green-600">
          Qibla Direction: {qiblaAngle !== null ? Math.round(qiblaAngle) : '--'}°
        </p>
        <p className="text-lg text-gray-600">
          Compass Heading: {heading !== null ? Math.round(heading) : '--'}°
        </p>
      </div>
    </div>
  );
};

export default Compass;
