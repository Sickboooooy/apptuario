# ADR-004: Por qué la IA nunca recibe datos personales

Estado: aceptado.

## Contexto

AppTuario usa un modelo de IA para ayudar a redactar razones de
notificación y otras constancias. El invariante del proyecto es que
ninguna llamada al modelo contenga valores reales del diccionario de
tokens — el modelo solo debe ver tokens (`QUEJOSO_1`, `DOMICILIO_1`,
`EXPEDIENTE`) y contexto procesal genérico.

Esto no es solo una preferencia de diseño: es la única forma de que la
promesa de "cifrado de extremo a extremo" de ADR-001 signifique algo. Si el
texto que llega al modelo tuviera los valores reales, todo el trabajo de
cifrar `recipients.name`/`address_line` y `cases.claimant` en reposo
(Fase 1) sería cosmético — el dato saldría en claro por otra puerta en
cuanto se generara una constancia asistida por IA.

## Decisión

`lib/ai/redactor.ts` (implementado como varios módulos: `token-map.ts`,
`tokenize.ts`, `prompt.ts`, `validate.ts`, `rehydrate.ts`) es una capa de
funciones puras sin acceso a base de datos ni a `fetch`. No decide por sí
sola cuándo se le llama; asume que quien la invoca (el cliente, después de
descifrar con `lib/crypto`) le entrega texto y un diccionario ya en
memoria.

Flujo:

1. El cliente descifra los campos del expediente que necesita (vía
   `lib/crypto`).
2. `buildTokenMap(source, previous?)` arma el diccionario token↔valor a
   partir de esos campos ya descifrados — nunca a partir de una consulta a
   la base de datos.
3. `tokenize(texto, tokenMap)` sustituye cada valor del diccionario en el
   texto de entrada por su token, y hace un barrido final
   (`assertNoLeaks`) que lanza `LeakDetectedError` si algo del diccionario
   sigue apareciendo. Solo el texto que sale de aquí puede cruzar hacia el
   servidor/la llamada al modelo.
4. `buildPrompt(...)` arma el prompt final con las tres reglas duras
   (conservar tokens, no inventar datos, marcar `[DATO_FALTANTE]`) sobre
   ese texto ya tokenizado.
5. El servidor reenvía el prompt tokenizado al modelo y recibe el borrador
   — en ningún punto de este paso el servidor tiene ni necesita la llave de
   cifrado ni los valores reales.
6. `validateDraft(borrador, tokenMap, tokenizedInput)` audita el borrador
   del modelo contra el diccionario **todavía en el cliente**: token
   huérfano → `red`; valor real filtrado → `red`; expediente o fecha
   inventados (no presentes ni en el input tokenizado) → `red`;
   `[DATO_FALTANTE]` presente y sin otros hallazgos → `abstain` (nunca
   colapsa a `green`).
7. `rehydrate(borrador, tokenMap)` — solo si el veredicto es `green` —
   sustituye los tokens por los valores reales, en el cliente, y lanza si
   queda algún token sin resolver.

## Desviaciones deliberadas del texto original del prompt de arquitectura

- **`buildTokenMap(caseId)` → `buildTokenMap(source, previous?)`**: el
  prompt original describe la firma como `buildTokenMap(caseId)`, que
  implicaría que la función consulta la base de datos por su cuenta. Eso
  violaría el invariante 3 (la rehidratación/descifrado solo ocurre en el
  cliente) si `buildTokenMap` viviera en un contexto con acceso a la DB sin
  también tener la llave de descifrado a mano. En vez de eso, la función
  recibe los campos ya descifrados (`CaseTokenSource`) — quien la llama
  (siempre el cliente) es responsable de haber hecho `caseId` → consulta →
  descifrado antes de invocarla. `previous` es un parámetro añadido para
  cumplir el requisito explícito de "tokens estables dentro del
  expediente": permite reconstruir el diccionario cuando cambian los datos
  del caso sin renumerar tokens ya usados en constancias previas.
- **`validateDraft(borrador, tokenMap)` → `validateDraft(borrador,
  tokenMap, tokenizedInput)`**: los fixtures de Fase 3 exigen detectar un
  expediente o fecha "no presente ni en tokens ni en el input" — esa
  comparación requiere tener el texto de entrada tokenizado a la mano, así
  que se añadió como tercer parámetro explícito en vez de asumir que
  `validateDraft` reconstruye o recuerda ese contexto por sí sola.

## Consecuencias

- `lib/ai/redactor.ts` es deliberadamente "tonto" respecto a de dónde
  vienen los datos: no importa nada de `db/` ni de `lib/crypto` que no sea
  tipos. Esto lo hace trivialmente testeable sin mocks de base de datos
  (ver los fixtures de Fase 3), pero también significa que **la disciplina
  de nunca invocar estas funciones desde el servidor con datos reales en
  memoria vive fuera de este módulo** — es responsabilidad de quien lo
  integre (Fase 4) asegurarse de que `tokenize`/`buildTokenMap`/
  `rehydrate` solo se llamen client-side.
- Si en el futuro se necesita que el servidor arme el diccionario (por
  ejemplo, para precalcular tokens sin depender de que el cliente tenga la
  sesión de descifrado abierta), eso requeriría que el servidor tuviera
  acceso a la DEK del expediente — lo cual violaría el invariante 3 tal
  como está escrito hoy. Cualquier cambio en esa dirección necesita su
  propio ADR, no una extensión silenciosa de este módulo.
