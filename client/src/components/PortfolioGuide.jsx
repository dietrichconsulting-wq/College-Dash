import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

// ── Static Data ────────────────────────────────────────────────

const MAJORS = {
  architecture: {
    key: 'architecture',
    name: 'Architecture',
    icon: '🏛️',
    difficulty: 87,
    difficultyLabel: 'Highly Competitive',
    difficultyColor: '#EF4444',
    tagline: 'Prove you can think spatially and draw by hand.',
    pageCount: '15–20 pages',
    format: 'PDF via SlideRoom or Portfoliobox · max 10MB',
    required: [
      {
        label: 'Freehand drawings & observational sketches',
        note: 'Still lifes, figure studies, or anything drawn from life — hand skill is everything.',
        critical: true,
      },
      {
        label: 'Design projects (any scale)',
        note: 'Spatial, architectural, graphic, or product — shows design thinking.',
        critical: true,
      },
      {
        label: 'Physical model photography',
        note: 'Cardboard, foam, wood models. Shows 3D thinking and fabrication ability.',
        critical: true,
      },
      {
        label: 'Process / sketchbook pages',
        note: 'Iterations, diagrams, and thinking-out-loud sketches. Admissions loves process.',
        critical: false,
      },
      {
        label: 'Digital work (CAD / rendering)',
        note: 'SketchUp, Rhino, AutoCAD — a nice-to-have, not a substitute for hand work.',
        critical: false,
      },
      {
        label: 'Personal creative work',
        note: 'Painting, photography, sculpture — shows artistic range and sensibility.',
        critical: false,
      },
    ],
    strongPortfolioTips: [
      'Hand drawing is still king — programs use it to gauge spatial intelligence',
      'Show process over polish: rough sketches that explain your thinking beat perfect finals',
      'Include at least 3 different media types (pencil, model, color, digital)',
      'Every project needs a clear title and 1-sentence description',
      'Avoid excessive renderings from a single project — variety signals range',
    ],
    admissionNotes: [
      'Most top-20 programs require a separate design portfolio (not just transcripts)',
      'UT Austin, Rice, and USC have highly competitive BArch programs',
      'Consider a gap year or post-bacc if you want to build portfolio strength',
    ],
    resources: [
      { label: 'RISD Architecture Portfolio Guide', search: 'RISD architecture portfolio requirements' },
      { label: 'Archinect Student Portfolios', search: 'archinect student portfolios examples' },
      { label: 'UT Austin SOA Admissions', search: 'UT Austin school of architecture undergraduate admissions' },
      { label: 'What architecture schools want (ArchDaily)', search: 'archdaily architecture school portfolio advice' },
    ],
  },

  environmental_design: {
    key: 'environmental_design',
    name: 'Environmental Design',
    icon: '🌿',
    difficulty: 65,
    difficultyLabel: 'Moderately Competitive',
    difficultyColor: '#F59E0B',
    tagline: 'Blend art, ecology, and spatial thinking.',
    pageCount: '12–18 pages',
    format: 'PDF or digital link · typically through Common App portal',
    required: [
      {
        label: 'Spatial / place-based projects',
        note: 'Work that shows you think about how people experience space, landscape, or environment.',
        critical: true,
      },
      {
        label: 'Observational drawings or photography',
        note: 'Documenting the built or natural environment — shows keen observation.',
        critical: true,
      },
      {
        label: 'Sustainability or ecology project',
        note: 'A design or research project that engages environmental thinking.',
        critical: false,
      },
      {
        label: 'Models or site diagrams',
        note: 'Site plans, section drawings, or physical models at urban/landscape scale.',
        critical: false,
      },
      {
        label: 'Written statement with visuals',
        note: 'Many ED programs want a 1-page project narrative explaining your intent.',
        critical: false,
      },
    ],
    strongPortfolioTips: [
      'Emphasize community and ecological impact — this is the heart of the discipline',
      'Show evidence of site analysis: maps, observations, diagrams of place',
      'Include fieldwork photos or documentation of real places you\'ve studied',
      'Range of scale matters: zoom from the regional to the detail',
      'UC Berkeley CED is the gold standard — research their portfolio examples',
    ],
    admissionNotes: [
      'Often more flexible than architecture in portfolio requirements',
      'Strong programs at UC Berkeley, Harvard GSD, UVA, UNC Charlotte',
      'Often combined with landscape architecture at the undergrad level',
    ],
    resources: [
      { label: 'UC Berkeley CED Portfolio Tips', search: 'UC Berkeley College of Environmental Design portfolio requirements' },
      { label: 'Landscape Architecture Foundation', search: 'landscape architecture student portfolio examples' },
      { label: 'ASLA Student Work', search: 'ASLA student portfolio landscape architecture' },
    ],
  },

  industrial_design: {
    key: 'industrial_design',
    name: 'Industrial Design',
    icon: '⚙️',
    difficulty: 78,
    difficultyLabel: 'Very Competitive',
    difficultyColor: '#F59E0B',
    tagline: 'Sketch fast, think in 3D, solve real problems.',
    pageCount: '15–20 pages / 5–8 projects',
    format: 'PDF via SlideRoom · some schools accept physical work',
    required: [
      {
        label: 'Hand sketches (ID-style)',
        note: 'Perspective sketches, exploded views, ideation sheets. This is non-negotiable for top programs.',
        critical: true,
      },
      {
        label: 'Process documentation',
        note: 'Show full project arc: problem → research → ideation → prototype → final. Narrative matters.',
        critical: true,
      },
      {
        label: 'Physical prototypes / models',
        note: 'Built models, foam mockups, or fabricated objects showing making skills.',
        critical: true,
      },
      {
        label: '3D CAD / renderings',
        note: 'SolidWorks, Fusion 360, or Rhino models and renderings. Shows technical capability.',
        critical: false,
      },
      {
        label: 'Materials & manufacturing awareness',
        note: 'Notes or diagrams showing you think about how things are made.',
        critical: false,
      },
      {
        label: 'User research or problem framing',
        note: 'Who are you designing for? Even a simple persona or observation adds depth.',
        critical: false,
      },
    ],
    strongPortfolioTips: [
      'Hand sketching ability is THE primary signal — practice daily marker/pencil product sketches',
      'Art Center, RISD, Pratt, and CMU all want to see rich process, not just finals',
      'Each project should tell a clear problem–solution story',
      'Show diverse project types: furniture, tools, electronics, sustainable products',
      'A project that failed and was iterated is more impressive than one perfect result',
    ],
    admissionNotes: [
      'Top programs: RISD, Art Center (Pasadena), Pratt, CMU, Georgia Tech, CCA',
      'Many programs require a separate portfolio review or interview',
      'Some schools (Art Center) have rolling admissions with portfolio deadlines',
    ],
    resources: [
      { label: 'RISD Industrial Design Admissions', search: 'RISD industrial design undergraduate portfolio' },
      { label: 'Core77 Student Portfolio Showcase', search: 'core77 student industrial design portfolios' },
      { label: 'Art Center College of Design', search: 'Art Center College of Design portfolio requirements industrial design' },
      { label: 'ID Sketching Techniques', search: 'industrial design sketching tutorial beginner' },
    ],
  },

  interior_design: {
    key: 'interior_design',
    name: 'Interior Design',
    icon: '🛋️',
    difficulty: 60,
    difficultyLabel: 'Moderately Competitive',
    difficultyColor: '#22C55E',
    tagline: 'Show spatial vision, color intelligence, and detail love.',
    pageCount: '10–15 pages',
    format: 'PDF · some schools accept physical portfolio at visit',
    required: [
      {
        label: 'Spatial compositions & room studies',
        note: 'Drawings, sketches, or collages showing how you arrange and experience a space.',
        critical: true,
      },
      {
        label: 'Color and materials work',
        note: 'Color studies, material boards, fabric/finish explorations — shows sensory intelligence.',
        critical: true,
      },
      {
        label: 'Freehand drawing or painting',
        note: 'Any observational or expressive drawing. Shows artistic foundation.',
        critical: true,
      },
      {
        label: 'Photography or documentation',
        note: 'Photos you\'ve taken of interiors, architecture, or design details you love.',
        critical: false,
      },
      {
        label: 'A redesign or space concept',
        note: 'Before/after concept for a room, or a mood board with layout sketch.',
        critical: false,
      },
      {
        label: 'CAD or floor plan work',
        note: 'AutoCAD or hand-drawn floor plans, elevations, or furniture layouts.',
        critical: false,
      },
    ],
    strongPortfolioTips: [
      'Programs want evidence of a strong aesthetic sensibility — curate carefully',
      'A mood board that tells a spatial story can be as powerful as a finished project',
      'NCIDQ certification path matters later — show you understand function, not just style',
      'Photography of spaces you\'ve styled or rearranged counts as portfolio work',
      'Parsons, RISD, SCAD, FIT, and UT Austin have standout programs',
    ],
    admissionNotes: [
      'Interior Design is often in the College of Fine Arts or Architecture school',
      'CIDA accreditation is important — check if programs are accredited',
      'Some programs are called "Interior Architecture" and are more technical',
    ],
    resources: [
      { label: 'CIDA Accredited Programs List', search: 'CIDA accredited interior design programs list' },
      { label: 'SCAD Interior Design Portfolio', search: 'SCAD interior design undergraduate portfolio requirements' },
      { label: 'Parsons Interior Design Admissions', search: 'Parsons School of Design interior design portfolio' },
      { label: 'Houzz Student Work Inspiration', search: 'houzz student interior design concept portfolio' },
    ],
  },
};

