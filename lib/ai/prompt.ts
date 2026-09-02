export function buildPrompt(
  constanciaTipo: string,
  resultadoCampo: string,
  textoTokenizado: string,
): string {
  return [
    `Vas a redactar el campo "${resultadoCampo}" de una constancia de tipo "${constanciaTipo}".`,
    '',
    'Reglas obligatorias, sin excepcion:',
    '1. Conserva cada token (por ejemplo QUEJOSO_1, TERCERO_1, DOMICILIO_1, EXPEDIENTE) exactamente como aparece en el texto de entrada. No los traduzcas, no los parafrasees, no inventes tokens nuevos.',
    '2. No introduzcas ningun nombre propio, domicilio, fecha concreta o numero de expediente que no venga literalmente en el texto de entrada. Si necesitas un dato que no esta ahi, no lo inventes.',
    '3. Si falta un dato necesario para completar la redaccion, escribe exactamente [DATO_FALTANTE] en su lugar en vez de adivinarlo o dejarlo en blanco.',
    '',
    'Texto de entrada (ya tokenizado; no contiene datos personales reales):',
    textoTokenizado,
  ].join('\n');
}
