# __Technical Product Requirements Document__

## __Case Conceptualisation Practice Platform — V1__

__Status:__ Draft  
__Product:__ Clinical case conceptualisation practice and peer-learning platform  
__Primary users:__ Early-career therapists  
__V1 modalities:__ CBT and DBT  
__Primary use case:__ Deliberate practice between supervision sessions

# __1. Product Overview__

The Case Conceptualisation Practice Platform is a learning tool that helps early-career therapists practise and strengthen case conceptualisation skills using __hypothetical clinical cases__.

A therapist works through a case presented as a written vignette and short interactive client–therapist scenarios. They select either CBT or DBT and complete a modality-specific conceptualisation template.

The platform then uses AI to ask __one critical-thinking or reflective question at a time__. The AI does not evaluate, grade, correct, diagnose, formulate, or provide treatment recommendations.

After responding to each question, the therapist chooses:

__Do you want to update the conceptualisation or continue with the questions?__

The therapist can iteratively revise their conceptualisation as their thinking develops.

Once they are satisfied, they can optionally share the conceptualisation with a __peer group they have chosen themselves__. Peers provide free-form feedback. The therapist then reviews the feedback, revises their conceptualisation, and completes a reflection.

The product is a __practice and learning tool__, not a replacement for supervision, formal modality training, or clinical consultation.

# __2. Problem__

Early-career therapists often have limited opportunities to deliberately practise case conceptualisation.

Supervision is:

- Infrequent
- Time-limited
- Often focused on current clinical cases
- Not necessarily structured around repeated conceptualisation practice

A therapist may understand the theoretical components of CBT or DBT but still struggle with:

- Organising clinical information
- Identifying relevant maintaining factors
- Distinguishing evidence from assumptions
- Developing hypotheses
- Considering alternative explanations
- Recognising missing information
- Connecting clinical information to a particular modality
- Revising a formulation when new information emerges

The platform provides a low-risk environment for repeated practice using hypothetical cases.

# __3. Product Goal__

## __Primary goal__

Help early-career therapists __practise and strengthen clinical case conceptualisation through repeated, structured reasoning__.

## __Secondary goal__

Build a peer-learning environment where therapists can learn from how other therapists conceptualise the same or similar cases.

# __4. Non-Goals__

The platform is not intended to:

- Replace clinical supervision
- Replace formal CBT or DBT training
- Provide psychotherapy
- Provide clinical consultation
- Diagnose clients
- Generate treatment plans
- Recommend interventions
- Determine whether a conceptualisation is clinically "correct"
- Assess therapist competency
- Provide professional accreditation
- Store real client clinical records

# __5. Primary User__

## __Early-career therapist__

The primary user is a therapist who has some foundational exposure to CBT and/or DBT and wants to practise applying these frameworks to clinical material.

The product assumes that the therapist has __basic familiarity with the modality__.

It is not designed to teach CBT or DBT from the ground up.

# __6. Core User Journey__

The complete V1 journey is:

__Dashboard__

↓

__Select case__

↓

__Read vignette__

↓

__Work through interactive scenarios__

↓

__Select CBT or DBT__

↓

__Complete conceptualisation__

↓

__Begin critical-thinking exercise__

↓

__AI asks one question__

↓

__Therapist responds__

↓

__AI asks:__

Do you want to update the conceptualisation or continue with the questions?

↓

### __Update__

Therapist edits conceptualisation

↓

Next critical-thinking question

__OR__

### __Continue__

Next critical-thinking question

↓

Repeat until therapist chooses to finish

↓

__Optional peer sharing__

↓

__Peer group feedback__

↓

__Review feedback__

↓

__Revise conceptualisation__

↓

__Write reflection__

↓

__Complete__

# __7. Core Product Principle__

The platform must preserve this distinction:

### __The therapist does the clinical reasoning.__

### __The AI facilitates the reasoning.__

### __Peers provide perspectives.__

The system should never turn this into:

__Case → AI formulates → therapist accepts/rejects__

Instead:

__Case → therapist formulates → AI questions → therapist examines → peers respond → therapist revises__

# __8. Information Architecture__

V1 consists of the following major areas:

