import type { ProfessionalStudy } from '../models/professional-study.models';
import { enterpriseStudy } from './case-studies/enterprise.data';
import { componentsStudy } from './case-studies/components.data';
import { realtimeStudy } from './case-studies/realtime.data';
import { workflowStudy } from './case-studies/workflows.data';
import { aiStudy } from './case-studies/ai.data';
import { visionStudy } from './case-studies/vision.data';

export const professionalStudies: readonly ProfessionalStudy[] = [
  enterpriseStudy,
  componentsStudy,
  realtimeStudy,
  workflowStudy,
  aiStudy,
  visionStudy,
];
