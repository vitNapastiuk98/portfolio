export type PublicationStatus =
  'published' | 'public-summary-only' | 'private' | 'in-progress' | 'draft';

export interface ExpertiseArea {
  readonly index: string;
  readonly title: string;
  readonly shortTitle: string;
  readonly description: string;
  readonly capabilities: readonly string[];
}

export interface ExperienceItem {
  readonly organization: string;
  readonly role: string;
  readonly period: string;
  readonly description: string;
  readonly responsibilities: readonly string[];
}

export interface Project {
  readonly slug: string;
  readonly title: string;
  readonly category: string;
  readonly organization: string;
  readonly summary: string;
  readonly contributions: readonly string[];
  readonly publicationStatus: PublicationStatus;
  readonly ownership: 'independent' | 'commercial' | 'hackathon';
  readonly url?: string;
  readonly demoUrl?: string;
  readonly featured?: boolean;
  readonly technologies?: readonly string[];
  readonly details?: readonly string[];
}

export interface TableOfContentsItem {
  readonly id: string;
  readonly text: string;
  readonly level: 2 | 3;
}

export interface BlogPost {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly date: string;
  readonly tags: readonly string[];
  readonly featured: boolean;
  readonly readingMinutes: number;
  readonly html: string;
  readonly tableOfContents: readonly TableOfContentsItem[];
}
