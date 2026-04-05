// palette-concepts.ts
// Master list of pain points and aspirations for the dynamic palette.
// Each concept is pre-mapped to primary dimensions and related concepts.
// The palette shows ~8 of these based on conversation context.

export interface PaletteConcept {
  id: string;
  text: string;
  category: 'pain' | 'aspiration';
  primaryDimensions: DimensionKey[];
  relatedConcepts: string[];        // IDs of concepts that often co-occur
  decompositionHint: string;        // Brief context for the decomposition engine
}

type DimensionKey =
  | 'body' | 'people' | 'money' | 'home'
  | 'growth' | 'joy' | 'purpose' | 'identity';

export const paletteConcepts: PaletteConcept[] = [

  // ════════════════════════════════════════
  // PAIN POINTS (50)
  // ════════════════════════════════════════

  // --- Body ---
  {
    id: 'pain-always-tired',
    text: 'Always tired',
    category: 'pain',
    primaryDimensions: ['body', 'joy'],
    relatedConcepts: ['pain-sleeping-badly', 'pain-eating-like-crap', 'pain-working-too-much'],
    decompositionHint: 'Fatigue usually has 2-3 causes: sleep, nutrition, overwork, or emotional drain. Clarify which before decomposing.'
  },
  {
    id: 'pain-sleeping-badly',
    text: 'Can\'t sleep well',
    category: 'pain',
    primaryDimensions: ['body'],
    relatedConcepts: ['pain-always-tired', 'pain-stressed', 'pain-phone-addiction'],
    decompositionHint: 'Sleep issues decompose into evening routine, screen habits, meal timing, stress load, and physical environment.'
  },
  {
    id: 'pain-eating-like-crap',
    text: 'Eating like crap',
    category: 'pain',
    primaryDimensions: ['body', 'money'],
    relatedConcepts: ['pain-no-time', 'pain-always-tired', 'pain-overweight'],
    decompositionHint: 'Usually a time/planning problem, not a willpower problem. Decompose into meal planning, shopping, prep, and cooking behaviors.'
  },
  {
    id: 'pain-out-of-shape',
    text: 'Out of shape',
    category: 'pain',
    primaryDimensions: ['body', 'identity'],
    relatedConcepts: ['pain-always-tired', 'pain-overweight', 'pain-no-time'],
    decompositionHint: 'Movement behaviors, not "exercise." Clarify: strength, endurance, flexibility, or just daily movement?'
  },
  {
    id: 'pain-overweight',
    text: 'Carrying extra weight',
    category: 'pain',
    primaryDimensions: ['body', 'identity'],
    relatedConcepts: ['pain-eating-like-crap', 'pain-out-of-shape', 'pain-stressed'],
    decompositionHint: 'Weight is an output, not a behavior. Decompose into the food and movement behaviors that drive it. Never make weight the target — make behaviors the target.'
  },
  {
    id: 'pain-health-problems',
    text: 'Health issues I can\'t shake',
    category: 'pain',
    primaryDimensions: ['body', 'money'],
    relatedConcepts: ['pain-always-tired', 'pain-stressed', 'pain-eating-like-crap'],
    decompositionHint: 'Chronic health decomposes into medical care access, nutrition, movement, stress management, and environmental factors. HUMA is not medical advice — focus on lifestyle behaviors that support healing.'
  },
  {
    id: 'pain-drinking-too-much',
    text: 'Drinking too much',
    category: 'pain',
    primaryDimensions: ['body', 'money', 'people'],
    relatedConcepts: ['pain-stressed', 'pain-lonely', 'pain-sleeping-badly'],
    decompositionHint: 'Usually a coping mechanism. Decompose into what triggers it, what it replaces (social connection, stress relief, boredom), and alternative behaviors.'
  },

  // --- Money ---
  {
    id: 'pain-never-enough-money',
    text: 'Never enough money',
    category: 'pain',
    primaryDimensions: ['money'],
    relatedConcepts: ['pain-drowning-in-debt', 'pain-paycheck-to-paycheck', 'pain-no-savings'],
    decompositionHint: 'Clarify: income problem, spending problem, or debt problem? Each decomposes differently.'
  },
  {
    id: 'pain-drowning-in-debt',
    text: 'Drowning in debt',
    category: 'pain',
    primaryDimensions: ['money', 'joy'],
    relatedConcepts: ['pain-never-enough-money', 'pain-stressed', 'pain-anxious-about-future'],
    decompositionHint: 'Debt paydown is a specific behavior chain: list debts, pick a method (avalanche/snowball), find margin, automate. The emotional weight is the real pain — name it.'
  },
  {
    id: 'pain-paycheck-to-paycheck',
    text: 'Living paycheck to paycheck',
    category: 'pain',
    primaryDimensions: ['money', 'identity'],
    relatedConcepts: ['pain-never-enough-money', 'pain-no-savings', 'pain-anxious-about-future'],
    decompositionHint: 'Usually needs both income increase AND spending awareness. Start with tracking — most people don\'t know where money goes.'
  },
  {
    id: 'pain-no-savings',
    text: 'No savings or safety net',
    category: 'pain',
    primaryDimensions: ['money'],
    relatedConcepts: ['pain-paycheck-to-paycheck', 'pain-anxious-about-future'],
    decompositionHint: 'Emergency fund first ($1000), then build. The behavior is automatic transfer, however small. Start with $25/week if needed.'
  },
  {
    id: 'pain-hate-my-job',
    text: 'Hate my job',
    category: 'pain',
    primaryDimensions: ['money', 'purpose', 'joy'],
    relatedConcepts: ['pain-working-too-much', 'pain-stuck-in-rut', 'pain-wasting-potential'],
    decompositionHint: 'Clarify: is it the work itself, the people, the hours, the pay, or the meaninglessness? Each decomposes into different escape routes.'
  },

  // --- People ---
  {
    id: 'pain-relationship-strained',
    text: 'Relationship is strained',
    category: 'pain',
    primaryDimensions: ['people', 'joy'],
    relatedConcepts: ['pain-fighting-with-partner', 'pain-working-too-much', 'pain-stressed'],
    decompositionHint: 'Relationship health decomposes into: time together, communication quality, shared activities, conflict resolution, individual health. Often the individual behaviors (sleep, stress) are the real lever.'
  },
  {
    id: 'pain-fighting-with-partner',
    text: 'Fighting with my partner',
    category: 'pain',
    primaryDimensions: ['people'],
    relatedConcepts: ['pain-relationship-strained', 'pain-stressed', 'pain-no-time'],
    decompositionHint: 'Fights usually escalate from unmet needs, not genuine disagreements. Decompose into check-in behaviors, shared time, and stress reduction.'
  },
  {
    id: 'pain-lonely',
    text: 'Lonely',
    category: 'pain',
    primaryDimensions: ['people', 'identity'],
    relatedConcepts: ['pain-no-community', 'pain-disconnected', 'pain-new-to-area'],
    decompositionHint: 'Loneliness decomposes into: number of interactions per week, depth of interactions, community participation. The behavior is showing up — weekly, somewhere, consistently.'
  },
  {
    id: 'pain-no-community',
    text: 'No real community',
    category: 'pain',
    primaryDimensions: ['people', 'identity'],
    relatedConcepts: ['pain-lonely', 'pain-disconnected', 'pain-new-to-area'],
    decompositionHint: 'Community is built through repeated, unplanned interactions (the "third place"). Decompose into regular attendance at one thing — market, church, class, volunteer shift.'
  },
  {
    id: 'pain-new-to-area',
    text: 'New to the area, don\'t know anyone',
    category: 'pain',
    primaryDimensions: ['people', 'home'],
    relatedConcepts: ['pain-lonely', 'pain-no-community'],
    decompositionHint: 'New area needs a "third place" strategy. Decompose into: find 2-3 regular weekly activities within 20 minutes.'
  },
  {
    id: 'pain-kids-growing-too-fast',
    text: 'Kids are growing up too fast',
    category: 'pain',
    primaryDimensions: ['people', 'joy', 'purpose'],
    relatedConcepts: ['pain-working-too-much', 'pain-no-time', 'pain-relationship-strained'],
    decompositionHint: 'This is a time allocation problem disguised as a feeling. Decompose into: protected family time blocks, shared activities, daily rituals.'
  },

  // --- Home ---
  {
    id: 'pain-house-is-a-mess',
    text: 'House is always a mess',
    category: 'pain',
    primaryDimensions: ['home', 'joy'],
    relatedConcepts: ['pain-no-time', 'pain-stressed', 'pain-overwhelmed'],
    decompositionHint: 'Home maintenance is a daily micro-behavior, not a weekend project. Decompose into: 15-min daily reset, one-in-one-out rule, weekly deep clean of one room.'
  },
  {
    id: 'pain-home-needs-work',
    text: 'Home needs repairs I can\'t afford',
    category: 'pain',
    primaryDimensions: ['home', 'money'],
    relatedConcepts: ['pain-never-enough-money', 'pain-stressed'],
    decompositionHint: 'Prioritize by safety → comfort → beauty. Decompose into: list all repairs, rank by urgency, identify DIY vs. hire-out, allocate monthly repair budget.'
  },
  {
    id: 'pain-wrong-place',
    text: 'Living in the wrong place',
    category: 'pain',
    primaryDimensions: ['home', 'identity', 'purpose'],
    relatedConcepts: ['pain-stuck-in-rut', 'pain-disconnected', 'pain-hate-my-job'],
    decompositionHint: 'Clarify: wrong climate, wrong community, wrong cost of living, or wrong for life goals? The move itself is a project. The realization is the first step.'
  },

  // --- Growth ---
  {
    id: 'pain-stuck-in-rut',
    text: 'Stuck in a rut',
    category: 'pain',
    primaryDimensions: ['growth', 'purpose', 'joy'],
    relatedConcepts: ['pain-wasting-potential', 'pain-dont-know-what-i-want', 'pain-hate-my-job'],
    decompositionHint: 'Ruts are usually about lack of novelty + lack of challenge. Decompose into: one new thing per week, one skill to develop, one conversation with someone outside your bubble.'
  },
  {
    id: 'pain-wasting-potential',
    text: 'Wasting my potential',
    category: 'pain',
    primaryDimensions: ['growth', 'purpose', 'identity'],
    relatedConcepts: ['pain-stuck-in-rut', 'pain-hate-my-job', 'pain-dont-know-what-i-want'],
    decompositionHint: 'Potential needs a direction. Clarify: what would "using" your potential look like? Then decompose into behaviors that move toward that.'
  },
  {
    id: 'pain-cant-focus',
    text: 'Can\'t focus on anything',
    category: 'pain',
    primaryDimensions: ['growth', 'body'],
    relatedConcepts: ['pain-phone-addiction', 'pain-stressed', 'pain-sleeping-badly'],
    decompositionHint: 'Focus problems are usually environmental or physiological. Decompose into: phone management, sleep, nutrition, work block structure, physical environment.'
  },
  {
    id: 'pain-phone-addiction',
    text: 'Addicted to my phone',
    category: 'pain',
    primaryDimensions: ['growth', 'joy', 'body'],
    relatedConcepts: ['pain-cant-focus', 'pain-sleeping-badly', 'pain-wasting-potential'],
    decompositionHint: 'Phone use is a replacement behavior. Clarify what it replaces (boredom, anxiety, connection). Decompose into: specific screen limits, phone-free zones/times, replacement activities.'
  },

  // --- Joy ---
  {
    id: 'pain-no-fun',
    text: 'Life has no fun in it',
    category: 'pain',
    primaryDimensions: ['joy', 'identity'],
    relatedConcepts: ['pain-working-too-much', 'pain-stuck-in-rut', 'pain-stressed'],
    decompositionHint: 'Fun isn\'t frivolous — it\'s restorative. Decompose into: one pleasure per day (small), one adventure per week (medium), one passion project ongoing.'
  },
  {
    id: 'pain-no-hobbies',
    text: 'No hobbies or interests outside work',
    category: 'pain',
    primaryDimensions: ['joy', 'growth', 'identity'],
    relatedConcepts: ['pain-no-fun', 'pain-stuck-in-rut', 'pain-working-too-much'],
    decompositionHint: 'What did they love as a kid? What do they lose track of time doing? Decompose into: try one thing for 4 weeks, 2 hours/week, no pressure to be good at it.'
  },
  {
    id: 'pain-depressed',
    text: 'Feeling depressed',
    category: 'pain',
    primaryDimensions: ['joy', 'body', 'people'],
    relatedConcepts: ['pain-lonely', 'pain-sleeping-badly', 'pain-stuck-in-rut'],
    decompositionHint: 'HUMA is not a therapist. Acknowledge the pain. Focus on small daily behaviors that are known to help: movement, sunlight, social contact, sleep routine, nutrition. Suggest professional support if appropriate.'
  },
  {
    id: 'pain-stressed',
    text: 'Stressed all the time',
    category: 'pain',
    primaryDimensions: ['joy', 'body'],
    relatedConcepts: ['pain-working-too-much', 'pain-sleeping-badly', 'pain-never-enough-money'],
    decompositionHint: 'Stress is a signal, not a problem. Clarify the source: work, money, relationships, health, existential. Decompose into: source reduction + daily recovery behaviors.'
  },
  {
    id: 'pain-anxious-about-future',
    text: 'Anxious about the future',
    category: 'pain',
    primaryDimensions: ['joy', 'money', 'purpose'],
    relatedConcepts: ['pain-no-savings', 'pain-dont-know-what-i-want', 'pain-stressed'],
    decompositionHint: 'Anxiety about the future usually reduces when you take action in the present. Decompose into: one concrete step toward financial security, one toward purpose clarity, daily grounding practice.'
  },
  {
    id: 'pain-overwhelmed',
    text: 'Completely overwhelmed',
    category: 'pain',
    primaryDimensions: ['joy', 'growth'],
    relatedConcepts: ['pain-no-time', 'pain-stressed', 'pain-house-is-a-mess'],
    decompositionHint: 'Overwhelm means too many open loops. Decompose into: brain dump everything, pick the 3 that matter most this week, defer the rest. The production sheet IS the solution — it reduces cognitive load.'
  },

  // --- Purpose ---
  {
    id: 'pain-lost-purpose',
    text: 'Lost my sense of purpose',
    category: 'pain',
    primaryDimensions: ['purpose', 'identity'],
    relatedConcepts: ['pain-stuck-in-rut', 'pain-dont-know-what-i-want', 'pain-wasting-potential'],
    decompositionHint: 'Purpose isn\'t found by thinking — it\'s found by doing. Decompose into: try things, pay attention to energy, notice what you do when nobody\'s watching.'
  },
  {
    id: 'pain-dont-know-what-i-want',
    text: 'Don\'t know what I want',
    category: 'pain',
    primaryDimensions: ['purpose', 'identity', 'growth'],
    relatedConcepts: ['pain-lost-purpose', 'pain-stuck-in-rut', 'pain-wasting-potential'],
    decompositionHint: 'This is common and okay. Don\'t force clarity. Decompose into: small experiments — one new thing per week for a month. HUMA watches for energy patterns.'
  },
  {
    id: 'pain-work-meaningless',
    text: 'My work feels meaningless',
    category: 'pain',
    primaryDimensions: ['purpose', 'money', 'joy'],
    relatedConcepts: ['pain-hate-my-job', 'pain-wasting-potential', 'pain-stuck-in-rut'],
    decompositionHint: 'Meaning can come from the work, the people, or the purpose it funds. Clarify which is missing. Sometimes the answer is a side project, not a career change.'
  },
  {
    id: 'pain-disconnected',
    text: 'Feel disconnected from everything',
    category: 'pain',
    primaryDimensions: ['purpose', 'people', 'identity'],
    relatedConcepts: ['pain-lonely', 'pain-lost-purpose', 'pain-phone-addiction'],
    decompositionHint: 'Disconnection is the meta-pain. Usually has roots in multiple dimensions. Start with the most physical: movement, nature, one human interaction per day.'
  },

  // --- Identity ---
  {
    id: 'pain-lost-myself',
    text: 'Lost who I am',
    category: 'pain',
    primaryDimensions: ['identity', 'purpose'],
    relatedConcepts: ['pain-dont-know-what-i-want', 'pain-lost-purpose', 'pain-stuck-in-rut'],
    decompositionHint: 'Identity rebuilds through action, not reflection. What did you love at 12? What makes you angry? What do you do when nobody\'s watching? Those are clues.'
  },
  {
    id: 'pain-no-confidence',
    text: 'No confidence in myself',
    category: 'pain',
    primaryDimensions: ['identity', 'growth'],
    relatedConcepts: ['pain-wasting-potential', 'pain-out-of-shape', 'pain-lost-myself'],
    decompositionHint: 'Confidence comes from evidence of capability, not affirmations. Decompose into: small challenges, completed. One per week. Let the evidence accumulate.'
  },

  // --- Time ---
  {
    id: 'pain-no-time',
    text: 'Never enough time',
    category: 'pain',
    primaryDimensions: ['joy', 'people', 'growth'],
    relatedConcepts: ['pain-working-too-much', 'pain-overwhelmed', 'pain-kids-growing-too-fast'],
    decompositionHint: 'Time scarcity is usually a priorities problem. Clarify: time for what? Then decompose into: what to stop doing, what to protect, what to batch.'
  },
  {
    id: 'pain-working-too-much',
    text: 'Working way too much',
    category: 'pain',
    primaryDimensions: ['body', 'people', 'joy'],
    relatedConcepts: ['pain-no-time', 'pain-always-tired', 'pain-relationship-strained'],
    decompositionHint: 'Overwork decomposes into: financial need (must work this much) vs. habit (could stop but don\'t) vs. identity (I am my work). Each has different solutions.'
  },
  {
    id: 'pain-no-time-for-myself',
    text: 'No time for myself',
    category: 'pain',
    primaryDimensions: ['joy', 'identity', 'body'],
    relatedConcepts: ['pain-no-time', 'pain-kids-growing-too-fast', 'pain-overwhelmed'],
    decompositionHint: 'Self-time requires protection, not finding. Decompose into: one non-negotiable daily block (even 20 min), communicated to household.'
  },

  // --- Compound ---
  {
    id: 'pain-everything-falling-apart',
    text: 'Everything is falling apart',
    category: 'pain',
    primaryDimensions: ['joy', 'body', 'money', 'people'],
    relatedConcepts: ['pain-overwhelmed', 'pain-stressed', 'pain-depressed'],
    decompositionHint: 'When everything is falling apart, start with ONE thing. The most physical, the most immediate. Usually: sleep, food, or safety. Stabilize one, the others start to follow.'
  },
  {
    id: 'pain-going-through-divorce',
    text: 'Going through a separation',
    category: 'pain',
    primaryDimensions: ['people', 'money', 'home', 'identity'],
    relatedConcepts: ['pain-lonely', 'pain-lost-myself', 'pain-anxious-about-future'],
    decompositionHint: 'Major life transition. Decompose into: immediate stability (housing, finances, routine), emotional support (people to lean on), and daily anchors (small rituals that stay constant).'
  },
  {
    id: 'pain-grief',
    text: 'Grieving a loss',
    category: 'pain',
    primaryDimensions: ['joy', 'people', 'identity'],
    relatedConcepts: ['pain-depressed', 'pain-disconnected', 'pain-lost-myself'],
    decompositionHint: 'HUMA doesn\'t fix grief. Decompose into: daily care behaviors (eat, sleep, move, connect with one person). Hold space. Suggest professional support.'
  },
  {
    id: 'pain-career-transition',
    text: 'In between careers',
    category: 'pain',
    primaryDimensions: ['money', 'purpose', 'identity'],
    relatedConcepts: ['pain-dont-know-what-i-want', 'pain-anxious-about-future', 'pain-no-savings'],
    decompositionHint: 'Transition needs both financial bridge and exploration. Decompose into: income floor (minimum viable earning), exploration (2-3 experiments), skill building (one focused effort).'
  },
  {
    id: 'pain-bad-habits',
    text: 'Stuck in bad habits',
    category: 'pain',
    primaryDimensions: ['body', 'growth', 'identity'],
    relatedConcepts: ['pain-phone-addiction', 'pain-drinking-too-much', 'pain-eating-like-crap'],
    decompositionHint: 'Habits are replacement behaviors. Clarify which habits, what they replace, and what environment enables them. The behavior chain matters more than willpower.'
  },
  {
    id: 'pain-aging-parents',
    text: 'Dealing with aging parents',
    category: 'pain',
    primaryDimensions: ['people', 'money', 'joy'],
    relatedConcepts: ['pain-no-time', 'pain-stressed', 'pain-overwhelmed'],
    decompositionHint: 'Caregiving decomposes into: what you can do, what you need to delegate, what support exists, and how to protect yourself while caring for others.'
  },
  {
    id: 'pain-toxic-environment',
    text: 'Surrounded by negative people',
    category: 'pain',
    primaryDimensions: ['people', 'joy', 'growth'],
    relatedConcepts: ['pain-disconnected', 'pain-no-community', 'pain-stuck-in-rut'],
    decompositionHint: 'Environment shapes behavior more than willpower. Decompose into: reduce exposure where possible, find one positive community, protect energy.'
  },

  // ════════════════════════════════════════
  // ASPIRATIONS (50)
  // ════════════════════════════════════════

  // --- Body ---
  {
    id: 'asp-eat-real-food',
    text: 'Eat real food',
    category: 'aspiration',
    primaryDimensions: ['body', 'money', 'home'],
    relatedConcepts: ['asp-cook-at-home', 'asp-grow-food', 'asp-more-energy'],
    decompositionHint: 'Clarify: what does "real food" mean for them? Animal-based, plant-forward, local, organic, unprocessed? Each decomposes differently.'
  },
  {
    id: 'asp-get-strong',
    text: 'Get strong',
    category: 'aspiration',
    primaryDimensions: ['body', 'identity'],
    relatedConcepts: ['asp-more-energy', 'asp-be-outside', 'asp-heal-my-body'],
    decompositionHint: 'Strength has many forms: gym, bodyweight, manual labor, yoga. Clarify the version. Decompose into 3x/week minimum with progression.'
  },
  {
    id: 'asp-more-energy',
    text: 'Have more energy',
    category: 'aspiration',
    primaryDimensions: ['body', 'joy'],
    relatedConcepts: ['asp-eat-real-food', 'asp-sleep-well', 'asp-get-strong'],
    decompositionHint: 'Energy is an output of sleep + nutrition + movement + purpose. Decompose into behaviors across all four rather than targeting energy directly.'
  },
  {
    id: 'asp-sleep-well',
    text: 'Sleep well',
    category: 'aspiration',
    primaryDimensions: ['body'],
    relatedConcepts: ['asp-more-energy', 'asp-less-stress', 'asp-simplify'],
    decompositionHint: 'Sleep decomposes into: evening routine (screens off, consistent bedtime), sleep environment (dark, cool, quiet), and daytime behaviors (morning light, no late caffeine, movement).'
  },
  {
    id: 'asp-heal-my-body',
    text: 'Heal my body',
    category: 'aspiration',
    primaryDimensions: ['body', 'purpose'],
    relatedConcepts: ['asp-eat-real-food', 'asp-more-energy', 'asp-less-stress'],
    decompositionHint: 'Healing is multidimensional. Decompose into: nutrition protocol, movement protocol, stress reduction, medical care, environmental factors. HUMA supports lifestyle — not medical treatment.'
  },

  // --- Money ---
  {
    id: 'asp-debt-free',
    text: 'Be debt free',
    category: 'aspiration',
    primaryDimensions: ['money', 'joy'],
    relatedConcepts: ['asp-save-money', 'asp-financial-freedom', 'asp-simplify'],
    decompositionHint: 'Debt freedom is a specific plan: list all debts, pick paydown method, find extra margin, automate payments, track monthly. The psychology matters as much as the math.'
  },
  {
    id: 'asp-save-money',
    text: 'Save money',
    category: 'aspiration',
    primaryDimensions: ['money'],
    relatedConcepts: ['asp-debt-free', 'asp-financial-freedom', 'asp-cook-at-home'],
    decompositionHint: 'Saving decomposes into: know where money goes (tracking), automate savings (pay yourself first), reduce biggest leaks (housing, food, subscriptions).'
  },
  {
    id: 'asp-financial-freedom',
    text: 'Financial freedom',
    category: 'aspiration',
    primaryDimensions: ['money', 'purpose', 'joy'],
    relatedConcepts: ['asp-debt-free', 'asp-save-money', 'asp-start-business', 'asp-multiple-income'],
    decompositionHint: 'Define the number: what does "freedom" cost per month? Then decompose into: income streams, expense reduction, investment, and timeline.'
  },
  {
    id: 'asp-multiple-income',
    text: 'Have multiple income streams',
    category: 'aspiration',
    primaryDimensions: ['money', 'growth'],
    relatedConcepts: ['asp-start-business', 'asp-financial-freedom', 'asp-learn-new-skills'],
    decompositionHint: 'Start with one additional stream, not three. Clarify: what skills/assets do they have? Decompose into: validate idea, minimum viable offer, first customer, then systematize.'
  },

  // --- People ---
  {
    id: 'asp-close-community',
    text: 'Have a close community',
    category: 'aspiration',
    primaryDimensions: ['people', 'joy', 'identity'],
    relatedConcepts: ['asp-be-better-partner', 'asp-help-others', 'asp-time-with-kids'],
    decompositionHint: 'Community is built through consistent presence, not events. Decompose into: one weekly gathering you never miss, one neighbor you check on, one skill you share.'
  },
  {
    id: 'asp-time-with-kids',
    text: 'Spend real time with my kids',
    category: 'aspiration',
    primaryDimensions: ['people', 'joy', 'purpose'],
    relatedConcepts: ['asp-be-present', 'asp-cook-at-home', 'asp-be-outside'],
    decompositionHint: 'Quality time decomposes into: daily ritual (even 15 min), weekly adventure, shared project, and protecting those blocks from work creep.'
  },
  {
    id: 'asp-be-better-partner',
    text: 'Be a better partner',
    category: 'aspiration',
    primaryDimensions: ['people', 'joy'],
    relatedConcepts: ['asp-be-present', 'asp-time-with-kids', 'asp-less-stress'],
    decompositionHint: 'Partnership health decomposes into: daily check-in (5 min), weekly date (protected), shared goals review (monthly), and individual health (because you can\'t give what you don\'t have).'
  },
  {
    id: 'asp-make-friends',
    text: 'Make real friends',
    category: 'aspiration',
    primaryDimensions: ['people', 'joy'],
    relatedConcepts: ['asp-close-community', 'asp-help-others', 'asp-be-outside'],
    decompositionHint: 'Friendship requires repeated, unstructured interaction. Decompose into: join one regular group activity, say yes to invitations, initiate one coffee/walk per week.'
  },

  // --- Home ---
  {
    id: 'asp-cook-at-home',
    text: 'Cook at home',
    category: 'aspiration',
    primaryDimensions: ['home', 'body', 'money', 'people'],
    relatedConcepts: ['asp-eat-real-food', 'asp-save-money', 'asp-time-with-kids'],
    decompositionHint: 'Cooking at home is a keystone behavior — it touches 4+ dimensions. Decompose into: meal plan (weekly), shop (once), prep (batch), cook (daily). The planning is the hard part, not the cooking.'
  },
  {
    id: 'asp-own-land',
    text: 'Own land',
    category: 'aspiration',
    primaryDimensions: ['home', 'money', 'purpose'],
    relatedConcepts: ['asp-grow-food', 'asp-self-sufficient', 'asp-build-something'],
    decompositionHint: 'Land ownership is a multi-year project. Decompose into: define requirements, financial plan (down payment timeline), area research, skill building (what will you DO with land).'
  },
  {
    id: 'asp-simplify',
    text: 'Simplify my life',
    category: 'aspiration',
    primaryDimensions: ['home', 'joy', 'money'],
    relatedConcepts: ['asp-less-stress', 'asp-save-money', 'asp-be-present'],
    decompositionHint: 'Simplification decomposes into: reduce possessions (one bag per week), reduce commitments (say no to one thing), reduce expenses (cancel what you don\'t use), reduce noise (phone/media limits).'
  },
  {
    id: 'asp-create-home',
    text: 'Make my home beautiful and functional',
    category: 'aspiration',
    primaryDimensions: ['home', 'joy', 'identity'],
    relatedConcepts: ['asp-simplify', 'asp-make-with-hands', 'asp-cook-at-home'],
    decompositionHint: 'Home improvement is a project chain, not a behavior. Decompose into: one room at a time, one improvement per week, budget per month.'
  },

  // --- Growth ---
  {
    id: 'asp-learn-new-skills',
    text: 'Learn new skills',
    category: 'aspiration',
    primaryDimensions: ['growth', 'purpose'],
    relatedConcepts: ['asp-start-business', 'asp-find-work-i-love', 'asp-create-more'],
    decompositionHint: 'Clarify: which skill and why? Decompose into: 30 min/day, specific resource (course, book, mentor), weekly practice target, first real application.'
  },
  {
    id: 'asp-read-more',
    text: 'Read more',
    category: 'aspiration',
    primaryDimensions: ['growth', 'joy'],
    relatedConcepts: ['asp-learn-new-skills', 'asp-less-phone'],
    decompositionHint: 'Reading decomposes into: replace one phone habit with reading (bedtime is easiest), keep a book visible, 20 pages/day target, no pressure to finish what you don\'t enjoy.'
  },
  {
    id: 'asp-less-phone',
    text: 'Use my phone less',
    category: 'aspiration',
    primaryDimensions: ['growth', 'joy', 'body'],
    relatedConcepts: ['asp-be-present', 'asp-read-more', 'asp-sleep-well'],
    decompositionHint: 'Phone reduction decomposes into: specific times (no phone before 8am, after 9pm), specific places (no phone at table, in bedroom), replacement activities.'
  },

  // --- Joy ---
  {
    id: 'asp-have-adventures',
    text: 'Have adventures',
    category: 'aspiration',
    primaryDimensions: ['joy', 'people', 'growth'],
    relatedConcepts: ['asp-be-outside', 'asp-travel', 'asp-time-with-kids'],
    decompositionHint: 'Adventure doesn\'t require travel or money. Decompose into: one novel experience per week (new trail, new recipe, new conversation), one bigger adventure per month.'
  },
  {
    id: 'asp-be-outside',
    text: 'Be outside more',
    category: 'aspiration',
    primaryDimensions: ['joy', 'body'],
    relatedConcepts: ['asp-grow-food', 'asp-have-adventures', 'asp-get-strong'],
    decompositionHint: 'Decompose into: morning outdoor time (even 10 min), one outdoor activity per week, reroute daily tasks outdoors (walk to store, eat lunch outside).'
  },
  {
    id: 'asp-create-more',
    text: 'Create more',
    category: 'aspiration',
    primaryDimensions: ['joy', 'identity', 'purpose'],
    relatedConcepts: ['asp-make-with-hands', 'asp-start-business', 'asp-learn-new-skills'],
    decompositionHint: 'Clarify: create what? Writing, art, music, food, code, building? Decompose into: protected creative time (same time daily), lower the bar (quantity over quality), share something once a week.'
  },
  {
    id: 'asp-make-with-hands',
    text: 'Make something with my hands',
    category: 'aspiration',
    primaryDimensions: ['joy', 'identity', 'home'],
    relatedConcepts: ['asp-create-more', 'asp-grow-food', 'asp-learn-new-skills'],
    decompositionHint: 'Clarify: woodworking, cooking, gardening, sewing, building, pottery? Decompose into: one project, materials sourced, 3 hours/week protected time.'
  },
  {
    id: 'asp-travel',
    text: 'Travel',
    category: 'aspiration',
    primaryDimensions: ['joy', 'growth', 'people'],
    relatedConcepts: ['asp-have-adventures', 'asp-save-money', 'asp-financial-freedom'],
    decompositionHint: 'Travel decomposes into: travel fund (auto-save), time off (plan and protect), research (one trip planned, one dreamed). Don\'t wait for "someday" — plan the next one.'
  },
  {
    id: 'asp-less-stress',
    text: 'Less stress',
    category: 'aspiration',
    primaryDimensions: ['joy', 'body'],
    relatedConcepts: ['asp-simplify', 'asp-sleep-well', 'asp-be-present'],
    decompositionHint: 'Stress reduction decomposes into: identify top 3 stressors, address the one you can change, build daily recovery (movement, nature, breath, play).'
  },
  {
    id: 'asp-be-present',
    text: 'Be more present',
    category: 'aspiration',
    primaryDimensions: ['joy', 'people', 'identity'],
    relatedConcepts: ['asp-less-phone', 'asp-time-with-kids', 'asp-be-better-partner'],
    decompositionHint: 'Presence is built through subtraction (remove distractions) not addition (add meditation). Decompose into: phone-free times, single-tasking blocks, 5 min of silence daily.'
  },

  // --- Purpose ---
  {
    id: 'asp-find-work-i-love',
    text: 'Find work I actually love',
    category: 'aspiration',
    primaryDimensions: ['purpose', 'money', 'joy'],
    relatedConcepts: ['asp-start-business', 'asp-learn-new-skills', 'asp-help-others'],
    decompositionHint: 'Loving your work is at the intersection of skill + interest + need + compensation. Decompose into: exploration experiments (try things), skill development, financial bridge.'
  },
  {
    id: 'asp-start-business',
    text: 'Start a business',
    category: 'aspiration',
    primaryDimensions: ['purpose', 'money', 'growth'],
    relatedConcepts: ['asp-multiple-income', 'asp-financial-freedom', 'asp-learn-new-skills'],
    decompositionHint: 'Business decomposes into: validate the idea (talk to 10 people), minimum viable offer, first paying customer. Don\'t build — sell first. $0 startup if possible.'
  },
  {
    id: 'asp-help-others',
    text: 'Help people',
    category: 'aspiration',
    primaryDimensions: ['purpose', 'people'],
    relatedConcepts: ['asp-close-community', 'asp-find-work-i-love', 'asp-build-something'],
    decompositionHint: 'Helping decomposes into: who specifically, how specifically, how often. Vague helping leads to burnout. Specific helping leads to impact. One person, one way, consistently.'
  },
  {
    id: 'asp-build-something',
    text: 'Build something meaningful',
    category: 'aspiration',
    primaryDimensions: ['purpose', 'identity', 'growth'],
    relatedConcepts: ['asp-start-business', 'asp-help-others', 'asp-create-more'],
    decompositionHint: 'Clarify: meaningful to whom? The world, your family, yourself? Decompose into: define the vision (one sentence), identify the first milestone, work on it 1 hour/day.'
  },
  {
    id: 'asp-proud-of-life',
    text: 'Feel proud of my life',
    category: 'aspiration',
    primaryDimensions: ['purpose', 'identity', 'joy'],
    relatedConcepts: ['asp-build-something', 'asp-be-present', 'asp-time-with-kids'],
    decompositionHint: 'Pride comes from alignment between values and actions. Clarify: what would you need to be doing daily to feel proud? Those become the behaviors.'
  },

  // --- Identity ---
  {
    id: 'asp-self-sufficient',
    text: 'Be self-sufficient',
    category: 'aspiration',
    primaryDimensions: ['identity', 'home', 'body', 'money'],
    relatedConcepts: ['asp-grow-food', 'asp-own-land', 'asp-learn-new-skills', 'asp-make-with-hands'],
    decompositionHint: 'Self-sufficiency is a spectrum, not a binary. Clarify the level: reduce dependence on grocery stores? On grid power? On employer income? Decompose based on their actual consumption patterns and bioregion.'
  },
  {
    id: 'asp-grow-food',
    text: 'Grow my own food',
    category: 'aspiration',
    primaryDimensions: ['body', 'home', 'money', 'joy', 'purpose'],
    relatedConcepts: ['asp-self-sufficient', 'asp-eat-real-food', 'asp-be-outside', 'asp-own-land'],
    decompositionHint: 'Food growing is zone-specific, season-specific, and skill-specific. Clarify: what space (containers, raised beds, yard, acreage)? Start with the easiest wins for their zone. Herbs and greens first.'
  },
  {
    id: 'asp-generational-wealth',
    text: 'Build generational wealth',
    category: 'aspiration',
    primaryDimensions: ['identity', 'money', 'people'],
    relatedConcepts: ['asp-financial-freedom', 'asp-own-land', 'asp-start-business'],
    decompositionHint: 'Generational wealth is assets + knowledge + relationships passed down. Decompose into: asset building (property, business, investments), knowledge transfer (teaching kids), relationship capital (community).'
  },
  {
    id: 'asp-legacy',
    text: 'Leave a legacy',
    category: 'aspiration',
    primaryDimensions: ['identity', 'purpose'],
    relatedConcepts: ['asp-build-something', 'asp-generational-wealth', 'asp-help-others'],
    decompositionHint: 'Legacy decomposes into: what do you want to be remembered for? Then reverse engineer the daily behaviors that build it. Legacy is the sum of daily actions over decades.'
  },
  {
    id: 'asp-live-by-values',
    text: 'Live according to my values',
    category: 'aspiration',
    primaryDimensions: ['identity', 'purpose', 'joy'],
    relatedConcepts: ['asp-proud-of-life', 'asp-simplify', 'asp-be-present'],
    decompositionHint: 'Clarify the values first (not abstractly — through examples of what feels right and wrong). Then audit: where is daily life misaligned? Those gaps become the behaviors.'
  },
  {
    id: 'asp-independence',
    text: 'Be truly independent',
    category: 'aspiration',
    primaryDimensions: ['identity', 'money', 'growth'],
    relatedConcepts: ['asp-self-sufficient', 'asp-financial-freedom', 'asp-start-business'],
    decompositionHint: 'Independence from what? Employer, system, relationship, location? Each decomposes differently. Most people want optionality, not isolation.'
  },
  {
    id: 'asp-resilient',
    text: 'Be resilient — handle whatever comes',
    category: 'aspiration',
    primaryDimensions: ['identity', 'body', 'money'],
    relatedConcepts: ['asp-self-sufficient', 'asp-get-strong', 'asp-save-money'],
    decompositionHint: 'Resilience is multi-dimensional: physical (health, fitness), financial (savings, low expenses), social (people who have your back), psychological (practices that restore you). Build all four.'
  },
  {
    id: 'asp-homestead',
    text: 'Homestead',
    category: 'aspiration',
    primaryDimensions: ['home', 'body', 'money', 'purpose', 'identity'],
    relatedConcepts: ['asp-grow-food', 'asp-self-sufficient', 'asp-own-land', 'asp-make-with-hands'],
    decompositionHint: 'Homesteading is a lifestyle, not a project. Decompose by year: year 1 (garden, food preservation, basic skills), year 2 (animals, expanded growing, infrastructure), year 3 (systems, community, income from land). Bioregion-specific.'
  }
];
