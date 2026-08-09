# Caseform — Case Conceptualisation Practice Platform

A deliberate-practice environment for early-career therapists. The therapist reads a
hypothetical case, picks CBT or DBT, builds a conceptualisation against a modality-specific
template, and then answers AI-generated questions designed to make them interrogate their own
reasoning. They revise, reflect, and the exercise is kept as a learning record.

The product boundary matters more than any feature in it: **the therapist does the clinical
reasoning, the AI only asks questions.** Nothing here diagnoses, scores, grades, recommends
treatment, or tells anyone which formulation is correct.

## Running it

```bash
npm install
cp .env.example .env.local     # then fill in SESSION_SECRET and ANTHROPIC_API_KEY
npm run dev
```

`SESSION_SECRET` can be anything long and random:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Without `ANTHROPIC_API_KEY` the app still runs — the critical-thinking stage falls back to a
vetted question library and says so on screen.

## Source of truth for content

| What | Where it came from |
|---|---|
| CBT and DBT templates | `docs/conceptualisation and question templates.docx` — Beck's cognitive model plus Persons & Tompkins; Linehan's biosocial theory and target hierarchy |
| Question generation logic | Same doc, "Question Generation Logic (Flow 4)" |
| Screens, data model, safety rules | `docs/Functional PRD.md`, `docs/technical PRD.md` |

Templates live in `src/lib/content/templates.ts` as **data, not components**. Adding a modality
is an entry in that file — no screen, action, or query changes.

## Architecture

```
src/lib/db/          Repository interface + SQLite and Supabase implementations
src/lib/auth/        scrypt hashing, signed cookie sessions, server-side guards
src/lib/content/     Cases, templates, self-review and reflection prompts
src/lib/ai/          Prompt construction, safety validator, fallback library, orchestration
src/lib/practice/    Server actions for the learning loop
src/app/             Screens
```

### Swapping the database

`DATA_BACKEND=sqlite` (default) uses Node's built-in `node:sqlite` and needs nothing installed.
To move to Supabase:

1. Apply `src/lib/db/supabase-schema.sql` in the Supabase SQL editor.
2. Set `DATA_BACKEND=supabase`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

Both implement the same `Repository` interface in `src/lib/db/types.ts`. The Postgres schema
ships with RLS policies — peer submissions are readable only by their author and their group,
and there is deliberately no public-read policy anywhere.

### How the AI stage works

Per the templates doc, the template fields are given to the model as **background context, not
a visible scoring key**. The model uses them to notice which field is thin or unstated and asks
about that, quoting the therapist's own words. It never names the rubric and never reports
coverage back.

```
generate → validate → regenerate under a stricter prompt → validate → vetted fallback
```

`src/lib/ai/validate.ts` rejects diagnostic assertions, treatment directives, certainty claims,
evaluation of the therapist (praise included — that is still a grade), formulations supplied on
the therapist's behalf, crisis directives, and rubric leakage. The discriminator throughout is
*asking* versus *asserting*. A rejected question is never displayed.

Questions are classified into the five types from the doc — evidence check, alternative
explanation, specificity push, link-the-gap, stakes check — and the session tracks which have
been used so questions do not repeat.

## What is not built yet

- **Peer learning UI.** The data model, permissions, and RLS policies exist; groups,
  submissions, comments, reporting, and the moderation queue do not. `/peer-learning` says so.
  Choosing "share with peers" at self-review is recorded but nothing is visible to anyone else.
- **Admin CMS.** Cases and templates are version-controlled content modules rather than
  database rows with a draft → review → approved → published workflow.
- **Email delivery.** Password reset issues a real, hashed, expiring token, but there is no mail
  transport. In local development the link is shown on screen; otherwise it is logged
  server-side only.
- **Clinical review.** Every case is marked `draft_pending_clinical_review` and the vignette
  screen says so. The PRDs require review by trained CBT/DBT clinicians before release.

## Interface conventions

The UI follows the [Uncodixfy](https://github.com/cyxzdev/Uncodixfy) ruleset: 1px borders,
radii capped at 8px, no gradients, no glass, no pill shapes, no transform animations,
colour-and-opacity transitions only, a 240px solid sidebar, and tables rather than metric-card
grids. Warm stone neutrals with a single teal accent — no blue-corporate palette, no hero
sections inside the app.

## Checks

```bash
npm run typecheck
npx eslint src
npm run build
```
