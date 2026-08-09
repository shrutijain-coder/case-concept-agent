import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";

import type {
  AnalyticsEvent,
  ConceptualisationVersion,
  CriticalThinkingSession,
  Exercise,
  NewUser,
  PeerComment,
  PeerGroup,
  PeerSubmission,
  PracticeCounts,
  QuestionCategory,
  QuestionInteraction,
  Repository,
  User,
  UserAction,
  UserWithSecret,
} from "./types";

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id             TEXT PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  display_name   TEXT NOT NULL,
  professional_role TEXT,
  experience_level  TEXT,
  role           TEXT NOT NULL DEFAULT 'learner',
  safety_ack_at  TEXT,
  created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exercises (
  id                 TEXT PRIMARY KEY,
  user_id            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id            TEXT NOT NULL,
  case_version       INTEGER NOT NULL,
  modality_id        TEXT,
  template_version   INTEGER,
  stage              TEXT NOT NULL,
  status             TEXT NOT NULL,
  scenarios_viewed   TEXT NOT NULL DEFAULT '[]',
  draft              TEXT NOT NULL DEFAULT '{}',
  current_version_id TEXT,
  self_review        TEXT NOT NULL DEFAULT '{}',
  reflection         TEXT NOT NULL DEFAULT '{}',
  sharing            TEXT NOT NULL DEFAULT 'undecided',
  created_at         TEXT NOT NULL,
  updated_at         TEXT NOT NULL,
  submitted_at       TEXT,
  completed_at       TEXT
);
CREATE INDEX IF NOT EXISTS idx_exercises_user ON exercises(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS conceptualisation_versions (
  id                TEXT PRIMARY KEY,
  exercise_id       TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  version_number    INTEGER NOT NULL,
  section_responses TEXT NOT NULL,
  change_reason     TEXT,
  created_at        TEXT NOT NULL,
  UNIQUE (exercise_id, version_number)
);

CREATE TABLE IF NOT EXISTS ct_sessions (
  id           TEXT PRIMARY KEY,
  exercise_id  TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  started_at   TEXT NOT NULL,
  completed_at TEXT,
  status       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ct_sessions_exercise ON ct_sessions(exercise_id);

CREATE TABLE IF NOT EXISTS question_interactions (
  id                           TEXT PRIMARY KEY,
  session_id                   TEXT NOT NULL REFERENCES ct_sessions(id) ON DELETE CASCADE,
  sequence                     INTEGER NOT NULL,
  question                     TEXT NOT NULL,
  category                     TEXT NOT NULL,
  source                       TEXT NOT NULL,
  target_section               TEXT,
  user_response                TEXT,
  conceptualisation_version_id TEXT,
  user_action                  TEXT,
  created_at                   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_interactions_session ON question_interactions(session_id, sequence);

CREATE TABLE IF NOT EXISTS peer_groups (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  created_at TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS peer_group_members (
  group_id  TEXT NOT NULL REFERENCES peer_groups(id) ON DELETE CASCADE,
  user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'member',
  joined_at TEXT NOT NULL,
  PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS peer_submissions (
  id             TEXT PRIMARY KEY,
  exercise_id    TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id       TEXT NOT NULL REFERENCES peer_groups(id) ON DELETE CASCADE,
  case_id        TEXT NOT NULL,
  modality_id    TEXT NOT NULL,
  shared_content TEXT NOT NULL,
  created_at     TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'open'
);
CREATE INDEX IF NOT EXISTS idx_submissions_group ON peer_submissions(group_id, created_at DESC);

CREATE TABLE IF NOT EXISTS peer_comments (
  id            TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES peer_submissions(id) ON DELETE CASCADE,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body          TEXT NOT NULL,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'visible'
);
CREATE INDEX IF NOT EXISTS idx_comments_submission ON peer_comments(submission_id, created_at);

CREATE TABLE IF NOT EXISTS comment_reports (
  id         TEXT PRIMARY KEY,
  comment_id TEXT NOT NULL REFERENCES peer_comments(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason     TEXT NOT NULL,
  detail     TEXT,
  created_at TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'open'
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id         TEXT PRIMARY KEY,
  user_id    TEXT,
  name       TEXT NOT NULL,
  props      TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_name ON analytics_events(name, created_at);
`;

type Row = Record<string, unknown>;

function now(): string {
  return new Date().toISOString();
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || !value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function str(value: unknown): string {
  return typeof value === "string" ? value : String(value ?? "");
}

function nullableStr(value: unknown): string | null {
  return value == null ? null : String(value);
}

/**
 * Dev hot-reload keeps re-evaluating modules; without a global the process
 * accumulates open database handles.
 */
const globalForDb = globalThis as unknown as { __ccDb?: DatabaseSync };

function openDatabase(): DatabaseSync {
  if (globalForDb.__ccDb) return globalForDb.__ccDb;
  // The database path is env-configurable, so the bundler can't tell which
  // subtree it touches and conservatively traces the whole project into the
  // server output. The path is a runtime concern only — nothing here needs
  // tracing — hence the opt-out.
  const configured = process.env.SQLITE_PATH || "./.data/app.db";
  const path = isAbsolute(configured)
    ? configured
    : join(/*turbopackIgnore: true*/ process.cwd(), configured);
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(SCHEMA);
  runMigrations(db);
  globalForDb.__ccDb = db;
  return db;
}

/**
 * Column additions to tables that already existed before that column was
 * introduced. `CREATE TABLE IF NOT EXISTS` only helps on a brand-new
 * database — an existing local .data/app.db from before this column was
 * added would otherwise 500 on first read. Each statement is independent and
 * safe to run every startup: a "duplicate column" failure just means it was
 * already applied.
 */
function runMigrations(db: DatabaseSync): void {
  const statements = [
    "ALTER TABLE question_interactions ADD COLUMN target_section TEXT",
  ];
  for (const statement of statements) {
    try {
      db.exec(statement);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.toLowerCase().includes("duplicate column")) throw error;
    }
  }
}

function toUser(row: Row): User {
  return {
    id: str(row.id),
    email: str(row.email),
    displayName: str(row.display_name),
    professionalRole: nullableStr(row.professional_role),
    experienceLevel: nullableStr(row.experience_level),
    role: str(row.role) as User["role"],
    safetyAckAt: nullableStr(row.safety_ack_at),
    createdAt: str(row.created_at),
  };
}

function toExercise(row: Row): Exercise {
  return {
    id: str(row.id),
    userId: str(row.user_id),
    caseId: str(row.case_id),
    caseVersion: Number(row.case_version),
    modalityId: (nullableStr(row.modality_id) as Exercise["modalityId"]) ?? null,
    templateVersion: row.template_version == null ? null : Number(row.template_version),
    stage: str(row.stage) as Exercise["stage"],
    status: str(row.status) as Exercise["status"],
    scenariosViewed: parseJson<string[]>(row.scenarios_viewed, []),
    draft: parseJson<Record<string, string>>(row.draft, {}),
    currentVersionId: nullableStr(row.current_version_id),
    selfReview: parseJson<Record<string, string>>(row.self_review, {}),
    reflection: parseJson<Record<string, string>>(row.reflection, {}),
    sharing: str(row.sharing) as Exercise["sharing"],
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
    submittedAt: nullableStr(row.submitted_at),
    completedAt: nullableStr(row.completed_at),
  };
}

function toVersion(row: Row): ConceptualisationVersion {
  return {
    id: str(row.id),
    exerciseId: str(row.exercise_id),
    versionNumber: Number(row.version_number),
    sectionResponses: parseJson<Record<string, string>>(row.section_responses, {}),
    changeReason: nullableStr(row.change_reason),
    createdAt: str(row.created_at),
  };
}

function toCtSession(row: Row): CriticalThinkingSession {
  return {
    id: str(row.id),
    exerciseId: str(row.exercise_id),
    startedAt: str(row.started_at),
    completedAt: nullableStr(row.completed_at),
    status: str(row.status) as CriticalThinkingSession["status"],
  };
}

function toInteraction(row: Row): QuestionInteraction {
  return {
    id: str(row.id),
    sessionId: str(row.session_id),
    sequence: Number(row.sequence),
    question: str(row.question),
    category: str(row.category) as QuestionCategory,
    source: str(row.source) as QuestionInteraction["source"],
    targetSection: nullableStr(row.target_section),
    userResponse: nullableStr(row.user_response),
    conceptualisationVersionId: nullableStr(row.conceptualisation_version_id),
    userAction: (nullableStr(row.user_action) as UserAction | null) ?? null,
    createdAt: str(row.created_at),
  };
}

export class SqliteRepository implements Repository {
  private get db(): DatabaseSync {
    return openDatabase();
  }

  async init(): Promise<void> {
    openDatabase();
  }

  // --- users ---------------------------------------------------------------

  async createUser(input: NewUser): Promise<User> {
    const id = randomUUID();
    const createdAt = now();
    this.db
      .prepare(
        `INSERT INTO users (id, email, password_hash, display_name, professional_role,
                            experience_level, role, safety_ack_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'learner', NULL, ?)`,
      )
      .run(
        id,
        input.email.toLowerCase(),
        input.passwordHash,
        input.displayName,
        input.professionalRole ?? null,
        input.experienceLevel ?? null,
        createdAt,
      );
    const user = await this.findUserById(id);
    if (!user) throw new Error("User insert failed");
    return user;
  }

  async findUserByEmail(email: string): Promise<UserWithSecret | null> {
    const row = this.db
      .prepare(`SELECT * FROM users WHERE email = ?`)
      .get(email.toLowerCase()) as Row | undefined;
    if (!row) return null;
    return { ...toUser(row), passwordHash: str(row.password_hash) };
  }

  async findUserById(id: string): Promise<User | null> {
    const row = this.db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as
      | Row
      | undefined;
    return row ? toUser(row) : null;
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    this.db
      .prepare(`UPDATE users SET password_hash = ? WHERE id = ?`)
      .run(passwordHash, userId);
  }

  async acknowledgeSafetyNotice(userId: string): Promise<void> {
    this.db
      .prepare(`UPDATE users SET safety_ack_at = ? WHERE id = ? AND safety_ack_at IS NULL`)
      .run(now(), userId);
  }

  // --- password reset ------------------------------------------------------

  async createPasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: string,
  ): Promise<void> {
    // One live token per user keeps the surface small.
    this.db.prepare(`DELETE FROM password_reset_tokens WHERE user_id = ?`).run(userId);
    this.db
      .prepare(
        `INSERT INTO password_reset_tokens (token_hash, user_id, expires_at, created_at)
         VALUES (?, ?, ?, ?)`,
      )
      .run(tokenHash, userId, expiresAt, now());
  }

  async consumePasswordResetToken(tokenHash: string): Promise<string | null> {
    const row = this.db
      .prepare(`SELECT * FROM password_reset_tokens WHERE token_hash = ?`)
      .get(tokenHash) as Row | undefined;
    if (!row) return null;
    this.db.prepare(`DELETE FROM password_reset_tokens WHERE token_hash = ?`).run(tokenHash);
    if (new Date(str(row.expires_at)).getTime() < Date.now()) return null;
    return str(row.user_id);
  }

  // --- exercises -----------------------------------------------------------

  async createExercise(input: {
    userId: string;
    caseId: string;
    caseVersion: number;
  }): Promise<Exercise> {
    const id = randomUUID();
    const ts = now();
    this.db
      .prepare(
        `INSERT INTO exercises (id, user_id, case_id, case_version, stage, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'vignette', 'in_progress', ?, ?)`,
      )
      .run(id, input.userId, input.caseId, input.caseVersion, ts, ts);
    const exercise = await this.getExercise(id);
    if (!exercise) throw new Error("Exercise insert failed");
    return exercise;
  }

  async getExercise(id: string): Promise<Exercise | null> {
    const row = this.db.prepare(`SELECT * FROM exercises WHERE id = ?`).get(id) as
      | Row
      | undefined;
    return row ? toExercise(row) : null;
  }

  async listExercises(userId: string): Promise<Exercise[]> {
    const rows = this.db
      .prepare(`SELECT * FROM exercises WHERE user_id = ? ORDER BY updated_at DESC`)
      .all(userId) as Row[];
    return rows.map(toExercise);
  }

  async findOpenExerciseForCase(
    userId: string,
    caseId: string,
  ): Promise<Exercise | null> {
    const row = this.db
      .prepare(
        `SELECT * FROM exercises
         WHERE user_id = ? AND case_id = ? AND status = 'in_progress'
         ORDER BY updated_at DESC LIMIT 1`,
      )
      .get(userId, caseId) as Row | undefined;
    return row ? toExercise(row) : null;
  }

  async updateExercise(
    id: string,
    patch: Parameters<Repository["updateExercise"]>[1],
  ): Promise<Exercise> {
    const columns: Record<string, string> = {
      modalityId: "modality_id",
      templateVersion: "template_version",
      stage: "stage",
      status: "status",
      scenariosViewed: "scenarios_viewed",
      draft: "draft",
      currentVersionId: "current_version_id",
      selfReview: "self_review",
      reflection: "reflection",
      sharing: "sharing",
      submittedAt: "submitted_at",
      completedAt: "completed_at",
    };
    const jsonKeys = new Set(["scenariosViewed", "draft", "selfReview", "reflection"]);

    const sets: string[] = [];
    const values: (string | number | null)[] = [];
    for (const [key, column] of Object.entries(columns)) {
      if (!(key in patch)) continue;
      const raw = (patch as Record<string, unknown>)[key];
      sets.push(`${column} = ?`);
      if (jsonKeys.has(key)) values.push(JSON.stringify(raw ?? (key === "scenariosViewed" ? [] : {})));
      else if (raw == null) values.push(null);
      else if (typeof raw === "number") values.push(raw);
      else values.push(String(raw));
    }
    sets.push("updated_at = ?");
    values.push(now());
    values.push(id);

    this.db.prepare(`UPDATE exercises SET ${sets.join(", ")} WHERE id = ?`).run(...values);
    const exercise = await this.getExercise(id);
    if (!exercise) throw new Error(`Exercise ${id} not found`);
    return exercise;
  }

  async countPractice(userId: string): Promise<PracticeCounts> {
    const row = this.db
      .prepare(
        `SELECT
           SUM(CASE WHEN status = 'complete' THEN 1 ELSE 0 END)     AS completed,
           SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END)  AS in_progress,
           SUM(CASE WHEN sharing = 'group' THEN 1 ELSE 0 END)       AS shared
         FROM exercises WHERE user_id = ?`,
      )
      .get(userId) as Row | undefined;
    return {
      completed: Number(row?.completed ?? 0),
      inProgress: Number(row?.in_progress ?? 0),
      shared: Number(row?.shared ?? 0),
    };
  }

  // --- versions ------------------------------------------------------------

  async createVersion(input: {
    exerciseId: string;
    sectionResponses: Record<string, string>;
    changeReason: string | null;
  }): Promise<ConceptualisationVersion> {
    const row = this.db
      .prepare(
        `SELECT COALESCE(MAX(version_number), 0) AS n FROM conceptualisation_versions WHERE exercise_id = ?`,
      )
      .get(input.exerciseId) as Row | undefined;
    const versionNumber = Number(row?.n ?? 0) + 1;
    const id = randomUUID();
    this.db
      .prepare(
        `INSERT INTO conceptualisation_versions
           (id, exercise_id, version_number, section_responses, change_reason, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        input.exerciseId,
        versionNumber,
        JSON.stringify(input.sectionResponses),
        input.changeReason,
        now(),
      );
    const created = await this.getVersion(id);
    if (!created) throw new Error("Version insert failed");
    return created;
  }

  async listVersions(exerciseId: string): Promise<ConceptualisationVersion[]> {
    const rows = this.db
      .prepare(
        `SELECT * FROM conceptualisation_versions WHERE exercise_id = ? ORDER BY version_number`,
      )
      .all(exerciseId) as Row[];
    return rows.map(toVersion);
  }

  async getVersion(id: string): Promise<ConceptualisationVersion | null> {
    const row = this.db
      .prepare(`SELECT * FROM conceptualisation_versions WHERE id = ?`)
      .get(id) as Row | undefined;
    return row ? toVersion(row) : null;
  }

  // --- critical thinking ---------------------------------------------------

  async createCtSession(exerciseId: string): Promise<CriticalThinkingSession> {
    const id = randomUUID();
    this.db
      .prepare(
        `INSERT INTO ct_sessions (id, exercise_id, started_at, completed_at, status)
         VALUES (?, ?, ?, NULL, 'active')`,
      )
      .run(id, exerciseId, now());
    const row = this.db.prepare(`SELECT * FROM ct_sessions WHERE id = ?`).get(id) as Row;
    return toCtSession(row);
  }

  async getActiveCtSession(exerciseId: string): Promise<CriticalThinkingSession | null> {
    const row = this.db
      .prepare(
        `SELECT * FROM ct_sessions WHERE exercise_id = ? AND status = 'active'
         ORDER BY started_at DESC LIMIT 1`,
      )
      .get(exerciseId) as Row | undefined;
    return row ? toCtSession(row) : null;
  }

  async completeCtSession(sessionId: string): Promise<void> {
    this.db
      .prepare(`UPDATE ct_sessions SET status = 'complete', completed_at = ? WHERE id = ?`)
      .run(now(), sessionId);
  }

  async createInteraction(input: {
    sessionId: string;
    question: string;
    category: QuestionCategory;
    source: "ai" | "fallback";
    targetSection: string | null;
    conceptualisationVersionId: string | null;
  }): Promise<QuestionInteraction> {
    const row = this.db
      .prepare(
        `SELECT COALESCE(MAX(sequence), 0) AS n FROM question_interactions WHERE session_id = ?`,
      )
      .get(input.sessionId) as Row | undefined;
    const sequence = Number(row?.n ?? 0) + 1;
    const id = randomUUID();
    this.db
      .prepare(
        `INSERT INTO question_interactions
           (id, session_id, sequence, question, category, source, target_section,
            user_response, conceptualisation_version_id, user_action, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, NULL, ?)`,
      )
      .run(
        id,
        input.sessionId,
        sequence,
        input.question,
        input.category,
        input.source,
        input.targetSection,
        input.conceptualisationVersionId,
        now(),
      );
    const created = this.db
      .prepare(`SELECT * FROM question_interactions WHERE id = ?`)
      .get(id) as Row;
    return toInteraction(created);
  }

  async listInteractions(sessionId: string): Promise<QuestionInteraction[]> {
    const rows = this.db
      .prepare(`SELECT * FROM question_interactions WHERE session_id = ? ORDER BY sequence`)
      .all(sessionId) as Row[];
    return rows.map(toInteraction);
  }

  async listInteractionsForExercise(exerciseId: string): Promise<QuestionInteraction[]> {
    const rows = this.db
      .prepare(
        `SELECT qi.* FROM question_interactions qi
         JOIN ct_sessions s ON s.id = qi.session_id
         WHERE s.exercise_id = ?
         ORDER BY qi.created_at, qi.sequence`,
      )
      .all(exerciseId) as Row[];
    return rows.map(toInteraction);
  }

  async answerInteraction(
    interactionId: string,
    response: string,
    action: UserAction,
  ): Promise<void> {
    this.db
      .prepare(
        `UPDATE question_interactions SET user_response = ?, user_action = ? WHERE id = ?`,
      )
      .run(response, action, interactionId);
  }

  async setInteractionAction(interactionId: string, action: UserAction): Promise<void> {
    this.db
      .prepare(`UPDATE question_interactions SET user_action = ? WHERE id = ?`)
      .run(action, interactionId);
  }

  // --- peer learning -------------------------------------------------------

  async listGroupsForUser(userId: string): Promise<PeerGroup[]> {
    const rows = this.db
      .prepare(
        `SELECT g.* FROM peer_groups g
         JOIN peer_group_members m ON m.group_id = g.id
         WHERE m.user_id = ? AND g.status = 'active'
         ORDER BY g.name`,
      )
      .all(userId) as Row[];
    return rows.map((row) => ({
      id: str(row.id),
      name: str(row.name),
      createdAt: str(row.created_at),
      status: str(row.status) as PeerGroup["status"],
    }));
  }

  async createSubmission(input: {
    exerciseId: string;
    userId: string;
    groupId: string;
    caseId: string;
    modalityId: PeerSubmission["modalityId"];
    sharedContent: PeerSubmission["sharedContent"];
  }): Promise<PeerSubmission> {
    const id = randomUUID();
    const createdAt = now();
    this.db
      .prepare(
        `INSERT INTO peer_submissions
           (id, exercise_id, user_id, group_id, case_id, modality_id, shared_content, created_at, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
      )
      .run(
        id,
        input.exerciseId,
        input.userId,
        input.groupId,
        input.caseId,
        input.modalityId,
        JSON.stringify(input.sharedContent),
        createdAt,
      );
    return { id, ...input, createdAt, status: "open" };
  }

  async listSubmissionsForExercise(exerciseId: string): Promise<PeerSubmission[]> {
    const rows = this.db
      .prepare(`SELECT * FROM peer_submissions WHERE exercise_id = ? ORDER BY created_at DESC`)
      .all(exerciseId) as Row[];
    return rows.map((row) => ({
      id: str(row.id),
      exerciseId: str(row.exercise_id),
      userId: str(row.user_id),
      groupId: str(row.group_id),
      caseId: str(row.case_id),
      modalityId: str(row.modality_id) as PeerSubmission["modalityId"],
      sharedContent: parseJson<PeerSubmission["sharedContent"]>(row.shared_content, {
        conceptualisation: true,
        criticalThinking: false,
      }),
      createdAt: str(row.created_at),
      status: str(row.status) as PeerSubmission["status"],
    }));
  }

  async listCommentsForSubmission(submissionId: string): Promise<PeerComment[]> {
    const rows = this.db
      .prepare(
        `SELECT * FROM peer_comments WHERE submission_id = ? AND status = 'visible' ORDER BY created_at`,
      )
      .all(submissionId) as Row[];
    return rows.map((row) => ({
      id: str(row.id),
      submissionId: str(row.submission_id),
      userId: str(row.user_id),
      body: str(row.body),
      createdAt: str(row.created_at),
      updatedAt: str(row.updated_at),
      status: str(row.status) as PeerComment["status"],
    }));
  }

  // --- analytics -----------------------------------------------------------

  async recordEvent(input: {
    userId: string | null;
    name: string;
    props: Record<string, unknown>;
  }): Promise<void> {
    const event: AnalyticsEvent = {
      id: randomUUID(),
      userId: input.userId,
      name: input.name,
      props: input.props,
      createdAt: now(),
    };
    this.db
      .prepare(
        `INSERT INTO analytics_events (id, user_id, name, props, created_at) VALUES (?, ?, ?, ?, ?)`,
      )
      .run(event.id, event.userId, event.name, JSON.stringify(event.props), event.createdAt);
  }
}
