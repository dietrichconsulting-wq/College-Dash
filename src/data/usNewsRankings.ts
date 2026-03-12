// @ts-nocheck
/**
 * Approximate US News National University & supplemental rankings (2024).
 * Source: US News & World Report Best Colleges 2024.
 * Rankings change annually — treat as reference, not definitive.
 *
 * Each entry: { rank, type, aliases[] }
 * type: 'national' | 'liberal-arts' | 'regional'
 */
const RANKINGS = [
  // ── Top National Universities ─────────────────────────────────
  { rank: 1,   name: 'Princeton University',                     aliases: ['princeton'] },
  { rank: 2,   name: 'Massachusetts Institute of Technology',    aliases: ['mit'] },
  { rank: 3,   name: 'Harvard University',                       aliases: ['harvard'] },
  { rank: 4,   name: 'Stanford University',                      aliases: ['stanford'] },
  { rank: 5,   name: 'Yale University',                          aliases: ['yale'] },
  { rank: 6,   name: 'University of Pennsylvania',               aliases: ['upenn', 'penn'] },
  { rank: 7,   name: 'Duke University',                          aliases: ['duke'] },
  { rank: 8,   name: 'Johns Hopkins University',                 aliases: ['jhu', 'johns hopkins'] },
  { rank: 9,   name: 'Northwestern University',                  aliases: ['northwestern'] },
  { rank: 9,   name: 'California Institute of Technology',       aliases: ['caltech'] },
  { rank: 12,  name: 'Columbia University',                      aliases: ['columbia'] },
  { rank: 12,  name: 'Dartmouth College',                        aliases: ['dartmouth'] },
  { rank: 13,  name: 'Brown University',                         aliases: ['brown'] },
  { rank: 14,  name: 'Vanderbilt University',                    aliases: ['vanderbilt'] },
  { rank: 15,  name: 'University of Notre Dame',                 aliases: ['notre dame'] },
  { rank: 16,  name: 'Georgetown University',                    aliases: ['georgetown'] },
  { rank: 17,  name: 'Rice University',                          aliases: ['rice'] },
  { rank: 18,  name: 'Emory University',                         aliases: ['emory'] },
  { rank: 19,  name: 'Cornell University',                       aliases: ['cornell'] },
  { rank: 20,  name: 'University of California Los Angeles',     aliases: ['ucla', 'uc los angeles'] },
  { rank: 20,  name: 'University of California Berkeley',        aliases: ['uc berkeley', 'cal', 'berkeley'] },
  { rank: 22,  name: 'Washington University in St. Louis',       aliases: ['washu', 'wash u', 'wustl', 'washington university st louis', 'washington university in st louis'] },
  { rank: 22,  name: 'Tufts University',                         aliases: ['tufts'] },
  { rank: 24,  name: 'Carnegie Mellon University',               aliases: ['cmu', 'carnegie mellon'] },
  { rank: 25,  name: 'Wake Forest University',                   aliases: ['wake forest'] },
  { rank: 26,  name: 'University of Michigan',                   aliases: ['umich', 'michigan', 'u michigan'] },
  { rank: 26,  name: 'University of Virginia',                   aliases: ['uva', 'virginia'] },
  { rank: 27,  name: 'University of Southern California',        aliases: ['usc', 'southern california'] },
  { rank: 28,  name: 'University of North Carolina at Chapel Hill', aliases: ['unc', 'unc chapel hill', 'north carolina', 'carolina'] },
  { rank: 28,  name: 'University of California San Diego',       aliases: ['ucsd', 'uc san diego'] },
  { rank: 28,  name: 'New York University',                      aliases: ['nyu'] },
  { rank: 30,  name: 'Boston College',                           aliases: ['bc', 'boston college'] },
  { rank: 30,  name: 'Tulane University',                        aliases: ['tulane'] },
  { rank: 32,  name: 'University of Texas at Austin',            aliases: ['ut austin', 'ut', 'texas', 'university of texas austin'] },
  { rank: 32,  name: 'University of California Santa Barbara',   aliases: ['ucsb', 'uc santa barbara'] },
  { rank: 35,  name: 'University of Florida',                    aliases: ['uf', 'florida', 'gators'] },
  { rank: 35,  name: 'Boston University',                        aliases: ['bu', 'boston university'] },
  { rank: 37,  name: 'Georgia Institute of Technology',          aliases: ['georgia tech', 'gatech'] },
  { rank: 37,  name: 'Lehigh University',                        aliases: ['lehigh'] },
  { rank: 38,  name: 'University of California Davis',           aliases: ['uc davis', 'davis', 'ucd'] },
  { rank: 40,  name: 'Ohio State University',                    aliases: ['ohio state', 'osu', 'ohio state university'] },
  { rank: 44,  name: 'Northeastern University',                  aliases: ['northeastern', 'neu'] },
  { rank: 44,  name: 'University of Wisconsin-Madison',          aliases: ['wisconsin', 'uw madison', 'uw-madison', 'university of wisconsin madison'] },
  { rank: 47,  name: 'University of Illinois Urbana-Champaign',  aliases: ['uiuc', 'illinois', 'u of i'] },
  { rank: 47,  name: 'University of Rochester',                  aliases: ['rochester', 'ur'] },
  { rank: 49,  name: 'Purdue University',                        aliases: ['purdue'] },
  { rank: 49,  name: 'Villanova University',                     aliases: ['villanova'] },
  { rank: 52,  name: 'Pepperdine University',                    aliases: ['pepperdine'] },
  { rank: 53,  name: 'University of California Irvine',          aliases: ['uci', 'uc irvine'] },
  { rank: 57,  name: 'University of Pittsburgh',                 aliases: ['pitt', 'pittsburgh'] },
  { rank: 57,  name: 'University of Maryland',                   aliases: ['umd', 'maryland'] },
  { rank: 57,  name: 'George Washington University',             aliases: ['gwu', 'george washington'] },
  { rank: 60,  name: 'Penn State University',                    aliases: ['penn state', 'psu'] },
  { rank: 60,  name: 'Fordham University',                       aliases: ['fordham'] },
  { rank: 68,  name: 'University of Miami',                      aliases: ['miami', 'um'] },
  { rank: 74,  name: 'Virginia Tech',                            aliases: ['vt', 'virginia tech'] },
  { rank: 74,  name: 'Clemson University',                       aliases: ['clemson'] },
  { rank: 75,  name: 'Texas A&M University',                     aliases: ['tamu', 'texas a&m', 'texas am', 'a&m'] },
  { rank: 75,  name: 'University of Minnesota',                  aliases: ['minnesota', 'umn'] },
  { rank: 80,  name: 'Indiana University',                       aliases: ['indiana', 'iu'] },
  { rank: 87,  name: 'Southern Methodist University',            aliases: ['smu'] },
  { rank: 93,  name: 'Texas Christian University',               aliases: ['tcu'] },
  { rank: 93,  name: 'Baylor University',                        aliases: ['baylor'] },
  { rank: 98,  name: 'University of Denver',                     aliases: ['du', 'denver'] },
  { rank: 104, name: 'University of Colorado Boulder',           aliases: ['cu boulder', 'colorado boulder', 'colorado', 'cu'] },
  { rank: 108, name: 'University of Oregon',                     aliases: ['oregon', 'uo', 'u of o'] },
  { rank: 115, name: 'University of Arizona',                    aliases: ['arizona', 'uarizona', 'u of a'] },
  { rank: 117, name: 'Arizona State University',                 aliases: ['asu', 'arizona state'] },
  { rank: 125, name: 'University of Iowa',                       aliases: ['iowa', 'uiowa'] },
  { rank: 125, name: 'Iowa State University',                    aliases: ['iowa state'] },
  { rank: 133, name: 'Colorado State University',                aliases: ['csu', 'colorado state'] },
  { rank: 133, name: 'Oregon State University',                  aliases: ['osu', 'oregon state'] },
  { rank: 137, name: 'University of Vermont',                    aliases: ['uvm', 'vermont'] },
  { rank: 140, name: 'University of Kansas',                     aliases: ['ku', 'kansas'] },
  { rank: 140, name: 'University of Connecticut',                aliases: ['uconn', 'connecticut'] },
  { rank: 146, name: 'University of New Hampshire',              aliases: ['unh', 'new hampshire'] },
  { rank: 150, name: 'University of Alabama',                    aliases: ['alabama', 'bama'] },
  { rank: 150, name: 'University of Utah',                       aliases: ['utah'] },
  { rank: 160, name: 'Florida State University',                 aliases: ['fsu', 'florida state'] },
  { rank: 164, name: 'University of Missouri',                   aliases: ['mizzou', 'missouri'] },
  { rank: 170, name: 'University of Tennessee',                  aliases: ['tennessee', 'vols'] },
  { rank: 175, name: 'University of Mississippi',                aliases: ['ole miss', 'mississippi'] },

  // ── Notable schools without national rank or special lists ────
  // Cal Poly is a regional/polytechnic — ranked separately
  { rank: null, name: 'California Polytechnic State University', aliases: ['cal poly', 'cal poly slo', 'calpoly'] },
  { rank: null, name: 'University of California Santa Cruz',     aliases: ['ucsc', 'uc santa cruz'] },
  { rank: null, name: 'University of New Mexico',                aliases: ['unm', 'new mexico'] },
  { rank: null, name: 'University of Montana',                   aliases: ['montana', 'um'] },
  { rank: null, name: 'University of Wyoming',                   aliases: ['wyoming', 'uw'] },
];

/** Normalize a school name for fuzzy matching */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s&]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const normalizedIndex = RANKINGS.map(entry => ({
  ...entry,
  _normalizedName: normalize(entry.name),
  _normalizedAliases: entry.aliases.map(normalize),
}));

/**
 * Look up US News rank for a school name.
 * Returns { rank, name } or null.
 */
export function findRanking(schoolName: string): { rank: number | null; name: string } | null {
  if (!schoolName) return null;
  const q = normalize(schoolName);

  // 1. Exact alias match
  let match = normalizedIndex.find(e =>
    e._normalizedAliases.includes(q) || e._normalizedName === q
  );
  if (match) return { rank: match.rank, officialName: match.name };

  // 2. Substring: query contains the normalized alias or vice versa
  match = normalizedIndex.find(e =>
    e._normalizedAliases.some(a => q.includes(a) || a.includes(q)) ||
    q.includes(e._normalizedName) || e._normalizedName.includes(q)
  );
  if (match) return { rank: match.rank, officialName: match.name };

  return null;
}

/**
 * Format rank as a display string: "#12" or "Unranked"
 */
export function formatRank(rank: number | null): string | null {
  if (rank == null) return null;
  return `#${rank}`;
}

export default RANKINGS;