1. Authentication
2. Dashboard
3. Case Library
4. Case Vignette
5. Interactive Scenarios
6. Modality Selection
7. Conceptualisation
8. Critical Thinking
9. Peer Groups
10. Peer Feedback
11. Revision
12. Reflection
13. Learning History
14. Profile
15. Admin / Content Management
16. Moderation

# __9. Screen Requirements__

## __Screen 1 — Sign Up / Login__

### __Purpose__

Allow users to create and access an account.

### __Requirements__

Users can:

- Create account
- Log in
- Log out
- Reset password

### __Minimum user data__

- Email
- Password
- Display name

Optional:

- Professional role
- Experience level

# __10. Screen 2 — First-use Safety Notice__

Before the user begins their first case, display a prominent notice:

__This platform is for practising with hypothetical cases. Please do not enter identifiable information about real clients. This tool does not replace supervision, formal training, or clinical consultation.__

The user must acknowledge the notice before continuing.

# __11. Screen 3 — Dashboard__

### __Purpose__

Provide the user's starting point.

### __Components__

Primary CTA:

__Practise a case__

Additional sections:

### __Continue practising__

Shows unfinished cases.

### __Recent practice__

Shows recently completed cases.

### __Peer activity__

Shows:

- Feedback received
- Discussions/comments relevant to the user

### __Practice history__

Shows basic activity such as:

- Cases completed
- Cases currently in progress
- Cases shared

No competency score should be displayed.

# __12. Screen 4 — Case Library__

### __Purpose__

Allow users to select a hypothetical case.

Each case card contains:

- Title
- Short description
- Difficulty
- Clinical themes
- Available modalities
- Estimated completion time

### __Example metadata__

Case: The Avoided Presentation

Difficulty: Intermediate

Themes: anxiety, avoidance, self-criticism

Modalities: CBT / DBT

Time: ~30 minutes

### __Requirements__

Users can:

- Browse cases
- Filter cases
- Search cases
- Start a case
- Return to an unfinished case

### __V1 filtering__

Potential filters:

- Modality
- Difficulty
- Clinical theme

# __13. Screen 5 — Case Vignette__

### __Purpose__

Present the initial clinical information.

### __Content__

- Case background
- Presenting concerns
- Relevant history
- Contextual information
- Current circumstances

The content must clearly indicate that the case is hypothetical.

### __Requirement__

The user should be able to revisit the vignette later while completing the conceptualisation.

# __14. Screen 6 — Interactive Scenarios__

Cases can contain short client–therapist scenarios.

Example:

__Therapist:__ "What happened when you thought about going to the party?"

__Client:__ "I started thinking everyone would notice how awkward I was, so I decided not to go."

The scenarios provide additional information progressively.

### __Requirements__

- Scenarios appear sequentially
- User can navigate backwards
- Previously viewed scenarios remain accessible
- Scenario completion is saved
- The system records which information has been revealed

### __V1 scope__

Scenarios can be branching or linear, but __complex adaptive branching is not required for V1__.

A linear sequence with meaningful information reveals is sufficient.

# __15. Screen 7 — Modality Selection__

After the case material, the user chooses:

### __CBT__

or

### __DBT__

The selection determines the conceptualisation template and informs the critical-thinking engine.

### __Data__

selected\_modality:

    CBT

    DBT

# __16. Screen 8 — Conceptualisation__

This is the central learning interface.

The system loads the conceptualisation template corresponding to the selected modality.

## __Requirements__

- Structured sections
- Free-text fields
- Guidance/examples where appropriate
- Autosave
- Save draft
- Submit conceptualisation
- Ability to revisit case information

### __Conceptualisation templates__

Templates must be __configuration-driven__, rather than hard-coded.

This is essential for future modalities.

# __17. CBT Conceptualisation Template__

The final template should be developed and reviewed by CBT subject-matter experts.

Possible sections include:

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
- Missing information
- Working hypotheses

The exact final template should be validated before implementation.

# __18. DBT Conceptualisation Template__

The final template should be developed and reviewed by DBT subject-matter experts.

Possible sections include:

