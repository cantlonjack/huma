// decomposition-templates.ts
// Pre-built aspiration templates with full behavior chains and dimensional mappings.
// Claude customizes these based on conversation context (household size, location,
// budget, schedule, preferences). The template is the starting skeleton —
// the conversation fills in the specifics.
//
// Each template includes:
// - Clarification variants (what "eat clean" means for different people)
// - Behavior chains with frequency, time estimates, and dimensional effects
// - Specificity hints for the production sheet compiler
// - Common failure modes and adjustments

export interface DecompositionTemplate {
  id: string;
  aspirationText: string;              // "Eat real food"
  variants: AspirationVariant[];       // Different interpretations
}

export interface AspirationVariant {
  id: string;
  label: string;                       // "Animal-based / keto"
  description: string;                 // Brief description for tappable card
  clarifyingQuestions: string[];        // Follow-up questions to ask
  behaviors: BehaviorTemplate[];
  commonFailures: FailureMode[];
}

export interface BehaviorTemplate {
  key: string;
  text: string;                        // "Cook dinner at home"
  frequency: 'daily' | 'weekly' | 'specific-days' | 'as-needed';
  defaultDays?: string[];              // For specific-days frequency
  timeEstimate: string;                // "30-60 min"
  dimensions: DimensionEffect[];
  specificityHints: string;            // Instructions for production sheet compiler
  contextDependencies: string[];       // What context makes this better: "freezer inventory", "local farms"
}

export interface DimensionEffect {
  dimension: DimensionKey;
  direction: 'builds' | 'costs' | 'protects';
  reasoning: string;
}

export interface FailureMode {
  signal: string;                      // "Skipping cook-dinner 3+ days in a row"
  likelyCause: string;                 // "Schedule too packed on those days"
  adjustment: string;                  // "Switch to batch cooking on weekends"
}

type DimensionKey =
  | 'body' | 'people' | 'money' | 'home'
  | 'growth' | 'joy' | 'purpose' | 'identity';

// ════════════════════════════════════════════════════════════════
// TEMPLATES
// ════════════════════════════════════════════════════════════════

