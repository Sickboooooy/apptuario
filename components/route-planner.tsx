'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type SyntheticEvent,
} from 'react';
import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  LocateFixed,
  LoaderCircle,
  MapPin,
  Navigation,
  Route,
  Search,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RouteMap } from '@/components/route-map';
import type {
  Coordinates,
  GeocodeResult,
  RoutePlan,
  RouteStop,
} from '@/lib/route-types';

const DEFAULT_ORIGIN: Coordinates = [-103.3472182, 20.6762294];

const INITIAL_STOPS: RouteStop[] = [
  {
    id: 'teatro-degollado',
    name: 'Oficialía de Partes — Zona Centro',
    address: 'Calle Degollado, Guadalajara Centro, Jalisco',
    coordinates: [-103.3444729, 20.677016],
    time: '09:30',
    type: 'Personal',
    verified: true,
  },
  {
    id: 'instituto-cabanas',
    name: 'Coordinación Jurídica — San Juan de Dios',
    address: 'Instituto Cultural Cabañas, Guadalajara, Jalisco',
    coordinates: [-103.3377051, 20.6768706],
    time: '11:15',
    type: 'Citatorio',
    verified: true,
  },
  {
    id: 'glorieta-minerva',
    name: 'Autoridad responsable — Arcos Vallarta',
    address: 'La Minerva, Av. López Mateos Sur, Guadalajara, Jalisco',
    coordinates: [-103.3874567, 20.6738584],
    time: '13:00',
    type: 'Oficio',
    verified: true,
  },
];

