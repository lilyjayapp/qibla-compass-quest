import React, { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";

const BasicCompass = () => {
  const [heading, setHeading] = useState<number | null>(null);

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
            console.log('Permission denied');
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
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not access compass"
        });
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
        let androidHeading = 360 - event.alpha;
        
        if (!event.absolute) {
          const rotation = window.screen.orientation?.angle || 0;
          androidHeading = (androidHeading + rotation) % 360;
        }

        console.log('Android heading:', androidHeading);
        setHeading(androidHeading);
      }
    };

    // Initialize compass
    requestPermission();

    window.addEventListener('deviceorientation', handleOrientation, { capture: true });
    window.addEventListener('orientationchange', () => {
      console.log('Orientation changed:', window.screen.orientation?.angle);
    });

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('orientationchange', () => {});
    };
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto h-[400px] flex items-center justify-center">
      <div className="absolute w-72 h-72 rounded-full border-8 border-blue-600 bg-white/90 shadow-lg">
        <div 
          className="relative w-full h-full" 
          style={{
            transform: `rotate(${heading !== null ? heading : 0}deg)`,
            transition: 'transform 0.05s linear'
          }}
        >
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
      </div>

      {/* Heading display */}
      <div className="absolute bottom-0 text-center w-full">
        <p className="text-lg text-gray-600">
          Heading: {heading !== null ? Math.round(heading) : '--'}°
        </p>
      </div>
    </div>
  );
};

export default BasicCompass;