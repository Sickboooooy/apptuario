import { eq, or } from 'drizzle-orm';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import {
  allowAuthAttempt,
  createSession,
  verifyPassword,
} from '@/lib/user-auth';

export async function POST(request: Request) {
  if (!allowAuthAttempt(request, 'login', 10)) {
    return Response.json(
      { error: 'Demasiados intentos de acceso. Espera unos minutos.' },
      { status: 429 },
    );
  }
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const identity =
    typeof body?.identity === 'string'
      ? body.identity.trim().toLocaleLowerCase('es-MX')
      : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!identity || !password) {
    return Response.json(
      { error: 'Escribe tu usuario o correo y contraseña.' },
      { status: 400 },
    );
  }

  const records = await getDb()
    .select()
    .from(users)
    .where(or(eq(users.email, identity), eq(users.username, identity)))
    .limit(1);
  const user = records[0];
  if (
    !user?.passwordHash ||
    !user.passwordSalt ||
    !(await verifyPassword(password, user.passwordSalt, user.passwordHash))
  ) {
    return Response.json(
      { error: 'Credenciales incorrectas.' },
      { status: 401 },
    );
  }

  const cookie = await createSession(user.id, request);
  return Response.json(
    {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        courtName: user.courtName,
      },
    },
    { headers: { 'Set-Cookie': cookie } },
  );
}
