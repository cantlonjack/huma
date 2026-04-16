export type { RpplSeed, RpplType, PrincipleSource, PortType, RpplPort } from "./types";
export { axiomSeeds } from "./axioms";
export { capacitySeeds } from "./capacities";
export { frameworkSeeds } from "./frameworks";
export { principleSeeds } from "./principles";
export { bodyHealthSeeds } from "./body-health";
export { growthPurposeJoySeeds } from "./growth-purpose-joy";
export { moneyLivelihoodSeeds } from "./money-livelihood";
export { homeRelationshipsSeeds } from "./home-relationships";
export { parentingDigitalSeeds } from "./parenting-digital";

// Aggregate all seeds (ordered by hierarchy depth)
import { axiomSeeds } from "./axioms";
import { capacitySeeds } from "./capacities";
import { frameworkSeeds } from "./frameworks";
import { principleSeeds } from "./principles";
import { bodyHealthSeeds } from "./body-health";
import { growthPurposeJoySeeds } from "./growth-purpose-joy";
import { moneyLivelihoodSeeds } from "./money-livelihood";
import { homeRelationshipsSeeds } from "./home-relationships";
import { parentingDigitalSeeds } from "./parenting-digital";

export const allSeeds = [
  ...axiomSeeds,
  ...capacitySeeds,
  ...frameworkSeeds,
  ...principleSeeds,
  ...bodyHealthSeeds,
  ...growthPurposeJoySeeds,
  ...moneyLivelihoodSeeds,
  ...homeRelationshipsSeeds,
  ...parentingDigitalSeeds,
];
