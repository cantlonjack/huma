import type { LotusState, LotusAction, LotusScreen, CapitalKey } from "@/types/lotus";

export const INITIAL_CAPITALS: Record<CapitalKey, number> = {
  financial: 0,
  material: 0,
  living: 0,
  social: 0,
  experiential: 0,
  intellectual: 0,
  spiritual: 0,
  cultural: 0,
};

export const INITIAL_STATE: LotusState = {
  screen: 1,
  context: {
    capitals: { ...INITIAL_CAPITALS },
    governance: { solo: true, people: [] },
    lotusProgress: {
      whole: false,
      who: false,
      what: false,
      context: false,
      purpose: false,
      vision: false,
      behavior: false,
      nurture: false,
      validate: false,
      design: false,
      install: false,
      evolve: false,
    },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  wholeParams: [],
  wholePhase: 1,
  direction: 1,
  loading: false,
  error: null,
};

function clampScreen(n: number): LotusScreen {
  return Math.max(1, Math.min(13, n)) as LotusScreen;
}

/**
 * Compute WHOLE visualization parameters from entity type + stage + capitals.
 * Returns an array of numbers that seed the parametric curve.
 */
function computeWholeParams(context: Partial<LotusState["context"]>): number[] {
  const entitySeed = context.entityType === "person" ? 3 : 5;
  const stageSeed =
    context.stage === "starting"
      ? 1
      : context.stage === "transition"
        ? 2
        : context.stage === "building"
          ? 3
          : context.stage === "searching"
            ? 1.5
            : 1;

  const caps = context.capitals ?? INITIAL_CAPITALS;
  const values = Object.values(caps);
  const sum = values.reduce((a, b) => a + b, 0);
  const variance =
    values.length > 0
      ? values.reduce((a, v) => a + Math.pow(v - sum / values.length, 2), 0) /
        values.length
      : 0;

  return [entitySeed, stageSeed, sum, Math.sqrt(variance)];
}

export function lotusReducer(state: LotusState, action: LotusAction): LotusState {
  const now = new Date().toISOString();

  switch (action.type) {
    case "SET_NAME":
      return {
        ...state,
        context: { ...state.context, name: action.name, updatedAt: now },
      };

    case "SET_ENTITY_TYPE": {
      const params = computeWholeParams({
        ...state.context,
        entityType: action.entityType,
      });
      return {
        ...state,
        context: { ...state.context, entityType: action.entityType, updatedAt: now },
        wholeParams: params,
      };
    }

    case "SET_STAGE": {
      const params = computeWholeParams({
        ...state.context,
        stage: action.stage,
      });
      return {
        ...state,
        context: {
          ...state.context,
          stage: action.stage,
          lotusProgress: { ...state.context.lotusProgress!, whole: true },
          updatedAt: now,
        },
        wholeParams: params,
      };
    }

    case "SET_GOVERNANCE":
      return {
        ...state,
        context: {
          ...state.context,
          governance: action.governance,
          lotusProgress: { ...state.context.lotusProgress!, who: true },
          updatedAt: now,
        },
      };

    case "SET_CAPITAL": {
      const newCapitals = {
        ...state.context.capitals!,
        [action.key]: action.value,
      };
      return {
        ...state,
        context: { ...state.context, capitals: newCapitals, updatedAt: now },
      };
    }

    case "SET_SYNTHESIS": {
      const params = computeWholeParams(state.context);
      return {
        ...state,
        context: {
          ...state.context,
          archetype: action.archetype,
          archetypeDescription: action.archetypeDescription,
          strengths: action.strengths,
          growthAreas: action.growthAreas,
          lotusProgress: { ...state.context.lotusProgress!, what: true },
          updatedAt: now,
        },
        wholeParams: params,
        // wholePhase stays at 1 — phase 2 triggers when screen 10 renders
      };
    }

    case "SET_INSIGHT":
      return {
        ...state,
        context: {
          ...state.context,
          firstInsight: action.insight,
          firstPattern: action.pattern,
          updatedAt: now,
        },
        loading: false,
      };

    case "SET_LOCATION":
      return {
        ...state,
        context: { ...state.context, location: action.location, updatedAt: now },
      };

    case "NEXT_SCREEN": {
      const nextScreen = clampScreen(state.screen + 1);
      const phase: 1 | 2 | 3 =
        nextScreen >= 11 ? 3 : nextScreen >= 10 ? 2 : state.wholePhase;
      return {
        ...state,
        screen: nextScreen,
        direction: 1,
        wholePhase: phase,
      };
    }

    case "PREV_SCREEN":
      return {
        ...state,
        screen: clampScreen(state.screen - 1),
        direction: -1,
      };

    case "GO_TO_SCREEN": {
      // Derive wholePhase from target screen
      const phase: 1 | 2 | 3 =
        action.screen >= 11 ? 3 : action.screen >= 10 ? 2 : state.wholePhase;
      return {
        ...state,
        screen: action.screen,
        direction: action.screen > state.screen ? 1 : -1,
        wholePhase: phase,
      };
    }

    case "SET_LOADING":
      return { ...state, loading: action.loading };

    case "SET_ERROR":
      return { ...state, error: action.error, loading: false };

    case "RESTORE_STATE":
      return { ...action.state };

    default:
      return state;
  }
}
