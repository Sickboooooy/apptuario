import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('guard: lib/crypto never logs to console', () => {
  it('no source file under lib/crypto calls console.*', () => {
    const dir = __dirname;
    const offenders: string[] = [];

    for (const entry of readdirSync(dir)) {
      if (!entry.endsWith('.ts') || entry.endsWith('.test.ts')) continue;
      const src = readFileSync(join(dir, entry), 'utf8');
      if (/\bconsole\s*\./.test(src)) offenders.push(entry);
    }

    expect(offenders, `console.* found in: ${offenders.join(', ')}`).toEqual(
      [],
    );
  });
});
