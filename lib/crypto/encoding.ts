export function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(
    Math.ceil(normalized.length / 4) * 4,
    '=',
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

// WebCrypto's BufferSource-typed parameters (AesGcmParams.iv/additionalData,
// SubtleCrypto.importKey/unwrapKey's key material, etc.) require a
// Uint8Array pinned to a concrete ArrayBuffer. Values from getRandomValues()
// and TextEncoder.encode() are always backed by a fresh, non-shared
// ArrayBuffer at runtime; this asserts that known-safe fact where the
// ambient lib.dom / @cloudflare/workers-types definitions disagree on the
// generic and TypeScript can't infer it on its own.
export function asBufferSource(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  return bytes as Uint8Array<ArrayBuffer>;
}
