import type { StudyContent } from './study.models';

export interface ProfessionalStudy extends StudyContent {
  readonly slug: string;
  readonly title: string;
  readonly category: string;
  readonly summary: string;
  readonly technologies: readonly string[];
  readonly contexts: readonly string[];
  readonly previewFlow: readonly string[];
  readonly related: readonly { label: string; path: string }[];
}