- Presenting problems/target behaviours
- Vulnerability factors
- Prompting events
- Behavioural chain
- Thoughts/cognitions
- Emotions
- Physiological responses
- Behavioural responses
- Consequences
- Environmental factors
- Interpersonal factors
- Maintaining contingencies
- Skills deficits
- Skills-use difficulties
- Protective factors/resources
- Missing information
- Working hypotheses

Again, these are proposed structures rather than final clinical specifications.

# __19. Conceptualisation Data Model__

Conceptualisation

- conceptualisation\_id

- user\_id

- case\_id

- modality\_id

- status

- current\_version\_id

- created\_at

- updated\_at

- submitted\_at

Each version:

ConceptualisationVersion

- version\_id

- conceptualisation\_id

- version\_number

- section\_responses

- created\_at

- created\_by

- change\_reason

# __20. Autosave__

Conceptualisation responses should autosave.

Requirements:

- Save individual field changes
- Recover draft after closing/reopening
- Prevent accidental loss of work
- Show save state

Example:

Saved just now

The system should not require the user to manually save every field.

# __21. Critical-Thinking Engine__

The critical-thinking stage begins after the user submits an initial conceptualisation.

The AI should ask __one question at a time__.

It should not present a static list of five or ten questions.

# __22. AI Input__

The AI may receive:

### __Case information__

- Vignette
- Relevant scenario information

### __User context__

- Selected modality
- Current conceptualisation
- Previous conceptualisation versions relevant to the current exercise

### __Conversation context__

- Previous questions
- User responses
- User actions

# __23. AI Output__

The AI produces a single critical-thinking or reflective question.

Possible categories:

### __Evidence__

What evidence from the case supports this hypothesis?

### __Missing information__

What would you want to know before becoming more confident in this interpretation?

### __Assumptions__

What are you assuming in this part of the conceptualisation?

### __Alternative hypotheses__

What else might explain this pattern?

### __Case fit__

How well does this explanation account for the other information in the case?

### __Internal consistency__

Are there any parts of your conceptualisation that don't fully fit together?

### __Modality fit__

How does this hypothesis fit with the CBT framework you selected?

### __Uncertainty__

Which part of your formulation feels least certain, and why?

The AI should adapt the question to what the user has actually written.

# __24. Critical-Thinking Interaction__

The core interaction is:

AI QUESTION

↓

USER RESPONSE

↓

SAVE RESPONSE

↓

AI CHOICE

The AI then displays:

__Do you want to update the conceptualisation or continue with the questions?__

Actions:

### __Update my conceptualisation__

### __Continue with questions__

# __25. Update Flow__

If the user selects:

__Update my conceptualisation__

the system returns them to the relevant conceptualisation section.

The existing conceptualisation remains visible.

The user edits it.

The system creates a new conceptualisation version.

Example:

Version 1

↓

Critical-thinking question

↓

User response

↓

Update

↓

Version 2

The previous version must not be overwritten.

After updating, the user returns to the critical-thinking flow.

The AI's next question should use the __updated conceptualisation__.

# __26. Continue Flow__

If the user selects:

__Continue with questions__

the AI generates the next question.

The next question should consider:

- Case
- Modality
- Current conceptualisation
- Previous questions
- Previous responses
- Any conceptualisation changes

Questions should not unnecessarily repeat previous questions.

# __27. Critical-Thinking Categories__

The AI should internally classify questions into categories.

V1 categories:

EVIDENCE

MISSING\_INFORMATION

ASSUMPTIONS

ALTERNATIVE\_HYPOTHESIS

CASE\_FIT

INTERNAL\_CONSISTENCY

MODALITY\_FIT

UNCERTAINTY

CONTEXT

MAINTAINING\_FACTORS

The system should track which categories have already been explored.

This can help prevent repetitive questioning.

# __28. Critical-Thinking Stopping Logic__

The therapist should remain in control of when to stop.

V1 should support:

### __Continue__

Ask another question.

### __Update__

Return to conceptualisation.

### __I'm done__

End the critical-thinking stage.

A configurable minimum number of questions can be implemented if needed, but the therapist should not be forced through an unnecessarily long sequence.

# __29. Critical-Thinking Session Data Model__

CriticalThinkingSession

- session\_id

- conceptualisation\_id

- started\_at

