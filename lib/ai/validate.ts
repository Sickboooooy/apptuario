import { TOKEN_SHAPE_PATTERN, type TokenMap } from './token-map';

const DOCKET_PATTERN = /\b\d+\/\d{4}\b/g;
const DATE_PATTERNS = [
  /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
  /\b\d{4}-\d{2}-\d{2}\b/g,
  /\b\d{1,2}\s+de\s+[a-zñáéíóú]+\s+de\s+\d{4}\b/giu,
];
const MISSING_DATA_MARKER = '[DATO_FALTANTE]';

export type ValidationVerdict = 'green' | 'red' | 'abstain';

export type ValidationFinding = {
  type:
    | 'orphan_token'
    | 'leaked_value'
    | 'invented_expediente_or_date'
    | 'missing_data';
  message: string;
  detail?: string;
};

export type ValidationResult = {
  verdict: ValidationVerdict;
  findings: ValidationFinding[];
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildValuePattern(value: string): RegExp {
  const normalized = value.trim().normalize('NFC');
  const escaped = escapeRegExp(normalized).replace(/\s+/g, '\\s+');
  return new RegExp(escaped, 'giu');
}

export function validateDraft(
  borrador: string,
  tokenMap: TokenMap,
  tokenizedInput: string,
): ValidationResult {
  const findings: ValidationFinding[] = [];
  const knownTokens = new Set(tokenMap.entries.map((entry) => entry.token));

  for (const match of borrador.matchAll(TOKEN_SHAPE_PATTERN)) {
    const token = match[0];
    if (!knownTokens.has(token)) {
      findings.push({
        type: 'orphan_token',
        message: `Token no reconocido en el diccionario: ${token}`,
        detail: token,
      });
    }
  }

  for (const entry of tokenMap.entries) {
    if (!entry.value.trim()) continue;
    if (buildValuePattern(entry.value).test(borrador)) {
      findings.push({
        type: 'leaked_value',
        message: `El valor real del token ${entry.token} aparece en claro en el borrador`,
        detail: entry.token,
      });
    }
  }

  const numericMatches = [
    ...borrador.matchAll(DOCKET_PATTERN),
    ...DATE_PATTERNS.flatMap((pattern) => [...borrador.matchAll(pattern)]),
  ].map((match) => match[0]);

  for (const value of new Set(numericMatches)) {
    if (!tokenizedInput.includes(value)) {
      findings.push({
        type: 'invented_expediente_or_date',
        message: `Numero de expediente o fecha no presente en el input: ${value}`,
        detail: value,
      });
    }
  }

  if (findings.length > 0) {
    return { verdict: 'red', findings };
  }

  if (borrador.includes(MISSING_DATA_MARKER)) {
    return {
      verdict: 'abstain',
      findings: [
        {
          type: 'missing_data',
          message:
            'El borrador contiene [DATO_FALTANTE]; requiere completarse antes de continuar.',
        },
      ],
    };
  }

  return { verdict: 'green', findings: [] };
}
