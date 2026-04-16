export type { RpplSeed, RpplType, PrincipleSource } from "./types";
export { axiomSeeds } from "./axioms";
export { capacitySeeds } from "./capacities";
export { frameworkSeeds } from "./frameworks";
export { principleSeeds } from "./principles";
// Future practice domains:
// export { bodyHealthSeeds } from "./body-health";
// export { moneyLivelihoodSeeds } from "./money-livelihood";
// etc.

// Aggregate all seeds (ordered by hierarchy depth)
import { axiomSeeds } from "./axioms";
import { capacitySeeds } from "./capacities";
import { frameworkSeeds } from "./frameworks";
import { principleSeeds } from "./principles";

export const allSeeds = [
  ...axiomSeeds,
  ...capacitySeeds,
  ...frameworkSeeds,
  ...principleSeeds,
];
