import { describe, expect, it } from 'vitest';

describe('blindIndex', () => {
  it('produces the same index for the same value with different capitalization/spacing', async () => {
    const { blindIndex } = await import('./blind-index');
    const { generateHmacKey } = await import('./keys');

    const key = await generateHmacKey();
    const a = await blindIndex('  Juan   Pérez  ', key);
    const b = await blindIndex('juan pérez', key);
    const c = await blindIndex('JUAN PÉREZ', key);

    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it('produces different indices for different values', async () => {
    const { blindIndex } = await import('./blind-index');
    const { generateHmacKey } = await import('./keys');

    const key = await generateHmacKey();
    const a = await blindIndex('Juan Pérez', key);
    const b = await blindIndex('Juana Pérez', key);

    expect(a).not.toBe(b);
  });

  it('produces different indices for the same value under different index keys', async () => {
    const { blindIndex } = await import('./blind-index');
    const { generateHmacKey } = await import('./keys');

    const keyA = await generateHmacKey();
    const keyB = await generateHmacKey();
    const a = await blindIndex('Juan Pérez', keyA);
    const b = await blindIndex('Juan Pérez', keyB);

    expect(a).not.toBe(b);
  });
});
