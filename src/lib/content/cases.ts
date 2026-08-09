import type { ModalityId } from "@/lib/db/types";

/**
 * The case library.
 *
 * Every case here is hypothetical and composed for practice. None describes a
 * real person. Cases are versioned: a completed learning record stores the
 * version the therapist actually worked from, so later content edits never
 * rewrite someone's history.
 *
 * `reviewStatus` is deliberately explicit. The PRDs require that all case
 * material is reviewed by appropriately trained CBT/DBT clinicians before
 * release; until that review happens the app says so on screen rather than
 * implying an authority the content does not yet have.
 */

export type Difficulty = "Foundational" | "Intermediate" | "Advanced";

export type ReviewStatus =
  | "draft_pending_clinical_review"
  | "clinically_reviewed"
  | "published";

export interface VignetteSection {
  id: string;
  title: string;
  /** Paragraphs. Rendered as separate <p> elements. */
  body: string[];
}

export interface DialogueLine {
  speaker: "Therapist" | "Client";
  text: string;
}

export interface Scenario {
  id: string;
  sequence: number;
  title: string;
  /** One line of framing before the exchange. */
  context: string;
  dialogue: DialogueLine[];
  /** What this exchange adds that the vignette did not contain. */
  additionalInformation: string;
}

export interface ClinicalCase {
  id: string;
  version: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  themes: string[];
  availableModalities: ModalityId[];
  estimatedMinutes: number;
  reviewStatus: ReviewStatus;
  /** Shown above the vignette when the material warrants extra framing. */
  contentNote?: string;
  vignette: VignetteSection[];
  scenarios: Scenario[];
}

