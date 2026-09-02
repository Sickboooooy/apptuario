// PBKDF2 iteration count for deriveRootKey. See docs/ADR/ADR-003 for the
// rationale (OWASP 2023 guidance for PBKDF2-HMAC-SHA256 is >=600,000).
export const ROOT_KEY_PBKDF2_ITERATIONS = 600_000;

// Derives the user's root key from their passphrase. The root key never
// leaves the device (invariant 4): it is created non-extractable and is
// only ever used to wrap/unwrap the account KEK, never exported.
export async function deriveRootKey(
  passphrase: string,
  salt: Uint8Array<ArrayBuffer>,
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ROOT_KEY_PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-KW', length: 256 },
    false,
    ['wrapKey', 'unwrapKey'],
  );
}
