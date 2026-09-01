import { deleteSession, getSessionUser } from '@/lib/user-auth';

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ user: null }, { status: 401 });
  return Response.json({ user });
}

export async function DELETE(request: Request) {
  const cookie = await deleteSession(request);
  return Response.json({ ok: true }, { headers: { 'Set-Cookie': cookie } });
}
