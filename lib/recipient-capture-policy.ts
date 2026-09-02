import type { recipientKinds } from '@/db/schema';
import { SYNTHETIC_NATURAL_PERSON_RECIPIENTS } from './synthetic-recipients';

export type RecipientKind = (typeof recipientKinds)[number];

export type RecipientCaptureInput =
  | { recipientKind: 'natural_person'; syntheticId: string }
  | { recipientKind: 'natural_person'; name: string; addressLine: string }
  | {
      recipientKind: Exclude<RecipientKind, 'natural_person'>;
      name: string;
      addressLine: string;
    };

export class RecipientCaptureRejected extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RecipientCaptureRejected';
  }
}

// Invariant 5: with REAL_JUDICIAL_DATA disabled, free-text capture of a
// natural_person recipient is never allowed -- only a selection from the
// synthetic dataset shipped in the repo. Other recipient kinds (public
// authorities, servants, legal entities) are unaffected by this flag.
export function assertRecipientCaptureAllowed(
  input: RecipientCaptureInput,
  options: { realJudicialData: boolean },
): void {
  if (input.recipientKind !== 'natural_person') return;
  if (options.realJudicialData) return;

  if (!('syntheticId' in input)) {
    throw new RecipientCaptureRejected(
      'Con REAL_JUDICIAL_DATA deshabilitado, un destinatario persona física solo puede seleccionarse del dataset sintético, no capturarse en texto libre.',
    );
  }
  if (
    !SYNTHETIC_NATURAL_PERSON_RECIPIENTS.some(
      (recipient) => recipient.id === input.syntheticId,
    )
  ) {
    throw new RecipientCaptureRejected(
      'syntheticId no reconocido en el dataset sintético.',
    );
  }
}
