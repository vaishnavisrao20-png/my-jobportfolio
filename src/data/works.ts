export interface WorkItem {
  id: string
  slug: string
  title: string
  subtitle: string
  category: string
  description: string
  highlights: string[]
  points?: string[]
  bullets?: string[]
  image?: string
  cover?: string
  gallery?: string[]
}

export interface WorksLocaleData {
  title: string
  sections: WorkItem[]
}

export const SECTION_COVERS: Record<string, string> = {
  threatlens: '/images/threatlens-console.jpeg',
  nyayasetu: '/images/nyayasetu-overview.jpeg',
}

const THREATLENS_HIGHLIGHTS: string[] = [
  'Normalizes raw security events across sources (such as EDR, DLP, SIEM, and IAM) into a risk-scored incident triage queue.',
  'Includes an interactive ThreatLens Copilot panel to explain incidents by ID, highlight attack clusters, and guide investigation order.',
  'Features an Attack Map view tracking activity routes toward YOUR SOC alongside Console, AI Center, and Secure Streams tabs.',
  'Built with a Python Flask backend (app.py), SQLite storage (threatlens.db), and front-end web files (index.html, style.css, script.js).',
]

const NYAYASET_HIGHLIGHTS: string[] = [
  'Guides citizens through a quick 4-question flow with zero bureaucratic jargon, login walls, or requests for name, phone number, or Aadhaar details.',
  'Supports multi-language selection across regional Indian languages alongside English.',
  'Matches user categories (such as Student, Woman Entrepreneur / Homemaker, Senior Citizen, Farmer, and Daily Wage Worker) to relevant welfare schemes with clear eligibility reasons.',
  'Tracks document readiness with step-by-step guidance on what each document unlocks and how to obtain it, plus action-plan printing and WhatsApp sharing.',
]

const ITEMS: WorkItem[] = [
  {
    id: 'threatlens',
    slug: 'threatlens',
    title: 'ThreatLens',
    subtitle: 'Real-Time Cybersecurity Triage & Risk-Based Incident Dashboard',
    category: 'Security & Web',
    description:
      'ThreatLens is a real-time cybersecurity triage dashboard that cuts through alert fatigue by automatically normalizing raw security logs and scoring threats by severity. Built with a Python Flask backend and a responsive frontend, it empowers analysts to instantly prioritize and resolve high-risk incidents from a single live queue.',
    highlights: THREATLENS_HIGHLIGHTS,
    points: THREATLENS_HIGHLIGHTS,
    bullets: THREATLENS_HIGHLIGHTS,
    image: '/images/threatlens-console.jpeg',
    cover: '/images/threatlens-console.jpeg',
    gallery: [
      '/images/threatlens-console.jpeg',
      '/images/threatlens-map.jpeg',
    ],
  },
  {
    id: 'nyayasetu',
    slug: 'nyayasetu',
    title: 'NyayaSetu',
    subtitle: 'Welfare Scheme Matchmaker & Document Readiness Platform',
    category: 'Civic Tech & Welfare Access',
    description:
      'The objective of NyayaSetu is to democratize access to public welfare by replacing bureaucratic complexity with an algorithmic matchmaker and document readiness framework, ensuring citizens never lose.',
    highlights: NYAYASET_HIGHLIGHTS,
    points: NYAYASET_HIGHLIGHTS,
    bullets: NYAYASET_HIGHLIGHTS,
    image: '/images/nyayasetu-overview.jpeg',
    cover: '/images/nyayasetu-overview.jpeg',
    gallery: [
      '/images/nyayasetu-overview.jpeg',
      '/images/nyayasetu-language.jpeg',
      '/images/nyayasetu-quiz.jpeg',
      '/images/nyayasetu-matches.jpeg',
    ],
  },
]

export const WORKS: Record<'en' | 'zh', WorksLocaleData> = {
  en: {
    title: 'Projects',
    sections: ITEMS,
  },
  zh: {
    title: 'Projects',
    sections: ITEMS,
  },
}

export default WORKS