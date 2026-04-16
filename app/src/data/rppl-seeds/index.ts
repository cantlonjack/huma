export type { RpplSeed, RpplType, PrincipleSource, PortType, RpplPort } from "./types";
export { axiomSeeds } from "./axioms";
export { capacitySeeds } from "./capacities";
export { frameworkSeeds } from "./frameworks";
export { principleSeeds } from "./principles";
export { bodyHealthSeeds } from "./body-health";
export { growthPurposeJoySeeds } from "./growth-purpose-joy";
// Future practice domains:
// export { moneyLivelihoodSeeds } from "./money-livelihood";
// export { homeRelationshipsSeeds } from "./home-relationships";
// export { parentingDigitalSeeds } from "./parenting-digital";

// Aggregate all seeds (ordered by hierarchy depth)
import { axiomSeeds } from "./axioms";
import { capacitySeeds } from "./capacities";
import { frameworkSeeds } from "./frameworks";
import { principleSeeds } from "./principles";
import { bodyHealthSeeds } from "./body-health";
import { growthPurposeJoySeeds } from "./growth-purpose-joy";

export const allSeeds = [
  ...axiomSeeds,
  ...capacitySeeds,
  ...frameworkSeeds,
  ...principleSeeds,
  ...bodyHealthSeeds,
  ...growthPurposeJoySeeds,
];
