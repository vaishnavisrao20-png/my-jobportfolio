import { motion } from 'framer-motion'
import { FOCUS_POINTS } from '../data/focusPoints'

interface ResumeEntry {
  period: string
  place: string
  role?: string
  points?: string[]
}

const RESUME_ENTRIES: ResumeEntry[] = [
  {
    period: 'Bengaluru, Karnataka, India · 7676625106 · vaishnavisrao20@gmail.com',
    place: 'VAISHNAVI S. RAO',
    role: 'LinkedIn: https://www.linkedin.com/in/vaishnavi-s-rao-214669432?utm_source=share_via&utm_content=profile&utm_medium=member_android | GitHub: https://github.com/vaishnavisrao20-png',
    points: [
      'PROFESSIONAL SUMMARY — First-year Computer Science Engineering student at Global Academy of Technology with a growing interest in cybersecurity, software development and artificial intelligence.',
      'Familiar with Python, Java, HTML and CSS, with a keen interest in building practical projects and exploring emerging technologies.',
      'A curious and creative learner who enjoys problem-solving, taking initiative and developing new technical skills. Seeking an opportunity to gain hands-on industry experience through an internship.',
    ],
  },
  {
    period: '2026 – Present',
    place: 'EDUCATION',
    role: 'Bachelor of Engineering – Computer Science and Engineering · Global Academy of Technology, Bengaluru',
    points: [
      'Bachelor of Engineering – Computer Science and Engineering',
      'Global Academy of Technology, Bengaluru',
      '2026 – Present',
    ],
  },
  {
    period: 'Technical Skills & Strengths',
    place: 'TECHNICAL SKILLS',
    role: 'Core Languages, Tools & Personal Strengths',
    points: [
      'Programming Languages: Python (Basics), Java (Fundamentals)',
      'Web Development: HTML, CSS',
      'Tools & Technologies: VS Code, Git/GitHub (add proficiency level)',
      'Areas of Interest: Cybersecurity, Artificial Intelligence, Software Development',
      'STRENGTHS — Creative thinking and problem-solving; Quick learner; Good communication and listening skills; Initiative and willingness to learn; Adaptability and teamwork',
    ],
  },
  {
    period: 'Career Focus',
    place: 'CAREER INTERESTS',
    role: 'Cybersecurity | Software Development | Web Development | Artificial Intelligence',
    points: [
      'Cybersecurity | Software Development | Web Development | Artificial Intelligence',
    ],
  },
  {
    period: 'Achievements & Activities',
    place: 'ACHIEVEMENTS AND ACTIVITIES',
    role: 'Cybersecurity Hackathon Participant',
    points: [
      'Participated in a cybersecurity-focused hackathon.',
      'Collaborated on developing ThreatLens, a cybersecurity alert prioritization platform.',
    ],
  },
]

const RESUME: Record<'en' | 'zh', { title: string; entries: ResumeEntry[] }> = {
  en: { title: 'Résumé', entries: RESUME_ENTRIES },
  zh: { title: 'Résumé', entries: RESUME_ENTRIES },
}

const POINT_ORDER = FOCUS_POINTS

const EASE = [0.22, 1, 0.36, 1]
const containerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
}
const itemV = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
}

function Entry({ entry, index }: { entry: ResumeEntry; index: number }) {
  return (
    <motion.div
      className="tl-entry"
      data-point={POINT_ORDER[index]}
      variants={containerV}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
    >
      <motion.span className="tl-dot" variants={itemV} aria-hidden="true" />
      <div className="tl-body">
        <motion.div className="tl-period" variants={itemV}>
          {entry.period}
        </motion.div>
        <motion.div className="tl-head" variants={itemV}>
          <h3 className="tl-place">{entry.place}</h3>
        </motion.div>
        {entry.role && (
          <motion.div className="tl-role" variants={itemV}>
            {entry.role}
          </motion.div>
        )}
        {entry.points && (
          <motion.ul className="tl-points" variants={itemV}>
            {entry.points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </motion.ul>
        )}
      </div>
    </motion.div>
  )
}

export default function Resume({ lang }: { lang: 'en' | 'zh' }) {
  const data = RESUME[lang]
  return (
    <section className="resume" lang={lang}>
      <motion.h2
        className="resume-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {data.title}
      </motion.h2>
      <div className="timeline">
        {data.entries.map((e, i) => (
          <Entry key={i} entry={e} index={i} />
        ))}
      </div>
    </section>
  )
}