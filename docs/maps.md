# Mapas y optimización de rutas

AppTuario utiliza MapLibre GL JS con los mapas vectoriales de OpenFreeMap. La vista funciona sin claves externas.

## Activar rutas viales

Configura `ORS_API_KEY` como secreto del entorno de ejecución. La clave nunca debe declararse con el prefijo `NEXT_PUBLIC_` ni enviarse al navegador.

Cuando la clave está disponible, `/api/routes/optimize` usa la optimización y las direcciones de openrouteservice. Sin ella, el endpoint devuelve un orden local por cercanía y una línea aproximada, identificada como tal en la interfaz.

## Geocodificación y privacidad

La búsqueda se ejecuta únicamente al pulsar **Buscar domicilio**; no existe autocompletado. Con `ORS_API_KEY` se usa el geocodificador de openrouteservice. Sin clave se usa la instancia pública de Nominatim con un máximo local de una solicitud por segundo, caché de 24 horas e identificación de la aplicación.

No deben escribirse nombres de personas, números de expediente, notas de campo ni otros datos del juicio. Sólo se envía el domicilio necesario. En producción con expedientes reales se recomienda alojar geocodificación, OSRM y VROOM en infraestructura controlada.

La atribución de OpenFreeMap, OpenMapTiles y OpenStreetMap permanece visible dentro del mapa.
