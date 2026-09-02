import { asBufferSource } from './encoding';

export const DEK_ALGORITHM: AesKeyAlgorithm = { name: 'AES-GCM', length: 256 };
export const DEK_USAGES: KeyUsage[] = ['encrypt', 'decrypt'];

export const KEK_ALGORITHM: AesKeyAlgorithm = { name: 'AES-KW', length: 256 };
export const KEK_USAGES: KeyUsage[] = ['wrapKey', 'unwrapKey'];

// DEKs and KEKs must be extractable so they can be wrapped: WebCrypto's
// wrapKey()/unwrapKey() require the [[extractable]] flag on the key being
// wrapped, even though the wrapped bytes never touch JS in plaintext form.
// The root key that ultimately wraps the account KEK never needs this and
// is created non-extractable in root-key.ts.
export function generateDataKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(DEK_ALGORITHM, true, DEK_USAGES);
}

export function generateKek(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(KEK_ALGORITHM, true, KEK_USAGES);
}

export function generateHmacKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

export function importHmacKey(
  rawKey: Uint8Array<ArrayBuffer>,
): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

export function generateSalt(byteLength = 16): Uint8Array<ArrayBuffer> {
  return asBufferSource(crypto.getRandomValues(new Uint8Array(byteLength)));
}
