import type { ExpertiseArea, ExperienceItem } from '../models/content.models';

export const profile = {
  name: 'Vitalii Napastiuk',
  title: 'Senior Software Engineer',
  location: 'Rome, Italy',
  email: 'vit.napastiuk@gmail.com',
  github: 'https://github.com/vitNapastiuk98',
  linkedin: 'https://www.linkedin.com/in/nap-vitalii/',
  medium: 'https://medium.com/@vit.napastiuk',
  availability: 'Open to fully remote senior engineering opportunities and B2B contracts.',
} as const;

export const expertiseAreas: readonly ExpertiseArea[] = [
  {
    index: '01',
    title: 'Frontend Engineering',
    shortTitle: 'Frontend',
    description:
      'Building complex web applications with Angular, TypeScript, React, and Vue. Experience spans application architecture, state management, reusable component libraries, design systems, and Web Components, with particular attention to performance and accessibility.',
    capabilities: ['Angular', 'TypeScript', 'React', 'Vue', 'Lit'],
  },
  {
    index: '02',
    title: 'AI & Agentic Interfaces',
    shortTitle: 'AI products',
    description:
      'Developing AI-powered applications with RAG, structured LLM outputs, and generative UI. Experience includes building intelligent assistants, agentic workflows, and dynamic interfaces that transform model responses into interactive components and executable application actions.',
    capabilities: ['RAG', 'Generative UI', 'Structured Outputs', 'Agentic Workflows'],
  },
  {
    index: '03',
    title: 'Real-Time Systems & Computer Vision',
    shortTitle: 'Real-time systems',
    description:
      'Developing real-time communication systems and computer vision solutions, from video conferencing and screen sharing to object tracking and augmented reality. Experience includes WebRTC, signaling, connection recovery, and OpenCV algorithms for feature detection, matching, and visual anchoring across video frames.',
    capabilities: ['WebRTC', 'SignalR', 'OpenCV', 'SIFT', 'OpenVidu'],
  },
  {
    index: '04',
    title: 'Full-Stack Development',
    shortTitle: 'Product engineering',
    description:
      'Building applications across frontend, backend, and mobile environments using TypeScript, Node.js, Java, Kotlin, and Python. Experience covers REST and WebSocket APIs, authentication, third-party integrations, offline synchronization, Dockerized services, and Python-based bots for automation and AI-powered content generation.',
    capabilities: ['Node.js', 'TypeScript', 'Python', 'Java', 'Kotlin', 'Docker'],
  },
];

export const experience: readonly ExperienceItem[] = [
  {
    organization: 'Minsait / Indra — INPS',
    role: 'Senior Frontend Engineer · AI Ambassador',
    period: 'May 2023 – Present',
    description: 'GovTech / Public Sector',
    responsibilities: [
      'Led a team of 5 frontend engineers across multiple projects, coordinating development, code reviews, and mentoring. Reduced delivery cycle times by 25% through better task allocation and faster resolution of bottlenecks.',
      'Drive AI adoption by training developers and creating reusable AI agent skills for coding, testing, and legacy modernization, reaching 80% active adoption across 3 engineering teams.',
      'Architected and developed Angular and TypeScript applications serving millions of users daily, including complex workflows, reactive state management, and backend integrations. Optimized Core Web Vitals (LCP, INP, CLS), achieved Lighthouse performance scores of 95+ and accessibility scores of 100 on audited pages, and developed interfaces tested against WCAG 2.1 AA criteria.',
      "Contributed to Sirio, INPS's shared Angular and Lit/Web Component libraries, used across 400+ projects.",
      'Led frontend development of a real-time video consultation platform with Azure Communication Services and SignalR. Built screen sharing, background replacement, device management, Picture-in-Picture, and reconnection. Added Application Insights telemetry, reducing bug diagnosis and resolution time by 75%.',
    ],
  },
  {
    organization: 'CSI Works',
    role: 'Senior Product Engineer / Frontend Architect (Contract)',
    period: '2026 – Present',
    description: 'AI SaaS / Retail Technology',
    responsibilities: [
      'Architected the frontend of HeyVista.ai, an AI-powered SaaS platform combining RAG-based assistants with agentic workflows. Built a schema-driven generative UI supporting 10 interactive content types, letting AI compose task-specific interfaces with charts, tables, cards, and actionable controls.',
      'Designed an adaptive agentic UX architecture with structured JSON responses, local UI state, and confirmation-driven interactions. Defined 5 business action categories and 20 documented AI interaction scenarios across inventory, sales, pricing, and decision support.',
      'Architected a modular Angular component system with shared core functionality, using Angular Elements to package independent, composable AI-powered modules as framework-agnostic Web Components. Enabled website integration via HTML and JavaScript snippets, reducing integration effort by 90%.',
      'Developed features across 15 Clover-integrated POS and SaaS products with Angular, React, and TypeScript. Improved Lighthouse accessibility to 95+, cut page load times by 30% and user interactions by 20%, and resolved 40+ UI and integration bugs.',
    ],
  },
  {
    organization: 'Transtec Services — Brochesia',
    role: 'Senior Full Stack Developer',
    period: 'September 2020 – May 2023',
    description: 'Industrial AR / Clinical Technology',
    responsibilities: [
      'Developed an industrial AR remote-assistance platform spanning Angular/React web apps and native Kotlin smart-glass apps. Built organization, permissions, device, and licensing features supporting approximately 100 client organizations.',
      'Independently built a digital workflow platform end-to-end, including a graph-based editor with branching and loops, backend services, and native Android app. Reduced workflow configuration time by 50%; enabled offline execution with Realm and bidirectional synchronization.',
      'Built real-time WebRTC, OpenVidu, and Kurento collaboration, video streaming, session management, and authentication. Reduced session initialization time by 40% and connection failures by 30%.',
      'Built SIFT-based visual anchoring with OpenCV to retain AR annotations on tracked objects. Achieved 90% object re-detection accuracy after objects left and re-entered the view; implemented real-time face obscuring.',
      'Developed Node.js services, REST/WebSocket APIs, SSO and database integrations. Automated file transfers, reducing manual handling by 80%. Managed Dockerized media-processing services, reducing downtime by 10%.',
      'Advanced to technical leadership within approximately one year: code reviews, interviews with 10+ candidates, mentoring 3 developers, and coordination across frontend, backend, and Android teams.',
    ],
  },
];
