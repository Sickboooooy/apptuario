import { toBase64Url } from './encoding';

export function normalizeForIndex(value: string): string {
  return value.trim().toLowerCase().normalize('NFC').replace(/\s+/g, ' ');
}

export async function blindIndex(
  value: string,
  indexKey: CryptoKey,
): Promise<string> {
  const signature = await crypto.subtle.sign(
    'HMAC',
    indexKey,
    new TextEncoder().encode(normalizeForIndex(value)),
  );
  return toBase64Url(new Uint8Array(signature));
}