export const CASES: ClinicalCase[] = [
  {
    id: "avoided-presentation",
    version: 1,
    title: "The Avoided Presentation",
    description:
      "A junior analyst has withdrawn from anything client-facing after a presentation she believes went badly.",
    difficulty: "Intermediate",
    themes: ["anxiety", "avoidance", "self-criticism"],
    availableModalities: ["cbt", "dbt"],
    estimatedMinutes: 30,
    reviewStatus: "draft_pending_clinical_review",
    vignette: [
      {
        id: "background",
        title: "Client background",
        body: [
          "Nadia is 27, works as an analyst at a mid-sized consultancy, and has been in the role for two years. She lives alone and describes a small, stable friendship group she has known since university.",
          "She was referred by her GP after presenting with difficulty sleeping and what she called \"work stress that isn't going away\". This is her first experience of therapy.",
        ],
      },
      {
        id: "presenting",
        title: "Presenting concerns",
        body: [
          "Nadia describes a presentation to a client six months ago during which she lost her place in her notes and paused for what she estimates was \"nearly a minute\". Since then she has declined three opportunities to present and has asked a colleague to take her place on a fourth.",
          "She reports lying awake replaying the pause. She describes checking her slides repeatedly the night before any meeting, sometimes until 2am, and rehearsing openings aloud.",
          "She says her manager has been \"fine about it\", which she reports as evidence that he has \"written her off as the person who does the spreadsheets\".",
        ],
      },
      {
        id: "history",
        title: "Relevant history",
        body: [
          "Nadia describes her mother as \"exacting\" and recalls schoolwork being corrected in red pen at the kitchen table. She reports being told she was capable but did not apply herself.",
          "She was academically successful and describes always having felt she was \"one bad result from being found out\". No previous mental health contact. No current medication.",
        ],
      },
      {
        id: "context",
        title: "Current circumstances",
        body: [
          "A promotion round opens in four months. Nadia says she wants it and simultaneously that she \"obviously won't get it now\".",
          "She has begun eating lunch at her desk rather than in the shared kitchen, and describes weekends as \"recovering\".",
        ],
      },
    ],
    scenarios: [
      {
        id: "s1",
        sequence: 1,
        title: "Turning down the fourth presentation",
        context: "Session two. The therapist asks about the most recent decision to decline.",
        dialogue: [
          {
            speaker: "Therapist",
            text: "You mentioned you asked Dev to take the Thursday slot. What was happening for you when the invitation came through?",
          },
          {
            speaker: "Client",
            text: "I read the email and my chest went tight. I thought, I can't do this one, not with the regional director there.",
          },
          {
            speaker: "Therapist",
            text: "And once you'd asked Dev?",
          },
          {
            speaker: "Client",
            text: "Relief. Genuinely, for about an hour I felt fine. Then I spent the evening thinking about how he'll be the one they remember.",
          },
        ],
        additionalInformation:
          "The avoidance is immediately relieving and later costly — the short-term and long-term consequences point in opposite directions.",
      },
      {
        id: "s2",
        sequence: 2,
        title: "What she believes the pause meant",
        context: "Session three. The therapist returns to the original presentation.",
        dialogue: [
          {
            speaker: "Therapist",
            text: "When you picture that pause now, what goes through your mind?",
          },
          {
            speaker: "Client",
            text: "That everyone in the room saw exactly what I am. Someone who's been getting away with it.",
          },
          {
            speaker: "Therapist",
            text: "Has anyone said anything to you about that meeting since?",
          },
          {
            speaker: "Client",
            text: "No. Which is worse, isn't it? People don't mention things when they're being kind about them.",
          },
        ],
        additionalInformation:
          "Disconfirming evidence is being reinterpreted as confirming. Worth noticing what would count as evidence against the belief at all.",
      },
      {
        id: "s3",
        sequence: 3,
        title: "The night before",
        context: "Session four. The therapist asks about preparation.",
        dialogue: [
          {
            speaker: "Therapist",
            text: "Walk me through the night before a meeting you can't get out of.",
          },
          {
            speaker: "Client",
            text: "I go through the deck. Then I go through it again in case I missed something. I write out the first two minutes word for word and say it out loud.",
          },
          {
            speaker: "Therapist",
            text: "Does it help?",
          },
          {
            speaker: "Client",
            text: "It must do. The ones I prepare like that go fine. That's sort of the problem — I can't stop, because what if that's the reason.",
          },
        ],
        additionalInformation:
          "Over-preparation is functioning as a safety behaviour: success is attributed to the ritual, so the underlying prediction is never tested.",
      },
    ],
  },

  {
    id: "argument-and-aftermath",
    version: 1,
    title: "The Argument and the Aftermath",
    description:
      "A client describes a recurring escalation with his partner and the hours of self-recrimination that follow.",
    difficulty: "Intermediate",
    themes: ["emotion dysregulation", "interpersonal difficulties", "shame"],
    availableModalities: ["dbt", "cbt"],
    estimatedMinutes: 35,
    reviewStatus: "draft_pending_clinical_review",
    vignette: [
      {
        id: "background",
        title: "Client background",
        body: [
          "Tomas is 34 and works shifts as a paramedic. He has been with his partner, Iris, for five years; they live together and have no children.",
          "He self-referred after what he describes as \"the same argument for the fourth time\".",
        ],
      },
      {
        id: "presenting",
        title: "Presenting concerns",
        body: [
          "Tomas describes arguments that escalate quickly — raised voice, leaving the flat, sometimes driving for an hour before coming back. He is clear that there has been no physical aggression and that this matters to him.",
          "Afterwards he describes several hours of what he calls \"the spiral\": going over what he said, apologising repeatedly, and at times sleeping on the sofa \"because it feels like what I deserve\".",
          "He reports that Iris has said the apologies are becoming harder to be on the receiving end of than the arguments.",
        ],
      },
      {
        id: "history",
        title: "Relevant history",
        body: [
          "Tomas describes a childhood home where \"nobody shouted, ever\". He recalls being sent to his room to \"come back when you're calm\" and remembers this as the standard response to any visible distress.",
          "He describes himself as having always felt things \"at a higher volume than other people\" and says he learned early that this was something to manage privately.",
        ],
      },
      {
        id: "context",
        title: "Current circumstances",
        body: [
          "He has been on nights for three of the last four weeks. He notes, unprompted, that the arguments \"are always after a run of nights\", then immediately says he does not want that to sound like an excuse.",
        ],
      },
    ],
    scenarios: [
      {
        id: "s1",
        sequence: 1,
        title: "The most recent argument",
        context: "Session two. Beginning a chain analysis of Tuesday evening.",
        dialogue: [
          {
            speaker: "Therapist",
            text: "Take me to just before it started. Where were you, what was happening?",
          },
          {
            speaker: "Client",
            text: "Kitchen. I'd been up since four. She asked whether I'd called the letting agent and I hadn't.",
          },
          {
            speaker: "Therapist",
            text: "What happened in you, right at that moment?",
          },
          {
            speaker: "Client",
            text: "Instantly hot. Like — before she'd finished the sentence. And the thought was, she thinks I'm useless.",
          },
        ],
        additionalInformation:
          "A specific prompting event, a physiological response that precedes the appraisal, and a vulnerability factor already in place.",
      },
      {
        id: "s2",
        sequence: 2,
        title: "What the leaving does",
        context: "Session three. The therapist asks about driving off.",
        dialogue: [
          {
            speaker: "Therapist",
            text: "You said you drove for about an hour. What's that hour like?",
          },
          {
            speaker: "Client",
            text: "The first twenty minutes it just drains out of me. Genuinely, it works — I can feel it going.",
          },
          {
            speaker: "Therapist",
            text: "And after the twenty minutes?",
          },
          {
            speaker: "Client",
            text: "That's when it starts. What I said, her face. By the time I'm home I've decided I'm the problem in this relationship.",
          },
        ],
        additionalInformation:
          "The behaviour is immediately effective at reducing arousal, which is what makes it durable. The cost lands later and elsewhere.",
      },
      {
        id: "s3",
        sequence: 3,
        title: "On the apologies",
        context: "Session four. The therapist asks about Iris's feedback.",
        dialogue: [
          {
            speaker: "Therapist",
            text: "Iris said the apologising is hard to be on the other side of. What did you make of that?",
          },
          {
            speaker: "Client",
            text: "That she's right and that I'm now failing at apologising too.",
          },
          {
            speaker: "Therapist",
            text: "What would it be like to say sorry once and then stop?",
          },
          {
            speaker: "Client",
            text: "Unbearable, honestly. If I stop I have to just sit there with it.",
          },
        ],
        additionalInformation:
          "The repeated apology appears to function as escape from an internal state rather than as repair directed at the other person.",
      },
    ],
  },

  {
    id: "quiet-withdrawal",
    version: 1,
    title: "Quiet Withdrawal",
    description:
      "Six months after a redundancy, a client's world has narrowed to the flat, and getting going feels impossible.",
    difficulty: "Foundational",
    themes: ["depression", "behavioural withdrawal", "loss of role"],
    availableModalities: ["cbt"],
    estimatedMinutes: 25,
    reviewStatus: "draft_pending_clinical_review",
    vignette: [
      {
        id: "background",
        title: "Client background",
        body: [
          "Ray is 52 and was a warehouse team leader for nineteen years until the site closed. He lives with his wife; their two children are adults and live elsewhere.",
          "His wife encouraged the referral. He describes himself as attending \"mostly so she stops worrying\".",
        ],
      },
      {
        id: "presenting",
        title: "Presenting concerns",
        body: [
          "Ray describes waking at five out of habit and then staying in bed until eleven. He reports that days \"go somewhere\" without his being able to say where.",
          "He has stopped going to the Sunday football he attended for eleven years, and no longer answers calls from two former colleagues. He says he has nothing to report to them.",
          "He describes the effort of starting anything as \"like the handbrake's on\", and says that on the rare days he does more, he pays for it the next day.",
        ],
      },
      {
        id: "history",
        title: "Relevant history",
        body: [
          "No prior contact with mental health services. Ray describes his father as \"a grafter\" who worked until his heart attack at 60, and says being the earner is \"just what I did\".",
          "He denies current thoughts of ending his life and says he would tell his wife if that changed. He described this straightforwardly and without hesitation when asked.",
        ],
      },
      {
        id: "context",
        title: "Current circumstances",
        body: [
          "Redundancy money covers roughly four more months. His wife has increased her hours. He says this is the part he finds hardest to talk about.",
        ],
      },
    ],
    scenarios: [
      {
        id: "s1",
        sequence: 1,
        title: "A day last week",
        context: "Session two. The therapist asks for a specific day rather than a typical one.",
        dialogue: [
          {
            speaker: "Therapist",
            text: "Can you take me through Wednesday? Not a typical day — that Wednesday.",
          },
          {
            speaker: "Client",
            text: "Got up about eleven. Made a coffee. Meant to sort the shed out. Sat down first and that was that, really.",
          },
          {
            speaker: "Therapist",
            text: "What was going through your mind sitting there?",
          },
          {
            speaker: "Client",
            text: "That there's no point starting it because I'd only get halfway. And then that I used to run a team of thirty.",
          },
        ],
        additionalInformation:
          "The prediction about outcome arrives before the attempt, and the comparison to his previous role follows the inactivity rather than preceding it.",
      },
      {
        id: "s2",
        sequence: 2,
        title: "The Sunday football",
        context: "Session three. The therapist asks about the things that have dropped away.",
        dialogue: [
          {
            speaker: "Therapist",
            text: "You went to that football for eleven years. What happens when Sunday comes round now?",
          },
          {
            speaker: "Client",
            text: "I think about going. Then I think, they'll ask what I'm doing with myself.",
          },
          {
            speaker: "Therapist",
            text: "And if they did ask?",
          },
          {
            speaker: "Client",
            text: "I'd have to say nothing, wouldn't I. Easier to watch it at home. Doesn't feel like much of a Sunday though.",
          },
        ],
        additionalInformation:
          "Anticipated exposure is doing the work here. Avoiding it removes a long-standing source of reinforcement.",
      },
    ],
  },

  {
    id: "two-worlds",
    version: 1,
    title: "Two Worlds",
    description:
      "A postgraduate student describes managing very different versions of herself at home and at university, and the cost of the switching.",
    difficulty: "Advanced",
    themes: ["identity", "contextual stressors", "anxiety", "family"],
    availableModalities: ["cbt", "dbt"],
    estimatedMinutes: 40,
    reviewStatus: "draft_pending_clinical_review",
    contentNote:
      "This case involves family conflict around cultural and generational expectations. It is written as a formulation exercise, not as a template for any particular community.",
    vignette: [
      {
        id: "background",
        title: "Client background",
        body: [
          "Priya is 24 and in the first year of a research master's. She lives at home with her parents and a younger brother, an hour from campus.",
          "She was referred by the university wellbeing service after disclosing panic symptoms before a supervision meeting.",
        ],
      },
      {
        id: "presenting",
        title: "Presenting concerns",
        body: [
          "Priya describes episodes of breathlessness and a racing heart, usually on the train home rather than at university. She has twice got off two stops early and walked.",
          "She describes \"switching\" between contexts and says the switch itself has become harder over the past year. She reports lying to both sides — to her parents about how much she is at the department, and to her supervisor about why she cannot attend evening seminars.",
          "She says that neither lie feels like her, and that she cannot see which one to stop.",
        ],
      },
      {
        id: "history",
        title: "Relevant history",
        body: [
          "Priya describes her parents as loving and describes their expectations as \"not negotiable rather than unkind\". Her older sister left home at 22 after a period of conflict; Priya describes the year that followed as \"the house being very quiet\".",
          "She recalls being praised, throughout school, specifically for being the one who did not cause trouble.",
        ],
      },
      {
        id: "context",
        title: "Current circumstances",
        body: [
          "Her supervisor has suggested she apply for a funded PhD, which would mean relocating. The deadline is in seven weeks. She has not told her parents the opportunity exists.",
        ],
      },
    ],
    scenarios: [
      {
        id: "s1",
        sequence: 1,
        title: "On the train",
        context: "Session two. The therapist asks about the panic episodes.",
        dialogue: [
          {
            speaker: "Therapist",
            text: "You said it tends to be on the way home rather than at university. What's happening in that window?",
          },
          {
            speaker: "Client",
            text: "It's about twenty minutes out. I start going through what I'll say I did today.",
          },
          {
            speaker: "Therapist",
            text: "Rehearsing it.",
          },
          {
            speaker: "Client",
            text: "Editing it. Taking bits out. And somewhere in there my chest goes and I think I'm going to be sick.",
          },
        ],
        additionalInformation:
          "The symptoms are anchored to the transition between contexts, not to either context on its own.",
      },
      {
        id: "s2",
        sequence: 2,
        title: "The sister",
        context: "Session three. The therapist asks about the family history of leaving.",
        dialogue: [
          {
            speaker: "Therapist",
            text: "You mentioned your sister left at 22. What did you take from how that went?",
          },
          {
            speaker: "Client",
            text: "That you can do it. And that it costs everyone else something for a very long time.",
          },
          {
            speaker: "Therapist",
            text: "Everyone else.",
          },
          {
            speaker: "Client",
            text: "My mum mostly. I was fifteen. I remember deciding I wasn't going to be the second one.",
          },
        ],
        additionalInformation:
          "A rule formed at fifteen is still operating on a decision at twenty-four. Note that she describes it as a decision rather than a feeling.",
      },
      {
        id: "s3",
        sequence: 3,
        title: "The application",
        context: "Session four. Seven weeks to the deadline.",
        dialogue: [
          {
            speaker: "Therapist",
            text: "The funding deadline is seven weeks away. Where are you with it?",
          },
          {
            speaker: "Client",
            text: "I've written the personal statement. It's in a folder called 'misc'.",
          },
          {
            speaker: "Therapist",
            text: "What would need to happen for it to leave that folder?",
          },
          {
            speaker: "Client",
            text: "I'd have to know what happens after. And I can't know that, so it stays there, and then the deadline goes and it's decided itself.",
          },
        ],
        additionalInformation:
          "Not deciding is functioning as a decision, and it removes the need to tolerate the uncertainty of either outcome.",
      },
    ],
  },

  {
    id: "the-good-days",
    version: 1,
    title: "The Good Days",
    description:
      "A client with long-standing difficulties describes an unstable pattern that she and previous services have struggled to make sense of together.",
    difficulty: "Advanced",
    themes: ["complex presentation", "emotion dysregulation", "self-harm", "service history"],
    availableModalities: ["dbt"],
    estimatedMinutes: 45,
    reviewStatus: "draft_pending_clinical_review",
    contentNote:
      "This case refers to self-harm in general terms as part of the clinical picture. It contains no method detail. It is a formulation exercise; it is not guidance for managing risk in a real client, and it does not replace your service's risk procedures or your supervisor.",
    vignette: [
      {
        id: "background",
        title: "Client background",
        body: [
          "Jo is 29 and works part-time in a garden centre, a job she has held for eight months and describes as the longest she has managed. She lives in a shared house.",
          "She has had contact with services since she was nineteen, across four teams, and describes herself as \"having been passed around\".",
        ],
      },
      {
        id: "presenting",
        title: "Presenting concerns",
        body: [
          "Jo describes weeks that go well — she works her shifts, sees a friend, cooks — followed by a period she calls \"falling off\", lasting two to five days, during which she does not leave her room and has historically self-harmed.",
          "She reports that self-harm has reduced substantially over the past year but has not stopped. She is able to describe what tends to precede it and says nobody has previously asked her that in detail.",
          "She says the thing she finds hardest is that the falling off follows the good weeks, which makes the good weeks \"feel like a trick\".",
        ],
      },
      {
        id: "history",
        title: "Relevant history",
        body: [
          "Jo describes an unpredictable childhood home with periods of care and periods of neglect, and says she \"never knew which house she was coming home to\". She describes learning to read a room before entering it.",
          "She has previously been told she was \"not suitable\" for one service and \"not unwell enough\" for another. She reports both as significant.",
        ],
      },
      {
        id: "context",
        title: "Current circumstances",
        body: [
          "Her manager has offered her additional hours. She describes wanting them and being frightened of them in the same sentence.",
        ],
      },
    ],
    scenarios: [
      {
        id: "s1",
        sequence: 1,
        title: "After a good week",
        context: "Session three. The therapist asks about the sequence Jo has noticed.",
        dialogue: [
          {
            speaker: "Therapist",
            text: "You've said the difficult days tend to come after the good ones. What's the last one you can walk me through?",
          },
          {
            speaker: "Client",
            text: "Two weeks ago. Worked five shifts, went to Sam's on the Saturday. Sunday I woke up and it had gone.",
          },
          {
            speaker: "Therapist",
            text: "What had gone?",
          },
          {
            speaker: "Client",
            text: "Whatever was holding it up. And then straight away — you knew this would happen, you always do this.",
          },
        ],
        additionalInformation:
          "The appraisal of the drop arrives immediately and frames the good week as a setup. Worth separating the drop from what she makes of it.",
      },
      {
        id: "s2",
        sequence: 2,
        title: "What has changed in a year",
        context: "Session four. The therapist asks about the reduction in self-harm.",
        dialogue: [
          {
            speaker: "Therapist",
            text: "You said this has reduced a lot over the last year. What's been different?",
          },
          {
            speaker: "Client",
            text: "I've started texting Sam. Not about it — just texting her about anything.",
          },
          {
            speaker: "Therapist",
            text: "What does that do?",
          },
          {
            speaker: "Client",
            text: "Puts a gap in. Sometimes the gap's enough. Sometimes I don't text her because I've decided I'm too much and then there's no gap.",
          },
        ],
        additionalInformation:
          "A skill is already in her repertoire and is working. The failure mode is not absence of the skill but a belief that blocks its use.",
      },
      {
        id: "s3",
        sequence: 3,
        title: "The extra hours",
        context: "Session five. The therapist asks about the offer at work.",
        dialogue: [
          {
            speaker: "Therapist",
            text: "Your manager's offered you more hours. You said you want them and they frighten you.",
          },
          {
            speaker: "Client",
            text: "If I take them and I fall off, I've proved it. Right now I'm part-time, so falling off is allowed.",
          },
          {
            speaker: "Therapist",
            text: "Allowed by whom?",
          },
          {
            speaker: "Client",
            text: "Good question. Me, I suppose. Nobody's ever actually said it.",
          },
        ],
        additionalInformation:
          "Staying below capacity protects a self-concept. The constraint she describes is self-imposed and she notices this when asked.",
      },
    ],
  },

  {
    id: "sent-from-school",
    version: 1,
    title: "Sent From School",
    description:
      "A fourteen-year-old is referred after repeated incidents in class. The picture at home and the picture at school do not match.",
    difficulty: "Intermediate",
    themes: ["behavioural difficulties", "adolescent", "family", "school"],
    availableModalities: ["cbt", "dbt"],
    estimatedMinutes: 35,
    reviewStatus: "draft_pending_clinical_review",
    vignette: [
      {
        id: "background",
        title: "Client background",
        body: [
          "Callum is 14, in Year 9. He lives with his mother and two younger half-siblings. Contact with his father is irregular and has recently resumed after eighteen months.",
          "Referral came through school following three exclusions this term.",
        ],
      },
      {
        id: "presenting",
        title: "Presenting concerns",
        body: [
          "School describes Callum as disruptive, refusing instruction, and walking out of lessons. Two incidents involved shouting at a teacher; none involved another student.",
          "His mother describes a different boy at home — quiet, helpful with the younger two, and \"the first one up if the baby cries\". She says she does not recognise the reports.",
          "Callum, when asked directly, says school is \"fine\" and that teachers \"start on him\". He is monosyllabic for most of the first session and more forthcoming in the second.",
        ],
      },
      {
        id: "history",
        title: "Relevant history",
        body: [
          "Reading difficulties were flagged in Year 4. An assessment was started and, according to his mother, never completed after a change of school.",
          "No prior mental health contact. No safeguarding concerns currently open.",
        ],
      },
      {
        id: "context",
        title: "Current circumstances",
        body: [
          "The three exclusions this term have all followed lessons involving reading aloud or extended writing. Nobody at school has connected these, and it emerged only when the therapist asked which lessons.",
        ],
      },
    ],
    scenarios: [
      {
        id: "s1",
        sequence: 1,
        title: "Which lessons",
        context: "Session two. The therapist asks about the specific lessons.",
        dialogue: [
          {
            speaker: "Therapist",
            text: "The three times you've been sent out — do you remember what lesson each was?",
          },
          {
            speaker: "Client",
            text: "English twice. Humanities once.",
          },
          {
            speaker: "Therapist",
            text: "What's happening in those lessons just before?",
          },
          {
            speaker: "Client",
            text: "She goes round the room. Everyone reads a bit. You can see it coming for about ten minutes.",
          },
        ],
        additionalInformation:
          "A consistent antecedent that the referral information did not contain, and a ten-minute build-up before the behaviour.",
      },
      {
        id: "s2",
        sequence: 2,
        title: "Getting sent out",
        context: "Session three. The therapist asks about what follows.",
        dialogue: [
          {
            speaker: "Therapist",
            text: "So you get sent out. What's the next ten minutes like?",
          },
          {
            speaker: "Client",
            text: "Corridor. It's alright. Quiet.",
          },
          {
            speaker: "Therapist",
            text: "Better or worse than being in there?",
          },
          {
            speaker: "Client",
            text: "Better, obviously. Everyone thinks I mind getting sent out.",
          },
        ],
        additionalInformation:
          "The consequence the school intends as a sanction is functioning as escape, which would maintain the behaviour rather than reduce it.",
      },
      {
        id: "s3",
        sequence: 3,
        title: "His mother's account",
        context: "Session three, second half. Seen with his mother, with Callum's agreement.",
        dialogue: [
          {
            speaker: "Therapist",
            text: "You said the boy the school describes isn't one you recognise.",
          },
          {
            speaker: "Client",
            text: "He's not. He does his sister's hair for school. He's never once shouted at me.",
          },
          {
            speaker: "Therapist",
            text: "Is there anything at home he does avoid?",
          },
          {
            speaker: "Client",
            text: "Homework. But every fourteen-year-old avoids homework, don't they. I've never pushed it, if I'm honest.",
          },
        ],
        additionalInformation:
          "The behaviour is situation-specific rather than global, and the one avoided task at home shares a feature with the trigger at school.",
      },
    ],
  },
];

