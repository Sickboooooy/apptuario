import { fromBase64Url, toBase64Url } from './encoding';
import { DEK_ALGORITHM, DEK_USAGES } from './keys';

const WRAP_ALGORITHM = { name: 'AES-KW' } as const;

export async function wrapKey(
  keyToWrap: CryptoKey,
  wrappingKey: CryptoKey,
): Promise<string> {
  const wrapped = await crypto.subtle.wrapKey(
    'raw',
    keyToWrap,
    wrappingKey,
    WRAP_ALGORITHM,
  );
  return toBase64Url(new Uint8Array(wrapped));
}

export async function unwrapKey(
  wrapped: string,
  wrappingKey: CryptoKey,
  unwrappedKeyAlgorithm: AesKeyAlgorithm,
  unwrappedKeyUsages: KeyUsage[],
  extractable = true,
): Promise<CryptoKey> {
  return crypto.subtle.unwrapKey(
    'raw',
    fromBase64Url(wrapped),
    wrappingKey,
    WRAP_ALGORITHM,
    unwrappedKeyAlgorithm,
    extractable,
    unwrappedKeyUsages,
  );
}

export type WrappedDekRecord = {
  caseId: string;
  wrappedDek: string;
  keyVersion: number;
};

// Rotates the account KEK: re-wraps every case's DEK under the new KEK
// without touching field ciphertext. Pure function — reading/writing
// case_keys rows is the caller's responsibility, not lib/crypto's.
export async function rotateAccountKey(
  oldKek: CryptoKey,
  newKek: CryptoKey,
  wrappedDeks: WrappedDekRecord[],
): Promise<WrappedDekRecord[]> {
  const rewrapped: WrappedDekRecord[] = [];
  for (const record of wrappedDeks) {
    const dek = await unwrapKey(
      record.wrappedDek,
      oldKek,
      DEK_ALGORITHM,
      DEK_USAGES,
      true,
    );
    const newWrapped = await wrapKey(dek, newKek);
    rewrapped.push({
      caseId: record.caseId,
      wrappedDek: newWrapped,
      keyVersion: record.keyVersion + 1,
    });
  }
  return rewrapped;
}
