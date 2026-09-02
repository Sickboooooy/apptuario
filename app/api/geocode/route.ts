import { env } from 'cloudflare:workers';
import type { GeocodeResult } from '@/lib/route-types';

const cache = new Map<
  string,
  { expiresAt: number; results: GeocodeResult[] }
>();
const clientLimits = new Map<string, { count: number; resetAt: number }>();
let lastNominatimRequest = 0;

const GUADALAJARA = {
  longitude: -103.3496,
  latitude: 20.6736,
  west: -103.55,
  south: 20.45,
  east: -103.15,
  north: 20.85,
} as const;

export async function POST(request: Request) {
  if (!allowClient(request)) {
    return Response.json(
      { error: 'Demasiadas búsquedas. Espera un minuto antes de continuar.' },
      { status: 429 },
    );
  }

  const body = await safeJson(request);

  // Invariant: geocoding a natural_person recipient can never be sent to
  // an external service. Both providers below (OpenRouteService and
  // Nominatim) are external, so this is checked before either is reached.
  if (body?.recipientKind === 'natural_person') {
    return Response.json(
      {
        error:
          'La geocodificación de un destinatario persona física no puede enviarse a un servicio externo.',
      },
      { status: 422 },
    );
  }

  const query =
    typeof body?.query === 'string'
      ? body.query.trim().replace(/\s+/g, ' ')
      : '';
  if (query.length < 8 || query.length > 220) {
    return Response.json(
      { error: 'Escribe un domicilio completo de entre 8 y 220 caracteres.' },
      { status: 400 },
    );
  }

  const cacheKey = await digest(query.toLocaleLowerCase('es-MX'));
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return Response.json({ results: cached.results, cached: true });
  }

  try {
    const apiKey = env.ORS_API_KEY?.trim();
    const results = apiKey
      ? await geocodeWithOpenRouteService(query, apiKey)
      : await geocodeWithNominatim(query);
    cache.set(cacheKey, {
      results,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    return Response.json({ results, cached: false });
  } catch {
    return Response.json(
      { error: 'No fue posible consultar el domicilio. Intenta nuevamente.' },
      { status: 503 },
    );
  }
}

async function geocodeWithOpenRouteService(
  query: string,
  apiKey: string,
): Promise<GeocodeResult[]> {
  const url = new URL('https://api.openrouteservice.org/geocode/search');
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('text', query);
  url.searchParams.set('boundary.country', 'MX');
  url.searchParams.set('focus.point.lon', String(GUADALAJARA.longitude));
  url.searchParams.set('focus.point.lat', String(GUADALAJARA.latitude));
  url.searchParams.set('boundary.rect.min_lon', String(GUADALAJARA.west));
  url.searchParams.set('boundary.rect.min_lat', String(GUADALAJARA.south));
  url.searchParams.set('boundary.rect.max_lon', String(GUADALAJARA.east));
  url.searchParams.set('boundary.rect.max_lat', String(GUADALAJARA.north));
  url.searchParams.set('size', '5');

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error('Geocoding failed');
  const data = (await response.json()) as {
    features?: Array<{
      properties?: { id?: string; label?: string };
      geometry?: { coordinates?: [number, number] };
    }>;
  };

  return (data.features ?? []).flatMap((feature, index) => {
    const coordinates = feature.geometry?.coordinates;
    const label = feature.properties?.label;
    if (!coordinates || !label || !isInGuadalajaraArea(coordinates)) return [];
    return [
      {
        id: feature.properties?.id ?? `ors-${index}`,
        label,
        coordinates,
        provider: 'openrouteservice' as const,
      },
    ];
  });
}

async function geocodeWithNominatim(query: string): Promise<GeocodeResult[]> {
  const wait = Math.max(0, 1_050 - (Date.now() - lastNominatimRequest));
  if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
  lastNominatimRequest = Date.now();

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('countrycodes', 'mx');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '5');
  url.searchParams.set(
    'viewbox',
    `${GUADALAJARA.west},${GUADALAJARA.north},${GUADALAJARA.east},${GUADALAJARA.south}`,
  );
  url.searchParams.set('bounded', '1');
  url.searchParams.set('q', addGuadalajaraContext(query));

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'es-MX,es;q=0.9',
      'User-Agent':
        'AppTuario/0.1 (+https://apptuario.sickboooooy.chatgpt.site)',
    },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error('Geocoding failed');
  const data = (await response.json()) as Array<{
    place_id: number;
    display_name: string;
    lon: string;
    lat: string;
  }>;

  return data.flatMap((item) => {
    const longitude = Number(item.lon);
    const latitude = Number(item.lat);
    if (
      !Number.isFinite(longitude) ||
      !Number.isFinite(latitude) ||
      !isInGuadalajaraArea([longitude, latitude])
    )
      return [];
    return [
      {
        id: `nominatim-${item.place_id}`,
        label: item.display_name,
        coordinates: [longitude, latitude],
        provider: 'nominatim' as const,
      },
    ];
  });
}

function addGuadalajaraContext(query: string) {
  if (
    /guadalajara|jalisco|zapopan|tlaquepaque|tonal[aá]|tlajomulco/i.test(query)
  )
    return query;
  return `${query}, Guadalajara, Jalisco, México`;
}

function isInGuadalajaraArea([longitude, latitude]: [number, number]) {
  return (
    longitude >= GUADALAJARA.west &&
    longitude <= GUADALAJARA.east &&
    latitude >= GUADALAJARA.south &&
    latitude <= GUADALAJARA.north
  );
}

async function safeJson(
  request: Request,
): Promise<{ query?: unknown; recipientKind?: unknown } | null> {
  try {
    return (await request.json()) as {
      query?: unknown;
      recipientKind?: unknown;
    };
  } catch {
    return null;
  }
}

async function digest(value: string) {
  const bytes = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function allowClient(request: Request) {
  const now = Date.now();
  const key =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for') ??
    'local';
  const current = clientLimits.get(key);
  if (!current || current.resetAt <= now) {
    clientLimits.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (current.count >= 10) return false;
  current.count += 1;
  return true;
}
