import { asBufferSource, fromBase64Url, toBase64Url } from './encoding';

const GCM_IV_BYTES = 12;
const GCM_TAG_BITS = 128;
const GCM_TAG_BYTES = GCM_TAG_BITS / 8;

export type FieldAad = {
  userId: string;
  caseId: string;
  recordType: string;
  keyVersion: number;
};

export type EncryptedField = {
  ciphertext: string;
  iv: string;
  tag: string;
};

export class FieldDecryptionError extends Error {
  constructor(cause: unknown) {
    super('Field decryption failed: ciphertext, key, or AAD mismatch');
    this.name = 'FieldDecryptionError';
    this.cause = cause;
  }
}

function buildAad(aad: FieldAad): Uint8Array<ArrayBuffer> {
  return asBufferSource(
    new TextEncoder().encode(
      `${aad.userId}|${aad.caseId}|${aad.recordType}|${aad.keyVersion}`,
    ),
  );
}

export async function encryptField(
  plaintext: string,
  key: CryptoKey,
  aad: FieldAad,
): Promise<EncryptedField> {
  const iv = asBufferSource(
    crypto.getRandomValues(new Uint8Array(GCM_IV_BYTES)),
  );
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: buildAad(aad), tagLength: GCM_TAG_BITS },
    key,
    new TextEncoder().encode(plaintext),
  );

  const cipherBytes = new Uint8Array(cipherBuffer);
  const tagBytes = cipherBytes.slice(cipherBytes.length - GCM_TAG_BYTES);
  const ciphertextBytes = cipherBytes.slice(0, cipherBytes.length - GCM_TAG_BYTES);

  return {
    ciphertext: toBase64Url(ciphertextBytes),
    iv: toBase64Url(iv),
    tag: toBase64Url(tagBytes),
  };
}

export async function decryptField(
  encrypted: EncryptedField,
  key: CryptoKey,
  aad: FieldAad,
): Promise<string> {
  const ciphertextBytes = fromBase64Url(encrypted.ciphertext);
  const tagBytes = fromBase64Url(encrypted.tag);
  const combined = new Uint8Array(ciphertextBytes.length + tagBytes.length);
  combined.set(ciphertextBytes, 0);
  combined.set(tagBytes, ciphertextBytes.length);

  try {
    const plainBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: fromBase64Url(encrypted.iv),
        additionalData: buildAad(aad),
        tagLength: GCM_TAG_BITS,
      },
      key,
      combined,
    );
    return new TextDecoder().decode(plainBuffer);
  } catch (cause) {
    throw new FieldDecryptionError(cause);
  }
}
