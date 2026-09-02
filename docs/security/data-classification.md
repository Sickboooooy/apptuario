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

## Pendiente para fases posteriores

- Fase 3 (`lib/ai/redactor.ts`) debe negarse a tokenizar o enviar a un
  modelo cualquier campo cuya `data_classification` sea
  `judicial_restricted` o `high_risk` sin pasar primero por el tokenizador.
- Fase 4 debe rechazar geocodificación externa para `recipient_kind =
  natural_person` (HTTP 422) independientemente de `data_classification`.
