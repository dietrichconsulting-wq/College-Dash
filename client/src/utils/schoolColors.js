// Maps school names (lowercase) to their primary + secondary colors
// Add more schools as needed
const SCHOOL_COLORS = {
  'harvard university': { primary: '#A51C30', secondary: '#1E1E1E', accent: '#C90016', short: 'Harvard' },
  'yale university': { primary: '#00356B', secondary: '#FFFFFF', accent: '#286DC0', short: 'Yale' },
  'princeton university': { primary: '#E77500', secondary: '#000000', accent: '#FF8F00', short: 'Princeton' },
  'stanford university': { primary: '#8C1515', secondary: '#FFFFFF', accent: '#B83A4B', short: 'Stanford' },
  'massachusetts institute of technology': { primary: '#750014', secondary: '#8A8B8C', accent: '#A31F34', short: 'MIT' },
  'mit': { primary: '#750014', secondary: '#8A8B8C', accent: '#A31F34', short: 'MIT' },
  'columbia university': { primary: '#B9D9EB', secondary: '#FFFFFF', accent: '#1D4F91', short: 'Columbia' },
  'university of pennsylvania': { primary: '#011F5B', secondary: '#990000', accent: '#82AFD3', short: 'Penn' },
  'duke university': { primary: '#003087', secondary: '#FFFFFF', accent: '#001A57', short: 'Duke' },
  'university of chicago': { primary: '#800000', secondary: '#FFFFFF', accent: '#A50000', short: 'UChicago' },
  'northwestern university': { primary: '#4E2A84', secondary: '#FFFFFF', accent: '#7B43A5', short: 'NW' },
  'johns hopkins university': { primary: '#002D72', secondary: '#FFFFFF', accent: '#68ACE5', short: 'Hopkins' },
  'rice university': { primary: '#00205B', secondary: '#C1C6C8', accent: '#5E6062', short: 'Rice' },
  'vanderbilt university': { primary: '#866D4B', secondary: '#000000', accent: '#CFAE70', short: 'Vandy' },
  'university of notre dame': { primary: '#0C2340', secondary: '#C99700', accent: '#AE9142', short: 'ND' },
  'carnegie mellon university': { primary: '#C41230', secondary: '#000000', accent: '#E02040', short: 'CMU' },
  'emory university': { primary: '#012169', secondary: '#F2A900', accent: '#0033A0', short: 'Emory' },
  'georgetown university': { primary: '#041E42', secondary: '#63666A', accent: '#1A3A6A', short: 'G-Town' },
  'university of michigan': { primary: '#00274C', secondary: '#FFCB05', accent: '#00274C', short: 'Michigan' },
  'university of virginia': { primary: '#232D4B', secondary: '#F84C1E', accent: '#E57200', short: 'UVA' },
  'university of north carolina': { primary: '#4B9CD3', secondary: '#FFFFFF', accent: '#13294B', short: 'UNC' },
  'georgia tech': { primary: '#B3A369', secondary: '#003057', accent: '#C29B40', short: 'GT' },
  'georgia institute of technology': { primary: '#B3A369', secondary: '#003057', accent: '#C29B40', short: 'GT' },
  'ucla': { primary: '#2774AE', secondary: '#FFD100', accent: '#005C8A', short: 'UCLA' },
  'university of california los angeles': { primary: '#2774AE', secondary: '#FFD100', accent: '#005C8A', short: 'UCLA' },
  'uc berkeley': { primary: '#003262', secondary: '#FDB515', accent: '#3B7EA1', short: 'Berkeley' },
  'university of california berkeley': { primary: '#003262', secondary: '#FDB515', accent: '#3B7EA1', short: 'Berkeley' },
  'uc davis': { primary: '#002855', secondary: '#B3A369', accent: '#DAAA00', short: 'Davis' },
  'university of california davis': { primary: '#002855', secondary: '#B3A369', accent: '#DAAA00', short: 'Davis' },
  'uc san diego': { primary: '#182B49', secondary: '#C69214', accent: '#006A96', short: 'UCSD' },
  'university of california san diego': { primary: '#182B49', secondary: '#C69214', accent: '#006A96', short: 'UCSD' },
  'uc santa barbara': { primary: '#003660', secondary: '#FEBC11', accent: '#004B87', short: 'UCSB' },
  'university of california santa barbara': { primary: '#003660', secondary: '#FEBC11', accent: '#004B87', short: 'UCSB' },
  'uc irvine': { primary: '#0064A4', secondary: '#FFD200', accent: '#1B3D6D', short: 'UCI' },
  'university of california irvine': { primary: '#0064A4', secondary: '#FFD200', accent: '#1B3D6D', short: 'UCI' },
  'usc': { primary: '#990000', secondary: '#FFC72C', accent: '#880000', short: 'USC' },
  'university of southern california': { primary: '#990000', secondary: '#FFC72C', accent: '#880000', short: 'USC' },
  'new york university': { primary: '#57068C', secondary: '#FFFFFF', accent: '#8900E1', short: 'NYU' },
  'nyu': { primary: '#57068C', secondary: '#FFFFFF', accent: '#8900E1', short: 'NYU' },
  'boston university': { primary: '#CC0000', secondary: '#FFFFFF', accent: '#E00000', short: 'BU' },
  'boston college': { primary: '#8B2332', secondary: '#BEA969', accent: '#A02040', short: 'BC' },
  'university of florida': { primary: '#0021A5', secondary: '#FA4616', accent: '#003087', short: 'Florida' },
  'ohio state university': { primary: '#BB0000', secondary: '#666666', accent: '#FF0000', short: 'OSU' },
  'ut austin': { primary: '#BF5700', secondary: '#FFFFFF', accent: '#CC5500', short: 'Texas' },
  'university of texas at austin': { primary: '#BF5700', secondary: '#FFFFFF', accent: '#CC5500', short: 'Texas' },
  'university of texas austin': { primary: '#BF5700', secondary: '#FFFFFF', accent: '#CC5500', short: 'Texas' },
  'texas a&m': { primary: '#500000', secondary: '#FFFFFF', accent: '#6A0000', short: 'A&M' },
  'texas a & m': { primary: '#500000', secondary: '#FFFFFF', accent: '#6A0000', short: 'A&M' },
  'texas a & m university': { primary: '#500000', secondary: '#FFFFFF', accent: '#6A0000', short: 'A&M' },
  'texas a&m university': { primary: '#500000', secondary: '#FFFFFF', accent: '#6A0000', short: 'A&M' },
  'penn state': { primary: '#041E42', secondary: '#FFFFFF', accent: '#1E3A6D', short: 'PSU' },
  'pennsylvania state university': { primary: '#041E42', secondary: '#FFFFFF', accent: '#1E3A6D', short: 'PSU' },
  'university of washington': { primary: '#4B2E83', secondary: '#E8D3A2', accent: '#85754D', short: 'UW' },
  'university of wisconsin': { primary: '#C5050C', secondary: '#FFFFFF', accent: '#E00000', short: 'Wiscon.' },
  'purdue university': { primary: '#CEB888', secondary: '#000000', accent: '#9D968D', short: 'Purdue' },
  'university of illinois': { primary: '#E84A27', secondary: '#13294B', accent: '#FF5F05', short: 'Illinois' },
  'auburn university': { primary: '#0C2340', secondary: '#E87722', accent: '#F56600', short: 'Auburn' },
  'university of alabama': { primary: '#9E1B32', secondary: '#FFFFFF', accent: '#C41E3A', short: 'Bama' },
  'clemson university': { primary: '#F56600', secondary: '#522D80', accent: '#FF7F00', short: 'Clemson' },
  'university of georgia': { primary: '#BA0C2F', secondary: '#000000', accent: '#E4002B', short: 'UGA' },
  'florida state university': { primary: '#782F40', secondary: '#CEB888', accent: '#A0344B', short: 'FSU' },
  'university of miami': { primary: '#F47321', secondary: '#005030', accent: '#FF8A40', short: 'Miami' },
  'university of oregon': { primary: '#154733', secondary: '#FEE123', accent: '#18593A', short: 'Oregon' },
  'oregon': { primary: '#154733', secondary: '#FEE123', accent: '#18593A', short: 'Oregon' },
  'university of colorado': { primary: '#CFB87C', secondary: '#000000', accent: '#A2956A', short: 'CU' },
  'arizona state university': { primary: '#8C1D40', secondary: '#FFC627', accent: '#A02050', short: 'ASU' },
  'university of arizona': { primary: '#CC0033', secondary: '#003366', accent: '#AB0520', short: 'Arizona' },
  'michigan state university': { primary: '#18453B', secondary: '#FFFFFF', accent: '#008840', short: 'MSU' },
  'indiana university': { primary: '#990000', secondary: '#FFFFFF', accent: '#7D110E', short: 'Indiana' },
  'university of pittsburgh': { primary: '#003594', secondary: '#FFB81C', accent: '#0040AA', short: 'Pitt' },
  'wake forest university': { primary: '#9E7E38', secondary: '#000000', accent: '#C8A23D', short: 'Wake' },
  'tulane university': { primary: '#006747', secondary: '#FFFFFF', accent: '#418FDE', short: 'Tulane' },
  'villanova university': { primary: '#003366', secondary: '#FFFFFF', accent: '#13B5EA', short: 'Nova' },
  'baylor university': { primary: '#003015', secondary: '#FFB81C', accent: '#154734', short: 'Baylor' },
  'tcu': { primary: '#4D1979', secondary: '#FFFFFF', accent: '#6A2C91', short: 'TCU' },
  'texas christian university': { primary: '#4D1979', secondary: '#FFFFFF', accent: '#6A2C91', short: 'TCU' },
  'smu': { primary: '#CC0035', secondary: '#002588', accent: '#E00040', short: 'SMU' },
  'southern methodist university': { primary: '#CC0035', secondary: '#002588', accent: '#E00040', short: 'SMU' },
  'texas tech university': { primary: '#CC0000', secondary: '#000000', accent: '#E00000', short: 'TTU' },
  'university of houston': { primary: '#C8102E', secondary: '#FFFFFF', accent: '#E00030', short: 'UH' },
};

