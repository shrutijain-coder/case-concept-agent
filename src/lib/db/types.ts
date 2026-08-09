/**
 * Domain types and the storage contract.
 *
 * Everything the application touches goes through `Repository`. Two
 * implementations exist: `SqliteRepository` (local, zero-config) and
 * `SupabaseRepository` (Postgres). Swapping is an env var, not a rewrite.
 */

export type UserRole = "learner" | "content_admin" | "moderator" | "sysadmin";

export interface User {
  id: string;
  email: string;
  displayName: string;
  professionalRole: string | null;
  experienceLevel: string | null;
  role: UserRole;
  /** Timestamp the first-use safety notice was acknowledged. Null until then. */
  safetyAckAt: string | null;
  createdAt: string;
}

/** Includes the credential material. Never leaves the auth layer. */
export interface UserWithSecret extends User {
  passwordHash: string;
}

export type ModalityId = "cbt" | "dbt";

export type ExerciseStage =
  | "vignette"
  | "scenarios"
  | "modality"
  | "conceptualisation"
  | "critical_thinking"
  | "self_review"
  | "reflection"
  | "complete";

export type ExerciseStatus = "in_progress" | "complete";

export type SharingChoice = "undecided" | "private" | "group";

export interface Exercise {
  id: string;
  userId: string;
  caseId: string;
  /** Snapshot of the case version in use, so later content edits never rewrite history. */
  caseVersion: number;
  modalityId: ModalityId | null;
  templateVersion: number | null;
  stage: ExerciseStage;
  status: ExerciseStatus;
  /** Scenario ids the therapist has actually opened. */
  scenariosViewed: string[];
  /** Working copy of the conceptualisation. Autosaved; promoted to a version on submit. */
  draft: Record<string, string>;
  currentVersionId: string | null;
  selfReview: Record<string, string>;
  reflection: Record<string, string>;
  sharing: SharingChoice;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  completedAt: string | null;
}

export interface ConceptualisationVersion {
  id: string;
  exerciseId: string;
  versionNumber: number;
  sectionResponses: Record<string, string>;
  changeReason: string | null;
  createdAt: string;
}

/**
 * Question taxonomy from "Case Conceptualization Templates → Question
 * Generation Logic (Flow 4)". These five types replace the longer speculative
 * list in the technical PRD; each PRD category maps onto one of them
 * (evidence/assumptions → EVIDENCE_CHECK, missing information & internal
 * consistency → LINK_THE_GAP, case/modality fit → SPECIFICITY_PUSH,
 * uncertainty → ALTERNATIVE_EXPLANATION).
 */
export type QuestionCategory =
  | "EVIDENCE_CHECK"
  | "ALTERNATIVE_EXPLANATION"
  | "SPECIFICITY_PUSH"
  | "LINK_THE_GAP"
  | "STAKES_CHECK";

export type UserAction = "UPDATE_CONCEPTUALISATION" | "CONTINUE" | "END_SESSION";

export interface CriticalThinkingSession {
  id: string;
  exerciseId: string;
  startedAt: string;
  completedAt: string | null;
  status: "active" | "complete";
}

export interface QuestionInteraction {
  id: string;
  sessionId: string;
  sequence: number;
  question: string;
  category: QuestionCategory;
  /** Whether the question came from the model or the vetted fallback library. */
  source: "ai" | "fallback";
  /**
   * Title of the template section this question was about, when it targeted
   * one specific field rather than the formulation as a whole. Drives which
   * field gets an AI-drafted revision when the therapist chooses "Update my
   * conceptualisation" after answering.
   */
  targetSection: string | null;
  userResponse: string | null;
  conceptualisationVersionId: string | null;
  userAction: UserAction | null;
  createdAt: string;
}

export interface PeerGroup {
  id: string;
  name: string;
  createdAt: string;
  status: "active" | "archived";
}

export interface PeerGroupMember {
  groupId: string;
  userId: string;
  role: "owner" | "member";
  joinedAt: string;
}

export interface PeerSubmission {
  id: string;
  exerciseId: string;
  userId: string;
  groupId: string;
  caseId: string;
  modalityId: ModalityId;
  /** Which parts of the exercise were shared. */
  sharedContent: { conceptualisation: boolean; criticalThinking: boolean };
  createdAt: string;
  status: "open" | "withdrawn";
}

export interface PeerComment {
  id: string;
  submissionId: string;
  userId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  status: "visible" | "removed";
}

