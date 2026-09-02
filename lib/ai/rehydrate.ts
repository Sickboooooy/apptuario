import { TOKEN_SHAPE_PATTERN, type TokenMap } from './token-map';

// Client-only: substitutes tokens back to their real values. Never call
// this on the server -- the whole point of tokenize()/validateDraft() is
// that real values never need to exist server-side at all.
export function rehydrate(borrador: string, tokenMap: TokenMap): string {
  const byTokenLengthDesc = [...tokenMap.entries].sort(
    (a, b) => b.token.length - a.token.length,
  );

  let result = borrador;
  for (const entry of byTokenLengthDesc) {
    result = result.split(entry.token).join(entry.value);
  }

  const residual = [...result.matchAll(TOKEN_SHAPE_PATTERN)][0]?.[0];
  if (residual) {
    throw new Error(
      `rehydrate: token residual detectado despues de la sustitucion: ${residual}`,
    );
  }

  return result;
}
