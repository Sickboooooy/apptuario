'use client';

import { useEffect, useRef, useState } from 'react';
import type { GeoJSONSource, Map as MapLibreMap, Marker } from 'maplibre-gl';
import type { Coordinates, RouteGeometry, RouteStop } from '@/lib/route-types';

const OPEN_FREE_MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

type RouteMapProps = {
  origin: Coordinates;
  stops: RouteStop[];
  geometry: RouteGeometry | null;
  selectedStopId: string | null;
  onSelectStop: (id: string) => void;
};

export function RouteMap({
  origin,
  stops,
  geometry,
  selectedStopId,
  onSelectStop,
}: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const initialOriginRef = useRef(origin);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    void import('maplibre-gl')
      .then((maplibre) => {
        if (cancelled || !containerRef.current) return;

        const map = new maplibre.Map({
          container: containerRef.current,
          style: OPEN_FREE_MAP_STYLE,
          center: initialOriginRef.current,
          zoom: 11.5,
          attributionControl: { compact: true },
        });

        map.addControl(
          new maplibre.NavigationControl({ showCompass: true }),
          'top-right',
        );
        void map.once('load', () => setMapReady(true));
        map.on('error', () => setMapError(true));
        mapRef.current = map;
      })
      .catch(() => setMapError(true));

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let disposed = false;
    let cleanup = () => undefined;

    void import('maplibre-gl').then((maplibre) => {
      if (disposed) return;

      const renderRoute = () => {
        if (disposed) return;

        const line = geometry ?? fallbackGeometry(origin, stops);
        const existingSource = map.getSource('apptuario-route') as
          | GeoJSONSource
          | undefined;

        if (existingSource) {
          existingSource.setData(line);
        } else {
          map.addSource('apptuario-route', { type: 'geojson', data: line });
          map.addLayer({
            id: 'apptuario-route-outline',
            type: 'line',
            source: 'apptuario-route',
            paint: {
              'line-color': '#ffffff',
              'line-width': 8,
              'line-opacity': 0.88,
            },
          });
          map.addLayer({
            id: 'apptuario-route-line',
            type: 'line',
            source: 'apptuario-route',
            paint: {
              'line-color': '#1e3a8a',
              'line-width': 5,
              'line-opacity': 0.95,
            },
          });
        }

        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        const originElement = document.createElement('div');
        originElement.className = 'apptuario-map-marker apptuario-map-origin';
        originElement.textContent = 'S';
        originElement.setAttribute('aria-label', 'Punto de salida');
        const originMarker = new maplibre.Marker({ element: originElement })
          .setLngLat(origin)
          .addTo(map);
        markersRef.current.push(originMarker);

        stops.forEach((stop, index) => {
          const element = document.createElement('button');
          element.type = 'button';
          element.className = `apptuario-map-marker${selectedStopId === stop.id ? ' is-selected' : ''}`;
          element.textContent = String(index + 1);
          element.setAttribute(
            'aria-label',
            `Parada ${index + 1}: ${stop.address}`,
          );
          element.addEventListener('click', () => onSelectStop(stop.id));
          const marker = new maplibre.Marker({ element })
            .setLngLat(stop.coordinates)
            .addTo(map);
          markersRef.current.push(marker);
        });

        const bounds = new maplibre.LngLatBounds(origin, origin);
        stops.forEach((stop) => bounds.extend(stop.coordinates));
        map.fitBounds(bounds, { padding: 64, maxZoom: 14, duration: 500 });
      };

      if (map.isStyleLoaded()) {
        renderRoute();
      } else {
        void map.once('load', renderRoute);
        cleanup = () => {
          map.off('load', renderRoute);
        };
      }
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [geometry, mapReady, onSelectStop, origin, selectedStopId, stops]);

  return (
    <div
      className="relative h-full min-h-[460px] w-full bg-slate-100"
      aria-label="Mapa interactivo de la ruta diaria"
    >
      <div
        ref={containerRef}
        className="absolute inset-0 h-full min-h-[460px] w-full"
      />
      {!mapReady && !mapError ? (
        <output className="absolute inset-0 z-10 grid place-items-center bg-slate-100/90 text-center text-sm font-bold text-primary backdrop-blur-sm">
          <span className="grid gap-2">
            <span className="mx-auto size-8 animate-spin rounded-full border-3 border-blue-200 border-t-primary" />
            Cargando mapa abierto…
          </span>
        </output>
      ) : null}
      {mapError ? (
        <output className="absolute inset-x-4 bottom-10 z-10 rounded-xl border border-amber-300 bg-amber-50/95 p-3 text-xs font-semibold text-amber-950 shadow-lg">
          No fue posible cargar una parte del mapa. Revisa la conexión e
          inténtalo nuevamente.
        </output>
      ) : null}
    </div>
  );
}

function fallbackGeometry(
  origin: Coordinates,
  stops: RouteStop[],
): RouteGeometry {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: [origin, ...stops.map((stop) => stop.coordinates)],
    },
  };
}
