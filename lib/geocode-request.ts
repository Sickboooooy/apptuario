import type { recipientKinds } from '@/db/schema';

// Closed request shape for /api/geocode: it structurally cannot admit a
// name, address, or docket-number field, so a caller cannot accidentally
// (or intentionally) send party PII to this endpoint -- the guarantee is
// enforced by the type checker, not by convention. See docs/ADR/ADR-005.
export type GeocodeRequestBody = {
  query: string;
  recipientKind?: (typeof recipientKinds)[number];
};

export function requestGeocode(body: GeocodeRequestBody): Promise<Response> {
  return fetch('/api/geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