- completed\_at

- status

Each interaction:

QuestionInteraction

- interaction\_id

- session\_id

- question

- question\_category

- user\_response

- conceptualisation\_version

- user\_action

- created\_at

Where:

user\_action =

UPDATE\_CONCEPTUALISATION

CONTINUE

END\_SESSION

# __30. AI Safety Constraints__

The AI must not:

- Generate a diagnosis
- Recommend treatment
- Recommend an intervention
- Generate a clinical formulation for the user
- Tell the therapist what the "correct" formulation is
- Grade the therapist
- Assign a competency score
- State that the user's conceptualisation is right/wrong
- Present itself as a supervisor
- Provide clinical consultation
- Encourage use of the exercise as a substitute for supervision

### __Preferred language__

Use:

"What evidence supports..."

"What else might explain..."

"What information is missing..."

"How confident are you in this hypothesis?"

Avoid:

"The client has..."

"The correct formulation is..."

"You should..."

"You have missed..."

# __31. AI Output Validation__

AI-generated prompts should pass through a validation layer before being shown.

Validation checks should identify:

- Diagnostic assertions
- Treatment advice
- Clinical directives
- Certainty claims
- Evaluation of therapist competence
- Generation of alternative formulations on behalf of the user
- Safety-critical instructions

If an output fails validation:

1. Do not display it.
2. Regenerate using a stricter prompt.
3. If regeneration fails, display a safe fallback prompt from the approved prompt library.

# __32. AI Failure Handling__

If the AI is unavailable:

The exercise should not become unusable.

The system can fall back to predefined questions such as:

What evidence supports this part of your conceptualisation?

What information might challenge this hypothesis?

What alternative explanation could you consider?

This ensures the core product does not depend entirely on AI availability.

# __33. Peer Learning__

After completing critical thinking, users can choose:

### __Share with my peer group__

or

### __Keep private__

Peer sharing is optional.

# __34. Peer Group Model__

Users choose their own peer group.

No automatic matching is required for V1.

PeerGroup

- group\_id

- name

- created\_at

- status

PeerGroupMember

- group\_id

- user\_id

- role

- joined\_at

# __35. Peer Group Permissions__

Only members of a peer group can see submissions shared with that group.

A submission should never be publicly accessible.

Permissions:

Owner

↓

Can create/edit/delete own submission

Group members

↓

Can view shared submission

Can comment

Non-members

↓

Cannot view

# __36. Peer Submission__

PeerSubmission

- submission\_id

- conceptualisation\_id

- user\_id

- group\_id

- case\_id

- modality

- shared\_content

- created\_at

- status

The submission should be clearly labelled:

__Hypothetical case — shared for learning and peer discussion__

# __37. Peer Feedback__

Peers provide __free-form comments__.

V1 does not require:

- Ratings
- Scores
- Rubrics
- Likes
- Upvotes
- "Correct/incorrect" labels

The purpose is discussion and perspective-taking.

# __38. Peer Feedback Guidelines__

Before commenting, users should be reminded:

Give feedback as a peer perspective rather than as definitive clinical advice. Focus on the reasoning and evidence in the conceptualisation.

Peers should not:

- Diagnose
- Prescribe treatment
- Present their interpretation as the only correct answer
- Request real-client information

# __39. Peer Comment Data Model__

PeerComment

- comment\_id

- submission\_id

- user\_id

- body

- created\_at

- updated\_at

- status

# __40. Moderation__

V1 requires basic moderation.

Users can:

__Report comment__

Report reasons may include:

- Inappropriate content
- Harassment
- Clinical misinformation
- Privacy violation
- Other

Administrators can:

- View reports
- Remove comments
- Restrict users
- Resolve reports

# __41. Revision After Peer Feedback__

Once the user has received peer feedback, they can revise their conceptualisation.

The original conceptualisation remains unchanged.

The user creates a new version.

Initial Conceptualisation

↓

Peer Feedback

↓

Revised Conceptualisation

The user should be able to see the feedback alongside the conceptualisation while revising.

# __42. Revision Interface__

Desktop layout:

__Left:__ Peer feedback

__Right:__ Conceptualisation

The user can edit the conceptualisation while reviewing comments.

