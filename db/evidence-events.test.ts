import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { cases, users } from './schema';
import { createTestDb } from './test-helpers';

function seedCase(db: ReturnType<typeof createTestDb>['db']) {
  const userId = randomUUID();
  db.insert(users).values({ id: userId, email: 'actuario@example.com' }).run();
  const caseId = randomUUID();
  db.insert(cases)
    .values({
      id: caseId,
      userId,
      docketNumber: '123/2026',
      courtName: 'Juzgado Primero de Distrito',
    })
    .run();
  return { userId, caseId };
}

describe('evidence_events: append-only enforcement', () => {
  it('the access-layer module exposes no update or delete function', async () => {
    const mod = await import('./evidence-events');
    expect(mod).not.toHaveProperty('updateEvidenceEvent');
    expect(mod).not.toHaveProperty('deleteEvidenceEvent');
  });

  it('appendEvidenceEvent chains each row to the previous event hash', async () => {
    const { appendEvidenceEvent } = await import('./evidence-events');
    const { db, sqlite } = createTestDb();
    try {
      const { caseId, userId } = seedCase(db);
      const first = await appendEvidenceEvent(db, {
        caseId,
        eventType: 'notification_scheduled',
        payloadHash: 'hash-1',
        actorUserId: userId,
      });
      const second = await appendEvidenceEvent(db, {
        caseId,
        eventType: 'notification_completed',
        payloadHash: 'hash-2',
        actorUserId: userId,
      });
      expect(first.prevEventHash).toBeNull();
      expect(second.prevEventHash).toBe('hash-1');
    } finally {
      sqlite.close();
    }
  });

  it('rejects a raw UPDATE against evidence_events at the database level', async () => {
    const { appendEvidenceEvent } = await import('./evidence-events');
    const { db, sqlite } = createTestDb();
    try {
      const { caseId, userId } = seedCase(db);
      await appendEvidenceEvent(db, {
        caseId,
        eventType: 'notification_scheduled',
        payloadHash: 'hash-1',
        actorUserId: userId,
      });
      expect(() =>
        sqlite.prepare(`UPDATE evidence_events SET event_type = 'tampered'`).run(),
      ).toThrow();
    } finally {
      sqlite.close();
    }
  });

  it('rejects a raw DELETE against evidence_events at the database level', async () => {
    const { appendEvidenceEvent } = await import('./evidence-events');
    const { db, sqlite } = createTestDb();
    try {
      const { caseId, userId } = seedCase(db);
      await appendEvidenceEvent(db, {
        caseId,
        eventType: 'notification_scheduled',
        payloadHash: 'hash-1',
        actorUserId: userId,
      });
      expect(() => sqlite.prepare(`DELETE FROM evidence_events`).run()).toThrow();
    } finally {
      sqlite.close();
    }
  });
});
