import { describe, expect, it } from 'vitest';

const tokenMap = {
  entries: [
    { token: 'EXPEDIENTE', value: '123/2026', sourceKey: 'case:docket' },
    { token: 'QUEJOSO_1', value: 'Juan Pérez', sourceKey: 'case:claimant' },
    { token: 'DOMICILIO_1', value: 'Av. Reforma 100', sourceKey: 'recipient:r1:address' },
  ],
};

const tokenizedInput =
  'En el expediente EXPEDIENTE se tiene por presentado a QUEJOSO_1, con domicilio en DOMICILIO_1.';

describe('validateDraft', () => {
  it('RED: an orphan token (not in the dictionary) is present', async () => {
    const { validateDraft } = await import('./validate');

    const borrador = 'Se notifica a QUEJOSO_9 en el domicilio señalado.';
    const result = validateDraft(borrador, tokenMap, tokenizedInput);

    expect(result.verdict).toBe('red');
    expect(result.findings.some((f) => f.type === 'orphan_token')).toBe(true);
  });

  it('RED: the real claimant name appears in clear', async () => {
    const { validateDraft } = await import('./validate');

    const borrador = 'Se notifica a Juan Pérez en el domicilio señalado.';
    const result = validateDraft(borrador, tokenMap, tokenizedInput);

    expect(result.verdict).toBe('red');
    expect(result.findings.some((f) => f.type === 'leaked_value')).toBe(true);
  });

  it('RED: an invented docket number not present in tokens or input', async () => {
    const { validateDraft } = await import('./validate');

    const borrador = 'Se acumula al expediente 999/2099 para su resolución.';
    const result = validateDraft(borrador, tokenMap, tokenizedInput);

    expect(result.verdict).toBe('red');
    expect(
      result.findings.some((f) => f.type === 'invented_expediente_or_date'),
    ).toBe(true);
  });

  it('ABSTAIN: the draft marks a missing datum -- never collapses to green', async () => {
    const { validateDraft } = await import('./validate');

    const borrador =
      'Se notifica a QUEJOSO_1 en [DATO_FALTANTE], conforme al expediente EXPEDIENTE.';
    const result = validateDraft(borrador, tokenMap, tokenizedInput);

    expect(result.verdict).toBe('abstain');
    expect(result.verdict).not.toBe('green');
  });

  it('GREEN: a clean draft using only known tokens, no invented data', async () => {
    const { validateDraft } = await import('./validate');

    const borrador =
      'Se notifica a QUEJOSO_1 en el domicilio DOMICILIO_1, dentro del expediente EXPEDIENTE.';
    const result = validateDraft(borrador, tokenMap, tokenizedInput);

    expect(result.verdict).toBe('green');
    expect(result.findings).toEqual([]);
  });
});
