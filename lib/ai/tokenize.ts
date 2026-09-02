import type { TokenMap } from './token-map';

export class LeakDetectedError extends Error {
  constructor(public readonly leakedTokens: string[]) {
    super(
      `Leaked dictionary value(s) detected after tokenization for: ${leakedTokens.join(', ')}`,
    );
    this.name = 'LeakDetectedError';
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Matching is normalized the same way as lib/crypto's blindIndex (trim +
// case-insensitive + NFC + whitespace collapse) so a value that was
// registered under one spacing/casing is still found under another --
// diverging normalization between the two would produce silent misses.
function buildValuePattern(value: string): RegExp {
  const normalized = value.trim().normalize('NFC');
  const escaped = escapeRegExp(normalized).replace(/\s+/g, '\\s+');
  return new RegExp(escaped, 'giu');
}

function substituteKnownValues(text: string, tokenMap: TokenMap): string {
  let result = text.normalize('NFC');

  // Replace longer values first so a shorter value that happens to be a
  // substring of a longer one (e.g. "Ana" inside "Ana López") never
  // consumes part of the longer match before it is handled.
  const byValueLengthDesc = [...tokenMap.entries].sort(
    (a, b) => b.value.length - a.value.length,
  );

  for (const entry of byValueLengthDesc) {
    if (!entry.value.trim()) continue;
    result = result.replace(buildValuePattern(entry.value), entry.token);
  }

  return result;
}

// Independent final check: scans for any dictionary value still present in
// the text, regardless of what the substitution pass above did or didn't
// catch. tokenize() always runs this before returning; it is exported
// separately so it can be exercised (and trusted) on its own.
export function assertNoLeaks(text: string, tokenMap: TokenMap): void {
  const leaked = tokenMap.entries
    .filter((entry) => entry.value.trim() && buildValuePattern(entry.value).test(text))
    .map((entry) => entry.token);

  if (leaked.length > 0) {
    throw new LeakDetectedError(leaked);
  }
}

export function tokenize(text: string, tokenMap: TokenMap): string {
  const result = substituteKnownValues(text, tokenMap);
  assertNoLeaks(result, tokenMap);
  return result;
}