const MAJOR_KEYS = Object.keys(MAJORS);

// ── Sub-components ─────────────────────────────────────────────

function DifficultyBar({ value, color, label }) {
  return (
    <div className="pg-difficulty">
      <div className="pg-difficulty__bar-wrap">
        <motion.div
          className="pg-difficulty__bar"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="pg-difficulty__label" style={{ color }}>{label}</span>
    </div>
  );
}

function PortfolioItem({ item }) {
  return (
    <div className={`pg-portfolio-item ${item.critical ? 'pg-portfolio-item--critical' : ''}`}>
      <div className="pg-portfolio-item__icon">
        {item.critical ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
      </div>
      <div className="pg-portfolio-item__content">
        <div className="pg-portfolio-item__label">
          {item.label}
          {item.critical && <span className="pg-required-badge">Required</span>}
        </div>
        <div className="pg-portfolio-item__note">{item.note}</div>
      </div>
    </div>
  );
}

function AISchoolTips({ tips, loading }) {
  if (loading) {
    return (
      <div className="pg-ai-tips pg-ai-tips--loading">
        <div className="pg-ai-dots">
          {[0, 1, 2].map(i => (
            <span key={i} className="pg-ai-dot" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
        <span>Generating school-specific tips…</span>
      </div>
    );
  }

  if (!tips || tips.length === 0) return null;

  return (
    <div className="pg-ai-tips">
      <div className="pg-ai-tips__header">
        <span className="pg-ai-badge">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          AI Insights for Your Schools
        </span>
      </div>
      <div className="pg-ai-tips__grid">
        {tips.map((t, i) => (
          <motion.div
            key={t.school}
            className="pg-school-tip"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="pg-school-tip__school">{t.school}</div>
            {t.emphasis && (
              <div className="pg-school-tip__emphasis">Focus: {t.emphasis}</div>
            )}
            {t.portfolioSize && (
              <div className="pg-school-tip__size">📄 {t.portfolioSize}</div>
            )}
            <div className="pg-school-tip__tip">{t.tip}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────

export default function PortfolioGuide({ profile }) {
  // Auto-select tab that matches student's major
  const profileMajorKey = MAJOR_KEYS.find(k =>
    MAJORS[k].name.toLowerCase().includes((profile?.proposedMajor || '').toLowerCase()) ||
    (profile?.proposedMajor || '').toLowerCase().includes(MAJORS[k].name.toLowerCase())
  ) || 'architecture';

  const [activeKey, setActiveKey] = useState(profileMajorKey);
  const [aiTips, setAiTips] = useState({});
  const [aiLoading, setAiLoading] = useState({});

  const major = MAJORS[activeKey];

  const fetchTips = async (key) => {
    if (aiTips[key] || aiLoading[key]) return;
    const schools = (profile?.schools || []).filter(s => s?.name).map(s => s.name);
    if (!schools.length) return;

    setAiLoading(prev => ({ ...prev, [key]: true }));
    try {
      const { data } = await api.post('/portfolio/tips', {
        major: MAJORS[key].name,
        schools,
        gpa: profile?.gpa,
        sat: profile?.sat,
      });
      setAiTips(prev => ({ ...prev, [key]: data }));
    } catch {
      setAiTips(prev => ({ ...prev, [key]: [] }));
    } finally {
      setAiLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // Fetch tips for active tab
  useEffect(() => {
    fetchTips(activeKey);
  }, [activeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="portfolio-guide">
      {/* Header */}
      <div className="portfolio-guide__header">
        <div>
          <h2 className="portfolio-guide__title">Portfolio & Major Guidance</h2>
          <p className="portfolio-guide__subtitle">
            What you need to get into each design program
          </p>
        </div>
      </div>

      {/* Major Tabs */}
      <div className="pg-tabs">
        {MAJOR_KEYS.map(key => {
          const m = MAJORS[key];
          const isActive = key === activeKey;
          return (
            <button
              key={key}
              className={`pg-tab ${isActive ? 'pg-tab--active' : ''}`}
              onClick={() => setActiveKey(key)}
            >
              <span className="pg-tab__icon">{m.icon}</span>
              <span className="pg-tab__name">{m.name}</span>
              {key === profileMajorKey && (
                <span className="pg-tab__yours">Yours</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeKey}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="pg-content"
        >
          {/* Major Hero */}
          <div className="pg-hero">
            <div className="pg-hero__left">
              <div className="pg-hero__icon">{major.icon}</div>
              <div>
                <h3 className="pg-hero__name">{major.name}</h3>
                <p className="pg-hero__tagline">{major.tagline}</p>
              </div>
            </div>
            <div className="pg-hero__right">
              <div className="pg-hero__stat-label">Admission Difficulty</div>
              <DifficultyBar value={major.difficulty} color={major.difficultyColor} label={major.difficultyLabel} />
            </div>
          </div>

          {/* Two-column layout */}
          <div className="pg-grid">
            {/* Left: Portfolio Requirements */}
            <div className="pg-section">
              <div className="pg-section__header">
                <span className="pg-section__icon">📋</span>
                <h4 className="pg-section__title">What to Include</h4>
              </div>
              <div className="pg-portfolio-list">
                {major.required.map((item, i) => (
                  <PortfolioItem key={i} item={item} />
                ))}
              </div>

              <div className="pg-format-box">
                <div className="pg-format-row">
                  <span className="pg-format-icon">📄</span>
                  <span><strong>Length:</strong> {major.pageCount}</span>
                </div>
                <div className="pg-format-row">
                  <span className="pg-format-icon">💾</span>
                  <span><strong>Format:</strong> {major.format}</span>
                </div>
              </div>
            </div>

            {/* Right: Tips + Resources */}
            <div className="pg-section">
              <div className="pg-section__header">
                <span className="pg-section__icon">💡</span>
                <h4 className="pg-section__title">Strong Portfolio Tips</h4>
              </div>
              <ul className="pg-tips-list">
                {major.strongPortfolioTips.map((tip, i) => (
                  <li key={i} className="pg-tips-list__item">
                    <span className="pg-tips-list__bullet" />
                    {tip}
                  </li>
                ))}
              </ul>

              <div className="pg-section__header" style={{ marginTop: '1.25rem' }}>
                <span className="pg-section__icon">📌</span>
                <h4 className="pg-section__title">Good to Know</h4>
              </div>
              <ul className="pg-tips-list pg-tips-list--notes">
                {major.admissionNotes.map((note, i) => (
                  <li key={i} className="pg-tips-list__item">
                    <span className="pg-tips-list__bullet pg-tips-list__bullet--note" />
                    {note}
                  </li>
                ))}
              </ul>

              <div className="pg-section__header" style={{ marginTop: '1.25rem' }}>
                <span className="pg-section__icon">🔗</span>
                <h4 className="pg-section__title">Research These</h4>
              </div>
              <ul className="pg-resources-list">
                {major.resources.map((r, i) => (
                  <li key={i} className="pg-resource-item">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span>Search: <em>{r.label}</em></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI School-Specific Tips */}
          <AISchoolTips tips={aiTips[activeKey]} loading={!!aiLoading[activeKey]} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
