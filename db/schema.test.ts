import { randomUUID } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cases, recipients, users } from './schema';
import { createTestDb } from './test-helpers';

describe('recipients: data_classification is mandatory', () => {
  it('rejects a natural_person recipient inserted without data_classification', () => {
    const { db, sqlite } = createTestDb();
    try {
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

      expect(() =>
        db
          .insert(recipients)
          .values({
            id: randomUUID(),
            caseId,
            recipientKind: 'natural_person',
            // dataClassification deliberately omitted
            nameCiphertext: 'ct',
            nameIv: 'iv',
            nameTag: 'tag',
            nameKeyVersion: 1,
            nameBlindIndex: 'bi',
            addressLineCiphertext: 'ct',
            addressLineIv: 'iv',
            addressLineTag: 'tag',
            addressLineKeyVersion: 1,
            addressLineBlindIndex: 'bi',
          } as never)
          .run(),
      ).toThrow();
    } finally {
      sqlite.close();
    }
  });
});

describe('guard: no plaintext PII columns or references for recipients/cases', () => {
  const schemaPath = join(__dirname, 'schema.ts');

  function extractTableBlock(src: string, exportName: string): string {
    const startMarker = `export const ${exportName} = sqliteTable(`;
    const start = src.indexOf(startMarker);
    if (start === -1) throw new Error(`table '${exportName}' not found in schema.ts`);
    const nextExport = src.indexOf('\nexport const ', start + startMarker.length);
    return src.slice(start, nextExport === -1 ? src.length : nextExport);
  }

  function columnKeys(block: string): string[] {
    return [...block.matchAll(/:\s*text\(\s*'([a-z_]+)'/g)].map((m) => m[1]);
  }

  it('recipients table declares no plaintext name or address_line column', () => {
    const block = extractTableBlock(readFileSync(schemaPath, 'utf8'), 'recipients');
    const keys = columnKeys(block);
    expect(keys).not.toContain('name');
    expect(keys).not.toContain('address_line');
  });

  it('cases table declares no plaintext claimant column', () => {
    const block = extractTableBlock(readFileSync(schemaPath, 'utf8'), 'cases');
    const keys = columnKeys(block);
    expect(keys).not.toContain('claimant');
  });

  it('no file under app/ selects recipients.name, .addressLine or cases.claimant in clear', () => {
    const appDir = join(__dirname, '..', 'app');
    const offenders: string[] = [];
    const FORBIDDEN_PATTERNS = [/\.addressLine\b/, /\brecipients?\.name\b/, /\.claimant\b/];

    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        const stat = statSync(full);
        if (stat.isDirectory()) {
          walk(full);
        } else if (/\.(ts|tsx)$/.test(entry)) {
          const src = readFileSync(full, 'utf8');
          if (FORBIDDEN_PATTERNS.some((p) => p.test(src))) offenders.push(full);
        }
      }
    };
    walk(appDir);

    expect(offenders, `plaintext PII field reference found in: ${offenders.join(', ')}`).toEqual([]);
  });
});
