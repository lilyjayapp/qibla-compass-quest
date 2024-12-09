import React, { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";

const Compass = () => {
  const [heading, setHeading] = useState<number | null>(null);
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Calculate Qibla angle using simple spherical trigonometry
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
    // Request device orientation permission
    const requestPermission = async () => {
      try {
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            console.log('Device orientation permission granted');
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
        }
      } catch (err) {
        console.error('Error requesting permission:', err);
        setError('Error accessing compass');
      }
    };

    // Get user location and calculate Qibla
    const getLocation = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('Location obtained:', position.coords);
            const qibla = calculateQibla(position.coords.latitude, position.coords.longitude);
            console.log('Calculated Qibla angle:', qibla);
            setQiblaAngle(qibla);
            toast({
              title: "Location found",
              description: "Qibla direction calculated"
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

    // Handle device orientation updates
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.webkitCompassHeading) {
        // iOS devices
        setHeading(event.webkitCompassHeading);
      } else if (event.alpha !== null) {
        // Android devices
        setHeading(360 - event.alpha);
      }
    };

    requestPermission();
    getLocation();
    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  const compassStyle = {
    transform: `rotate(${heading !== null ? -heading : 0}deg)`,
    transition: 'transform 0.5s ease-out'
  };

  const qiblaStyle = {
    transform: `rotate(${qiblaAngle || 0}deg)`,
    transition: 'transform 0.5s ease-out'
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
        
        {/* Qibla indicator */}
        <div className="absolute top-1/2 left-1/2" style={qiblaStyle}>
          <div className="absolute -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-40 bg-green-600 rounded-full" />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-8 bg-green-600 rounded-full" />
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