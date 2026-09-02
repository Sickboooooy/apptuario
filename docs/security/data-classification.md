# Clasificación de datos

Enums implementados en [`db/schema.ts`](../../db/schema.ts) sobre la tabla
`recipients`. Ambas columnas son `NOT NULL`: todo destinatario debe
declarar de qué tipo es y qué tan sensible es su dato antes de poder
guardarse.

## `recipient_kind`

Quién es el destinatario de la notificación:

| Valor | Significado |
| --- | --- |
| `public_authority` | Una autoridad (dependencia, órgano de gobierno). |
| `public_servant` | Un servidor público identificado individualmente. |
| `private_legal_entity` | Una persona moral privada. |
| `natural_person` | Una persona física. Es el caso que activa las reglas más estrictas: el flujo de captura de texto libre para `natural_person` solo opera sobre el dataset sintético mientras `REAL_JUDICIAL_DATA=false` (Fase 4). |

## `data_classification`

Qué tan sensible es el dato asociado al destinatario:

| Valor | Significado |
| --- | --- |
| `public` | Información ya pública (p. ej. datos de una autoridad publicados en su directorio oficial). |
| `operational` | Metadatos operativos de la notificación sin dato personal directo (estatus, folio interno). |
| `personal` | Dato personal según la LFPDPPP (nombre, domicilio) que no corresponde a una persona física parte en un juicio penal o de naturaleza especialmente sensible. |
| `judicial_restricted` | Dato personal ligado a un expediente judicial en curso; sujeto a las reglas de acceso más estrictas del propio juzgado. |
| `high_risk` | Dato cuya exposición indebida representa riesgo de daño físico o jurídico grave a la persona (p. ej. domicilio de una persona física en un asunto con historial de violencia). |

## Dónde se aplica hoy

- `recipients.recipient_kind` y `recipients.data_classification`: columnas
  `NOT NULL` sin valor por defecto — insertar un destinatario sin
  clasificarlo explícitamente falla a nivel de base de datos
  (`db/schema.test.ts`).
- `cases.claimant_*` (el nombre del quejoso) se cifra con el mismo grupo de
  columnas que `recipients.name_*`/`address_line_*`, pero **no** tiene hoy
  una columna de clasificación propia — el expediente completo se trata
  como `judicial_restricted` implícitamente. Extender `data_classification`
  (o un campo equivalente) a `cases` queda pendiente si en el futuro se
  necesita distinguir el nivel de sensibilidad de un caso completo.

- `POST /api/recipients` (Fase 4, `lib/recipient-capture-policy.ts`)
  rechaza captura de texto libre de un `recipient_kind = natural_person`
  cuando `REAL_JUDICIAL_DATA` no es `'true'` — ver ADR-005.
- `POST /api/geocode` (Fase 4) rechaza con 422 cualquier request con
  `recipientKind: 'natural_person'` antes de llamar a un proveedor
  externo, y su payload (`lib/geocode-request.ts`) es un tipo cerrado que
  no puede admitir un campo de nombre ni de expediente — garantizado por
  el compilador, no por convención.

## Pendiente para fases posteriores

- `lib/ai/redactor.ts` (Fase 3) no distingue hoy por `data_classification`
  al tokenizar: trata todo campo del diccionario igual. Negarse a incluir
  en el prompt cualquier campo `judicial_restricted`/`high_risk` sin pasar
  primero por el tokenizador queda pendiente de una fase futura si se
  necesita ese nivel de granularidad.
- El formulario real de captura de destinatarios, la integración con un
  modelo de IA concreto, el componente de constancia rotulada, y conectar
  `app/api/recipients` a persistencia cifrada real quedan fuera del
  alcance implementado en Fase 4 — ver "Alcance implementado" en
  ADR-005.
