import { describe, expect, it } from 'vitest';

describe('assertRecipientCaptureAllowed', () => {
  it('rejects free-text natural_person capture when REAL_JUDICIAL_DATA is false', async () => {
    const { assertRecipientCaptureAllowed, RecipientCaptureRejected } =
      await import('./recipient-capture-policy');

    expect(() =>
      assertRecipientCaptureAllowed(
        { recipientKind: 'natural_person', name: 'Juan Pérez', addressLine: 'Av. Real 100' },
        { realJudicialData: false },
      ),
    ).toThrow(RecipientCaptureRejected);
  });

  it('accepts a synthetic-dataset selection when REAL_JUDICIAL_DATA is false', async () => {
    const { assertRecipientCaptureAllowed } = await import(
      './recipient-capture-policy'
    );
    const { SYNTHETIC_NATURAL_PERSON_RECIPIENTS } = await import(
      './synthetic-recipients'
    );

    expect(() =>
      assertRecipientCaptureAllowed(
        {
          recipientKind: 'natural_person',
          syntheticId: SYNTHETIC_NATURAL_PERSON_RECIPIENTS[0].id,
        },
        { realJudicialData: false },
      ),
    ).not.toThrow();
  });

  it('rejects an unknown syntheticId even when REAL_JUDICIAL_DATA is false', async () => {
    const { assertRecipientCaptureAllowed, RecipientCaptureRejected } =
      await import('./recipient-capture-policy');

    expect(() =>
      assertRecipientCaptureAllowed(
        { recipientKind: 'natural_person', syntheticId: 'not-a-real-id' },
        { realJudicialData: false },
      ),
    ).toThrow(RecipientCaptureRejected);
  });

  it('allows free-text natural_person capture when REAL_JUDICIAL_DATA is true', async () => {
    const { assertRecipientCaptureAllowed } = await import(
      './recipient-capture-policy'
    );

    expect(() =>
      assertRecipientCaptureAllowed(
        { recipientKind: 'natural_person', name: 'Juan Pérez', addressLine: 'Av. Real 100' },
        { realJudicialData: true },
      ),
    ).not.toThrow();
  });

  it('never restricts non-natural_person kinds regardless of the flag', async () => {
    const { assertRecipientCaptureAllowed } = await import(
      './recipient-capture-policy'
    );

    expect(() =>
      assertRecipientCaptureAllowed(
        {
          recipientKind: 'public_authority',
          name: 'Secretaría de Hacienda',
          addressLine: 'Palacio de Gobierno',
        },
        { realJudicialData: false },
      ),
    ).not.toThrow();
  });
});