// Normalize a school name for matching: lowercase, strip punctuation variations
function normalize(name) {
  return name
    .toLowerCase()
    .replace(/[,\-–]/g, ' ')    // commas, hyphens, dashes -> space
    .replace(/\s+/g, ' ')       // collapse whitespace
    .trim();
}

// Fuzzy match: try exact, then normalized exact, then substring both ways
export function getSchoolColors(schoolName) {
  if (!schoolName) return null;
  const lower = schoolName.toLowerCase().trim();
  const norm = normalize(schoolName);

  // Exact match
  if (SCHOOL_COLORS[lower]) return SCHOOL_COLORS[lower];

  // Normalized exact match (handles commas, dashes)
  for (const [key, colors] of Object.entries(SCHOOL_COLORS)) {
    if (normalize(key) === norm) return colors;
  }

  // Substring match both directions
  for (const [key, colors] of Object.entries(SCHOOL_COLORS)) {
    const normKey = normalize(key);
    if (norm.includes(normKey) || normKey.includes(norm)) return colors;
  }

  return null;
}

// Get the short/common name for a school (e.g. "Texas", "A&M", "Oregon")
export function getSchoolShortName(schoolName) {
  const colors = getSchoolColors(schoolName);
  if (colors?.short) return colors.short;
  // Fallback: strip common words and return what's left
  if (!schoolName) return '?';
  const stripped = schoolName
    .replace(/\buniversity\b|\bcollege\b|\bof\b|\bthe\b|\bat\b|\bin\b|\bmain\b|\bcampus\b/gi, '')
    .replace(/[,\-–]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return stripped || schoolName.slice(0, 6);
}

// Default theme if no school colors found
export const DEFAULT_THEME = {
  primary: '#2563EB',
  secondary: '#F59E0B',
  accent: '#3B82F6',
};
