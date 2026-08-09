# __Functional PRD: Case Conceptualisation Practice Platform__

## __1. Product summary__

A practice platform for __early-career therapists__ to strengthen case conceptualisation skills through repeated practice with hypothetical clinical cases.

Users read a case vignette and interactive client–therapist scenarios, select __CBT or DBT__, and build a case conceptualisation using a modality-specific template. They then respond to structured questions designed to make them __defend, examine, question, and strengthen their own clinical reasoning__.

Users can optionally share their conceptualisation with other therapists for __free-form peer feedback__. They then review the feedback, revise their conceptualisation, and write a reflection on what changed in their thinking.

The product is explicitly a __practice and learning tool__. It does not replace clinical supervision, formal modality training, or consultation around real clients.

# __2. The problem__

Early-career therapists need opportunities to repeatedly practise case conceptualisation, but opportunities for deliberate practice are limited.

Supervision is often:

- Infrequent
- Time-limited
- Focused on current clinical work rather than repeated skills practice
- Dependent on what cases happen to arise in a therapist's caseload

As a result, a therapist may understand the components of CBT or DBT conceptually but struggle to translate clinical information into a coherent formulation.

They need a safe environment where they can repeatedly practise:

__What am I noticing? → How am I making sense of it? → What evidence supports this? → What might I be missing? → What alternative explanations exist?__

The product creates that practice environment using __hypothetical cases__, structured conceptualisation templates, critical-thinking prompts, and optional peer learning.

# __3. Primary user__

### __Early-career therapists__

The primary user is a therapist who:

- Has some foundational exposure to CBT and/or DBT
- Wants to improve case conceptualisation
- Is not yet highly confident in applying a modality to clinical material
- Wants opportunities to practise between supervision sessions
- Is interested in learning from other therapists

The product should assume __basic familiarity with the modality__, rather than teaching CBT or DBT from scratch.

# __4. When do they use it?__

The primary use case is __deliberate practice between supervision sessions__.

A typical session might be:

1. Therapist selects a case.
2. Reads the vignette.
3. Works through interactive client–therapist scenarios.
4. Chooses CBT or DBT.
5. Completes the conceptualisation template.
6. Answers critical-thinking questions.
7. Reviews their own reasoning.
8. Optionally shares the conceptualisation with peers.
9. Receives peer comments.
10. Revises the conceptualisation.
11. Writes a reflection.
12. Saves the completed exercise as part of their learning history.

# __5. The ONE job the product must do__

## __Help an early-career therapist practise and strengthen their clinical case conceptualisation through repeated, structured reasoning.__

Everything in V1 should serve this job.

The product is __not__ primarily trying to:

- Teach CBT
- Teach DBT
- Diagnose clients
- Tell therapists what formulation is correct
- Provide treatment recommendations
- Replace supervision
- Act as a clinical decision-support system

Its job is to create a __high-quality space for practice__.

# __6. Core learning loop__

The central product loop is:

__CASE → CONCEPTUALISE → QUESTION → PEER REVIEW → REVISE → REFLECT__

### __Step 1: Case__

The therapist receives a hypothetical clinical case.

Cases consist of:

- Written vignette
- Relevant client background
- Presenting concerns
- Clinical history
- Contextual information
- Short interactive client–therapist scenarios

The interactive scenarios allow the therapist to encounter additional information rather than receiving everything at once.

### __Step 2: Choose modality__

The therapist chooses:

- CBT
- DBT

The conceptualisation template changes depending on the selected modality.

### __Step 3: Build conceptualisation__

The therapist completes a structured template.

The product should provide enough structure to support learning without writing the conceptualisation for them.

### __Step 4: Defend and examine__

After completing the template, the therapist receives questions/prompts.

These should encourage them to examine:

- What evidence supports this?
- What information led you to this conclusion?
- What are you assuming?
- What information is missing?
- Are there alternative explanations?
- Are different parts of your conceptualisation consistent with one another?
- What might you be overlooking?
- How does this fit with the selected modality?

__The AI does not provide a score, grade, formulation, diagnosis, or "correct answer."__

Its role is to facilitate critical thinking.

### __Step 5: Peer learning__

