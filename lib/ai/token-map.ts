// The token dictionary maps a stable source key (e.g. a recipient id) to a
// token and its real plaintext value. It is built and consumed entirely
// client-side: per invariant 3 of the data-protection architecture,
// decryption only ever happens on the client, so the caller here already
// holds the decrypted case fields in memory. This module never fetches or
// decrypts anything itself -- it is a pure function of caller-supplied
// plaintext, deliberately decoupled from db/ and lib/crypto's DB-facing
// concerns (see docs/ADR/ADR-004).
export const TOKEN_SHAPE_PATTERN =
  /\b(?:QUEJOSO|TERCERO|DOMICILIO)_\d+\b|\bEXPEDIENTE\b/g;

export type TokenMapEntry = {
  token: string;
  value: string;
  sourceKey: string;
};

export type TokenMap = {
  entries: TokenMapEntry[];
};

export type CaseRecipientSource = {
  id: string;
  name: string;
  addressLine?: string | null;
};

export type CaseTokenSource = {
  docketNumber: string;
  claimant?: string | null;
  recipients: CaseRecipientSource[];
};

function nextNumber(soFar: TokenMapEntry[], prefix: string): number {
  let max = 0;
  for (const entry of soFar) {
    if (!entry.token.startsWith(`${prefix}_`)) continue;
    const n = Number(entry.token.slice(prefix.length + 1));
    if (Number.isFinite(n) && n > max) max = n;
  }
  return max + 1;
}

export function buildTokenMap(
  source: CaseTokenSource,
  previous?: TokenMap,
): TokenMap {
  const priorTokenBySourceKey = new Map(
    (previous?.entries ?? []).map((entry) => [entry.sourceKey, entry.token]),
  );
  const entries: TokenMapEntry[] = [];

  function assign(sourceKey: string, value: string, fixedOrPrefix: string, isPrefix: boolean) {
    const priorToken = priorTokenBySourceKey.get(sourceKey);
    const token =
      priorToken ??
      (isPrefix ? `${fixedOrPrefix}_${nextNumber(entries, fixedOrPrefix)}` : fixedOrPrefix);
    entries.push({ token, value, sourceKey });
  }

  assign('case:docket', source.docketNumber, 'EXPEDIENTE', false);

  if (source.claimant) {
    assign('case:claimant', source.claimant, 'QUEJOSO', true);
  }

  for (const recipient of source.recipients) {
    assign(`recipient:${recipient.id}:name`, recipient.name, 'TERCERO', true);
    if (recipient.addressLine) {
      assign(
        `recipient:${recipient.id}:address`,
        recipient.addressLine,
        'DOMICILIO',
        true,
      );
    }
  }

  return { entries };
}
