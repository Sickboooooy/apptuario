import { eq, or } from 'drizzle-orm';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import {
  FEDERAL_CIRCUITS,
  NATIONAL_JURISDICTIONAL_ORGANS,
} from '@/lib/federal-courts';
import {
  allowAuthAttempt,
  createSession,
  hashPassword,
  validatePassword,
} from '@/lib/user-auth';
import { PRIVACY_VERSION, TERMS_VERSION } from '@/lib/legal-versions';

export async function POST(request: Request) {
  if (!allowAuthAttempt(request, 'register', 5)) {
    return Response.json(
      { error: 'Demasiados intentos de registro. Espera unos minutos.' },
      { status: 429 },
    );
  }
  const body = await safeJson(request);
  const email = normalize(body?.email).toLocaleLowerCase('es-MX');
  const username = normalize(body?.username).toLocaleLowerCase('es-MX');
  const password = typeof body?.password === 'string' ? body.password : '';
  const displayName = normalize(body?.displayName);
  const courtId = normalize(body?.courtId);
  const courtName = normalize(body?.courtName);
  const courtAddress = normalize(body?.courtAddress);
  const courtType = normalize(body?.courtType);
  const courtSource = normalize(body?.courtSource);
  const courtCircuit = Number(body?.courtCircuit);
  const acceptedLegal = body?.acceptedLegal === true;
  const termsVersion = normalize(body?.termsVersion);
  const privacyVersion = normalize(body?.privacyVersion);

  const error = validateRegistration({
    email,
    username,
    password,
    displayName,
    courtId,
    courtName,
    courtType,
    courtSource,
    courtCircuit,
    acceptedLegal,
    termsVersion,
    privacyVersion,
  });
  if (error) return Response.json({ error }, { status: 400 });

  const db = getDb();
  const duplicate = await db
    .select({ email: users.email, username: users.username })
    .from(users)
    .where(or(eq(users.email, email), eq(users.username, username)))
    .limit(1);
  if (duplicate.length) {
    return Response.json(
      { error: 'El correo o nombre de usuario ya está registrado.' },
      { status: 409 },
    );
  }

  const { hash, salt } = await hashPassword(password);
  const id = crypto.randomUUID();
  const acceptedAt = new Date().toISOString();
  await db.insert(users).values({
    id,
    email,
    username,
    passwordHash: hash,
    passwordSalt: salt,
    displayName,
    courtId,
    courtName,
    courtAddress,
    courtCircuit,
    courtType,
    courtSource,
    jurisdiction: 'Amparo',
    termsVersion,
    termsAcceptedAt: acceptedAt,
    privacyVersion,
    privacyAcknowledgedAt: acceptedAt,
  });

  const cookie = await createSession(id, request);
  return Response.json(
    {
      user: {
        id,
        email,
        username,
        displayName,
        courtName,
        courtType,
        courtCircuit,
      },
    },
    { status: 201, headers: { 'Set-Cookie': cookie } },
  );
}

function validateRegistration(input: {
  email: string;
  username: string;
  password: string;
  displayName: string;
  courtId: string;
  courtName: string;
  courtType: string;
  courtSource: string;
  courtCircuit: number;
  acceptedLegal: boolean;
  termsVersion: string;
  privacyVersion: string;
}) {
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) ||
    input.email.length > 160
  )
    return 'Escribe un correo electrónico válido.';
  if (!/^[a-z0-9._-]{4,30}$/.test(input.username))
    return 'El usuario debe tener de 4 a 30 caracteres: letras, números, punto, guion o guion bajo.';
  if (!validatePassword(input.password))
    return 'La contraseña debe tener al menos 12 caracteres, una mayúscula, una minúscula y un número.';
  if (input.displayName.length < 3 || input.displayName.length > 100)
    return 'Escribe tu nombre completo.';
  if (
    input.courtName.length < 8 ||
    input.courtName.length > 350 ||
    !input.courtId
  )
    return 'Selecciona un órgano jurisdiccional del directorio.';
  if (!['OAJ', 'SCJN', 'TEPJF'].includes(input.courtSource))
    return 'La fuente del órgano jurisdiccional no es válida.';
  if (
    !Number.isInteger(input.courtCircuit) ||
    input.courtCircuit < 0 ||
    input.courtCircuit > 32
  )
    return 'El circuito judicial no es válido.';
  if (input.courtCircuit > 0 && !FEDERAL_CIRCUITS[input.courtCircuit - 1])
    return 'El circuito judicial no existe.';
  if (
    input.courtCircuit === 0 &&
    !NATIONAL_JURISDICTIONAL_ORGANS.some((court) => court.id === input.courtId)
  )
    return 'Selecciona un órgano nacional válido.';
  if (
    input.courtCircuit > 0 &&
    !input.courtId.startsWith(`oaj-${input.courtCircuit}-`)
  )
    return 'El órgano no corresponde al circuito seleccionado.';
  if (input.courtType.length < 3 || input.courtType.length > 120)
    return 'El tipo de órgano no es válido.';
  if (
    !input.acceptedLegal ||
    input.termsVersion !== TERMS_VERSION ||
    input.privacyVersion !== PRIVACY_VERSION
  )
    return 'Debes leer y aceptar los Términos y confirmar el Aviso de Privacidad vigente.';
  return null;
}

function normalize(value: unknown) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

async function safeJson(
  request: Request,
): Promise<Record<string, unknown> | null> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}