After saving:

__Conceptualisation revised__

# __43. Final Reflection__

After revision, the user completes a reflection.

Suggested questions:

1. What changed in your conceptualisation?
2. What influenced the change?
3. What did you learn from the process?
4. What would you pay attention to in your next conceptualisation?

The exact number of questions can be configurable.

# __44. Completion__

A case is marked complete when:

- Conceptualisation completed
- Critical-thinking stage completed
- Reflection completed

Peer sharing is optional and therefore should __not__ be required for case completion.

# __45. Learning Record__

LearningRecord

- learning\_record\_id

- user\_id

- case\_id

- modality\_id

- conceptualisation\_id

- critical\_thinking\_session\_id

- peer\_submission\_id

- reflection

- completed\_at

The record allows the therapist to revisit previous practice.

# __46. Learning History__

The user can see:

- Cases completed
- Cases in progress
- Modality used
- Date completed
- Whether peer feedback was received
- Whether the conceptualisation was revised

The system should not display a clinical competency score.

# __47. Case Content Model__

Cases should be stored as structured objects.

Case

- case\_id

- title

- description

- difficulty

- clinical\_themes\[\]

- available\_modalities\[\]

- vignette

- scenarios\[\]

- estimated\_time

- status

- version

- created\_at

- updated\_at

# __48. Scenario Content Model__

Scenario

- scenario\_id

- case\_id

- sequence

- title

- context

- dialogue\[\]

- additional\_information

Each dialogue element:

Dialogue

- speaker

- text

- sequence

# __49. Modality Content Model__

Modality

- modality\_id

- name

- description

- version

- status

Template:

ConceptualisationTemplate

- template\_id

- modality\_id

- version

- sections\[\]

Section:

TemplateSection

- section\_id

- title

- description

- guidance

- field\_type

- required

- order

This makes adding future modalities possible without changing the core application architecture.

# __50. Content Management System__

Administrators should be able to create and edit:

### __Cases__

- Vignettes
- Scenarios
- Themes
- Difficulty
- Modalities
- Status

### __Conceptualisation templates__

- Sections
- Prompts
- Guidance
- Required/optional status

### __Reflection prompts__

### __AI prompt categories__

### __Safety rules__

Content changes should be versioned.

# __51. Content Review Workflow__

Clinical educational content should not go directly from draft to public release.

Suggested workflow:

DRAFT

↓

CLINICAL REVIEW

↓

EDIT

↓

APPROVED

↓

PUBLISHED

Cases and modality templates should be reviewed by appropriately trained subject-matter experts.

# __52. User Roles__

## __Learner__

Can:

- Complete cases
- Create conceptualisations
- Use critical-thinking prompts
- Join peer groups
- Share conceptualisations
- Comment
- Revise
- Reflect
- Report content

## __Content Administrator__

Can:

- Create/edit cases
- Create/edit scenarios
- Manage templates
- Manage prompt configurations
- Publish/unpublish content

## __Moderator__

Can:

- Review reports
- Remove inappropriate comments
- Manage community violations

## __System Administrator__

Can:

- Manage users
- Manage permissions
- Configure platform settings
- Access system analytics

# __53. Privacy and Data Protection__

The platform should follow data minimisation principles.

### __The system should not require:__

- Real client names
- Client contact information
- Medical records
- Identifiable clinical notes
- Real therapy session transcripts

### __Safety messaging__

At relevant points, remind users:

__Use hypothetical cases only. Do not enter identifiable information about real clients.__

Peer submissions must be visible only to the selected peer group.

# __54. Authentication and Authorisation__

V1 requires:

- Account creation
- Login
- Logout
- Password reset
- Session management

Authorisation must be enforced server-side.

The frontend must never be trusted to enforce peer-group privacy.

# __55. Data Security Requirements__

At minimum:

- Encryption in transit
- Encryption at rest where supported
- Secure authentication
- Server-side authorisation
- Role-based access control
- Audit logging for administrative actions
- Secure handling of AI requests
- No exposure of private peer submissions through public URLs

# __56. AI Data Handling__

The product architecture must explicitly define what information is sent to the AI provider.

Potential AI payload:

Case information