export const CASE_THEMES: string[] = [
  ...new Set(CASES.flatMap((clinicalCase) => clinicalCase.themes)),
].sort();

export const DIFFICULTIES: Difficulty[] = ["Foundational", "Intermediate", "Advanced"];

export function getCase(caseId: string): ClinicalCase | null {
  return CASES.find((clinicalCase) => clinicalCase.id === caseId) ?? null;
}

/** Throws when a case referenced by an exercise no longer exists. */
export function requireCase(caseId: string): ClinicalCase {
  const found = getCase(caseId);
  if (!found) throw new Error(`Unknown case: ${caseId}`);
  return found;
}

/** Plain-text rendering of the vignette, for the AI context payload. */
export function vignetteToText(clinicalCase: ClinicalCase): string {
  return clinicalCase.vignette
    .map((section) => `${section.title}\n${section.body.join("\n")}`)
    .join("\n\n");
}

/** Plain-text rendering of only the scenarios the therapist has actually opened. */
export function scenariosToText(
  clinicalCase: ClinicalCase,
  viewedIds: string[],
): string {
  const seen = new Set(viewedIds);
  const viewed = clinicalCase.scenarios.filter((scenario) => seen.has(scenario.id));
  if (!viewed.length) return "";
  return viewed
    .map((scenario) => {
      const lines = scenario.dialogue
        .map((line) => `${line.speaker}: ${line.text}`)
        .join("\n");
      return `${scenario.title} — ${scenario.context}\n${lines}`;
    })
    .join("\n\n");
}
