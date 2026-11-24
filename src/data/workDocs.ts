// 作品详情内容规范：每个作品一个 markdown 文件，放在 src/content/works/<slug>.md
//
// frontmatter（--- 之间）字段（均可选）：
//   title   标题（缺省回退列表里的作品名）
//   banner  顶部 banner 图路径（如 /works/guqin/banner.jpg；缺省用渐变占位）
//   year    年份
//   role    角色 / 担当
//   tags    标签数组：[互动项目, 虎啸奖]
//   link    外链（“访问作品”按钮）
// 正文（frontmatter 之后）写 markdown：文字 / 图 ![](...) / 视频 <video src=...>。
//
// 资源（图/视频）放到 public/works/ 下，用 /works/... 绝对路径引用。
// 列表（works.ts 的 item）通过 `slug` 关联到此处的 md；没有 slug 的 item 仍走占位详情。

export interface WorkDoc {
  slug: string
  title?: string
  banner?: string
  year?: string
  role?: string
  tags?: string[]
  link?: string
  body: string
}

const FALLBACK_DOCS: Record<string, WorkDoc> = {
  threatlens: {
    slug: 'threatlens',
    title: 'ThreatLens',
    banner: '/images/threatlens-console.jpeg',
    role: 'Cybersecurity & Full-Stack Web Project',
    tags: ['Python', 'Flask', 'SQLite', 'Incident Triage'],
    body: `ThreatLens is a real-time cybersecurity triage dashboard that cuts through alert fatigue by automatically normalizing raw security logs and scoring threats by severity. Built with a Python Flask backend and a responsive frontend, it empowers analysts to instantly prioritize and resolve high-risk incidents from a single live queue.

### Key Capabilities
- Normalizes raw security events across sources (such as EDR, DLP, SIEM, and IAM) into a prioritized risk-scored incident queue.
- Includes an interactive ThreatLens Copilot panel to explain incidents by ID, highlight attack clusters, and guide investigation order.
- Features an Attack Map view tracking activity routes toward YOUR SOC alongside Console, AI Center, and Secure Streams tabs.
- Built with a Python Flask backend (\`app.py\`), SQLite storage (\`threatlens.db\`), and frontend files (\`index.html\`, \`style.css\`, \`script.js\`).

### Screenshots
![ThreatLens Incident Triage Console](/images/threatlens-console.jpeg)
![ThreatLens Attack Map View](/images/threatlens-map.jpeg)`,
  },
  nyayasetu: {
    slug: 'nyayasetu',
    title: 'NyayaSetu',
    banner: '/images/nyayasetu-overview.jpeg',
    role: 'Civic Tech & Welfare Access Project',
    tags: ['Welfare Matchmaker', 'Multi-Language', 'Document Readiness'],
    body: `The objective of NyayaSetu is to democratize access to public welfare by replacing bureaucratic complexity with an algorithmic matchmaker and document readiness framework, ensuring citizens never lose.

### Key Capabilities
- Guides citizens through a quick 4-question flow with zero bureaucratic jargon, login walls, or requests for name, phone number, or Aadhaar details.
- Supports multi-language selection across regional Indian languages alongside English.
- Matches user categories (such as Student, Woman Entrepreneur / Homemaker, Senior Citizen, Farmer, and Daily Wage Worker) to relevant welfare schemes with clear eligibility reasons.
- Tracks document readiness with step-by-step guidance on what each document unlocks and how to obtain it, plus action-plan printing and WhatsApp sharing.

### Screenshots
![NyayaSetu Overview & How It Works](/images/nyayasetu-overview.jpeg)
![NyayaSetu Language Selection](/images/nyayasetu-language.jpeg)
![NyayaSetu 4-Question Category Prompt](/images/nyayasetu-quiz.jpeg)
![NyayaSetu Scheme Matches & Document Checklist](/images/nyayasetu-matches.jpeg)`,
  },
}

// 构建期把全部 md 作为原始字符串内联进来
const files = import.meta.glob('../content/works/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

// 极简 frontmatter 解析（key: value，数组用 [a, b]）——避免引入依赖 Buffer 的库
function parseFrontmatter(raw: string): {
  data: Record<string, string | string[]>
  body: string
} {
  const m = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(raw)
  if (!m) return { data: {}, body: raw }
  const data: Record<string, string | string[]> = {}
  for (const line of m[1].split('\n')) {
    const mm = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line.trim())
    if (!mm) continue
    const rawVal = mm[2].trim()
    let val: string | string[]
    if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
      val = rawVal
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean)
    } else {
      val = rawVal.replace(/^['"]|['"]$/g, '')
    }
    data[mm[1]] = val
  }
  return { data, body: m[2].trim() }
}

const docs: Record<string, WorkDoc> = { ...FALLBACK_DOCS }
for (const path in files) {
  const slug = path.split('/').pop()!.replace(/\.md$/, '')
  const { data, body } = parseFrontmatter(files[path])
  docs[slug] = { ...(docs[slug] || { slug }), ...data, body } as WorkDoc
}

export function getWorkDoc(slug?: string): WorkDoc | null {
  return slug ? docs[slug] || null : null
}