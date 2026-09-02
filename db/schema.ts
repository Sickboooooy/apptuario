import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const recipientKinds = [
  'public_authority',
  'public_servant',
  'private_legal_entity',
  'natural_person',
] as const;

export const dataClassifications = [
  'public',
  'operational',
  'personal',
  'judicial_restricted',
  'high_risk',
] as const;

export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    username: text('username'),
    passwordHash: text('password_hash'),
    passwordSalt: text('password_salt'),
    displayName: text('display_name'),
    courtName: text('court_name'),
    courtId: text('court_id'),
    courtCircuit: integer('court_circuit'),
    courtType: text('court_type'),
    courtAddress: text('court_address'),
    courtSource: text('court_source'),
    jurisdiction: text('jurisdiction').default('Amparo'),
    termsVersion: text('terms_version'),
    termsAcceptedAt: text('terms_accepted_at'),
    privacyVersion: text('privacy_version'),
    privacyAcknowledgedAt: text('privacy_acknowledged_at'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex('idx_users_email').on(table.email),
    uniqueIndex('idx_users_username').on(table.username),
  ],
);

export const userSessions = sqliteTable(
  'user_sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: text('expires_at').notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex('idx_user_sessions_token').on(table.tokenHash),
    index('idx_user_sessions_user').on(table.userId),
  ],
);

export const cases = sqliteTable(
  'cases',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    docketNumber: text('docket_number').notNull(),
    proceedingType: text('proceeding_type')
      .notNull()
      .default('amparo_indirecto'),
    courtName: text('court_name').notNull(),
    // Encrypted party name (the "quejoso"/claimant). See lib/crypto (Fase 2)
    // for the envelope-encryption helpers that populate these columns; the
    // group stays nullable because a case may not yet have a named claimant.
    claimantCiphertext: text('claimant_ciphertext'),
    claimantIv: text('claimant_iv'),
    claimantTag: text('claimant_tag'),
    claimantKeyVersion: integer('claimant_key_version'),
    claimantBlindIndex: text('claimant_blind_index'),
    status: text('status', { enum: ['active', 'closed', 'archived'] })
      .notNull()
      .default('active'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex('idx_cases_user_docket_court').on(
      table.userId,
      table.docketNumber,
      table.courtName,
    ),
    index('idx_cases_user_status').on(table.userId, table.status),
    index('idx_cases_claimant_blind').on(table.claimantBlindIndex),
  ],
);

export const documents = sqliteTable(
  'documents',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    caseId: text('case_id').references(() => cases.id, {
      onDelete: 'set null',
    }),
    category: text('category', {
      enum: [
        'agreement',
        'judgment',
        'template',
        'evidence',
        'generated_reason',
      ],
    }).notNull(),
    originalName: text('original_name').notNull(),
    objectKey: text('object_key').notNull(),
    contentType: text('content_type').notNull(),
    byteSize: integer('byte_size').notNull(),
    reviewStatus: text('review_status', {
      enum: ['pending', 'reviewed', 'rejected'],
    })
      .notNull()
      .default('pending'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex('idx_documents_object_key').on(table.objectKey),
    index('idx_documents_user_case').on(table.userId, table.caseId),
  ],
);

export const recipients = sqliteTable(
  'recipients',
  {
    id: text('id').primaryKey(),
    caseId: text('case_id')
      .notNull()
      .references(() => cases.id, { onDelete: 'cascade' }),
    recipientKind: text('recipient_kind', { enum: recipientKinds }).notNull(),
    dataClassification: text('data_classification', {
      enum: dataClassifications,
    }).notNull(),
    // Encrypted recipient name. See lib/crypto (Fase 2) for the
    // envelope-encryption helpers that populate this column group.
    nameCiphertext: text('name_ciphertext').notNull(),
    nameIv: text('name_iv').notNull(),
    nameTag: text('name_tag').notNull(),
    nameKeyVersion: integer('name_key_version').notNull(),
    nameBlindIndex: text('name_blind_index').notNull(),
    role: text('role'),
    // Encrypted street address. Same column-group shape as name above.
    addressLineCiphertext: text('address_line_ciphertext').notNull(),
    addressLineIv: text('address_line_iv').notNull(),
    addressLineTag: text('address_line_tag').notNull(),
    addressLineKeyVersion: integer('address_line_key_version').notNull(),
    addressLineBlindIndex: text('address_line_blind_index').notNull(),
    municipality: text('municipality'),
    state: text('state').default('Ciudad de México'),
    postalCode: text('postal_code'),
    latitude: text('latitude'),
    longitude: text('longitude'),
    addressVerified: integer('address_verified', { mode: 'boolean' })
      .notNull()
      .default(false),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_recipients_case').on(table.caseId),
    index('idx_recipients_name_blind').on(table.nameBlindIndex),
    index('idx_recipients_address_blind').on(table.addressLineBlindIndex),
  ],
);

