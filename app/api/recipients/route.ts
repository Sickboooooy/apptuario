import { env } from 'cloudflare:workers';
import {
  assertRecipientCaptureAllowed,
  RecipientCaptureRejected,
  type RecipientCaptureInput,
} from '@/lib/recipient-capture-policy';

// Minimal endpoint exercising the REAL_JUDICIAL_DATA capture gate
// (Fase 4, invariant 5). It intentionally does not persist to `recipients`
// yet -- wiring this to db/schema.ts + lib/crypto's envelope encryption
// (case DEK, blind indexes) is a separate, larger integration left for
// when the actual capture UI exists. See docs/ADR/ADR-005.
export async function POST(request: Request) {
  const body = await safeJson(request);
  if (!body || typeof body.recipientKind !== 'string') {
    return Response.json(
      { error: 'recipientKind es requerido.' },
      { status: 400 },
    );
  }

  try {
    assertRecipientCaptureAllowed(body as RecipientCaptureInput, {
      realJudicialData: env.REAL_JUDICIAL_DATA === 'true',
    });
  } catch (error) {
    if (error instanceof RecipientCaptureRejected) {
      return Response.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }

  return Response.json({ accepted: true }, { status: 202 });
}

async function safeJson(
  request: Request,
): Promise<Record<string, unknown> | null> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}
