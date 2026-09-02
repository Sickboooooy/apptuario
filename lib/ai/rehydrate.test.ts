import { describe, expect, it } from 'vitest';

const tokenMap = {
  entries: [
    { token: 'EXPEDIENTE', value: '123/2026', sourceKey: 'case:docket' },
    { token: 'QUEJOSO_1', value: 'Juan Pérez', sourceKey: 'case:claimant' },
  ],
};

describe('rehydrate', () => {
  it('substitutes every known token back to its real value', async () => {
    const { rehydrate } = await import('./rehydrate');

    const borrador = 'Se notifica a QUEJOSO_1, expediente EXPEDIENTE.';
    const result = rehydrate(borrador, tokenMap);

    expect(result).toBe('Se notifica a Juan Pérez, expediente 123/2026.');
  });

  it('does not let a shorter token clobber a longer one with the same prefix', async () => {
    const { rehydrate } = await import('./rehydrate');

    const withDecoyPrefix = {
      entries: [
        { token: 'TERCERO_1', value: 'Ana López', sourceKey: 'recipient:r1:name' },
        { token: 'TERCERO_10', value: 'Carlos Ruiz', sourceKey: 'recipient:r10:name' },
      ],
    };

    const result = rehydrate('TERCERO_10 y TERCERO_1', withDecoyPrefix);
    expect(result).toBe('Carlos Ruiz y Ana López');
  });

  it('throws when a token-shaped string survives substitution', async () => {
    const { rehydrate } = await import('./rehydrate');

    const borradorConTokenHuerfano =
      'Se notifica a QUEJOSO_1 y a TERCERO_9, expediente EXPEDIENTE.';

    expect(() => rehydrate(borradorConTokenHuerfano, tokenMap)).toThrow();
  });
});