The therapist can choose to share the conceptualisation with peers.

Peers can leave __free-form comments__.

### __Step 6: Revise__

The therapist reviews the peer feedback and revises their conceptualisation.

The original version should remain available so the learner can see what changed.

### __Step 7: Reflect__

The therapist writes a short reflection about:

- What they changed
- What they learned
- What challenged their original thinking
- What they might approach differently next time

# __7. V1 screens__

## __Screen 1 — Home / Dashboard__

Purpose: Give the therapist an immediate starting point.

Shows:

- Start a new case
- Continue an unfinished case
- Recent completed cases
- Cases shared with peers
- Peer feedback received
- Personal practice history

A simple progress indicator can show number of cases completed, but __V1 should avoid competitive leaderboards or skill scores__.

Primary CTA:

__Practise a case__

## __Screen 2 — Case Library__

Purpose: Let users select a hypothetical case.

Cases should cover a broad range of clinical presentations and contexts.

Each case displays:

- Case title
- Brief description
- Approximate difficulty
- Available modality: CBT / DBT / both
- Estimated completion time

Potential V1 case categories could include:

- Anxiety
- Depression
- Emotion dysregulation
- Interpersonal difficulties
- Self-criticism
- Avoidance
- Behavioural difficulties
- Identity/contextual stressors
- Complex presentations

The product should avoid implying that a case represents a single "correct" diagnosis.

## __Screen 3 — Case Vignette__

Purpose: Present the clinical material.

Contains:

- Written case vignette
- Client background
- Presenting concerns
- Relevant history
- Contextual information

The therapist can move between sections rather than needing to remember the entire vignette.

CTA:

__Start conceptualisation__

## __Screen 4 — Interactive Scenario__

Purpose: Introduce short pieces of clinical information through simulated client–therapist interactions.

For example:

__Client:__ "I knew I should have gone to the party, but I just couldn't make myself."

The therapist encounters the interaction and may receive additional information relevant to their conceptualisation.

The scenarios should be short and purposeful rather than becoming a full therapy simulation.

CTA:

__Continue to conceptualisation__

## __Screen 5 — Modality Selection__

The therapist chooses:

__Which framework would you like to use?__

- CBT
- DBT

The screen briefly reminds them that the conceptualisation template will differ according to their selection.

# __8. Screen 6 — Conceptualisation Template__

This is the core screen of the product.

The structure should be modality-specific.

### __CBT template__

The exact template should be developed with CBT subject-matter experts, but may include areas such as:

- Presenting problems
- Relevant background/developmental factors
- Precipitating factors
- Maintaining factors
- Triggers/situations
- Thoughts/appraisals
- Emotions
- Physiological responses
- Behaviours
- Avoidance/safety behaviours
- Core beliefs/schema-level hypotheses
- Protective factors/resources
- Hypotheses requiring further information

### __DBT template__

Again, the final structure should be developed with DBT experts, but may include areas such as:

- Presenting problems/target behaviours
- Relevant vulnerabilities
- Prompting events
- Links in the behavioural chain
- Thoughts/cognitions
- Emotions
- Physiological responses
- Behavioural responses
- Consequences
- Environmental/interpersonal factors
- Maintaining contingencies
- Skills deficits vs. skills-use difficulties
- Protective factors/resources
- Areas requiring further assessment

The product should make clear that these are __learning templates__, not universal or definitive representations of CBT or DBT formulation.

# __9. Screen 7 — Critical Thinking / Defence__

After submitting the initial conceptualisation, the therapist receives a series of prompts.

The system should select prompts relevant to the conceptualisation and case.

Examples:

__Evidence__

What information from the case most strongly supports this hypothesis?

__Missing information__

What would you want to know before becoming more confident in this part of your formulation?

__Alternative hypotheses__

What is another possible explanation for this pattern?

__Assumptions__

Which part of your conceptualisation relies most heavily on an assumption?

__Internal consistency__

Do any parts of your conceptualisation appear to contradict one another?

__Modality fit__

How does this formulation make sense from a CBT/DBT perspective?

The therapist writes responses.

The AI's role is to __ask useful questions__, not answer them.

