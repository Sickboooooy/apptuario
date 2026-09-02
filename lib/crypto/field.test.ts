import { describe, expect, it } from 'vitest';

describe('encryptField/decryptField: round-trip', () => {
  it('returns the exact original value, including accents and ñ', async () => {
    const { encryptField, decryptField } = await import('./field');
    const { generateDataKey } = await import('./keys');

    const key = await generateDataKey();
    const aad = {
      userId: 'user-1',
      caseId: 'case-1',
      recordType: 'recipients.name',
      keyVersion: 1,
    };
    const plaintext = 'José Ñáñez Muñoz — colonia Álamos, C.P. 04160';

    const encrypted = await encryptField(plaintext, key, aad);
    const decrypted = await decryptField(encrypted, key, aad);

    expect(decrypted).toBe(plaintext);
  });

  it('produces a different IV (and ciphertext) on each call for the same plaintext', async () => {
    const { encryptField } = await import('./field');
    const { generateDataKey } = await import('./keys');

    const key = await generateDataKey();
    const aad = {
      userId: 'user-1',
      caseId: 'case-1',
      recordType: 'recipients.name',
      keyVersion: 1,
    };

    const first = await encryptField('Juan Pérez', key, aad);
    const second = await encryptField('Juan Pérez', key, aad);

    expect(first.iv).not.toBe(second.iv);
    expect(first.ciphertext).not.toBe(second.ciphertext);
  });
});

describe('encryptField/decryptField: AAD binding across cases', () => {
  it('throws when decrypting with a different case_id in the AAD', async () => {
    const { encryptField, decryptField } = await import('./field');
    const { generateDataKey } = await import('./keys');

    const key = await generateDataKey();
    const aadCaseA = {
      userId: 'user-1',
      caseId: 'case-A',
      recordType: 'recipients.name',
      keyVersion: 1,
    };
    const aadCaseB = { ...aadCaseA, caseId: 'case-B' };

    const encrypted = await encryptField('Domicilio confidencial', key, aadCaseA);

    await expect(decryptField(encrypted, key, aadCaseB)).rejects.toThrow();
  });

  it('throws when decrypting with a stale key_version in the AAD', async () => {
    const { encryptField, decryptField } = await import('./field');
    const { generateDataKey } = await import('./keys');

    const key = await generateDataKey();
    const aad = {
      userId: 'user-1',
      caseId: 'case-1',
      recordType: 'cases.claimant',
      keyVersion: 1,
    };
    const encrypted = await encryptField('Ana López', key, aad);

    await expect(
      decryptField(encrypted, key, { ...aad, keyVersion: 2 }),
    ).rejects.toThrow();
  });
});
