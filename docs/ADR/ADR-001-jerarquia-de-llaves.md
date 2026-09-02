# ADR-001: Jerarquía de llaves para cifrado de datos personales

Estado: aceptado (estructura de datos). Implementación criptográfica: Fase 2.

## Contexto

AppTuario almacena domicilios y nombres de partes físicas (destinatarios de
notificaciones judiciales, quejosos). El invariante del proyecto es que
ningún valor de estos campos exista en claro en D1, R2, logs ni telemetría.
Eso exige cifrado en reposo, pero un solo secreto compartido para toda la
base de datos sería un único punto de fallo: comprometerlo expone todos los
expedientes de todos los usuarios a la vez, y no permite revocar o rotar el
acceso de un usuario sin afectar a los demás.

## Decisión

Jerarquía de tres niveles:

1. **Llave raíz del usuario** — derivada de su passphrase vía PBKDF2
   (`lib/crypto/deriveRootKey`, Fase 2). Nunca sale del dispositivo del
   usuario; el servidor no la ve ni la almacena en ninguna forma.
2. **KEK de cuenta (Key-Encryption-Key)** — envuelta por la llave raíz.
   Vive solo en memoria del cliente durante la sesión.
3. **DEK por expediente (Data-Encryption-Key)** — una llave simétrica por
   `case_id`, envuelta por la KEK de cuenta. El servidor solo almacena la
   forma envuelta (`case_keys.wrapped_dek`), nunca la DEK en claro.

Los campos protegidos (`recipients.name_*`, `recipients.address_line_*`,
`cases.claimant_*`) se cifran con la DEK del expediente al que pertenecen,
no con la KEK de cuenta directamente. Esto acota el radio de exposición: si
una DEK se compromete, solo se ve afectado ese expediente.

`case_keys` usa clave primaria compuesta `(case_id, key_version)` en vez de
una fila única por expediente, para permitir generaciones de DEK a lo largo
de la vida de un expediente sin perder la capacidad de descifrar ciphertext
antiguo cifrado con una DEK anterior. `rotateAccountKey()` (Fase 2) rota la
KEK de cuenta y re-envuelve las filas de `case_keys` existentes — no cambia
la DEK ni re-cifra los campos, así que no crea una nueva fila de
`key_version` por sí sola.

## Consecuencias

- Perder la passphrase del usuario sin backup implica pérdida irrecuperable
  de los datos cifrados: es el costo esperado de que la llave raíz nunca
  toque el servidor.
- Cada operación de lectura de un campo protegido requiere que el cliente
  tenga la DEK del expediente en memoria (vía KEK de cuenta ya desenvuelta).
  El servidor nunca puede descifrar por sí solo.
- El campo `{campo}_key_version` en cada grupo de columnas cifradas permite,
  a futuro, migrar campos individuales a una DEK más nueva sin tener que
  re-cifrar todo el expediente de una sola vez.
