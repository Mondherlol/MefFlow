// Symptome.js
// Centralise les symptômes par zone et par partie.
// - clé `ALL` : symptômes applicables partout
// - clés de zones (ex: `chest`, `head`) : symptômes fréquents pour la zone
// - clés de parties (ex: `Pecs`, `DessusdeCraneGauche`) : symptômes spécifiques à une partie

// More maintainable structure: list of symptom objects with metadata
const SYMPTOM_LIST = [
  // Global / general (no specific zone)
  { id: "saignement", label: "Saignement", applicable: ["ALL"], tags: ["urgent"] },
  { id: "fievre", label: "Fièvre", applicable: ["ALL"], tags: ["general"] },
  { id: "fatigue", label: "Fatigue", applicable: ["ALL"], tags: ["general"] },
  { id: "nausées", label: "Nausées", applicable: ["ALL"], tags: ["general"] },
  { id: "vomissements", label: "Vomissements", applicable: ["ALL"], tags: ["general"] },
  { id: "evanouissement", label: "Évanouissement / Syncope", applicable: ["ALL"], tags: ["urgent"] },
  { id: "vertiges", label: "Vertiges / Étourdissements", applicable: ["ALL"], tags: ["general"] },

  // Chest / Torse
  { id: "douleur-thoracique", label: "Douleur thoracique", applicable: ["zone:chest"] },
  { id: "oppression-poitrine", label: "Oppression dans la poitrine", applicable: ["zone:chest"] },
  { id: "essoufflement", label: "Essoufflement", applicable: ["zone:chest"] },
  { id: "palpitations", label: "Palpitations", applicable: ["zone:chest"] },

  // Abdomen
  { id: "crampes", label: "Crampes abdominales", applicable: ["zone:abdomen"] },
  { id: "brulures-estomac", label: "Brûlures / Reflux", applicable: ["zone:abdomen"] },

  // Head
  { id: "cephalees", label: "Céphalées", applicable: ["zone:head"] },
  { id: "migraine", label: "Migraine pulsatile", applicable: ["zone:head", "part:DessusdeCraneGauche", "part:DessusdeCraneDroit"] },

  // Parts specific
  { id: "mal-au-coeur-pecs", label: "Mal au coeur", applicable: ["part:Pecs"] },
  { id: "douleur-mastic", label: "Douleur à la mastication", applicable: ["part:Machoire"] },

  // Limbs
  { id: "engourdissement-main", label: "Engourdissement / Fourmillements", applicable: ["zone:upperLimbLeft", "zone:upperLimbRight", "part:PouceGauche", "part:PouceDroit"] },
];

// Map for quick lookup
const SYMPTOM_MAP = SYMPTOM_LIST.reduce((acc, s) => {
  acc[s.id] = s;
  return acc;
}, {});

/**
 * Renvoie la liste des symptômes applicables pour une part (ou zone).
 * - partId: ex 'Pecs' ou null
 * - zoneId: ex 'chest' (si connu)
 * On retourne des objets {id,label}
 */
function getSymptomsFor(partId, zoneId) {
  const zoneTag = zoneId ? `zone:${zoneId}` : null;
  const partTag = partId ? `part:${partId}` : null;

  const result = SYMPTOM_LIST.filter((s) => {
    // Always include global symptoms
    if (s.applicable.includes("ALL")) return true;
    if (partTag && s.applicable.includes(partTag)) return true;
    if (zoneTag && s.applicable.includes(zoneTag)) return true;
    // fallback: allow explicit raw matches
    if (partId && s.applicable.includes(partId)) return true;
    if (zoneId && s.applicable.includes(zoneId)) return true;
    return false;
  });

  // unique by id and return shallow objects
  const seen = new Set();
  return result.filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  }).map(({ id, label }) => ({ id, label }));
}

/**
 * Recherche fuzzy simple (case-insensitive substring) dans la liste applicable.
 * Si partId/zoneId fournis, recherche dans les symptômes applicables à la cible
 * Sinon, recherche parmi les symptômes globaux (ALL).
 */
function searchSymptoms(query, partId = null, zoneId = null, limit = 8) {
  const q = (query || "").trim().toLowerCase();
  const pool = getSymptomsFor(partId, zoneId);
  if (!q) return pool.slice(0, limit);
  return pool.filter((s) => s.label.toLowerCase().includes(q)).slice(0, limit);
}

function getSymptomById(id) {
  return SYMPTOM_MAP[id] || null;
}

export { SYMPTOM_LIST, SYMPTOM_MAP, getSymptomsFor, searchSymptoms, getSymptomById };
