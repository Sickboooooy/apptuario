# ADR-005: El candado de despliegue `REAL_JUDICIAL_DATA`

Estado: aceptado (alcance reducido respecto al plan original — ver
"Alcance implementado" abajo).

## Contexto

Invariante 5: `REAL_JUDICIAL_DATA` existe a nivel de despliegue y su valor
por defecto es `false`. En `false`, todo flujo de captura de destinatarios
persona física opera solo con el dataset sintético incluido en el repo.
Esto existe para que un entorno de desarrollo, demo o preview nunca pueda
terminar procesando el domicilio real de una persona física por accidente
— el candado tiene que decidirse en el servidor, nunca en el cliente
(un flag leído en el navegador es trivialmente evadible).

## Decisión

- `REAL_JUDICIAL_DATA` se declara en `Cloudflare.Env` (`env.d.ts`) como
  variable de entorno opcional. Se lee exclusivamente vía
  `env.REAL_JUDICIAL_DATA` dentro de un handler de servidor
  (`cloudflare:workers`), nunca en un componente de cliente.
- Comparación explícita contra la cadena `'true'`
  (`env.REAL_JUDICIAL_DATA === 'true'`): cualquier otro valor —
  `undefined`, `'false'`, una cadena vacía, un typo — se trata como
  deshabilitado. El default seguro es "candado puesto", no "candado
  levantado a menos que se demuestre lo contrario".
- La política vive en `lib/recipient-capture-policy.ts`
  (`assertRecipientCaptureAllowed`), separada del handler HTTP
  (`app/api/recipients/route.ts`) para poder probarla sin depender de un
  runtime de Workers real — la prueba e2e ligera sí ejercita el handler
  HTTP completo (mockeando `cloudflare:workers`), pero la lógica de
  decisión en sí es una función pura reutilizable desde cualquier otro
  punto de captura que se agregue después.
- `lib/synthetic-recipients.ts` es el dataset sintético: nombres y
  domicilios evidentemente ficticios, con un `id` estable que es lo único
  que un cliente con `REAL_JUDICIAL_DATA=false` puede enviar para un
  destinatario `natural_person`.

## Alcance implementado (reducido respecto al "Alcance" original del prompt)

El prompt de arquitectura describe Fase 4 como conectar el flujo completo:
captura → cifrado → tokenización → llamada IA → validación → rehidratación
→ render de constancia rotulada. Ninguna de esas piezas de producto
(formulario de captura, llamada real a un modelo, componente de
constancia) existe hoy en la app — construirlas habría significado diseñar
UI/UX y un endpoint de IA sin ningún mockup ni decisión de producto del
usuario, con alto riesgo de construir algo que no es lo que se necesita.

Se acordó explícitamente con el usuario reducir Fase 4 a los tres gates
mecánicos y verificables que sí especifica la sección de
PRECONDICIÓN/fixtures:

1. `POST /api/recipients` rechaza captura de texto libre de un
   destinatario `natural_person` cuando `REAL_JUDICIAL_DATA` no es
   `'true'` (403), y acepta una selección del dataset sintético (202).
2. `lib/geocode-request.ts` expone un tipo cerrado (`GeocodeRequestBody`)
   que no puede admitir un campo de nombre — garantizado por el
   compilador (`lib/geocode-request.type-check.ts`, verificado con
   `@ts-expect-error` dentro de `tsc --noEmit`), no por convención.
3. `POST /api/geocode` rechaza con 422 cualquier request con
   `recipientKind: 'natural_person'` antes de llamar a cualquier proveedor
   externo (hoy, OpenRouteService o Nominatim — ambos externos).

**Lo que queda pendiente, fuera de este ADR:** el formulario real de
captura de destinatarios, la integración con un modelo de IA concreto, el
componente de constancia con el rótulo "BORRADOR — SIN FIRMA — SUJETO A
REVISIÓN", y conectar `app/api/recipients` a persistencia real (cifrado de
campo vía `lib/crypto`, `case_keys`, blind indexes). `POST
/api/recipients` hoy valida y responde `202 { accepted: true }` sin
escribir en `recipients` — es deliberadamente un gate, no una persistencia
funcional.

## Consecuencias

- Cualquier endpoint futuro que capture destinatarios reales debe llamar
  `assertRecipientCaptureAllowed` antes de aceptar el payload — si no lo
  hace, el candado no lo protege (no hay enforcement automático a nivel de
  framework, es una convención de código que debe respetarse en cada punto
  de entrada nuevo).
- El dataset sintético vive en el repo en texto plano (no es dato
  personal real, así que no aplica el invariante 1) — si algún día
  contuviera datos que pudieran confundirse con reales, tendría que
  tratarse con el mismo cuidado que cualquier fixture de prueba sensible.
