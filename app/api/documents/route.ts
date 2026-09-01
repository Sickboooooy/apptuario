import { env } from 'cloudflare:workers';
import { desc, eq } from 'drizzle-orm';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { getDb } from '@/db';
import { documents, evidence, users } from '@/db/schema';
import { getSessionUser } from '@/lib/user-auth';

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
  'audio/mpeg',
  'audio/mp4',
  'audio/webm',
  'audio/wav',
  'audio/x-wav',
]);
const CATEGORIES = new Set([
  'agreement',
  'judgment',
  'template',
  'evidence',
  'generated_reason',
]);

export async function GET(request: Request) {
  const user = await getAppUser(request);
  if (!user)
    return Response.json(
      { error: 'Autenticación requerida.' },
      { status: 401 },
    );

  const records = await getDb()
    .select({
      id: documents.id,
      caseId: documents.caseId,
      category: documents.category,
      originalName: documents.originalName,
      contentType: documents.contentType,
      byteSize: documents.byteSize,
      reviewStatus: documents.reviewStatus,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(eq(documents.userId, user.userId))
    .orderBy(desc(documents.createdAt))
    .limit(100);

  return Response.json({ documents: records });
}

export async function POST(request: Request) {
  const user = await getAppUser(request);
  if (!user)
    return Response.json(
      { error: 'Autenticación requerida.' },
      { status: 401 },
    );

  const form = await request.formData();
  const file = form.get('file');
  const categoryValue = form.get('category');
  const category =
    typeof categoryValue === 'string' ? categoryValue : 'agreement';
  const caseId = optionalString(form.get('caseId'));
  const notificationId = optionalString(form.get('notificationId'));
  const evidenceKind = optionalString(form.get('evidenceKind'));

  if (!(file instanceof File))
    return Response.json({ error: 'Selecciona un archivo.' }, { status: 400 });
  if (!CATEGORIES.has(category))
    return Response.json({ error: 'Categoría no válida.' }, { status: 400 });
  if (!ALLOWED_TYPES.has(file.type))
    return Response.json({ error: 'Formato no permitido.' }, { status: 415 });
  if (file.size <= 0 || file.size > MAX_FILE_SIZE)
    return Response.json(
      { error: 'El archivo debe pesar entre 1 byte y 25 MB.' },
      { status: 413 },
    );
  if (
    category === 'evidence' &&
    (!notificationId ||
      !['photo', 'audio', 'document'].includes(evidenceKind ?? ''))
  ) {
    return Response.json(
      { error: 'La evidencia requiere diligencia y tipo válidos.' },
      { status: 400 },
    );
  }

  const db = getDb();
  await db
    .insert(users)
    .values({
      id: user.userId,
      email: user.email,
      displayName: user.displayName,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: user.email,
        displayName: user.displayName,
        updatedAt: new Date().toISOString(),
      },
    });

  const id = crypto.randomUUID();
  const ownerKey = await ownerHash(user.userId);
  const extension = safeExtension(file.name);
  const objectKey = `users/${ownerKey}/${category}/${id}${extension}`;

  await env.FILES.put(objectKey, file.stream(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { owner: ownerKey, category, documentId: id },
  });

  try {
    await db.insert(documents).values({
      id,
      userId: user.userId,
      caseId,
      category: category as typeof documents.$inferInsert.category,
      originalName: file.name.slice(0, 240),
      objectKey,
      contentType: file.type,
      byteSize: file.size,
    });

    if (category === 'evidence' && notificationId && evidenceKind) {
      await db.insert(evidence).values({
        id: crypto.randomUUID(),
        notificationId,
        documentId: id,
        kind: evidenceKind as typeof evidence.$inferInsert.kind,
      });
    }
  } catch (error) {
    await env.FILES.delete(objectKey);
    throw error;
  }

  return Response.json(
    {
      document: {
        id,
        caseId,
        category,
        originalName: file.name,
        contentType: file.type,
        byteSize: file.size,
        reviewStatus: 'pending',
      },
    },
    { status: 201 },
  );
}

function optionalString(value: FormDataEntryValue | null) {
  const result = typeof value === 'string' ? value.trim() : '';
  return result || null;
}

function safeExtension(filename: string) {
  const match = filename
    .toLowerCase()
    .match(/\.(pdf|doc|docx|jpg|jpeg|png|webp|mp3|mp4|webm|wav)$/);
  return match ? `.${match[1]}` : '';
}

async function ownerHash(value: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest))
    .slice(0, 12)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function getAppUser(request: Request) {
  const localUser = await getSessionUser(request);
  if (localUser) {
    return {
      userId: localUser.id,
      email: localUser.email,
      displayName: localUser.displayName ?? localUser.username,
    };
  }
  return getChatGPTUser();
}
