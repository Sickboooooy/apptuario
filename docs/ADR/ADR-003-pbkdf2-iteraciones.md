# ADR-003: Cifra de iteraciones PBKDF2 para la llave raíz

Estado: aceptado.

## Contexto

`lib/crypto/root-key.ts` deriva la llave raíz del usuario a partir de su
passphrase con PBKDF2-HMAC-SHA-256. El costo de esa derivación es la única
defensa contra un ataque de fuerza bruta offline si la base de datos (que
solo contiene KEKs/DEKs envueltas, nunca la llave raíz) se filtrara junto
con el salt del usuario — el salt no es secreto, así que toda la
resistencia depende del número de iteraciones.

`lib/user-auth.ts` ya usa PBKDF2-SHA-256 con 210,000 iteraciones para
hashear contraseñas de login (un caso de uso distinto: verificar una
contraseña, no derivar una llave de cifrado de larga vida).

## Decisión

600,000 iteraciones para `deriveRootKey`, por encima del mínimo (210,000
iteraciones) que ya recomendaba históricamente OWASP para PBKDF2-HMAC-SHA256
y que este mismo proyecto usa para el hash de login. La cifra más alta se
justifica porque la llave raíz protege datos de mucho mayor sensibilidad y
vida más larga que una sesión de login (todo el historial de nombres y
domicilios cifrados de un usuario, potencialmente por años), así que
justifica un costo de derivación mayor que el de un simple hash de
contraseña de un solo uso por sesión.

El número vive como constante exportada
(`ROOT_KEY_PBKDF2_ITERATIONS` en `lib/crypto/root-key.ts`) en vez de estar
hardcodeado inline, para que subirlo en el futuro (conforme el hardware
disponible para atacantes mejora) sea un cambio de una línea con su propio
ADR de actualización, no una arqueología de código.

## Consecuencias

- ~600,000 iteraciones de PBKDF2-SHA256 toman un tiempo perceptible
  (decenas a un par de cientos de milisegundos) en dispositivos de gama
  baja. Es una operación que ocurre una vez por sesión (al desbloquear la
  llave raíz), no por campo cifrado, así que el costo no se multiplica por
  la cantidad de datos del expediente.
- Subir este número más adelante no invalida datos ya cifrados: solo
  cambia el costo de re-derivar la llave raíz la próxima vez que el usuario
  ingrese su passphrase. No requiere migración de datos.
- Esta cifra es específica de PBKDF2-SHA-256. Si en el futuro se migra a
  Argon2id (no disponible en Web Crypto API de forma nativa, por lo que
  requeriría una dependencia externa, fuera del alcance de "cero
  dependencias nativas" de este módulo), esta decisión debe revisarse por
  completo, no solo el número de iteraciones.
