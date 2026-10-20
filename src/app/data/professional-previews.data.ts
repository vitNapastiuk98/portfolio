import type { ProfessionalStudy } from '../models/professional-study.models';

type ProfessionalPreview = Pick<
  ProfessionalStudy,
  'slug' | 'category' | 'title' | 'summary' | 'technologies' | 'contexts' | 'previewFlow'
>;

export const professionalPreviews = [
  {
    slug: 'angular-enterprise-architecture',
    category: 'Frontend Architecture',
    title: 'Architecting Large-Scale Angular Applications',
    summary:
      'Building enterprise applications involves more than organizing components. It requires clear feature boundaries, predictable state management, reliable navigation, and consistent behavior across complex user journeys.',
    technologies: ['Angular', 'TypeScript', 'RxJS', 'Signals', 'Router', 'Dependency Injection'],
    contexts: ['Area Riservata / MyINPS', 'Portale Patronati', 'CAF'],
    previewFlow: ['Application shell', 'Feature ownership', 'Backend contracts'],
  },
  {
    slug: 'design-systems',
    category: 'Component Architecture',
    title: 'Designing Component Systems That Scale',
    summary:
      'Reusable components are only valuable when they establish reliable contracts between applications, teams, and technologies.',
    technologies: ['Angular', 'Lit', 'TypeScript', 'Web Components', 'WCAG 2.1 AA'],
    contexts: ['Sirio', 'INPS public-sector applications'],
    previewFlow: ['Consumer application', 'Angular integration', 'Web Component contract'],
  },
  {
    slug: 'real-time-systems',
    category: 'Real-Time Systems',
    title: 'Engineering Reliable Real-Time Experiences',
    summary:
      'Real-time applications introduce a different class of problems. Connections fail, devices change, communication channels become unavailable, and users expect sessions to recover without losing their work.',
    technologies: [
      'Angular 16',
      'Azure Communication Services',
      'SignalR',
      'WebRTC',
      'OpenVidu',
      'Kurento',
      'Application Insights',
    ],
    contexts: ['Sportello Telematico Evoluto', 'Brochesia / BView'],
    previewFlow: ['Business session', 'Media lifecycle', 'Event reconciliation'],
  },
  {
    slug: 'workflow-architecture',
    category: 'Workflow & Product Architecture',
    title: 'From Dynamic Forms to Executable Workflows',
    summary:
      'Not every business process fits into a fixed sequence of screens. Some require configurable forms and conditional validation; others need branching workflows, loops, task execution, and offline operation.',
    technologies: [
      'Angular 16',
      'Angular Formly',
      'TypeScript',
      'Node.js',
      'Kotlin',
      'Realm',
      'REST',
    ],
    contexts: ['Welfare in Cloud', 'BStep / Brochesia'],
    previewFlow: ['Schema-driven forms', 'Graph execution', 'Offline synchronization'],
  },
  {
    slug: 'ai-product-engineering',
    category: 'AI & Agentic Interfaces',
    title: 'Turning AI Responses into Interactive Applications',
    summary:
      'Integrating an LLM is relatively straightforward. Building a reliable product around it requires controlling context, interpreting structured responses, managing interface state, and separating AI-generated suggestions from executable actions.',
    technologies: [
      'Angular',
      'TypeScript',
      'RAG',
      'Structured JSON',
      'Generative UI',
      'Angular Elements',
      'Web Components',
    ],
    contexts: ['HeyVista.ai / CSI Works'],
    previewFlow: ['Validated response', 'Trusted component registry', 'Confirmed backend action'],
  },
  {
    slug: 'computer-vision',
    category: 'Computer Vision',
    title: 'Keeping Digital Annotations Anchored in Live Video',
    summary:
      'A drawing placed over a video frame loses its meaning when the camera or object moves. Maintaining that relationship becomes more challenging on hardware without native spatial-tracking capabilities.',
    technologies: ['OpenCV 3/4', 'SIFT', 'Kurento', 'WebRTC', 'Angular', 'Kotlin'],
    contexts: ['Brochesia / BView'],
    previewFlow: ['Selection & context', 'Feature correspondence', 'Transformed annotation'],
  },
] as const satisfies readonly ProfessionalPreview[];
