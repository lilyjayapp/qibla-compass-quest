interface DeviceOrientationEvent extends Event {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
  webkitCompassHeading?: number;
  absolute: boolean;
}

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
}

declare global {
  interface Window {
    DeviceOrientationEvent: {
      requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
    } & DeviceOrientationEventConstructor;
  }
}