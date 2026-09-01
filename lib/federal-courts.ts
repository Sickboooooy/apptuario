export type FederalCourt = {
  id: string;
  name: string;
  address: string;
  circuit: number;
  circuitName: string;
  type: string;
  source: 'OAJ' | 'SCJN' | 'TEPJF';
};

export const OAJ_DIRECTORY_URL =
  'https://www.oaj.gob.mx/DIrectorios/OrgJurisdiccionales.aspx';

export const FEDERAL_CIRCUITS = [
  'Ciudad de México',
  'Estado de México',
  'Jalisco',
  'Nuevo León',
  'Sonora',
  'Puebla',
  'Veracruz de Ignacio de la Llave',
  'Coahuila',
  'San Luis Potosí',
  'Tabasco',
  'Michoacán de Ocampo',
  'Sinaloa',
  'Oaxaca',
  'Yucatán',
  'Baja California',
  'Guanajuato',
  'Chihuahua',
  'Morelos',
  'Tamaulipas',
  'Chiapas',
  'Guerrero',
  'Querétaro de Arteaga',
  'Zacatecas',
  'Nayarit',
  'Durango',
  'Baja California Sur',
  'Quintana Roo',
  'Tlaxcala',
  'Hidalgo',
  'Aguascalientes',
  'Campeche',
  'Colima',
].map((name, index) => ({ id: index + 1, name }));

export const NATIONAL_JURISDICTIONAL_ORGANS: FederalCourt[] = [
  {
    id: 'scjn-pleno',
    name: 'Suprema Corte de Justicia de la Nación',
    address: 'Pino Suárez 2, Centro Histórico, Ciudad de México',
    circuit: 0,
    circuitName: 'Competencia nacional',
    type: 'Suprema Corte de Justicia de la Nación',
    source: 'SCJN',
  },
  ...[
    [
      'Sala Superior del Tribunal Electoral del Poder Judicial de la Federación',
      'Ciudad de México',
    ],
    [
      'Sala Regional Guadalajara del Tribunal Electoral del Poder Judicial de la Federación',
      'Guadalajara, Jalisco',
    ],
    [
      'Sala Regional Monterrey del Tribunal Electoral del Poder Judicial de la Federación',
      'Monterrey, Nuevo León',
    ],
    [
      'Sala Regional Xalapa del Tribunal Electoral del Poder Judicial de la Federación',
      'Xalapa, Veracruz',
    ],
    [
      'Sala Regional Ciudad de México del Tribunal Electoral del Poder Judicial de la Federación',
      'Ciudad de México',
    ],
    [
      'Sala Regional Toluca del Tribunal Electoral del Poder Judicial de la Federación',
      'Toluca, Estado de México',
    ],
    [
      'Sala Regional Especializada del Tribunal Electoral del Poder Judicial de la Federación',
      'Ciudad de México',
    ],
  ].map(([name, address], index) => ({
    id: `tepjf-${index + 1}`,
    name,
    address,
    circuit: 0,
    circuitName: 'Competencia nacional',
    type: 'Tribunal Electoral del Poder Judicial de la Federación',
    source: 'TEPJF' as const,
  })),
];

export function inferFederalCourtType(name: string) {
  const normalized = name.toLocaleUpperCase('es-MX');
  if (normalized.includes('PLENO REGIONAL')) return 'Pleno Regional';
  if (normalized.includes('TRIBUNAL COLEGIADO DE APELACIÓN'))
    return 'Tribunal Colegiado de Apelación';
  if (normalized.includes('TRIBUNAL COLEGIADO'))
    return 'Tribunal Colegiado de Circuito';
  if (normalized.includes('CENTRO DE JUSTICIA PENAL'))
    return 'Centro de Justicia Penal Federal';
  if (normalized.includes('TRIBUNAL LABORAL'))
    return 'Tribunal Laboral Federal';
  if (normalized.includes('CENTRO NACIONAL DE JUSTICIA ESPECIALIZADO'))
    return 'Centro Nacional de Justicia Especializado';
  if (normalized.includes('JUZGADO')) return 'Juzgado de Distrito';
  return 'Órgano jurisdiccional federal';
}
