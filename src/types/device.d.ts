interface DeviceOrientationEvent extends Event {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
  webkitCompassHeading?: number;
  absolute: boolean;
}

interface DeviceOrientationEventStatic extends EventTarget {
  requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
}

declare var DeviceOrientationEvent: {
  prototype: DeviceOrientationEvent;
  new(type: string, eventInitDict?: DeviceOrientationEventInit): DeviceOrientationEvent;
  requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
};