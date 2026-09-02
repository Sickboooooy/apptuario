# ADR-002: Blind indexes para búsqueda sobre campos cifrados

Estado: aceptado (estructura de datos). Implementación criptográfica: Fase 2.

## Contexto

`recipients.name` y `recipients.address_line` (y `cases.claimant`) dejan de
almacenarse en claro (Fase 1). AES-GCM produce ciphertext no determinista
(el mismo valor cifrado dos veces da bytes distintos por el IV aleatorio),
así que no es posible hacer `WHERE name_ciphertext = ?` para, por ejemplo,
detectar si un domicilio ya fue registrado antes en el mismo expediente o
para deduplicar destinatarios.

## Decisión

Cada grupo de columnas cifradas añade una columna `_blind_index` adicional:
`recipients.name_blind_index`, `recipients.address_line_blind_index`,
`cases.claimant_blind_index`. El valor es un HMAC-SHA-256 determinista del
valor normalizado (trim, minúsculas, colapso de espacios, forma Unicode
NFC — ver `lib/crypto/blindIndex`, Fase 2) usando una llave de indexado
separada de la DEK de cifrado de campo.

Las tres columnas tienen un índice B-tree normal
(`idx_recipients_name_blind`, `idx_recipients_address_blind`,
`idx_cases_claimant_blind`) para que una búsqueda por igualdad sobre el
blind index sea una consulta indexada, no un escaneo completo de tabla.

## Consecuencias

- El blind index permite igualdad exacta post-normalización, no búsqueda
  parcial ni ordenamiento alfabético: buscar "por prefijo" o "contiene"
  sobre un campo protegido no es posible sin descifrar en el cliente.
- Un HMAC determinista sobre un espacio de valores pequeño y adivinable
  (por ejemplo, nombres comunes) es vulnerable a un ataque de diccionario
  offline si la llave de indexado se filtra junto con la base de datos: la
  llave de indexado debe protegerse con el mismo nivel de cuidado que las
  DEK, y su compromiso reduce la confidencialidad de los valores indexados
  aunque el ciphertext del campo en sí siga intacto. Este trade-off se
  acepta porque la alternativa (sin blind index) no permite ninguna
  búsqueda operativa sobre destinatarios ya capturados.
- La normalización debe ser idéntica en cada punto donde se calcula un
  blind index (captura y búsqueda); una divergencia produce falsos
  negativos silenciosos en vez de un error, así que la función de
  normalización vive en un solo lugar (`lib/crypto`, Fase 2) y no se
  reimplementa en los llamadores.