\+

Selected modality

\+

Current conceptualisation

\+

Previous critical-thinking interaction

Only the information necessary to generate the question should be sent.

No real-client information should be permitted.

AI provider data retention and training policies should be reviewed before implementation.

# __57. AI Prompt Architecture__

The AI should receive a structured instruction similar to:

ROLE:

You are a reflective learning facilitator for therapist case

conceptualisation practice.

TASK:

Ask the therapist one question that helps them critically

examine their conceptualisation.

DO NOT:

- formulate the case for them

- diagnose

- recommend treatment

- evaluate their competence

- tell them whether they are correct

- provide clinical advice

- act as a supervisor

FOCUS:

Use evidence, assumptions, missing information, alternative

hypotheses, case fit, modality fit, uncertainty and internal

consistency.

OUTPUT:

One concise question only.

The actual production prompt should be developed and tested separately.

# __58. AI Context Management__

The AI needs enough context to make the next question meaningful.

Context should include:

Case summary

Selected modality

Current conceptualisation

Current conceptualisation version

Previous questions

Previous user responses

Question categories already explored

The system should avoid sending unnecessary historical data.

# __59. AI Question Quality Requirements__

Questions should be:

- Specific to the case
- Specific to the user's conceptualisation
- Open-ended
- Non-judgemental
- Hypothesis-oriented
- Clinically educational
- Concise
- Appropriate to the selected modality

Avoid generic repetition.

Bad:

What else do you think?

Better:

What evidence would help you distinguish between avoidance driven by fear of evaluation and avoidance driven by low mood?

# __60. AI Prompt Diversity__

The system should prevent repeated questioning within a session.

For example, if the user has already explored evidence extensively, subsequent questions could explore:

- Alternative hypotheses
- Missing information
- Modality fit
- Internal consistency
- Uncertainty

This should not become a rigid checklist; the AI should still prioritise what is most useful given the user's actual responses.

# __61. AI Fallback__

If AI generation fails:

Use a vetted question from the prompt library.

Example fallback:

What information in the case most strongly supports this part of your conceptualisation?

The user should not see a technical error unless the system cannot continue.

# __62. Notifications__

V1 should keep notifications minimal.

Potential notifications:

- Peer feedback received
- Someone commented on your shared conceptualisation

Email notifications can be considered optional for V1.

# __63. Analytics__

Track product events such as:

account\_created

case\_started

case\_completed

scenario\_viewed

modality\_selected

conceptualisation\_started

conceptualisation\_submitted

critical\_thinking\_started

question\_generated

question\_answered

conceptualisation\_updated

critical\_thinking\_completed

peer\_group\_joined

submission\_shared

peer\_comment\_created

peer\_feedback\_received

revision\_started

revision\_completed

reflection\_completed

learning\_record\_completed

# __64. Success Metrics__

## __Primary product outcome__

Users improve their case conceptualisation skills through repeated practice.

This should ultimately be evaluated through research or expert assessment rather than AI scoring.

Potential dimensions:

### __Completeness__

Does the conceptualisation meaningfully incorporate relevant case information?

### __Case fit__

Does it fit the information presented?

### __Clinical reasoning__

Does the therapist distinguish evidence from assumptions?

### __Modality coherence__

Does the formulation meaningfully use the selected framework?

### __Critical thinking__

Does the therapist recognise uncertainty, missing information, and alternatives?

# __65. Product Engagement Metrics__

Monitor:

- First-case completion
- Repeat case completion
- Cases per active user
- Critical-thinking completion
- Conceptualisation revision rate
- Reflection completion
- Peer sharing rate
- Peer feedback rate
- Return rate

# __66. Peer Learning Metrics__

Track:

- Percentage of shared submissions receiving comments
- Average time to first comment
- Percentage of users giving feedback
- Percentage receiving feedback
- Number of comments per shared submission
- Percentage revising after feedback

A healthy peer-learning loop should eventually look like:

__Share → Receive feedback → Revise__

rather than simply:

__Share → Receive nothing__

# __67. Learning Metrics__

Future research should compare conceptualisations over time.

Potential study design:

### __Baseline__

Expert-rated conceptualisation before repeated practice.

