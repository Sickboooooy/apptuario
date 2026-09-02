import { describe, expect, it } from 'vitest';

describe('buildTokenMap', () => {
  it('assigns QUEJOSO_1/TERCERO_n/DOMICILIO_n/EXPEDIENTE deterministically', async () => {
    const { buildTokenMap } = await import('./token-map');

    const map = buildTokenMap({
      docketNumber: '123/2026',
      claimant: 'José Pérez',
      recipients: [
        { id: 'r1', name: 'Ana López', addressLine: 'Av. Reforma 100' },
        { id: 'r2', name: 'Secretaría de Hacienda', addressLine: null },
      ],
    });

    const byToken = Object.fromEntries(
      map.entries.map((e) => [e.token, e.value]),
    );
    expect(byToken.EXPEDIENTE).toBe('123/2026');
    expect(byToken.QUEJOSO_1).toBe('José Pérez');
    expect(byToken.TERCERO_1).toBe('Ana López');
    expect(byToken.DOMICILIO_1).toBe('Av. Reforma 100');
    expect(byToken.TERCERO_2).toBe('Secretaría de Hacienda');
    // r2 has no address, so no DOMICILIO_2 should exist
    expect(byToken.DOMICILIO_2).toBeUndefined();
  });

  it('keeps existing tokens stable across rebuilds even if a recipient is removed', async () => {
    const { buildTokenMap } = await import('./token-map');

    const first = buildTokenMap({
      docketNumber: '123/2026',
      claimant: 'José Pérez',
      recipients: [
        { id: 'r1', name: 'Ana López', addressLine: 'Av. Reforma 100' },
        { id: 'r2', name: 'Carlos Ruiz', addressLine: 'Calle 5 de Mayo 20' },
      ],
    });

    // r1 removed; r2 (previously TERCERO_2) is now the only recipient and
    // must keep its original token, not collapse down to TERCERO_1.
    const second = buildTokenMap(
      {
        docketNumber: '123/2026',
        claimant: 'José Pérez',
        recipients: [
          { id: 'r2', name: 'Carlos Ruiz', addressLine: 'Calle 5 de Mayo 20' },
        ],
      },
      first,
    );

    const byToken = Object.fromEntries(
      second.entries.map((e) => [e.token, e.value]),
    );
    expect(byToken.TERCERO_2).toBe('Carlos Ruiz');
    expect(byToken.TERCERO_1).toBeUndefined();
  });
});
