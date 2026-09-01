import { env } from 'cloudflare:workers';
import type { Coordinates, RouteGeometry, RoutePlan } from '@/lib/route-types';

const MAX_STOPS = 30;
const rateLimits = new Map<string, { count: number; resetAt: number }>();

type OptimizeRequest = {
  origin: Coordinates;
  stops: Array<{ id: string; coordinates: Coordinates; priority?: number }>;
  roundTrip?: boolean;
};

export async function POST(request: Request) {
  if (!allowRequest(request)) {
    return Response.json(
      { error: 'Demasiadas solicitudes. Intenta nuevamente en un minuto.' },
      { status: 429 },
    );
  }

  const body = await safeJson(request);
  if (!isOptimizeRequest(body)) {
    return Response.json(
      { error: 'La ruta contiene coordenadas o destinos no válidos.' },
      { status: 400 },
    );
  }

  const apiKey = env.ORS_API_KEY?.trim();
  if (!apiKey) return Response.json(localPlan(body));

  try {
    const plan = await openRouteServicePlan(body, apiKey);
    return Response.json(plan);
  } catch {
    return Response.json(
      localPlan(
        body,
        'openrouteservice no respondió; se muestra un orden local provisional.',
      ),
    );
  }
}

async function openRouteServicePlan(
  body: OptimizeRequest,
  apiKey: string,
): Promise<RoutePlan> {
  const optimizationResponse = await fetch(
    'https://api.openrouteservice.org/optimization',
    {
      method: 'POST',
      headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobs: body.stops.map((stop, index) => ({
          id: index + 1,
          location: stop.coordinates,
          priority: Math.min(100, Math.max(0, stop.priority ?? 50)),
        })),
        vehicles: [
          {
            id: 1,
            profile: 'driving-car',
            start: body.origin,
            ...(body.roundTrip ? { end: body.origin } : {}),
          },
        ],
      }),
      signal: AbortSignal.timeout(12_000),
    },
  );

  if (!optimizationResponse.ok) throw new Error('Optimization failed');
  const optimization = (await optimizationResponse.json()) as {
    routes?: Array<{ steps?: Array<{ type: string; id?: number }> }>;
  };
  const orderedIndexes =
    optimization.routes?.[0]?.steps
      ?.filter((step) => step.type === 'job' && typeof step.id === 'number')
      .map((step) => (step.id as number) - 1) ?? [];

  if (orderedIndexes.length !== body.stops.length)
    throw new Error('Incomplete optimization');

  const orderedStops = orderedIndexes.map((index) => body.stops[index]);
  const coordinates = [
    body.origin,
    ...orderedStops.map((stop) => stop.coordinates),
    ...(body.roundTrip ? [body.origin] : []),
  ];

  const directionsResponse = await fetch(
    'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
    {
      method: 'POST',
      headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ coordinates, instructions: false }),
      signal: AbortSignal.timeout(12_000),
    },
  );

  if (!directionsResponse.ok) throw new Error('Directions failed');
  const directions = (await directionsResponse.json()) as {
    features?: Array<
      RouteGeometry & {
        properties?: { summary?: { distance?: number; duration?: number } };
      }
    >;
  };
  const feature = directions.features?.[0];
  if (!feature?.geometry) throw new Error('Missing route geometry');

  return {
    orderedStopIds: orderedStops.map((stop) => stop.id),
    geometry: {
      type: 'Feature',
      properties: feature.properties ?? {},
      geometry: feature.geometry,
    },
    distanceMeters: feature.properties?.summary?.distance ?? null,
    durationSeconds: feature.properties?.summary?.duration ?? null,
    provider: 'openrouteservice',
    message: 'Ruta vial optimizada por cercanía y prioridades registradas.',
  };
}

function localPlan(
  body: OptimizeRequest,
  message = 'Agrega ORS_API_KEY para obtener calles, tráfico estimado y tiempos viales.',
): RoutePlan {
  const remaining = [...body.stops];
  const ordered: typeof body.stops = [];
  let current = body.origin;

  while (remaining.length) {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    remaining.forEach((stop, index) => {
      const distance = haversineMeters(current, stop.coordinates);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    const [next] = remaining.splice(bestIndex, 1);
    ordered.push(next);
    current = next.coordinates;
  }

  const coordinates = [
    body.origin,
    ...ordered.map((stop) => stop.coordinates),
    ...(body.roundTrip ? [body.origin] : []),
  ];
  const distanceMeters = coordinates
    .slice(1)
    .reduce(
      (total, coordinate, index) =>
        total + haversineMeters(coordinates[index], coordinate),
      0,
    );

  return {
    orderedStopIds: ordered.map((stop) => stop.id),
    geometry: {
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates },
    },
    distanceMeters,
    durationSeconds: null,
    provider: 'local',
    message,
  };
}

function haversineMeters(a: Coordinates, b: Coordinates) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6_371_000;
  const latitudeDelta = toRadians(b[1] - a[1]);
  const longitudeDelta = toRadians(b[0] - a[0]);
  const latitudeA = toRadians(a[1]);
  const latitudeB = toRadians(b[1]);
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitudeA) *
      Math.cos(latitudeB) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 2 * earthRadius * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function isOptimizeRequest(value: unknown): value is OptimizeRequest {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<OptimizeRequest>;
  return (
    isCoordinates(candidate.origin) &&
    Array.isArray(candidate.stops) &&
    candidate.stops.length > 0 &&
    candidate.stops.length <= MAX_STOPS &&
    candidate.stops.every(
      (stop) =>
        Boolean(stop) &&
        typeof stop.id === 'string' &&
        stop.id.length <= 80 &&
        isCoordinates(stop.coordinates),
    )
  );
}

function isCoordinates(value: unknown): value is Coordinates {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every(
      (coordinate) =>
        typeof coordinate === 'number' && Number.isFinite(coordinate),
    ) &&
    value[0] >= -180 &&
    value[0] <= 180 &&
    value[1] >= -90 &&
    value[1] <= 90
  );
}

async function safeJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function allowRequest(request: Request) {
  const now = Date.now();
  const key =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for') ??
    'local';
  const current = rateLimits.get(key);
  if (!current || current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (current.count >= 20) return false;
  current.count += 1;
  return true;
}
