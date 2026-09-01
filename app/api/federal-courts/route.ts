import {
  FEDERAL_CIRCUITS,
  NATIONAL_JURISDICTIONAL_ORGANS,
  OAJ_DIRECTORY_URL,
  inferFederalCourtType,
  type FederalCourt,
} from '@/lib/federal-courts';

const cache = new Map<number, { expiresAt: number; courts: FederalCourt[] }>();

export async function GET(request: Request) {
  const circuitValue = new URL(request.url).searchParams.get('circuit');
  if (circuitValue === null) {
    return Response.json({
      circuits: FEDERAL_CIRCUITS,
      national: NATIONAL_JURISDICTIONAL_ORGANS,
      source: OAJ_DIRECTORY_URL,
    });
  }

  const circuit = Number(circuitValue);
  if (!Number.isInteger(circuit) || circuit < 0 || circuit > 32) {
    return Response.json(
      { error: 'Circuito judicial no válido.' },
      { status: 400 },
    );
  }
  if (circuit === 0) {
    return Response.json({ courts: NATIONAL_JURISDICTIONAL_ORGANS });
  }

  const cached = cache.get(circuit);
  if (cached && cached.expiresAt > Date.now()) {
    return Response.json({ courts: cached.courts, cached: true });
  }

  try {
    const response = await fetch(
      `https://www.oaj.gob.mx/DIrectorios/OJintcirc.aspx?cir=${circuit}`,
      {
        headers: {
          Accept: 'text/html',
          'User-Agent': 'AppTuario/0.1 (directorio de adscripciones PJF)',
        },
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (!response.ok) throw new Error('Official directory unavailable');

    const html = await response.text();
    const courts = await parseOfficialDirectory(html, circuit);
    if (!courts.length)
      throw new Error('Official directory returned no courts');

    cache.set(circuit, {
      courts,
      expiresAt: Date.now() + 12 * 60 * 60 * 1000,
    });
    return Response.json({ courts, cached: false, source: OAJ_DIRECTORY_URL });
  } catch {
    return Response.json(
      {
        error:
          'El directorio oficial del OAJ no está disponible en este momento. Intenta nuevamente.',
      },
      { status: 503 },
    );
  }
}

async function parseOfficialDirectory(html: string, circuit: number) {
  const circuitName =
    FEDERAL_CIRCUITS[circuit - 1]?.name ?? `Circuito ${circuit}`;
  const matches = html.matchAll(
    /<div\s+class=['"][^'"]*alert-ojarea[^'"]*['"][^>]*>([\s\S]*?)<\/div>\s*<div\s+class=['"][^'"]*alert-ojubica[^'"]*['"][^>]*>([\s\S]*?)<\/div>/gi,
  );
  const records = Array.from(matches, ([, rawName, rawAddress]) => ({
    name: cleanHtml(rawName),
    address: cleanHtml(rawAddress),
  })).filter(({ name }) => name.length > 5);

  return Promise.all(
    records.map(async ({ name, address }) => ({
      id: `oaj-${circuit}-${await shortHash(`${name}|${address}`)}`,
      name: sentenceCase(name),
      address: sentenceCase(address),
      circuit,
      circuitName,
      type: inferFederalCourtType(name),
      source: 'OAJ' as const,
    })),
  );
}

function cleanHtml(value: string) {
  return decodeEntities(
    value
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function decodeEntities(value: string) {
  const named: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  };
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code: string) => {
    if (code.startsWith('#x'))
      return String.fromCodePoint(Number.parseInt(code.slice(2), 16));
    if (code.startsWith('#'))
      return String.fromCodePoint(Number.parseInt(code.slice(1), 10));
    return named[code.toLowerCase()] ?? entity;
  });
}

function sentenceCase(value: string) {
  if (value !== value.toLocaleUpperCase('es-MX')) return value;
  return value
    .toLocaleLowerCase('es-MX')
    .replace(
      /(^|[.!?]\s+)(\p{L})/gu,
      (_, prefix, letter) => `${prefix}${letter.toLocaleUpperCase('es-MX')}`,
    );
}

async function shortHash(value: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest).slice(0, 8))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
