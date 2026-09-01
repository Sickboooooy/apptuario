# AppTuario en Docker

## Requisitos

- Docker Desktop con Docker Compose v2.

## Iniciar

Desde la carpeta `app-tuario`:

```powershell
docker compose up --build -d
```

La aplicación quedará disponible en <http://localhost:3001>. Se usa el puerto
3001 para poder mantener el servidor de desarrollo actual en el puerto 3000.
Al iniciar, el contenedor aplica automáticamente las migraciones pendientes de
la base de datos local, incluidos usuarios y sesiones.

Comprueba el estado y consulta los registros con:

```powershell
docker compose ps
docker compose logs -f apptuario
```

Para detenerla sin borrar los datos locales:

```powershell
docker compose down
```

## OpenRouteService opcional

La aplicación funciona sin llave mediante Nominatim y rutas aproximadas. Para
habilitar las rutas viales, copia `.dev.vars.example` como `.dev.vars` y agrega
la llave `ORS_API_KEY`. Después recrea el contenedor:

```powershell
Copy-Item .dev.vars.example .dev.vars
docker compose up --build -d
```

`.dev.vars` está excluido de Git y del contexto de compilación para evitar que
la llave termine dentro de la imagen.

## Puerto alternativo

Para publicar el contenedor en otro puerto:

```powershell
$env:APPTUARIO_PORT = '8080'
docker compose up --build -d
```

En ese caso, abre <http://localhost:8080>.

## Eliminar también los datos locales

Este comando elimina el contenedor y el volumen persistente de Wrangler:

```powershell
docker compose down --volumes
```