### __Intervention__

Multiple practice cases.

### __Follow-up__

Expert-rated conceptualisation after repeated practice.

Possible outcome:

__Change in conceptualisation quality over time.__

This is preferable to treating AI-generated scores as evidence of learning.

# __68. Performance Requirements__

V1 should feel responsive during ordinary interactions.

Target:

- Standard page transitions: <2 seconds where technically feasible
- Autosave: near-real-time
- AI question generation: ideally <10 seconds
- Peer comments: appear without requiring full page reload where feasible

AI latency should be handled gracefully with:

Thinking through your next question…

rather than leaving the user uncertain whether the system is working.

# __69. Reliability Requirements__

If AI is unavailable:

- Users should still be able to access cases
- Users should still be able to edit conceptualisations
- Saved work must remain accessible
- Fallback questions should be available

The AI should be an enhancement to the learning workflow, not a single point of failure.

# __70. Accessibility__

V1 should support:

- Keyboard navigation
- Screen-reader-compatible controls
- Sufficient text contrast
- Clear focus states
- Descriptive labels
- Accessible form fields
- Avoidance of colour-only status indicators
- Responsive design

Long conceptualisation fields should support comfortable reading and writing.

# __71. Mobile / Responsive Design__

V1 should be responsive on:

- Desktop
- Tablet
- Mobile browser

A native mobile app is not required.

For desktop, the critical-thinking interface should ideally support:

__Conceptualisation | AI question__

side-by-side.

On mobile:

__View conceptualisation__

can open the formulation without leaving the question flow.

# __72. Versioning Requirements__

The following must be versioned:

- Cases
- Scenarios
- Modality templates
- Conceptualisations
- AI prompt configurations

If a case is updated after a user completes it, the user's completed learning record must retain the version of the case they actually used.

# __73. Error States__

The system should handle:

### __Lost connection__

Your connection was interrupted. Your latest saved work is safe.

### __AI unavailable__

We couldn't generate the next question right now. Here's a reflection question to continue your practice.

### __Peer group unavailable__

Your peer group is temporarily unavailable. Your conceptualisation remains saved.

### __Autosave failure__

The interface should clearly indicate that changes have not been saved.

# __74. V1 Scope__

## __IN__

### __Learning__

- Hypothetical cases
- Written vignettes
- Interactive scenarios
- CBT
- DBT
- Modality-specific templates
- Iterative critical-thinking questions
- Conceptualisation revision during questioning
- Optional peer sharing
- User-selected peer groups
- Free-form peer feedback
- Post-feedback revision
- Final reflection
- Learning history

### __AI__

- One question at a time
- Context-sensitive questions
- Reflective questions
- Critical-thinking questions
- Fallback prompt library
- Safety validation

### __Community__

- Peer groups
- Private group submissions
- Comments
- Reporting
- Basic moderation

### __Administration__

- Case CMS
- Scenario CMS
- Modality templates
- Prompt configuration
- User management
- Moderation

# __75. V1 OUT__

The following should not be built initially:

- AI-generated conceptualisations
- AI grading
- AI competency scores
- Diagnostic tools
- Treatment recommendations
- AI supervision
- Real-client case storage
- EHR integration
- Clinical documentation
- Live supervision
- Automated peer matching
- Public social feed
- Leaderboards
- Gamified therapist rankings
- Native iOS app
- Native Android app
- Additional modalities
- Advanced adaptive branching
- Expert marketplace
- Paid supervision
- Continuing education accreditation

# __76. Future Modality Architecture__

The system should be designed so future modalities are content additions rather than fundamental engineering changes.

Future possibilities:

- ACT
- MBT
- Schema Therapy
- Psychodynamic
- Narrative
- Systemic/Family Therapy

Each should be represented as:

Modality

↓

Conceptualisation Template

↓

Prompt Configuration

↓

Case Applicability

The core case workflow should remain unchanged.

# __77. Future Product Extensions__

Potential future features:

### __Advanced cases__

- Branching cases
- Audio
- Video
- Longitudinal cases
- Multi-session cases

### __Peer learning__

- Facilitated groups
- Structured peer review
- Expert review
- Cohort-based practice

### __Learning science__

