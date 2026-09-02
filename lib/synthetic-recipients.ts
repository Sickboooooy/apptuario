// Fictitious natural-person recipients used while REAL_JUDICIAL_DATA is
// disabled (invariant 5). None of these correspond to a real person; the
// names and addresses are deliberately generic placeholders.
export type SyntheticRecipient = {
  id: string;
  name: string;
  addressLine: string;
  municipality: string;
};

export const SYNTHETIC_NATURAL_PERSON_RECIPIENTS: SyntheticRecipient[] = [
  {
    id: 'synthetic-1',
    name: 'Juan Ejemplo Pérez',
    addressLine: 'Av. Ficticia 123, Col. Simulada',
    municipality: 'Guadalajara',
  },
  {
    id: 'synthetic-2',
    name: 'María Prueba González',
    addressLine: 'Calle Demo 456, Col. Prototipo',
    municipality: 'Zapopan',
  },
  {
    id: 'synthetic-3',
    name: 'Carlos Muestra López',
    addressLine: 'Blvd. Sintético 789, Col. Datos Falsos',
    municipality: 'Tlaquepaque',
  },
];
