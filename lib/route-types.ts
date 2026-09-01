export type Coordinates = [longitude: number, latitude: number];

export type RouteStop = {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  time: string;
  type: string;
  verified: boolean;
};

export type RouteGeometry = {
  type: 'Feature';
  properties: Record<string, unknown>;
  geometry: {
    type: 'LineString';
    coordinates: Coordinates[];
  };
};

export type RoutePlan = {
  orderedStopIds: string[];
  geometry: RouteGeometry;
  distanceMeters: number | null;
  durationSeconds: number | null;
  provider: 'openrouteservice' | 'local';
  message: string;
};

export type GeocodeResult = {
  id: string;
  label: string;
  coordinates: Coordinates;
  provider: 'openrouteservice' | 'nominatim';
};