export const decompositionTemplates: DecompositionTemplate[] = [

  // ─────────────────────────────────────────
  // 1. EAT REAL FOOD
  // ─────────────────────────────────────────
  {
    id: 'tmpl-eat-real-food',
    aspirationText: 'Eat real food',
    variants: [
      {
        id: 'eat-animal-based',
        label: 'Animal-based / keto',
        description: 'Meat, eggs, dairy, vegetables. Minimal processed food. Low carb.',
        clarifyingQuestions: [
          'How many people are you cooking for?',
          'What\'s your weekly food budget?',
          'Do you have access to local farms or a farmers market?',
          'Any foods you absolutely won\'t eat?'
        ],
        behaviors: [
          {
            key: 'meal-plan-weekly',
            text: 'Plan meals for the week',
            frequency: 'weekly',
            defaultDays: ['sunday'],
            timeEstimate: '20 min',
            dimensions: [
              { dimension: 'home', direction: 'builds', reasoning: 'Kitchen becomes organized and intentional' },
              { dimension: 'money', direction: 'protects', reasoning: 'Planning prevents impulse purchases and waste' }
            ],
            specificityHints: 'Use known inventory (freezer, pantry) to build the plan. Suggest meals that use overlapping ingredients. Account for busy days (simpler meals) vs. free days (more involved). Always reference what they already have before suggesting purchases.',
            contextDependencies: ['household_size', 'food_budget', 'freezer_inventory', 'schedule']
          },
          {
            key: 'cook-dinner',
            text: 'Cook dinner at home',
            frequency: 'specific-days',
            defaultDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            timeEstimate: '30-60 min',
            dimensions: [
              { dimension: 'body', direction: 'builds', reasoning: 'Home-cooked meals with whole ingredients improve nutrition' },
              { dimension: 'money', direction: 'builds', reasoning: 'Home cooking costs 60-70% less than eating out' },
              { dimension: 'people', direction: 'builds', reasoning: 'Cooking together or eating together strengthens bonds' },
              { dimension: 'joy', direction: 'builds', reasoning: 'The act of cooking and sharing a meal is a daily pleasure' }
            ],
            specificityHints: 'Never say "cook dinner." Say exactly what to cook: "Ribeye with roasted broccoli and butter. Sear the steak 4 min per side, medium-rare. Toss broccoli in olive oil, salt, 400°F for 20 min." Use leftovers from previous days. Account for cooking skill level. On busy days, suggest one-pot or sheet-pan meals. Always mention what to pull from the freezer for tomorrow.',
            contextDependencies: ['freezer_inventory', 'cooking_skill', 'available_time_today', 'leftovers']
          },
          {
            key: 'grocery-shop',
            text: 'Grocery shop for the week',
            frequency: 'weekly',
            defaultDays: ['saturday'],
            timeEstimate: '45-90 min',
            dimensions: [
              { dimension: 'money', direction: 'costs', reasoning: 'Grocery spending is the primary cost of this aspiration' },
              { dimension: 'body', direction: 'builds', reasoning: 'Having good food available makes eating well automatic' }
            ],
            specificityHints: 'Generate an actual shopping list based on the meal plan. Organize by store section. Note which items might be available at farmers market vs. regular grocery. Include estimated total cost. Flag items they might already have.',
            contextDependencies: ['meal_plan', 'food_budget', 'local_stores', 'farmers_market_availability']
          },
          {
            key: 'no-processed-snacks',
            text: 'No processed snacks — keep good alternatives available',
            frequency: 'daily',
            timeEstimate: '0 min (setup only)',
            dimensions: [
              { dimension: 'body', direction: 'builds', reasoning: 'Removing processed food reduces inflammation and stabilizes energy' },
              { dimension: 'money', direction: 'builds', reasoning: 'Whole food snacks are cheaper per serving than processed' }
            ],
            specificityHints: 'Suggest specific alternatives based on their diet: beef jerky, hard boiled eggs, cheese, nuts, olives. Include prep for the week: "boil a dozen eggs Sunday, portion nuts into bags." Make the good choice the easy choice.',
            contextDependencies: ['dietary_preferences', 'snack_preferences']
          },
          {
            key: 'meal-prep',
            text: 'Meal prep for the week',
            frequency: 'weekly',
            defaultDays: ['sunday'],
            timeEstimate: '1-2 hours',
            dimensions: [
              { dimension: 'home', direction: 'builds', reasoning: 'A prepped kitchen reduces daily friction' },
              { dimension: 'body', direction: 'protects', reasoning: 'Having prepped food prevents bad default choices on busy days' }
            ],
            specificityHints: 'Specific to the week\'s meals: "Brown 3 lbs ground beef (use half for Monday\'s chili, half for Wednesday\'s taco bowls). Roast a tray of mixed vegetables. Make bone broth from the chicken carcass. Boil eggs. Portion snacks." Batch tasks that overlap. Give a rough timeline.',
            contextDependencies: ['meal_plan', 'cooking_skill', 'kitchen_equipment']
          }
        ],
        commonFailures: [
          {
            signal: 'Skipping cook-dinner 3+ days in a row',
            likelyCause: 'Schedule too packed — no energy after work',
            adjustment: 'Move more prep to Sunday. Switch weeknight meals to 15-min options: eggs and sausage, steak and salad, rotisserie chicken.'
          },
          {
            signal: 'Grocery shop skipped or incomplete',
            likelyCause: 'Weekend got away from them',
            adjustment: 'Try a weeknight quick-shop (just proteins and vegetables) or explore grocery delivery for staples.'
          },
          {
            signal: 'Budget consistently exceeded',
            likelyCause: 'Animal-based is expensive if buying premium cuts',
            adjustment: 'Introduce cheaper proteins: ground beef, chicken thighs, eggs. Buy in bulk. Utilize the whole animal (bones for broth, organs for nutrition).'
          }
        ]
      },
      {
        id: 'eat-whole-foods',
        label: 'Whole foods — cut the processed stuff',
        description: 'Less packaged food, more cooking from scratch. No specific diet.',
        clarifyingQuestions: [
          'How many people are you cooking for?',
          'How often do you currently cook at home?',
          'What\'s the biggest barrier — time, skill, or motivation?',
          'Any dietary restrictions?'
        ],
        behaviors: [
          {
            key: 'meal-plan-weekly',
            text: 'Plan meals for the week',
            frequency: 'weekly',
            defaultDays: ['sunday'],
            timeEstimate: '20 min',
            dimensions: [
              { dimension: 'home', direction: 'builds', reasoning: 'Planning brings order to the kitchen' },
              { dimension: 'money', direction: 'protects', reasoning: 'A plan prevents waste and impulse purchases' }
            ],
            specificityHints: 'Start simple — 5 dinners, not 21 meals. Suggest theme nights to reduce decision fatigue: Monday=soup, Tuesday=stir-fry, etc. Build from what they already cook well.',
            contextDependencies: ['household_size', 'cooking_skill', 'current_cooking_frequency']
          },
          {
            key: 'cook-dinner',
            text: 'Cook dinner at home',
            frequency: 'specific-days',
            defaultDays: ['monday', 'tuesday', 'wednesday', 'thursday'],
            timeEstimate: '30-45 min',
            dimensions: [
              { dimension: 'body', direction: 'builds', reasoning: 'Home cooking improves nutrition automatically' },
              { dimension: 'money', direction: 'builds', reasoning: 'Saves $10-20 per meal vs. eating out' },
              { dimension: 'joy', direction: 'builds', reasoning: 'Cooking is a creative, grounding daily practice' }
            ],
            specificityHints: 'Match complexity to the day. Monday after work: 15-minute meal. Saturday with time: try something new. Always include the specific recipe and what needs to happen first (defrost, marinate). Use leftovers aggressively.',
            contextDependencies: ['schedule', 'cooking_skill', 'leftovers', 'pantry_staples']
          },
          {
            key: 'grocery-shop',
            text: 'Grocery shop',
            frequency: 'weekly',
            defaultDays: ['saturday'],
            timeEstimate: '45 min',
            dimensions: [
              { dimension: 'money', direction: 'costs', reasoning: 'Primary cost center' },
              { dimension: 'body', direction: 'builds', reasoning: 'Stocked kitchen enables good choices all week' }
            ],
            specificityHints: 'Stick to the perimeter of the store. Actual list from the meal plan. Estimated budget. Seasonal produce suggestions for their area.',
            contextDependencies: ['meal_plan', 'food_budget', 'location']
          },
          {
            key: 'read-labels',
            text: 'Check labels — skip anything with ingredients you can\'t pronounce',
            frequency: 'as-needed',
            timeEstimate: '0 min (habit)',
            dimensions: [
              { dimension: 'body', direction: 'protects', reasoning: 'Awareness of what you\'re eating changes choices automatically' },
              { dimension: 'growth', direction: 'builds', reasoning: 'Learning to read food labels is a skill that compounds' }
            ],
            specificityHints: 'Not a daily checklist item — a principle. Mention it in the first week, then it becomes background knowledge. Suggest specific swaps: "Instead of bottled dressing, olive oil + lemon. Instead of store bread, [local bakery] or make your own."',
            contextDependencies: ['current_processed_food_habits']
          }
        ],
        commonFailures: [
          {
            signal: 'Falling back to takeout 3+ times per week',
            likelyCause: 'Meal plan too ambitious for current skill/time',
            adjustment: 'Reduce to 3 home-cooked dinners. Make them dead simple: protein + vegetable + starch. Build up from there.'
          },
          {
            signal: 'Food waste increasing',
            likelyCause: 'Buying too much produce without a plan to use it',
            adjustment: 'Buy less, shop twice if needed. Introduce a "use it up" meal before the next shop.'
          }
        ]
      },
      {
        id: 'eat-local-seasonal',
        label: 'Local and seasonal — know where it comes from',
        description: 'Buy from local farms, eat what\'s in season, reduce food miles.',
        clarifyingQuestions: [
          'Do you have a farmers market nearby? How far?',
          'Have you looked into CSA (farm share) programs?',
          'Are you interested in growing any of your own food?',
          'What\'s your food budget?'
        ],
        behaviors: [
          {
            key: 'farmers-market',
            text: 'Farmers market',
            frequency: 'weekly',
            defaultDays: ['saturday'],
            timeEstimate: '1-2 hours',
            dimensions: [
              { dimension: 'body', direction: 'builds', reasoning: 'Local food is fresher, more nutritious, fewer preservatives' },
              { dimension: 'people', direction: 'builds', reasoning: 'Markets are community spaces — you meet producers and neighbors' },
              { dimension: 'purpose', direction: 'builds', reasoning: 'Buying local supports the food system you believe in' },
              { dimension: 'money', direction: 'costs', reasoning: 'Local food can cost more — but less waste means less total cost' }
            ],
            specificityHints: 'Name the specific market, hours, and what\'s in season right now for their area. Suggest what to buy this week based on the season. Note vendors they might like based on their diet preferences.',
            contextDependencies: ['location', 'bioregion', 'season', 'farmers_market_details']
          },
          {
            key: 'seasonal-eating',
            text: 'Cook with what\'s in season',
            frequency: 'daily',
            timeEstimate: '0 min (planning)',
            dimensions: [
              { dimension: 'body', direction: 'builds', reasoning: 'Seasonal food is at peak nutrition and flavor' },
              { dimension: 'money', direction: 'builds', reasoning: 'In-season food is cheapest' },
              { dimension: 'growth', direction: 'builds', reasoning: 'Learning seasonal rhythms develops food literacy' }
            ],
            specificityHints: 'Integrate into the meal plan. For their zone and month, list what\'s in season. "March in Zone 5a: storage crops (potatoes, onions, carrots, beets), greenhouse greens starting, last of the winter squash. By April: asparagus, rhubarb, first greens."',
            contextDependencies: ['location', 'bioregion', 'season', 'growing_zone']
          },
          {
            key: 'cook-dinner',
            text: 'Cook dinner with local ingredients',
            frequency: 'specific-days',
            defaultDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            timeEstimate: '30-60 min',
            dimensions: [
              { dimension: 'body', direction: 'builds', reasoning: 'Fresh local ingredients = better nutrition' },
              { dimension: 'joy', direction: 'builds', reasoning: 'Cooking with peak-season food tastes dramatically better' },
              { dimension: 'home', direction: 'builds', reasoning: 'The kitchen becomes a seasonal workspace' }
            ],
            specificityHints: 'Recipes should feature market finds. "You got butternut squash and ground pork at the market. Tonight: stuffed squash — halve it, roast 40 min, fill with seasoned pork and top with cheese." Make the local ingredient the star.',
            contextDependencies: ['market_haul', 'season', 'cooking_skill']
          },
          {
            key: 'food-preservation',
            text: 'Preserve seasonal abundance',
            frequency: 'as-needed',
            timeEstimate: '2-4 hours when in season',
            dimensions: [
              { dimension: 'home', direction: 'builds', reasoning: 'A stocked pantry of preserved food is real wealth' },
              { dimension: 'money', direction: 'builds', reasoning: 'Buying in bulk at peak season and preserving saves significantly' },
              { dimension: 'identity', direction: 'builds', reasoning: 'Preservation is a fundamental human skill that connects you to cycles' }
            ],
            specificityHints: 'Only suggest when something is genuinely in season and abundant. "Tomatoes are peaking in August — buy a bushel and make sauce. Here\'s the simplest method: blanch, peel, crush, simmer, jar. 3 hours = 20 jars of sauce for winter." Include specific methods: fermentation, freezing, canning, drying.',
            contextDependencies: ['season', 'bioregion', 'kitchen_equipment', 'storage_space', 'skill_level']
          }
        ],
        commonFailures: [
          {
            signal: 'Farmers market skipped 2+ weeks',
            likelyCause: 'Saturday mornings are hard to protect',
            adjustment: 'Look into a CSA delivery or a weekday market. Some farms do on-farm pickup.'
          },
          {
            signal: 'Budget strain from local sourcing',
            likelyCause: 'Trying to buy everything local immediately',
            adjustment: 'Start with the "dirty dozen" — buy local for meat, dairy, and the most chemical-laden produce. Buy staples (rice, beans, oils) wherever is cheapest.'
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────
  // 2. GET OUT OF DEBT
  // ─────────────────────────────────────────
  {
    id: 'tmpl-get-out-of-debt',
    aspirationText: 'Get out of debt',
    variants: [
      {
        id: 'debt-snowball',
        label: 'Snowball — smallest debts first for quick wins',
        description: 'Pay minimums on everything, throw extra at the smallest balance. Momentum builds.',
        clarifyingQuestions: [
          'Roughly how many debts do you have?',
          'Do you know your total debt amount?',
          'What\'s your monthly income after taxes?',
          'Have you tried budgeting before? What happened?'
        ],
        behaviors: [
          {
            key: 'list-all-debts',
            text: 'List every debt with balance, minimum payment, and interest rate',
            frequency: 'weekly',
            defaultDays: ['sunday'],
            timeEstimate: '10 min first time, 5 min to update',
            dimensions: [
              { dimension: 'money', direction: 'builds', reasoning: 'You can\'t manage what you can\'t see. The list is the first act of control.' },
              { dimension: 'joy', direction: 'builds', reasoning: 'Facing the number is scary but reduces the ambient anxiety of not knowing' }
            ],
            specificityHints: 'First week: help them build the list. Subsequent weeks: "Update your debt list. Last week your smallest balance was $342 on the Visa. Where is it now?" Celebrate movement. Never judge the numbers.',
            contextDependencies: ['existing_debt_list']
          },
          {
            key: 'track-spending',
            text: 'Track every dollar spent today',
            frequency: 'daily',
            timeEstimate: '2 min',
            dimensions: [
              { dimension: 'money', direction: 'builds', reasoning: 'Awareness of spending changes spending — without willpower' },
              { dimension: 'growth', direction: 'builds', reasoning: 'Financial awareness is a skill that compounds' }
            ],
            specificityHints: 'Simple: at end of day, note what you spent and on what. No categories needed. No app required — notes app is fine. The act of recording is the behavior, not the analysis.',
            contextDependencies: []
          },
          {
            key: 'no-new-debt',
            text: 'No new debt today',
            frequency: 'daily',
            timeEstimate: '0 min',
            dimensions: [
              { dimension: 'money', direction: 'protects', reasoning: 'Stopping the bleeding is step one' },
              { dimension: 'identity', direction: 'builds', reasoning: 'Each day without new debt reinforces "I am someone who pays cash"' }
            ],
            specificityHints: 'Not a checklist item after week 1 — becomes background. But if the spending tracker shows credit card use, HUMA flags it gently: "You used the card Tuesday. Was that planned or a slip? No judgment — just tracking."',
            contextDependencies: ['spending_data']
          },
          {
            key: 'extra-payment',
            text: 'Make extra payment on smallest debt',
            frequency: 'weekly',
            defaultDays: ['friday'],
            timeEstimate: '5 min',
            dimensions: [
              { dimension: 'money', direction: 'builds', reasoning: 'Every extra dollar accelerates payoff exponentially' },
              { dimension: 'joy', direction: 'builds', reasoning: 'Watching a balance drop is one of the most satisfying feelings in personal finance' }
            ],
            specificityHints: 'Calculate the extra amount from what they saved that week (tracked spending shows the margin). Even $20 matters. "You saved $35 this week by cooking at home instead of takeout. Send $35 to the Visa today — that brings it to $307. Three more weeks like this and it\'s gone." Connect food behaviors to money behaviors explicitly.',
            contextDependencies: ['debt_list', 'spending_data', 'income']
          },
          {
            key: 'find-extra-income',
            text: 'One action toward extra income this week',
            frequency: 'weekly',
            timeEstimate: '1-3 hours',
            dimensions: [
              { dimension: 'money', direction: 'builds', reasoning: 'Income increase is the most powerful accelerator of debt payoff' },
              { dimension: 'growth', direction: 'builds', reasoning: 'Side income develops skills and entrepreneurial capacity' }
            ],
            specificityHints: 'Specific to their skills. A baker: "Could you sell bread at the farmers market? What would 10 loaves at $8 each add per weekend?" A carpenter: "Any small repair jobs in the neighborhood?" Don\'t suggest generic gig work unless nothing else fits.',
            contextDependencies: ['skills', 'available_time', 'current_income']
          }
        ],
        commonFailures: [
          {
            signal: 'No extra payment made 2+ weeks',
            likelyCause: 'No margin found in spending, or unexpected expense',
            adjustment: 'Revisit spending data together. Look for one subscription to cut, one recurring cost to reduce. Even $10/week is $520/year.'
          },
          {
            signal: 'New debt added',
            likelyCause: 'Emergency without savings buffer',
            adjustment: 'Pause the debt snowball. Build a $500 mini emergency fund first — even at $25/week. Prevents new debt from derailing progress.'
          },
          {
            signal: 'Stopped tracking spending',
            likelyCause: 'Tracking felt tedious or discouraging',
            adjustment: 'Simplify to weekly total only. Or switch to cash envelope for discretionary spending — the physical money does the tracking.'
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────
  // 3. MOVE MY BODY
  // ─────────────────────────────────────────
  {
    id: 'tmpl-move-body',
    aspirationText: 'Move my body',
    variants: [
      {
        id: 'move-daily-walks',
        label: 'Daily walks — simple, no equipment',
        description: 'Walking is the most underrated exercise. Start here.',
        clarifyingQuestions: [
          'How much are you moving right now?',
          'Any injuries or physical limitations?',
          'When in the day do you have 20-30 minutes free?',
          'Do you prefer being alone or with someone?'
        ],
        behaviors: [
          {
            key: 'morning-walk',
            text: 'Morning walk',
            frequency: 'daily',
            timeEstimate: '20-30 min',
            dimensions: [
              { dimension: 'body', direction: 'builds', reasoning: 'Walking improves cardiovascular health, reduces inflammation, regulates blood sugar' },
              { dimension: 'joy', direction: 'builds', reasoning: 'Morning sunlight and movement set mood for the day' },
              { dimension: 'growth', direction: 'builds', reasoning: 'Walking is when many people think most clearly — it\'s processing time' }
            ],
            specificityHints: 'Time to sunrise/sunset. Temperature and weather. Specific route suggestion if location is known ("the loop around the neighborhood is about 1.5 miles — perfect for 25 min"). If it\'s raining or bitter cold, indoor alternative: walk in place while listening to a podcast for 15 min. Don\'t make weather an excuse, but adapt to it.',
            contextDependencies: ['location', 'weather', 'schedule', 'physical_limitations']
          },
          {
            key: 'evening-stretch',
            text: 'Evening stretch — 5 minutes before bed',
            frequency: 'daily',
            timeEstimate: '5 min',
            dimensions: [
              { dimension: 'body', direction: 'builds', reasoning: 'Stretching reduces tension accumulated during the day' },
              { dimension: 'body', direction: 'protects', reasoning: 'Signals to the nervous system that it\'s time to wind down — improves sleep' }
            ],
            specificityHints: 'Name 4-5 specific stretches. Keep it dead simple: "Hamstrings (touch toes, 30 sec), hip flexors (lunge stretch, 30 sec each side), shoulders (arm across chest, 30 sec each), neck rolls (30 sec each direction), child\'s pose (1 min)." That\'s 5 minutes. No yoga mat needed.',
            contextDependencies: ['physical_limitations']
          },
          {
            key: 'walk-after-dinner',
            text: 'Walk after dinner',
            frequency: 'specific-days',
            defaultDays: ['monday', 'wednesday', 'friday', 'sunday'],
            timeEstimate: '15-20 min',
            dimensions: [
              { dimension: 'body', direction: 'builds', reasoning: 'Post-meal walking dramatically improves blood sugar regulation' },
              { dimension: 'people', direction: 'builds', reasoning: 'Walking together after dinner is relationship time disguised as movement' },
              { dimension: 'joy', direction: 'builds', reasoning: 'Evening walks are decompression — the day\'s stress processes itself' }
            ],
            specificityHints: 'Frame as a together activity if they have a partner or kids. "After dinner, 15-minute walk with Madison. No phones. Just walk and talk." If solo, suggest a podcast or just silence. Note sunset time — adjust for darkness and safety.',
            contextDependencies: ['household', 'location', 'sunset_time', 'safety']
          }
        ],
        commonFailures: [
          {
            signal: 'Morning walk skipped 3+ days',
            likelyCause: 'Mornings are too rushed or weather is bad',
            adjustment: 'Move to lunch walk or after-dinner walk. The time of day matters less than doing it. Or shorten to 10 minutes — half a walk beats no walk.'
          },
          {
            signal: 'Evening stretch never happens',
            likelyCause: 'Falls asleep before getting to it',
            adjustment: 'Attach it to tooth brushing — stretch while waiting for the timer. Or do it on the bed. Lower the bar until it sticks.'
          }
        ]
      },
      {
        id: 'move-strength',
        label: 'Get strong — build real strength',
        description: 'Bodyweight or weights. Progressive. Functional.',
        clarifyingQuestions: [
          'Have you done strength training before?',
          'Do you have access to a gym, or training at home?',
          'What equipment do you have (if any)?',
          'How many days per week can you realistically commit?'
        ],
        behaviors: [
          {
            key: 'strength-session',
            text: 'Strength training session',
            frequency: 'specific-days',
            defaultDays: ['monday', 'wednesday', 'friday'],
            timeEstimate: '30-45 min',
            dimensions: [
              { dimension: 'body', direction: 'builds', reasoning: 'Strength training builds muscle, bone density, metabolic health' },
              { dimension: 'identity', direction: 'builds', reasoning: 'Getting stronger changes how you see yourself — capability becomes identity' },
              { dimension: 'joy', direction: 'builds', reasoning: 'Progressive overload is one of the clearest feedback loops in life — you can SEE the progress' }
            ],
            specificityHints: 'Specific workout for today, not just "strength training." Beginner bodyweight: "5 sets: 10 squats, 10 push-ups (from knees if needed), 10 rows (use a table edge), 30-sec plank. Rest 60 sec between sets. Total: 25 min." Progress by adding reps or difficulty each week. Log the numbers.',
            contextDependencies: ['fitness_level', 'equipment', 'gym_access', 'physical_limitations']
          },
          {
            key: 'morning-walk',
            text: 'Walk on off-days',
            frequency: 'specific-days',
            defaultDays: ['tuesday', 'thursday', 'saturday'],
            timeEstimate: '20-30 min',
            dimensions: [
              { dimension: 'body', direction: 'builds', reasoning: 'Active recovery between strength sessions' },
              { dimension: 'joy', direction: 'builds', reasoning: 'Movement without intensity — restorative' }
            ],
            specificityHints: 'Light walk, not a workout. Recovery day. "Easy 20-minute walk. No pace target. Just move."',
            contextDependencies: ['location', 'weather']
          },
          {
            key: 'protein-target',
            text: 'Hit protein target today',
            frequency: 'daily',
            timeEstimate: '0 min (awareness)',
            dimensions: [
              { dimension: 'body', direction: 'builds', reasoning: 'Protein is the building block for the strength you\'re training. Training without protein is like building without materials.' }
            ],
            specificityHints: 'Calculate their target: roughly 0.7-1g per pound of body weight. Then make it concrete: "Your target is ~130g today. Breakfast: 3 eggs + sausage (35g). Lunch: chicken thigh + rice (40g). Dinner: beef stew (45g). Snack: Greek yogurt (15g). That\'s 135g." Integrate with meal planning if they have the eat-real-food aspiration.',
            contextDependencies: ['body_weight', 'meal_plan', 'dietary_preferences']
          }
        ],
        commonFailures: [
          {
            signal: 'Skipping strength sessions for 2+ weeks',
            likelyCause: 'Too ambitious, too sore, or schedule conflict',
            adjustment: 'Drop to 2x/week. Shorter sessions (20 min). The minimum effective dose is surprisingly low — 2 sessions of 20 minutes builds real strength.'
          },
          {
            signal: 'Not progressing (same weights/reps for 3+ weeks)',
            likelyCause: 'Not tracking, not eating enough, or not sleeping enough',
            adjustment: 'Check the cross-dimensional connections: sleep and nutrition are likely the bottleneck, not the training.'
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────
  // 4. SPEND TIME WITH MY KIDS
  // ─────────────────────────────────────────
  {
    id: 'tmpl-time-with-kids',
    aspirationText: 'Spend time with my kids',
    variants: [
      {
        id: 'kids-daily-rituals',
        label: 'Daily rituals — protected time every day',
        description: 'Small, consistent, sacred time. Not big trips — everyday presence.',
        clarifyingQuestions: [
          'How old are your kids?',
          'What time do you usually get home from work?',
          'What do they love doing?',
          'Is a partner involved in this goal too?'
        ],
        behaviors: [
          {
            key: 'family-dinner',
            text: 'Family dinner at the table — no screens',
            frequency: 'specific-days',
            defaultDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            timeEstimate: '30-45 min',
            dimensions: [
              { dimension: 'people', direction: 'builds', reasoning: 'Shared meals are the single strongest predictor of family cohesion in research' },
              { dimension: 'body', direction: 'builds', reasoning: 'Eating together improves everyone\'s nutrition — kids especially' },
              { dimension: 'joy', direction: 'builds', reasoning: 'The table is where the day gets processed' }
            ],
            specificityHints: 'Integrate with cook-at-home if that aspiration exists. "Dinner at 6:00. Everyone at the table. Phones in the basket by the door. One question for tonight: what was the hardest thing about your day?" Give specific conversation starters — kids need prompts.',
            contextDependencies: ['kids_ages', 'household_schedule', 'meal_plan']
          },
          {
            key: 'bedtime-presence',
            text: 'Bedtime — 15 minutes, fully present',
            frequency: 'daily',
            timeEstimate: '15 min',
            dimensions: [
              { dimension: 'people', direction: 'builds', reasoning: 'Bedtime is the most emotionally open moment of a child\'s day' },
              { dimension: 'joy', direction: 'builds', reasoning: 'Reading together, talking about the day — this is the stuff that makes a childhood' }
            ],
            specificityHints: 'Age-specific. Under 5: read a book, sing a song, 3 things you\'re grateful for. 5-10: read together, one question about their day, back scratch. Over 10: just be available in the room — they might talk, they might not. Presence without agenda.',
            contextDependencies: ['kids_ages']
          },
          {
            key: 'work-hard-stop',
            text: 'Hard stop on work — home by committed time',
            frequency: 'specific-days',
            defaultDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            timeEstimate: '0 min (boundary)',
            dimensions: [
              { dimension: 'people', direction: 'protects', reasoning: 'The hard stop is what makes family time possible' },
              { dimension: 'money', direction: 'costs', reasoning: 'Leaving work on time might mean less overtime or slower career progress — acknowledge the trade-off' },
              { dimension: 'purpose', direction: 'builds', reasoning: 'Choosing family time is a values alignment behavior — purpose in action' }
            ],
            specificityHints: 'Name the specific time based on their schedule. "Leave the bakery by 4:30. Home by 5:00. Dinner at 5:30. This is non-negotiable Tuesday through Friday. Saturday is your long day — that\'s the trade-off." Make the trade-off explicit — not everything can be optimized.',
            contextDependencies: ['work_schedule', 'commute', 'dinner_time']
          },
          {
            key: 'weekend-adventure',
            text: 'One family adventure per weekend',
            frequency: 'weekly',
            defaultDays: ['saturday', 'sunday'],
            timeEstimate: '2-4 hours',
            dimensions: [
              { dimension: 'people', direction: 'builds', reasoning: 'Shared experiences create the stories families are built on' },
              { dimension: 'joy', direction: 'builds', reasoning: 'Adventure is joy in its purest form' },
              { dimension: 'body', direction: 'builds', reasoning: 'Most kid adventures involve movement — hiking, biking, swimming, exploring' }
            ],
            specificityHints: 'Specific to their location and season. "Saturday: drive to the Sleeping Bear Dunes (45 min). Hike the Empire Bluff trail — 1.5 miles, kid-friendly, lake views. Pack sandwiches." Not "do something fun" — an actual plan with logistics.',
            contextDependencies: ['location', 'kids_ages', 'season', 'weather', 'budget']
          }
        ],
        commonFailures: [
          {
            signal: 'Hard stop missed 3+ times in a week',
            likelyCause: 'Work pressure or habit of staying late',
            adjustment: 'Set a physical alarm at the stop time. Tell one coworker about the commitment — social accountability. On days you must stay late, move the ritual to morning (breakfast together instead of dinner).'
          },
          {
            signal: 'Family dinner happening but feels forced',
            likelyCause: 'No conversation structure — everyone stares at food',
            adjustment: 'Introduce a low-pressure game: highs and lows, two truths and a lie, "if you could have any superpower today." Structure creates permission to open up.'
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────
  // 5. SLEEP WELL
  // ─────────────────────────────────────────
  {
    id: 'tmpl-sleep-well',
    aspirationText: 'Sleep well',
    variants: [
      {
        id: 'sleep-routine',
        label: 'Build a sleep routine',
        description: 'Consistent bedtime, wind-down ritual, better sleep environment.',
        clarifyingQuestions: [
          'What time do you need to wake up?',
          'What\'s your current bedtime?',
          'What do you usually do in the hour before bed?',
          'Is the bedroom dark, cool, and quiet?'
        ],
        behaviors: [
          {
            key: 'screens-off',
            text: 'Screens off 1 hour before bed',
            frequency: 'daily',
            timeEstimate: '0 min (subtraction)',
            dimensions: [
              { dimension: 'body', direction: 'builds', reasoning: 'Blue light suppresses melatonin. Removing screens is the single highest-impact sleep behavior.' },
              { dimension: 'growth', direction: 'builds', reasoning: 'The hour before bed becomes available for reading, conversation, or thinking' }
            ],
            specificityHints: 'Specific time. "Screens off at 9:00pm. Phone charges in the kitchen, not the bedroom. If you need an alarm, buy a $10 alarm clock — this is worth it." Suggest what to do instead: read, stretch, talk, prep tomorrow\'s clothes.',
            contextDependencies: ['target_bedtime', 'current_evening_habits']
          },
          {
            key: 'consistent-bedtime',
            text: 'In bed by target time',
            frequency: 'daily',
            timeEstimate: '0 min (discipline)',
            dimensions: [
              { dimension: 'body', direction: 'builds', reasoning: 'Consistent sleep timing is more important than sleep duration for quality' }
            ],
            specificityHints: 'Name the specific time. "In bed by 9:30pm. Lights out by 9:45pm. This means starting the wind-down at 8:30pm." Show how this connects to wake time: "8 hours of sleep opportunity = wake at 5:45am feeling rested."',
            contextDependencies: ['wake_time', 'current_bedtime']
          },
          {
            key: 'morning-light',
            text: 'Morning sunlight within 30 minutes of waking',
            frequency: 'daily',
            timeEstimate: '10 min',
            dimensions: [
              { dimension: 'body', direction: 'builds', reasoning: 'Morning light resets circadian rhythm, improves nighttime sleep quality, boosts daytime energy' },
              { dimension: 'joy', direction: 'builds', reasoning: 'Starting the day outside changes the feeling of the entire morning' }
            ],
            specificityHints: 'Combine with morning walk if that behavior exists. "Step outside within 30 minutes of waking. Face the sun (don\'t stare at it). Even overcast days work — outdoor light is 10-100x brighter than indoor. 10 minutes minimum." In winter: "Sunrise is 7:42am. If you wake before that, get outside as soon as there\'s light."',
            contextDependencies: ['wake_time', 'sunrise_time', 'weather']
          },
          {
            key: 'no-late-caffeine',
            text: 'No caffeine after noon',
            frequency: 'daily',
            timeEstimate: '0 min (subtraction)',
            dimensions: [
              { dimension: 'body', direction: 'builds', reasoning: 'Caffeine has a 6-hour half-life. Afternoon coffee is still in your system at bedtime.' }
            ],
            specificityHints: 'First week only as a checklist item. Then background. If they\'re a heavy coffee drinker: "Morning coffee is fine — enjoy it. But switch to water or herbal tea after noon. The 2pm coffee is stealing from tonight\'s sleep."',
            contextDependencies: ['caffeine_habits']
          }
        ],
        commonFailures: [
          {
            signal: 'Screens-off not happening',
            likelyCause: 'Evening scrolling is the de-stress routine',
            adjustment: 'Replace with something equally passive: audiobook, podcast, music. The issue isn\'t willpower — it\'s having nothing else to do. Provide the alternative.'
          },
          {
            signal: 'Bedtime inconsistent (varying by 2+ hours)',
            likelyCause: 'Weekend drift or work schedule variation',
            adjustment: 'Allow 30-minute weekend flexibility, but anchor the wake time. Consistent wake time matters more than consistent bedtime.'
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────
  // 6. SAVE MONEY
  // ─────────────────────────────────────────
  {
    id: 'tmpl-save-money',
    aspirationText: 'Save money',
    variants: [
      {
        id: 'save-emergency-fund',
        label: 'Build an emergency fund first',
        description: 'Before investing or big goals — $1,000 buffer so emergencies don\'t become debt.',
        clarifyingQuestions: [
          'Do you have any savings right now?',
          'What\'s your biggest recurring expense you might be able to reduce?',
          'Do you get paid weekly, biweekly, or monthly?',
          'Have you had an unexpected expense in the last 3 months?'
        ],
        behaviors: [
          {
            key: 'auto-transfer',
            text: 'Automatic transfer to savings on payday',
            frequency: 'weekly',
            timeEstimate: '5 min setup, then automatic',
            dimensions: [
              { dimension: 'money', direction: 'builds', reasoning: 'Pay yourself first. Automation removes the decision — the money is saved before you see it.' },
              { dimension: 'joy', direction: 'builds', reasoning: 'Watching a savings balance grow is a quiet, powerful antidote to financial anxiety' }
            ],
            specificityHints: 'First week: help them set up the auto-transfer. "Set up an automatic transfer of $X every [payday]. Start with whatever doesn\'t hurt — even $25. You can increase it later." Subsequent weeks: "Your auto-transfer went through. Savings balance: $X. You\'re Y weeks from $1,000."',
            contextDependencies: ['income', 'pay_frequency', 'current_savings', 'bank_setup']
          },
          {
            key: 'track-spending',
            text: 'Track spending — know where it goes',
            frequency: 'daily',
            timeEstimate: '2 min',
            dimensions: [
              { dimension: 'money', direction: 'builds', reasoning: 'Awareness changes behavior without willpower' },
              { dimension: 'growth', direction: 'builds', reasoning: 'Financial awareness is a life skill' }
            ],
            specificityHints: 'Same as debt template. End of day, note what you spent. No judgment. "You spent $47 today: $12 gas, $8 coffee + muffin, $27 groceries." After a week, patterns emerge. HUMA can flag: "Coffee + muffin 5x this week = $40/month. That\'s one week\'s auto-transfer."',
            contextDependencies: []
          },
          {
            key: 'one-cut',
            text: 'One subscription or recurring cost to cut this month',
            frequency: 'weekly',
            defaultDays: ['sunday'],
            timeEstimate: '10 min',
            dimensions: [
              { dimension: 'money', direction: 'builds', reasoning: 'Recurring costs are the silent drain. Cutting one frees up margin permanently.' }
            ],
            specificityHints: 'Week 1: "List all subscriptions and recurring charges. Streaming, gym, apps, memberships, insurance." Week 2: "Which one do you use least?" Week 3: "Cancel it. Redirect that $X to savings." Don\'t cut everything — cut the one that won\'t be missed.',
            contextDependencies: ['recurring_expenses']
          },
          {
            key: 'no-impulse-purchases',
            text: '24-hour rule on non-essential purchases over $20',
            frequency: 'daily',
            timeEstimate: '0 min (rule)',
            dimensions: [
              { dimension: 'money', direction: 'protects', reasoning: 'Most impulse purchases wouldn\'t happen with a 24-hour delay' },
              { dimension: 'identity', direction: 'builds', reasoning: 'Choosing to wait reinforces "I am in control of my money"' }
            ],
            specificityHints: 'First week as a checklist reminder. Then background. If they flag a want: "You mentioned wanting new headphones ($80). That\'s fine — wait 24 hours. If you still want them tomorrow, buy them guilt-free. The pause is the behavior, not the denial."',
            contextDependencies: []
          }
        ],
        commonFailures: [
          {
            signal: 'Auto-transfer gets manually reversed',
            likelyCause: 'Account runs low before next payday',
            adjustment: 'Reduce the transfer amount. $10/week that stays is better than $50/week that gets pulled back. Also check: is there a timing issue? Move transfer to 1 day after payday, not same day.'
          },
          {
            signal: 'Spending tracking stops after week 1',
            likelyCause: 'Too tedious',
            adjustment: 'Switch to weekly bank statement review instead of daily tracking. "Sunday: open your bank app, scroll through the week. Note the total. That\'s it."'
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────
  // 7. GROW MY OWN FOOD
  // ─────────────────────────────────────────
  {
    id: 'tmpl-grow-food',
    aspirationText: 'Grow my own food',
    variants: [
      {
        id: 'grow-beginner-garden',
        label: 'Start a garden — beginner level',
        description: 'Raised beds or containers. Easy wins first. Learn by growing.',
        clarifyingQuestions: [
          'What space do you have? (balcony, yard, acreage)',
          'What growing zone are you in? (or what\'s your location)',
          'Have you grown anything before?',
          'What foods does your family eat most?'
        ],
        behaviors: [
          {
            key: 'garden-plan',
            text: 'Plan what to grow this season',
            frequency: 'as-needed',
            timeEstimate: '1-2 hours once, then seasonal updates',
            dimensions: [
              { dimension: 'home', direction: 'builds', reasoning: 'A garden plan turns your space into productive land' },
              { dimension: 'growth', direction: 'builds', reasoning: 'Learning your zone, your soil, your seasons is deep practical knowledge' }
            ],
            specificityHints: 'Zone-specific. "You\'re in Zone 5a, Michigan. Last frost is around May 15. Start indoors now (March): tomatoes, peppers. Direct sow in April: lettuce, spinach, peas, radishes. By May: everything else." Give specific varieties that are easy and productive for their zone. Link to a planting calendar.',
            contextDependencies: ['location', 'growing_zone', 'space_available', 'experience_level', 'diet']
          },
          {
            key: 'daily-garden-check',
            text: 'Garden check — 10 minutes',
            frequency: 'daily',
            timeEstimate: '10 min',
            dimensions: [
              { dimension: 'body', direction: 'builds', reasoning: 'Time outside, bending, lifting, moving — gentle daily movement' },
              { dimension: 'joy', direction: 'builds', reasoning: 'Watching things grow is deeply satisfying. It\'s the original dopamine.' },
              { dimension: 'purpose', direction: 'builds', reasoning: 'Tending food is one of the most fundamental human activities' }
            ],
            specificityHints: 'Season-specific tasks. "Morning garden check: water the seedlings (they\'re in the south window). Check for germination — the lettuce should be up by now. Pull any weeds in the raised bed." In winter: "Check on the garlic mulch. Plan next year\'s layout." Always something to do, always specific.',
            contextDependencies: ['season', 'what_is_planted', 'growth_stage', 'weather']
          },
          {
            key: 'weekly-garden-work',
            text: 'Weekend garden session',
            frequency: 'weekly',
            defaultDays: ['saturday'],
            timeEstimate: '1-3 hours',
            dimensions: [
              { dimension: 'home', direction: 'builds', reasoning: 'Each session builds the productive capacity of your space' },
              { dimension: 'body', direction: 'builds', reasoning: 'Gardening is full-body functional movement' },
              { dimension: 'people', direction: 'builds', reasoning: 'Gardening with kids or partner is working together toward something tangible' }
            ],
            specificityHints: 'Specific project for this weekend based on season and progress. "Saturday: build the second raised bed (4x8, you have the lumber). Fill with compost + topsoil mix. Plant the lettuce starts you\'ve been growing inside." Or: "Harvest the kale and chard. Process for freezing: blanch 2 min, ice bath, bag in portions."',
            contextDependencies: ['season', 'current_garden_state', 'available_materials', 'weather']
          }
        ],
        commonFailures: [
          {
            signal: 'Garden check skipped for 3+ days',
            likelyCause: 'Schedule too busy, or garden felt overwhelming',
            adjustment: 'Scale down. If raised beds are too much, start with 3 containers on the porch: one herb pot, one tomato, one lettuce. 2 minutes to water. Can\'t fail.'
          },
          {
            signal: 'Plants dying',
            likelyCause: 'Watering inconsistency or wrong plants for the conditions',
            adjustment: 'Install a simple drip timer ($30). Switch to hardier varieties. "Cherry tomatoes, zucchini, and herbs are nearly indestructible in your zone. Start there."'
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────
  // 8. LESS STRESS
  // ─────────────────────────────────────────
  {
    id: 'tmpl-less-stress',
    aspirationText: 'Less stress',
    variants: [
      {
        id: 'stress-daily-recovery',
        label: 'Build daily recovery habits',
        description: 'You can\'t eliminate stress, but you can recover from it daily.',
        clarifyingQuestions: [
          'What\'s the biggest source of stress right now?',
          'Do you have any time in the day that\'s just yours?',
          'How do you currently decompress?',
          'Is the stress mostly work, money, relationships, or health?'
        ],
        behaviors: [
          {
            key: 'morning-quiet',
            text: '10 minutes of quiet before the day starts',
            frequency: 'daily',
            timeEstimate: '10 min',
            dimensions: [
              { dimension: 'joy', direction: 'builds', reasoning: 'Starting the day on your terms changes the entire day\'s texture' },
              { dimension: 'body', direction: 'builds', reasoning: 'Nervous system regulation before the demands begin' }
            ],
            specificityHints: 'Not meditation (unless they want that). Just quiet. "Wake 10 minutes before you need to. Sit with coffee. No phone. Look out the window. That\'s it." Or: "Step outside. Feel the air. 10 breaths. Then start your day." Make it the easiest possible version of solitude.',
            contextDependencies: ['wake_time', 'household', 'current_morning_routine']
          },
          {
            key: 'movement-break',
            text: 'Movement break — 5 minutes, midday',
            frequency: 'daily',
            timeEstimate: '5 min',
            dimensions: [
              { dimension: 'body', direction: 'builds', reasoning: 'Physical movement metabolizes stress hormones' },
              { dimension: 'growth', direction: 'builds', reasoning: 'Breaking a stress cycle midday prevents accumulation' }
            ],
            specificityHints: 'Simple. "At noon (set an alarm): stand up, walk outside for 5 minutes, come back. If you can\'t go outside: 20 squats, 20 arm circles, touch your toes 10 times. Move your body. Reset your nervous system."',
            contextDependencies: ['work_environment', 'schedule']
          },
          {
            key: 'evening-decompression',
            text: 'Decompression ritual — transition from work to home',
            frequency: 'daily',
            timeEstimate: '15 min',
            dimensions: [
              { dimension: 'joy', direction: 'builds', reasoning: 'A transition ritual prevents work stress from bleeding into home life' },
              { dimension: 'people', direction: 'protects', reasoning: 'Arriving home decompressed means you\'re actually present for your family' }
            ],
            specificityHints: 'The commute IS the decompression if used intentionally. "On the drive home: no news, no work calls. Music or silence. When you park, sit for 2 minutes before going inside. You\'re transitioning from worker to partner/parent. Let the work version of you stay in the car." If they work from home: "At 5pm: close the laptop. Change clothes (this matters — it\'s a physical transition). Walk around the block once. Now you\'re home."',
            contextDependencies: ['commute', 'work_situation', 'household']
          },
          {
            key: 'brain-dump',
            text: 'Brain dump before bed — get it out of your head',
            frequency: 'daily',
            timeEstimate: '5 min',
            dimensions: [
              { dimension: 'body', direction: 'protects', reasoning: 'Open loops in your head disrupt sleep. Writing them down closes the loop.' },
              { dimension: 'joy', direction: 'builds', reasoning: 'Going to bed with an empty mind is a form of peace' }
            ],
            specificityHints: 'Not journaling. Not reflection. Just a dump. "Before bed: write down everything that\'s on your mind. Tasks, worries, ideas, reminders. Paper or phone notes. Don\'t organize it. Just get it out. Tomorrow\'s production sheet will handle the tasks. Tonight, your only job is sleep."',
            contextDependencies: ['bedtime_routine']
          }
        ],
        commonFailures: [
          {
            signal: 'Morning quiet not happening',
            likelyCause: 'Can\'t wake up earlier, or household is too chaotic',
            adjustment: 'Move to a different slot: lunch break, right after kids go to school, or in the car before going inside. The timing doesn\'t matter — the practice does.'
          },
          {
            signal: 'Stress level not improving despite behaviors',
            likelyCause: 'The source of stress hasn\'t been addressed — only the recovery',
            adjustment: 'Time to look at the source. Is it workload? Financial? Relational? Recovery behaviors buy time, but the source needs a structural solution. Open a conversation about it.'
          }
        ]
      }
    ]
  }
];