# __10. Screen 8 — Self-review__

The therapist reviews their completed conceptualisation and responses.

Possible prompts:

- What part of your conceptualisation feels strongest?
- What part feels least certain?
- What information would you want to gather next?
- What changed in your thinking while answering the questions?

The therapist can then choose:

__Share with peers__

or

__Keep private__

# __11. Screen 9 — Peer Sharing__

Optional.

The therapist can share their conceptualisation with the peer community.

They should be able to choose whether to share:

- Initial conceptualisation
- Critical-thinking responses
- Both

No real client information should be permitted.

The post should clearly indicate that the case is hypothetical.

# __12. Screen 10 — Peer Feedback__

Peers can read another therapist's conceptualisation and leave __free-form comments__.

Peer feedback should be framed as learning/discussion rather than clinical authority.

For example:

"I hadn't considered that the avoidance might be functioning this way. I wonder what additional information you'd want before deciding that?"

rather than:

"Your formulation is wrong. The client clearly has X."

# __13. Screen 11 — Revision__

The therapist sees their original conceptualisation alongside the peer feedback.

They revise their conceptualisation.

The system should preserve:

- Original version
- Revised version
- Peer feedback

This allows the therapist to see their own development.

# __14. Screen 12 — Reflection__

The therapist writes a final reflection.

Suggested prompts:

- What did you change?
- What influenced the change?
- What did you learn about your own reasoning?
- What would you pay more attention to in your next conceptualisation?

The completed case can then be marked:

__Complete__

# __15. What is IN V1__

### __Core practice__

- Hypothetical written case vignettes
- Short interactive client–therapist scenarios
- CBT conceptualisation template
- DBT conceptualisation template
- Broad range of clinical cases
- Modality selection
- Structured conceptualisation workflow
- Critical-thinking prompts
- Self-reflection
- Optional peer sharing
- Free-form peer feedback
- Revision after feedback
- Reflection after revision
- Saving completed exercises
- Basic practice history

### __AI__

AI is used only as a __guided critical-thinking facilitator__.

It can:

- Ask questions
- Identify areas that may warrant further thought
- Encourage consideration of alternatives
- Prompt examination of evidence
- Prompt reflection on assumptions

It should __not__:

- Generate the user's conceptualisation
- Grade the conceptualisation
- Diagnose the hypothetical client
- Tell the therapist which formulation is correct
- Recommend treatment
- Act as a supervisor

### __Modality__

V1:

- CBT
- DBT

The underlying product structure should allow additional modalities to be added later without rebuilding the entire product.

# __16. What is OUT of V1__

Explicitly out of scope:

### __Clinical use with real clients__

Users should not enter identifiable information about real clients.

The product is for hypothetical cases.

### __AI supervision__

The product will not:

- Replace supervision
- Act as a supervisor
- Provide authoritative clinical feedback
- Resolve disagreements between therapists

### __Automated scoring__

No:

- "85% accurate"
- "Excellent formulation"
- Therapist rankings
- Competency scores
- AI-generated grades

This is particularly important because case conceptualisation is often hypothesis-driven and multiple formulations may be clinically defensible.

### __Treatment planning__

V1 does not generate:

- Treatment plans
- Interventions
- Session plans
- Safety plans
- Medication recommendations

### __Diagnosis__

The product should not function as a diagnostic assessment tool.

### __Additional modalities__

Not in V1:

- ACT
- Schema Therapy
- Psychodynamic
- Narrative
- Family/systemic
- MBT
- etc.

These can be added later.

### __Gamification__

Avoid leaderboards, public rankings, streak pressure, or competitive scoring in V1.

The goal is __clinical learning, not performance competition__.

# __17. Information the product touches__

Because this is a mental-health learning product, information boundaries need to be explicit.

### __Information stored__

For hypothetical cases:

- Case content
- User's conceptualisation
- Critical-thinking responses
- Reflections
- Peer comments
- Modality selected
- Practice history
- Revision history

### __User information__

Potentially:

- Name/display name
- Professional/learner profile
- Account information
- Cases completed

### __Information the product should NOT collect__

The product should not require:

- Real client names
- Contact details
- Medical records
- Identifiable clinical notes
- Real client case histories