export function RoutePlanner({
  onOpenEvidence,
}: {
  onOpenEvidence: () => void;
}) {
  const [origin, setOrigin] = useState<Coordinates>(DEFAULT_ORIGIN);
  const [originLabel, setOriginLabel] = useState(
    'Plaza de Armas, Guadalajara, Jalisco',
  );
  const [stops, setStops] = useState<RouteStop[]>(INITIAL_STOPS);
  const [plan, setPlan] = useState<RoutePlan | null>(null);
  const [planStatus, setPlanStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  );
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [geocodeResults, setGeocodeResults] = useState<GeocodeResult[]>([]);
  const [searchStatus, setSearchStatus] = useState<
    'idle' | 'loading' | 'error'
  >('idle');
  const [searchMessage, setSearchMessage] = useState('');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void requestRoutePlan(origin, stops, controller.signal)
      .then((nextPlan) => {
        setPlan(nextPlan);
        setPlanStatus('ready');
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError')
          return;
        setPlanStatus('error');
      });
    return () => controller.abort();
  }, [origin, stops]);

  async function refreshPlan() {
    setPlanStatus('loading');
    try {
      const nextPlan = await requestRoutePlan(origin, stops);
      setPlan(nextPlan);
      setPlanStatus('ready');
    } catch {
      setPlanStatus('error');
    }
  }

  const orderedStops = useMemo(() => {
    if (!plan) return stops;
    const byId = new Map(stops.map((stop) => [stop.id, stop]));
    return plan.orderedStopIds.flatMap((id) => {
      const stop = byId.get(id);
      return stop ? [stop] : [];
    });
  }, [plan, stops]);

  const selectStop = useCallback((id: string) => setSelectedStopId(id), []);

  async function searchAddress(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 8) {
      setSearchStatus('error');
      setSearchMessage(
        'Escribe calle, número, colonia y alcaldía o municipio.',
      );
      return;
    }

    setSearchStatus('loading');
    setSearchMessage('');
    setGeocodeResults([]);
    try {
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: normalizedQuery }),
      });
      const data = (await response.json()) as {
        results?: GeocodeResult[];
        error?: string;
      };
      if (!response.ok)
        throw new Error(data.error ?? 'No fue posible consultar el domicilio.');
      setGeocodeResults(data.results ?? []);
      setSearchStatus((data.results?.length ?? 0) ? 'idle' : 'error');
      setSearchMessage(
        (data.results?.length ?? 0)
          ? ''
          : 'No encontramos ese domicilio en el área metropolitana de Guadalajara. Incluye calle, número, colonia y municipio.',
      );
    } catch (error) {
      setSearchStatus('error');
      setSearchMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible consultar el domicilio.',
      );
    }
  }

  function addGeocodedStop(result: GeocodeResult) {
    const id = `manual-${crypto.randomUUID()}`;
    setStops((current) => [
      ...current,
      {
        id,
        name: 'Destino agregado',
        address: result.label,
        coordinates: result.coordinates,
        time: 'Sin horario',
        type: 'Destino',
        verified: true,
      },
    ]);
    setSelectedStopId(id);
    setQuery('');
    setGeocodeResults([]);
    setSearchStatus('idle');
  }

  function removeStop(id: string) {
    setStops((current) => current.filter((stop) => stop.id !== id));
    setSelectedStopId((current) => (current === id ? null : current));
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setSearchStatus('error');
      setSearchMessage('Este dispositivo no ofrece ubicación del navegador.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin([position.coords.longitude, position.coords.latitude]);
        setOriginLabel('Mi ubicación actual');
        setLocating(false);
      },
      () => {
        setSearchStatus('error');
        setSearchMessage(
          'No se pudo obtener tu ubicación. Revisa el permiso del navegador.',
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }

  return (
    <div className="mt-7 min-w-0 space-y-5">
      <section
        aria-label="Controles de ruta"
        className="glass-panel min-w-0 rounded-3xl border border-white/80 p-4 shadow-sm sm:p-5"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <form onSubmit={searchAddress} className="grid min-w-0 gap-2">
            <label
              htmlFor="route-address"
              className="text-xs font-extrabold uppercase tracking-wider text-foreground/80"
            >
              Agregar domicilio a la ruta
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="glass-input flex min-h-11 flex-1 items-center gap-2.5 rounded-xl px-3.5">
                <Search
                  aria-hidden="true"
                  className="size-4.5 shrink-0 text-muted-foreground"
                />
                <input
                  id="route-address"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  autoComplete="street-address"
                  placeholder="Ej. Arista 1740, colonia Moderna, Guadalajara"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Button
                disabled={searchStatus === 'loading'}
                type="submit"
                variant="glass-primary"
                className="h-11 min-w-32 font-bold"
              >
                {searchStatus === 'loading' ? (
                  <LoaderCircle aria-hidden="true" className="animate-spin" />
                ) : (
                  <MapPin aria-hidden="true" />
                )}
                {searchStatus === 'loading' ? 'Buscando' : 'Buscar domicilio'}
              </Button>
            </div>
          </form>

          <Button
            disabled={locating}
            type="button"
            onClick={useCurrentLocation}
            variant="glass"
            className="h-11 font-bold"
          >
            {locating ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" />
            ) : (
              <LocateFixed aria-hidden="true" className="text-primary" />
            )}
            {locating ? 'Ubicando…' : 'Salir desde mi ubicación'}
          </Button>
        </div>

        <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-emerald-700"
          />
          <p>
            No escribas nombres, expedientes ni notas del juicio. La consulta
            externa recibe solamente el domicilio necesario.
          </p>
        </div>

        {searchMessage ? (
          <p
            role="alert"
            className="mt-3 rounded-xl border border-amber-300 bg-amber-50/85 px-3.5 py-2.5 text-xs font-semibold text-amber-950"
          >
            {searchMessage}
          </p>
        ) : null}

        {geocodeResults.length ? (
          <div
            aria-label="Coincidencias de domicilio"
            className="mt-3 grid gap-2 lg:grid-cols-2"
          >
            {geocodeResults.map((result) => (
              <button
                type="button"
                key={result.id}
                onClick={() => addGeocodedStop(result)}
                className="flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border border-white/80 bg-white/70 p-3 text-left text-xs transition-colors hover:border-primary/40 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <MapPin
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-primary"
                />
                <span>
                  <span className="block font-bold text-foreground">
                    Usar este punto
                  </span>
                  <span className="mt-0.5 block leading-5 text-muted-foreground">
                    {result.label}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.7fr)]">
        <section
          aria-label="Mapa y resumen de la ruta"
          className="glass-panel relative min-h-[500px] min-w-0 overflow-hidden rounded-3xl border border-white/80 shadow-md"
        >
          <RouteMap
            origin={origin}
            stops={orderedStops}
            geometry={plan?.geometry ?? null}
            selectedStopId={selectedStopId}
            onSelectStop={selectStop}
          />

          <div className="glass-panel absolute left-4 top-4 z-10 max-w-[calc(100%-5rem)] rounded-2xl border border-white/90 p-3.5 shadow-xl backdrop-blur-2xl sm:left-5 sm:top-5 sm:p-4.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Ruta sugerida
              </p>
              <Badge
                variant={
                  plan?.provider === 'openrouteservice'
                    ? 'glass-blue'
                    : 'glass-amber'
                }
              >
                {plan?.provider === 'openrouteservice'
                  ? 'Ruta vial'
                  : 'Modo aproximado'}
              </Badge>
            </div>
            <p className="mt-1 font-heading text-xl font-bold text-foreground sm:text-2xl">
              {formatDistance(plan?.distanceMeters)} ·{' '}
              {formatDuration(plan?.durationSeconds)}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <LocateFixed aria-hidden="true" className="size-3.5" />{' '}
              {originLabel}
            </p>
          </div>

          {planStatus === 'loading' ? (
            <output className="absolute inset-x-4 bottom-10 z-10 flex items-center gap-2 rounded-xl border border-blue-200 bg-white/95 p-3 text-xs font-bold text-primary shadow-lg sm:inset-x-auto sm:right-4">
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />{' '}
              Calculando el mejor orden…
            </output>
          ) : null}
        </section>

        <section
          aria-labelledby="stop-order-title"
          className="glass-panel min-w-0 rounded-3xl border border-white/80 p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id="stop-order-title"
                className="font-heading text-xl font-semibold"
              >
                Orden de visita
              </h2>
              <p className="text-xs text-muted-foreground">
                {stops.length} destinos · confirma cada marcador antes de salir
              </p>
            </div>
            <Button
              onClick={() => void refreshPlan()}
              disabled={planStatus === 'loading'}
              variant="glass"
              size="icon"
              aria-label="Optimizar ruta nuevamente"
              className="size-11 shrink-0"
            >
              <Route
                aria-hidden="true"
                className={
                  planStatus === 'loading'
                    ? 'animate-pulse text-primary'
                    : 'text-primary'
                }
              />
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-blue-200/70 bg-blue-50/75 p-3 text-xs leading-5 text-blue-950">
            {planStatus === 'error' ? (
              <CircleAlert
                aria-hidden="true"
                className="size-4 shrink-0 text-red-700"
              />
            ) : (
              <CheckCircle2
                aria-hidden="true"
                className="size-4 shrink-0 text-emerald-700"
              />
            )}
            <span>
              {planStatus === 'error'
                ? 'No fue posible actualizar la ruta.'
                : (plan?.message ?? 'Preparando la ruta…')}
            </span>
          </div>

          <ol className="mt-4 space-y-2.5">
            {orderedStops.map((stop, index) => (
              <li
                key={stop.id}
                className={`group flex items-center gap-2 rounded-2xl border p-2 transition-colors ${selectedStopId === stop.id ? 'border-amber-400 bg-amber-50/75' : 'border-white/70 bg-white/45'}`}
              >
                <button
                  onClick={() => {
                    setSelectedStopId(stop.id);
                    onOpenEvidence();
                  }}
                  type="button"
                  className="flex min-h-14 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl p-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary text-xs font-extrabold text-white shadow-xs">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-bold text-foreground">
                        {stop.name}
                      </span>
                      {stop.verified ? (
                        <CheckCircle2
                          aria-label="Domicilio confirmado"
                          className="size-3.5 shrink-0 text-emerald-700"
                        />
                      ) : null}
                    </span>
                    <span className="mt-0.5 block truncate text-xs font-medium text-muted-foreground">
                      {stop.time} · {stop.address}
                    </span>
                  </span>
                </button>
                {stop.id.startsWith('manual-') ? (
                  <Button
                    type="button"
                    onClick={() => removeStop(stop.id)}
                    variant="ghost"
                    size="icon"
                    aria-label={`Quitar ${stop.address}`}
                    className="size-11 shrink-0 text-muted-foreground hover:text-red-700"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </Button>
                ) : null}
              </li>
            ))}
          </ol>

          <Button
            onClick={onOpenEvidence}
            variant="glass-primary"
            size="lg"
            className="mt-4 h-11 w-full font-bold"
          >
            <Navigation aria-hidden="true" />
            Abrir primera diligencia
          </Button>

          <p className="mt-3 flex items-start gap-2 text-[11px] leading-4 text-muted-foreground">
            <Clock3 aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            Los tiempos de traslado no sustituyen la valoración del actuario
            sobre plazos, horarios hábiles y prioridad procesal.
          </p>
        </section>
      </div>
    </div>
  );
}

function formatDistance(distance?: number | null) {
  if (distance == null) return 'Calculando';
  return distance >= 1_000
    ? `${(distance / 1_000).toFixed(1)} km`
    : `${Math.round(distance)} m`;
}

function formatDuration(duration?: number | null) {
  if (duration == null) return 'sin tiempo vial';
  const minutes = Math.max(1, Math.round(duration / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours} h${remainder ? ` ${remainder} min` : ''}`;
}

async function requestRoutePlan(
  origin: Coordinates,
  stops: RouteStop[],
  signal?: AbortSignal,
) {
  const response = await fetch('/api/routes/optimize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      origin,
      stops: stops.map((stop, index) => ({
        id: stop.id,
        coordinates: stop.coordinates,
        priority: Math.max(1, 90 - index * 10),
      })),
    }),
    signal,
  });
  if (!response.ok) throw new Error('No fue posible calcular la ruta');
  return response.json() as Promise<RoutePlan>;
}
