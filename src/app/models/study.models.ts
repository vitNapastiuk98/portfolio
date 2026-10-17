export interface StudySection {
  readonly id: string;
  readonly label: string;
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly bullets?: readonly string[];
  readonly codeExamples?: readonly {
    readonly title: string;
    readonly language?: string;
    readonly code: string;
    readonly explanation?: string;
  }[];
  readonly table?: {
    readonly caption: string;
    readonly columns: readonly string[];
    readonly rows: readonly (readonly string[])[];
  };
}

export interface StudyFlow {
  readonly title: string;
  readonly steps: readonly { readonly title: string; readonly detail: string }[];
}

export interface StudyDecision {
  readonly title: string;
  readonly choice: string;
  readonly tradeoff: string;
}

export interface StudyCheck {
  readonly scenario: string;
  readonly expectation: string;
}

export interface StudyContent {
  readonly lead: string;
  readonly scopeNote: string;
  readonly sections: readonly StudySection[];
  readonly flow?: StudyFlow;
  readonly decisions?: readonly StudyDecision[];
  readonly checks?: readonly StudyCheck[];
  readonly takeaways?: readonly string[];
  readonly references: readonly { readonly label: string; readonly url: string }[];
}

export interface EngineeringStudy extends StudyContent {
  readonly presentation?: 'article';
  readonly studyType?: 'experiment' | 'implemented' | 'conceptual';
  readonly technologies?: readonly string[];
  readonly problem?: string;
  readonly shortTitle?: string;
  readonly evidenceSummary?: string;
  readonly measurementSummary?: string;
  readonly demo?: { readonly label: string; readonly href: string };
  readonly relatedSlugs?: readonly string[];
  readonly updatedOn?: string;
  readonly experiment?: boolean;
  readonly flow: StudyFlow;
  readonly decisions: readonly StudyDecision[];
  readonly checks: readonly StudyCheck[];
  readonly takeaways: readonly string[];
  readonly experience?: {
    readonly contribution: string;
    readonly implemented: readonly string[];
  };
  readonly slug: string;
  readonly title: string;
  readonly category: string;
  readonly summary: string;
}
