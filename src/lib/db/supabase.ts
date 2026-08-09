import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type {
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

/**
 * Supabase Postgres implementation of the same contract as SqliteRepository.
 *
 * Apply `src/lib/db/supabase-schema.sql` to the project first, then set
 * DATA_BACKEND=supabase plus NEXT_PUBLIC_SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY.
 *
 * This runs server-side only and uses the service-role key, so RLS is
 * bypassed here by design — authorisation is enforced in the server actions
 * that call the repository. The RLS policies in the schema are defence in
 * depth for any client that later talks to Postgres with the anon key.
 */

type Row = Record<string, unknown>;

function str(value: unknown): string {
  return typeof value === "string" ? value : String(value ?? "");
}

function nullableStr(value: unknown): string | null {
  return value == null ? null : String(value);
}

function asRecord(value: unknown): Record<string, string> {
  return value && typeof value === "object" ? (value as Record<string, string>) : {};
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
    scenariosViewed: Array.isArray(row.scenarios_viewed)
      ? (row.scenarios_viewed as string[])
      : [],
    draft: asRecord(row.draft),
    currentVersionId: nullableStr(row.current_version_id),
    selfReview: asRecord(row.self_review),
    reflection: asRecord(row.reflection),
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
    sectionResponses: asRecord(row.section_responses),
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

/**
 * The client, not the repository wrapper, is what's worth caching: it holds
 * the actual connection config and shouldn't be rebuilt on every call. See
 * the comment on `getRepository()` in index.ts for why the wrapper class
 * itself is deliberately never cached.
 */
const globalForSupabase = globalThis as unknown as { __ccSupabaseClient?: SupabaseClient };

function getSupabaseClient(): SupabaseClient {
  if (!globalForSupabase.__ccSupabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "DATA_BACKEND=supabase requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      );
    }
    globalForSupabase.__ccSupabaseClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return globalForSupabase.__ccSupabaseClient;
}

export class SupabaseRepository implements Repository {
  private client: SupabaseClient;

  constructor() {
    this.client = getSupabaseClient();
  }

  /**
   * Throws on error, throws on an unexpectedly empty body, and otherwise hands
   * back the row(s) as `unknown` for the caller's `toX` mapper to narrow. The
   * client is untyped (no generated Database types), so `unknown` is the
   * honest return type rather than a fictional generic.
   */
  private unwrap(result: { data: unknown; error: { message: string } | null }): unknown {
    if (result.error) throw new Error(result.error.message);
    if (result.data == null) throw new Error("Supabase returned no data");
    return result.data;
  }

  async init(): Promise<void> {
    const { error } = await this.client.from("users").select("id").limit(1);
    if (error) {
      throw new Error(
        `Supabase is unreachable or the schema is missing. Apply src/lib/db/supabase-schema.sql. (${error.message})`,
      );
    }
  }

  // --- users ---------------------------------------------------------------

  async createUser(input: NewUser): Promise<User> {
    const data = this.unwrap(
      await this.client
        .from("users")
        .insert({
          email: input.email.toLowerCase(),
          password_hash: input.passwordHash,
          display_name: input.displayName,
          professional_role: input.professionalRole ?? null,
          experience_level: input.experienceLevel ?? null,
        })
        .select()
        .single(),
    );
    return toUser(data as Row);
  }

  async findUserByEmail(email: string): Promise<UserWithSecret | null> {
    const { data, error } = await this.client
      .from("users")
      .select()
      .eq("email", email.toLowerCase())
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return { ...toUser(data as Row), passwordHash: str((data as Row).password_hash) };
  }

  async findUserById(id: string): Promise<User | null> {
    const { data, error } = await this.client
      .from("users")
      .select()
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toUser(data as Row) : null;
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    const { error } = await this.client
      .from("users")
      .update({ password_hash: passwordHash })
      .eq("id", userId);
    if (error) throw new Error(error.message);
  }

  async acknowledgeSafetyNotice(userId: string): Promise<void> {
    const { error } = await this.client
      .from("users")
      .update({ safety_ack_at: new Date().toISOString() })
      .eq("id", userId)
      .is("safety_ack_at", null);
    if (error) throw new Error(error.message);
  }

  // --- password reset ------------------------------------------------------

  async createPasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: string,
  ): Promise<void> {
    await this.client.from("password_reset_tokens").delete().eq("user_id", userId);
    const { error } = await this.client
      .from("password_reset_tokens")
      .insert({ token_hash: tokenHash, user_id: userId, expires_at: expiresAt });
    if (error) throw new Error(error.message);
  }

  async consumePasswordResetToken(tokenHash: string): Promise<string | null> {
    const { data, error } = await this.client
      .from("password_reset_tokens")
      .select()
      .eq("token_hash", tokenHash)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    await this.client.from("password_reset_tokens").delete().eq("token_hash", tokenHash);
    const row = data as Row;
    if (new Date(str(row.expires_at)).getTime() < Date.now()) return null;
    return str(row.user_id);
  }

  // --- exercises -----------------------------------------------------------

  async createExercise(input: {
    userId: string;
    caseId: string;
    caseVersion: number;
  }): Promise<Exercise> {
    const data = this.unwrap(
      await this.client
        .from("exercises")
        .insert({
          user_id: input.userId,
          case_id: input.caseId,
          case_version: input.caseVersion,
          stage: "vignette",
          status: "in_progress",
        })
        .select()
        .single(),
    );
    return toExercise(data as Row);
  }

  async getExercise(id: string): Promise<Exercise | null> {
    const { data, error } = await this.client
      .from("exercises")
      .select()
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toExercise(data as Row) : null;
  }

  async listExercises(userId: string): Promise<Exercise[]> {
    const data = this.unwrap(
      await this.client
        .from("exercises")
        .select()
        .eq("user_id", userId)
        .order("updated_at", { ascending: false }),
    );
    return (data as Row[]).map(toExercise);
  }

  async findOpenExerciseForCase(
    userId: string,
    caseId: string,
  ): Promise<Exercise | null> {
    const { data, error } = await this.client
      .from("exercises")
      .select()
      .eq("user_id", userId)
      .eq("case_id", caseId)
      .eq("status", "in_progress")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toExercise(data as Row) : null;
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
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const [key, column] of Object.entries(columns)) {
      if (key in patch) update[column] = (patch as Record<string, unknown>)[key];
    }
    const data = this.unwrap(
      await this.client.from("exercises").update(update).eq("id", id).select().single(),
    );
    return toExercise(data as Row);
  }

  async countPractice(userId: string): Promise<PracticeCounts> {
    const exercises = await this.listExercises(userId);
    return {
      completed: exercises.filter((e) => e.status === "complete").length,
      inProgress: exercises.filter((e) => e.status === "in_progress").length,
      shared: exercises.filter((e) => e.sharing === "group").length,
    };
  }

  // --- versions ------------------------------------------------------------

  async createVersion(input: {
    exerciseId: string;
    sectionResponses: Record<string, string>;
    changeReason: string | null;
  }): Promise<ConceptualisationVersion> {
    const existing = await this.listVersions(input.exerciseId);
    const versionNumber = existing.length
      ? Math.max(...existing.map((v) => v.versionNumber)) + 1
      : 1;
    const data = this.unwrap(
      await this.client
        .from("conceptualisation_versions")
        .insert({
          exercise_id: input.exerciseId,
          version_number: versionNumber,
          section_responses: input.sectionResponses,
          change_reason: input.changeReason,
        })
        .select()
        .single(),
    );
    return toVersion(data as Row);
  }

  async listVersions(exerciseId: string): Promise<ConceptualisationVersion[]> {
    const data = this.unwrap(
      await this.client
        .from("conceptualisation_versions")
        .select()
        .eq("exercise_id", exerciseId)
        .order("version_number", { ascending: true }),
    );
    return (data as Row[]).map(toVersion);
  }

  async getVersion(id: string): Promise<ConceptualisationVersion | null> {
    const { data, error } = await this.client
      .from("conceptualisation_versions")
      .select()
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toVersion(data as Row) : null;
  }

  // --- critical thinking ---------------------------------------------------

  async createCtSession(exerciseId: string): Promise<CriticalThinkingSession> {
    const data = this.unwrap(
      await this.client
        .from("ct_sessions")
        .insert({ exercise_id: exerciseId, status: "active" })
        .select()
        .single(),
    );
    return toCtSession(data as Row);
  }

  async getActiveCtSession(exerciseId: string): Promise<CriticalThinkingSession | null> {
    const { data, error } = await this.client
      .from("ct_sessions")
      .select()
      .eq("exercise_id", exerciseId)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toCtSession(data as Row) : null;
  }

  async completeCtSession(sessionId: string): Promise<void> {
    const { error } = await this.client
      .from("ct_sessions")
      .update({ status: "complete", completed_at: new Date().toISOString() })
      .eq("id", sessionId);
    if (error) throw new Error(error.message);
  }

  async createInteraction(input: {
    sessionId: string;
    question: string;
    category: QuestionCategory;
    source: "ai" | "fallback";
    targetSection: string | null;
    conceptualisationVersionId: string | null;
  }): Promise<QuestionInteraction> {
    const existing = await this.listInteractions(input.sessionId);
    const sequence = existing.length
      ? Math.max(...existing.map((i) => i.sequence)) + 1
      : 1;
    const data = this.unwrap(
      await this.client
        .from("question_interactions")
        .insert({
          session_id: input.sessionId,
          sequence,
          question: input.question,
          category: input.category,
          source: input.source,
          target_section: input.targetSection,
          conceptualisation_version_id: input.conceptualisationVersionId,
        })
        .select()
        .single(),
    );
    return toInteraction(data as Row);
  }

  async listInteractions(sessionId: string): Promise<QuestionInteraction[]> {
    const data = this.unwrap(
      await this.client
        .from("question_interactions")
        .select()
        .eq("session_id", sessionId)
        .order("sequence", { ascending: true }),
    );
    return (data as Row[]).map(toInteraction);
  }

  async listInteractionsForExercise(exerciseId: string): Promise<QuestionInteraction[]> {
    // Embedded-resource filter: question_interactions has no exercise_id of
    // its own, so filter through the ct_sessions relationship it belongs to.
    const data = this.unwrap(
      await this.client
        .from("question_interactions")
        .select("*, ct_sessions!inner(exercise_id)")
        .eq("ct_sessions.exercise_id", exerciseId)
        .order("created_at", { ascending: true }),
    );
    return (data as Row[]).map(toInteraction);
  }

  async answerInteraction(
    interactionId: string,
    response: string,
    action: UserAction,
  ): Promise<void> {
    const { error } = await this.client
      .from("question_interactions")
      .update({ user_response: response, user_action: action })
      .eq("id", interactionId);
    if (error) throw new Error(error.message);
  }

  async setInteractionAction(interactionId: string, action: UserAction): Promise<void> {
    const { error } = await this.client
      .from("question_interactions")
      .update({ user_action: action })
      .eq("id", interactionId);
    if (error) throw new Error(error.message);
  }

  // --- peer learning -------------------------------------------------------

  async listGroupsForUser(userId: string): Promise<PeerGroup[]> {
    const data = this.unwrap(
      await this.client
        .from("peer_group_members")
        .select("peer_groups(id, name, created_at, status)")
        .eq("user_id", userId),
    );
    return (data as Row[])
      .map((row) => row.peer_groups as Row | null)
      .filter((group): group is Row => Boolean(group) && str(group!.status) === "active")
      .map((group) => ({
        id: str(group.id),
        name: str(group.name),
        createdAt: str(group.created_at),
        status: str(group.status) as PeerGroup["status"],
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
    const data = this.unwrap(
      await this.client
        .from("peer_submissions")
        .insert({
          exercise_id: input.exerciseId,
          user_id: input.userId,
          group_id: input.groupId,
          case_id: input.caseId,
          modality_id: input.modalityId,
          shared_content: input.sharedContent,
        })
        .select()
        .single(),
    );
    const row = data as Row;
    return {
      id: str(row.id),
      exerciseId: str(row.exercise_id),
      userId: str(row.user_id),
      groupId: str(row.group_id),
      caseId: str(row.case_id),
      modalityId: str(row.modality_id) as PeerSubmission["modalityId"],
      sharedContent: input.sharedContent,
      createdAt: str(row.created_at),
      status: str(row.status) as PeerSubmission["status"],
    };
  }

  async listSubmissionsForExercise(exerciseId: string): Promise<PeerSubmission[]> {
    const data = this.unwrap(
      await this.client
        .from("peer_submissions")
        .select()
        .eq("exercise_id", exerciseId)
        .order("created_at", { ascending: false }),
    );
    return (data as Row[]).map((row) => ({
      id: str(row.id),
      exerciseId: str(row.exercise_id),
      userId: str(row.user_id),
      groupId: str(row.group_id),
      caseId: str(row.case_id),
      modalityId: str(row.modality_id) as PeerSubmission["modalityId"],
      sharedContent: (row.shared_content as PeerSubmission["sharedContent"]) ?? {
        conceptualisation: true,
        criticalThinking: false,
      },
      createdAt: str(row.created_at),
      status: str(row.status) as PeerSubmission["status"],
    }));
  }

  async listCommentsForSubmission(submissionId: string): Promise<PeerComment[]> {
    const data = this.unwrap(
      await this.client
        .from("peer_comments")
        .select()
        .eq("submission_id", submissionId)
        .eq("status", "visible")
        .order("created_at", { ascending: true }),
    );
    return (data as Row[]).map((row) => ({
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
    const { error } = await this.client
      .from("analytics_events")
      .insert({ user_id: input.userId, name: input.name, props: input.props });
    if (error) throw new Error(error.message);
  }
}