A prominent warning should appear before users begin:

__Use hypothetical cases only. Do not enter identifiable information about real clients.__

# __18. Safety rules__

Safety is a core product requirement because the users are clinicians and the subject matter is clinical.

### __Rule 1: Hypothetical cases only__

The platform should repeatedly communicate:

__Do not enter identifiable information about real clients.__

### __Rule 2: Learning tool, not supervision__

The product should explicitly state that it:

- Does not replace supervision
- Does not replace formal training
- Does not provide clinical advice
- Does not determine the correct formulation

### __Rule 3: AI must not assume clinical authority__

AI prompts should use language such as:

"What evidence supports this hypothesis?"

rather than:

"The correct formulation is..."

### __Rule 4: No diagnosis generation__

The system should not diagnose the hypothetical client or encourage users to treat its output as a diagnostic conclusion.

### __Rule 5: No treatment directives__

The system should not tell users what intervention they should use with a client.

### __Rule 6: Peer feedback is clearly labelled__

Peer feedback should be presented as:

__Peer perspective / learning feedback__

rather than professional supervision or expert review.

### __Rule 7: Crisis content__

Cases may contain difficult material, but V1 should be deliberately designed and reviewed by qualified clinicians for appropriate educational use.

Cases involving high-risk material should include appropriate contextual framing rather than turning the exercise into real-world crisis guidance.

### __Rule 8: Expert review__

All case material and modality-specific templates should undergo review by appropriately trained CBT/DBT clinicians before being released.

# __19. How we know it worked__

The product should not define success as "the AI gave good answers."

The fundamental question is:

__Are therapists getting better at conceptualising cases through practice?__

### __Primary outcome__

Users demonstrate improvement in the quality of their conceptualisations over repeated exercises.

This can be evaluated through expert-rated samples using dimensions such as:

1. __Completeness__
	- Does the formulation meaningfully cover relevant information?
2. __Case fit__
	- Does the formulation appropriately account for the information provided?
3. __Clinical reasoning__
	- Does the therapist distinguish evidence from assumptions?
	- Do they formulate hypotheses rather than present speculation as fact?
4. __Modality coherence__
	- Does the formulation meaningfully use the selected CBT/DBT framework?
5. __Critical thinking__
	- Can the therapist identify uncertainty, missing information, and alternative explanations?

### __Product metrics__

V1 should also track:

- Cases started
- Cases completed
- Conceptualisations completed
- Critical-thinking prompts completed
- Cases shared with peers
- Peer feedback received
- Revisions completed
- Reflections completed
- Repeat practice rate
- Number of cases completed per user
- Percentage of users returning to practise again

### __Learning metric__

A particularly useful measure:

__Change between initial and revised conceptualisation.__

For example, expert raters could assess whether the revised formulation demonstrates:

- Greater completeness
- Better use of evidence
- More appropriate uncertainty
- Stronger case fit
- More coherent modality use

### __Community metric__

Because peer learning is a core outcome:

- Percentage of shared cases receiving feedback
- Average time to first feedback
- Percentage of users who both give and receive feedback
- Repeat participation in peer feedback

The ultimate success signal is:

__Users voluntarily return to practise, revise their thinking, and increasingly produce stronger conceptualisations.__

# __20. Product principles__

These should guide future feature decisions.

### __1. The therapist does the thinking.__

The product should create cognitive work, not remove it.

### __2. Questions over answers.__

AI should primarily facilitate reflection and critical reasoning.

### __3. Hypotheses over certainty.__

The product should model the idea that a conceptualisation is a working hypothesis that can change as information changes.

### __4. Practice over performance.__

The goal is skill development, not getting a perfect score.

### __5. Peer learning over peer authority.__

Peers provide perspectives, not supervision.

### __6. Supervision remains essential.__

The product complements supervision rather than positioning itself as an alternative.

# __21. V1 success statement__

If V1 is successful, an early-career therapist should be able to say:

__"I can practise conceptualising cases on my own, and the process helps me notice where my reasoning is weak, question my assumptions, consider alternative explanations, learn from other therapists, and revise my formulation."__

That is the product's core value proposition.

