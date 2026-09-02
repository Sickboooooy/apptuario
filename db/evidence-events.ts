import { randomUUID } from 'node:crypto';
import { desc, eq, sql } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import { evidenceEvents } from './schema';
import type * as schema from './schema';

// Append-only access to evidence_events: this module intentionally exports
// no update or delete function. A raw UPDATE/DELETE against the table is
// also rejected at the database level by the triggers created alongside it
// in drizzle/0003_dp_f1_add_protected_fields.sql (defense in depth).
export type EvidenceEventsDb = BaseSQLiteDatabase<
  'sync' | 'async',
  unknown,
  typeof schema
>;

export type NewEvidenceEvent = {
  caseId: string;
  eventType: string;
  payloadHash: string;
  actorUserId: string;
};

export async function appendEvidenceEvent(
  db: EvidenceEventsDb,
  event: NewEvidenceEvent,
) {
  const [lastForCase] = await db
    .select({ payloadHash: evidenceEvents.payloadHash })
    .from(evidenceEvents)
    .where(eq(evidenceEvents.caseId, event.caseId))
    .orderBy(desc(sql`rowid`))
    .limit(1);

  const [row] = await db
    .insert(evidenceEvents)
    .values({
      id: randomUUID(),
      caseId: event.caseId,
      eventType: event.eventType,
      payloadHash: event.payloadHash,
      prevEventHash: lastForCase?.payloadHash ?? null,
      actorUserId: event.actorUserId,
    })
    .returning();

  return row;
}
