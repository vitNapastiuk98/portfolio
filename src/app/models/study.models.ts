export interface StudySection {
  readonly id: string;
  readonly label: string;
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly bullets?: readonly string[];
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
