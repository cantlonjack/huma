export type { EnterpriseTemplate } from "./types";
import { livestockTemplates } from "./livestock";
import { vegetablesTemplates } from "./vegetables";
import { agroforestryTemplates } from "./agroforestry";
import { fungiTemplates } from "./fungi";
import { marketingTemplates } from "./marketing";
import { knowledgeTemplates } from "./knowledge";
import { processingTemplates } from "./processing";
import { specialtyCropsTemplates } from "./specialty-crops";
import { soilBuildingTemplates } from "./soil-building";
import { careerTemplates } from "./career";
import { creativeTemplates } from "./creative";
import { lifeSystemsTemplates } from "./life-systems";
import { growthTemplates } from "./growth";

export const ENTERPRISE_TEMPLATES: import("./types").EnterpriseTemplate[] = [
  ...livestockTemplates,
  ...vegetablesTemplates,
  ...agroforestryTemplates,
  ...fungiTemplates,
  ...marketingTemplates,
  ...knowledgeTemplates,
  ...processingTemplates,
  ...specialtyCropsTemplates,
  ...soilBuildingTemplates,
  ...careerTemplates,
  ...creativeTemplates,
  ...lifeSystemsTemplates,
  ...growthTemplates,
];
