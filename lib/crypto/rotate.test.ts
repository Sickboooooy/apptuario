import { describe, expect, it } from 'vitest';

describe('rotateAccountKey', () => {
  it('re-wraps DEKs under a new KEK, advances key_version, and leaves field ciphertext decryptable', async () => {
    const { rotateAccountKey, unwrapKey } = await import('./wrap');
    const { encryptField, decryptField } = await import('./field');
    const { generateDataKey, generateKek, DEK_ALGORITHM, DEK_USAGES } = await import(
      './keys'
    );
    const { wrapKey } = await import('./wrap');

    const oldKek = await generateKek();
    const newKek = await generateKek();

    const dek = await generateDataKey();
    const wrappedUnderOldKek = await wrapKey(dek, oldKek);

    const aad = {
      userId: 'user-1',
      caseId: 'case-1',
      recordType: 'recipients.address_line',
      keyVersion: 1,
    };
    const encrypted = await encryptField('Av. Reforma 123', dek, aad);

    const [rotated] = await rotateAccountKey(oldKek, newKek, [
      { caseId: 'case-1', wrappedDek: wrappedUnderOldKek, keyVersion: 1 },
    ]);

    expect(rotated.keyVersion).toBe(2);
    expect(rotated.wrappedDek).not.toBe(wrappedUnderOldKek);

    const dekAfterRotation = await unwrapKey(
      rotated.wrappedDek,
      newKek,
      DEK_ALGORITHM,
      DEK_USAGES,
    );

    const decrypted = await decryptField(encrypted, dekAfterRotation, aad);
    expect(decrypted).toBe('Av. Reforma 123');

    // the DEK unwrapped under the OLD KEK must no longer be reachable via
    // the new wrapped form -- unwrapping the new form under the old KEK
    // must fail.
    await expect(
      unwrapKey(rotated.wrappedDek, oldKek, DEK_ALGORITHM, DEK_USAGES),
    ).rejects.toThrow();
  });
});
