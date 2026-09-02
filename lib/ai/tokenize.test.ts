import { describe, expect, it } from 'vitest';

const tokenMap = {
  entries: [
    { token: 'EXPEDIENTE', value: '123/2026', sourceKey: 'case:docket' },
    { token: 'QUEJOSO_1', value: 'Juan Pérez', sourceKey: 'case:claimant' },
  ],
};

describe('tokenize', () => {
  it('replaces every occurrence of a dictionary value, matching normalized (case-insensitive)', async () => {
    const { tokenize } = await import('./tokenize');

    const input =
      'En el expediente 123/2026 se tiene por presentado a JUAN PÉREZ, quien promueve en su carácter de quejoso.';

    const result = tokenize(input, tokenMap);

    expect(result).toContain('EXPEDIENTE');
    expect(result).toContain('QUEJOSO_1');
    expect(result.toLowerCase()).not.toContain('juan pérez');
    expect(result).not.toContain('123/2026');
  });

  it('tolerates extra/collapsed whitespace inside a multi-word value', async () => {
    const { tokenize } = await import('./tokenize');

    const input = 'Se notifica a Juan   Pérez en el domicilio señalado.';
    const result = tokenize(input, tokenMap);

    expect(result).toContain('QUEJOSO_1');
    expect(result.toLowerCase()).not.toContain('pérez');
  });
});

describe('assertNoLeaks (the final sweep tokenize() relies on)', () => {
  it('throws LeakDetectedError when a dictionary value is still present in the text', async () => {
    const { assertNoLeaks, LeakDetectedError } = await import('./tokenize');

    const textThatStillLeaks =
      'Compareciente: Juan Pérez, en representación propia.';

    expect(() => assertNoLeaks(textThatStillLeaks, tokenMap)).toThrow(
      LeakDetectedError,
    );
  });

  it('does not throw when no dictionary value remains', async () => {
    const { assertNoLeaks } = await import('./tokenize');

    const cleanText = 'Compareciente: QUEJOSO_1, expediente EXPEDIENTE.';
    expect(() => assertNoLeaks(cleanText, tokenMap)).not.toThrow();
  });
});