- Skill progression
- Personalised case difficulty
- Deliberate-practice pathways
- Research-based learning analytics

### __Additional modalities__

Can be added without changing the fundamental architecture.

# __78. Key Acceptance Criteria__

V1 should not be considered complete unless all of the following work:

### __Case experience__

- User can select a case.
- User can read the vignette.
- User can complete interactive scenarios.
- User can revisit case information.

### __Conceptualisation__

- User can select CBT or DBT.
- Correct template loads.
- User can save a draft.
- User can submit a conceptualisation.
- User's work is not lost.

### __AI__

- AI asks one question at a time.
- Question incorporates relevant case/formulation context.
- User can respond.
- Response is saved.
- AI asks:  
__"Do you want to update the conceptualisation or continue with the questions?"__
- User can update.
- Updated formulation creates a new version.
- User can continue without updating.
- AI uses the latest conceptualisation for subsequent questions.
- AI does not provide clinical advice or grading.
- Fallback prompts work when AI is unavailable.

### __Peer learning__

- User can choose a peer group.
- User can share a conceptualisation.
- Only that peer group can view it.
- Peers can comment.
- Users can report comments.

### __Revision__

- User can review peer feedback.
- User can revise their conceptualisation.
- Original version remains preserved.

### __Reflection__

- User can complete final reflection.
- Case is marked complete.

### __Safety__

- Users are warned not to enter real client information.
- AI is constrained from acting as a clinical authority.
- Peer feedback is clearly framed as peer learning.
- Server-side permissions protect peer submissions.

# __79. Definition of Done for the Learning Loop__

The most important V1 acceptance test is:

A new user should be able to go from:

__"I want to practise"__

to:

__"I have completed and reflected on a strengthened conceptualisation"__

without requiring human intervention from the product team.

The complete flow should be:

START

 ↓

CASE

 ↓

VIGNETTE

 ↓

SCENARIOS

 ↓

SELECT CBT/DBT

 ↓

CONCEPTUALISE

 ↓

AI QUESTION

 ↓

RESPOND

 ↓

UPDATE OR CONTINUE

 ↓

\[REPEAT\]

 ↓

FINISH CRITICAL THINKING

 ↓

OPTIONAL PEER SHARING

 ↓

PEER FEEDBACK

 ↓

REVISE

 ↓

REFLECT

 ↓

COMPLETE

# __80. Core Product Boundary__

The most important requirement in this PRD is not technical.

It is a __clinical product boundary__:

__The product should make therapists better at thinking, rather than make the thinking unnecessary.__

The therapist creates the conceptualisation.

The AI asks questions that help the therapist interrogate it.

The therapist decides whether and how to revise it.

Peers offer additional perspectives.

The therapist decides what to take from those perspectives.

The final conceptualisation remains the therapist's own clinical reasoning.

The platform therefore functions as a __deliberate-practice environment for case conceptualisation__, not an automated clinical reasoning or supervision system.

Tech stack 

__Frontend \+ app framework__

__Next.js \+ React \+ TypeScript__

Entire web application

__UI__

__Tailwind CSS \+ shadcn/ui__

Fast, polished, accessible interface

__Hosting / deployment__

__Vercel__

Hosts the Next.js application and deployment pipeline

__Database__

__Supabase PostgreSQL__

Users, cases, conceptualisations, peer groups, comments, etc.

__Authentication__

__Supabase Auth__

Login, signup, sessions

__Backend/API__

__Next.js server-side functions / Route Handlers__

Business logic and secure API calls

__AI — case generation__

__Anthropic Claude Haiku__

Generates hypothetical cases and scenarios

__AI — critical-thinking prompts__

__Anthropic Claude Haiku__

Generates contextual reflective/critical-thinking questions

__AI — secondary/fast inference__

__Groq__

Fast AI inference where useful

__File/storage__

__Supabase Storage__

Only if we eventually need files/assets

__Analytics__

__PostHog__

Product usage and learning-flow analytics

__Error monitoring__

__Sentry__

Application/AI error monitoring

__Version control__

__GitHub__

Source control \+ collaboration

__Deployment__

__Vercel \+ GitHub__

Automatic deployments from the repository

