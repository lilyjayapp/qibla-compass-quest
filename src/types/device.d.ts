interface DeviceOrientationEvent extends Event {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
  webkitCompassHeading?: number;
  absolute: boolean;
}

interface DeviceOrientationEventConstructor {
  new(type: string, eventInitDict?: DeviceOrientationEventInit): DeviceOrientationEvent;
  requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
}

declare global {
  interface Window {
    DeviceOrientationEvent: DeviceOrientationEventConstructor;
  }
}