export const notifications = sqliteTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    caseId: text('case_id')
      .notNull()
      .references(() => cases.id, { onDelete: 'cascade' }),
    recipientId: text('recipient_id')
      .notNull()
      .references(() => recipients.id, { onDelete: 'cascade' }),
    kind: text('kind', {
      enum: ['personal', 'citation', 'notice', 'official_letter'],
    }).notNull(),
    status: text('status', {
      enum: [
        'draft',
        'scheduled',
        'in_progress',
        'partial',
        'completed',
        'cancelled',
      ],
    })
      .notNull()
      .default('draft'),
    scheduledAt: text('scheduled_at'),
    routePosition: integer('route_position'),
    resultCode: text('result_code'),
    fieldNotes: text('field_notes'),
    requiresFollowUp: integer('requires_follow_up', { mode: 'boolean' })
      .notNull()
      .default(false),
    followUpAt: text('follow_up_at'),
    reasonDraft: text('reason_draft'),
    reasonReviewedAt: text('reason_reviewed_at'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_notifications_user_schedule').on(
      table.userId,
      table.scheduledAt,
    ),
    index('idx_notifications_user_status').on(table.userId, table.status),
  ],
);

export const evidence = sqliteTable(
  'evidence',
  {
    id: text('id').primaryKey(),
    notificationId: text('notification_id')
      .notNull()
      .references(() => notifications.id, { onDelete: 'cascade' }),
    documentId: text('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: ['photo', 'audio', 'document'] }).notNull(),
    capturedAt: text('captured_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    note: text('note'),
  },
  (table) => [index('idx_evidence_notification').on(table.notificationId)],
);

export const templates = sqliteTable(
  'templates',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    documentId: text('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    kind: text('kind', {
      enum: ['citation', 'notice', 'personal', 'reason'],
    }).notNull(),
    isDefault: integer('is_default', { mode: 'boolean' })
      .notNull()
      .default(false),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_templates_user_kind_active').on(
      table.userId,
      table.kind,
      table.active,
    ),
  ],
);

export const calendarEntries = sqliteTable(
  'calendar_entries',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    notificationId: text('notification_id').references(() => notifications.id, {
      onDelete: 'cascade',
    }),
    title: text('title').notNull(),
    startsAt: text('starts_at').notNull(),
    endsAt: text('ends_at'),
    kind: text('kind', {
      enum: ['visit', 'follow_up', 'deadline', 'reminder'],
    }).notNull(),
    completed: integer('completed', { mode: 'boolean' })
      .notNull()
      .default(false),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_calendar_user_start').on(table.userId, table.startsAt),
  ],
);

// Wrapped per-case data-encryption keys (DEK). The DEK itself never exists
// in plaintext outside client memory; only its wrapping (by the account KEK)
// is stored here. Rows are keyed by (case_id, key_version) so a case can
// carry more than one DEK generation over its lifetime; rotateAccountKey()
// (Fase 2) re-wraps existing rows without minting a new key_version.
export const caseKeys = sqliteTable(
  'case_keys',
  {
    caseId: text('case_id')
      .notNull()
      .references(() => cases.id, { onDelete: 'cascade' }),
    wrappedDek: text('wrapped_dek').notNull(),
    keyVersion: integer('key_version').notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex('idx_case_keys_case_version').on(
      table.caseId,
      table.keyVersion,
    ),
  ],
);

// Per-case token <-> real-value map used by lib/ai (Fase 3) to keep
// literal party names/addresses out of any prompt sent to a model. The AI
// only ever sees the `token` column; `value_*` stays encrypted at rest and
// is only decrypted client-side during rehydrate().
export const tokenDictionary = sqliteTable(
  'token_dictionary',
  {
    caseId: text('case_id')
      .notNull()
      .references(() => cases.id, { onDelete: 'cascade' }),
    token: text('token').notNull(),
    valueCiphertext: text('value_ciphertext').notNull(),
    valueIv: text('value_iv').notNull(),
    valueTag: text('value_tag').notNull(),
    keyVersion: integer('key_version').notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex('idx_token_dictionary_case_token').on(
      table.caseId,
      table.token,
    ),
  ],
);

// Append-only evidentiary bitácora. Each row hash-chains to the previous
// event via prev_event_hash; the data-access layer (db/evidence-events.ts)
// exposes only an insert, and idx_evidence_events_no_update/delete below
// reject UPDATE/DELETE at the database level as a second, independent
// enforcement layer.
export const evidenceEvents = sqliteTable(
  'evidence_events',
  {
    id: text('id').primaryKey(),
    caseId: text('case_id')
      .notNull()
      .references(() => cases.id, { onDelete: 'cascade' }),
    eventType: text('event_type').notNull(),
    payloadHash: text('payload_hash').notNull(),
    prevEventHash: text('prev_event_hash'),
    actorUserId: text('actor_user_id').notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_evidence_events_case').on(table.caseId, table.createdAt),
  ],
);