export interface AnalyticsEvent {
  id: string;
  userId: string | null;
  name: string;
  props: Record<string, unknown>;
  createdAt: string;
}

export interface NewUser {
  email: string;
  passwordHash: string;
  displayName: string;
  professionalRole?: string | null;
  experienceLevel?: string | null;
}

export interface PracticeCounts {
  completed: number;
  inProgress: number;
  shared: number;
}

/**
 * The storage contract. Implementations must enforce nothing beyond
 * persistence — authorisation lives in the server actions that call this.
 */
export interface Repository {
  init(): Promise<void>;

  // --- users ---------------------------------------------------------------
  createUser(input: NewUser): Promise<User>;
  findUserByEmail(email: string): Promise<UserWithSecret | null>;
  findUserById(id: string): Promise<User | null>;
  updateUserPassword(userId: string, passwordHash: string): Promise<void>;
  acknowledgeSafetyNotice(userId: string): Promise<void>;

  // --- password reset ------------------------------------------------------
  /** Stores a hash of the token; the caller keeps the only plaintext copy. */
  createPasswordResetToken(userId: string, tokenHash: string, expiresAt: string): Promise<void>;
  /** Returns the user id and burns the token. Null if unknown or expired. */
  consumePasswordResetToken(tokenHash: string): Promise<string | null>;

  // --- exercises -----------------------------------------------------------
  createExercise(input: {
    userId: string;
    caseId: string;
    caseVersion: number;
  }): Promise<Exercise>;
  getExercise(id: string): Promise<Exercise | null>;
  listExercises(userId: string): Promise<Exercise[]>;
  findOpenExerciseForCase(userId: string, caseId: string): Promise<Exercise | null>;
  updateExercise(
    id: string,
    patch: Partial<
      Pick<
        Exercise,
        | "modalityId"
        | "templateVersion"
        | "stage"
        | "status"
        | "scenariosViewed"
        | "draft"
        | "currentVersionId"
        | "selfReview"
        | "reflection"
        | "sharing"
        | "submittedAt"
        | "completedAt"
      >
    >,
  ): Promise<Exercise>;
  countPractice(userId: string): Promise<PracticeCounts>;

  // --- conceptualisation versions -----------------------------------------
  createVersion(input: {
    exerciseId: string;
    sectionResponses: Record<string, string>;
    changeReason: string | null;
  }): Promise<ConceptualisationVersion>;
  listVersions(exerciseId: string): Promise<ConceptualisationVersion[]>;
  getVersion(id: string): Promise<ConceptualisationVersion | null>;

  // --- critical thinking ---------------------------------------------------
  createCtSession(exerciseId: string): Promise<CriticalThinkingSession>;
  getActiveCtSession(exerciseId: string): Promise<CriticalThinkingSession | null>;
  completeCtSession(sessionId: string): Promise<void>;
  createInteraction(input: {
    sessionId: string;
    question: string;
    category: QuestionCategory;
    source: "ai" | "fallback";
    targetSection: string | null;
    conceptualisationVersionId: string | null;
  }): Promise<QuestionInteraction>;
  listInteractions(sessionId: string): Promise<QuestionInteraction[]>;
  /**
   * Every interaction for an exercise, across all of its critical-thinking
   * sessions, oldest first. A new session starts when the therapist reopens
   * questioning after ending one — this is what lets the AI (and the UI)
   * keep remembering the full Q&A instead of forgetting it at that boundary.
   */
  listInteractionsForExercise(exerciseId: string): Promise<QuestionInteraction[]>;
  answerInteraction(
    interactionId: string,
    response: string,
    action: UserAction,
  ): Promise<void>;
  setInteractionAction(interactionId: string, action: UserAction): Promise<void>;

  // --- peer learning (schema-complete; UI arrives in the peer milestone) ----
  listGroupsForUser(userId: string): Promise<PeerGroup[]>;
  createSubmission(input: {
    exerciseId: string;
    userId: string;
    groupId: string;
    caseId: string;
    modalityId: ModalityId;
    sharedContent: PeerSubmission["sharedContent"];
  }): Promise<PeerSubmission>;
  listSubmissionsForExercise(exerciseId: string): Promise<PeerSubmission[]>;
  listCommentsForSubmission(submissionId: string): Promise<PeerComment[]>;

  // --- analytics -----------------------------------------------------------
  recordEvent(input: {
    userId: string | null;
    name: string;
    props: Record<string, unknown>;
  }): Promise<void>;
}
