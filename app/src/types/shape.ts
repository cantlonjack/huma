export interface ShapeData {
  dimensions: {
    body: number;      // 1-5 (internal: Living)
    people: number;    // 1-5 (internal: Social)
    money: number;     // 1-5 (internal: Financial)
    home: number;      // 1-5 (internal: Material)
    growth: number;    // 1-5 (internal: Intellectual)
    joy: number;       // 1-5 (internal: Experiential)
    purpose: number;   // 1-5 (internal: Spiritual)
    identity: number;  // 1-5 (internal: Cultural)
  };
  createdAt: Date;
  source: 'builder' | 'pulse' | 'conversation';
}

// Fixed dimension order (clockwise from top):
export const DIMENSION_ORDER = [
  'body', 'people', 'money', 'home',
  'growth', 'joy', 'purpose', 'identity'
] as const;

export type DimensionKey = typeof DIMENSION_ORDER[number];

// Friendly -> Internal mapping
export const DIMENSION_MAP: Record<DimensionKey, string> = {
  body: 'Living',
  people: 'Social',
  money: 'Financial',
  home: 'Material',
  growth: 'Intellectual',
  joy: 'Experiential',
  purpose: 'Spiritual',
  identity: 'Cultural',
};

// User-facing labels
export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  body: 'Body',
  people: 'People',
  money: 'Money',
  home: 'Home',
  growth: 'Growth',
  joy: 'Joy',
  purpose: 'Purpose',
  identity: 'Identity',
};

// Per-dimension colors (for illustrations and future accent use)
export const DIMENSION_COLORS: Record<DimensionKey, string> = {
  body: '#3A5A40',
  people: '#5C7A62',
  money: '#B5621E',
  home: '#2E6B8A',
  growth: '#8A6D1E',
  joy: '#A04040',
  purpose: '#3A5A40',
  identity: '#8BAF8E',
};

// Card definitions for the Shape Builder
export interface ShapeCard {
  dimension: DimensionKey;
  question: string;
  pills: [string, string, string, string, string];
}

export const SHAPE_CARDS: ShapeCard[] = [
  {
    dimension: 'body',
    question: 'How does your body feel right now?',
    pills: ['depleted', 'heavy', 'okay', 'strong', 'alive'],
  },
  {
    dimension: 'people',
    question: 'The people in your life right now?',
    pills: ['alone', 'strained', 'mixed', 'supported', 'held'],
  },
  {
    dimension: 'money',
    question: 'How does money feel?',
    pills: ['drowning', 'tight', 'managing', 'stable', 'flowing'],
  },
  {
    dimension: 'home',
    question: 'Your physical space \u2014 does it hold you?',
    pills: ['trapped', 'cramped', 'fine', 'comfortable', 'sanctuary'],
  },
  {
    dimension: 'growth',
    question: 'Are you learning and growing right now?',
    pills: ['stuck', 'restless', 'learning', 'building', 'accelerating'],
  },
  {
    dimension: 'joy',
    question: 'How close is joy right now?',
    pills: ['numb', 'rare', 'sometimes', 'often', 'everywhere'],
  },
  {
    dimension: 'purpose',
    question: 'Do you know what you\u2019re building toward?',
    pills: ['lost', 'searching', 'glimpses', 'forming', 'clear'],
  },
  {
    dimension: 'identity',
    question: 'Do you feel like yourself?',
    pills: ['fractured', 'scattered', 'assembling', 'settling', 'whole'],
  },
];
