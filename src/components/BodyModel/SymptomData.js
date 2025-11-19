// Base de données des symptômes mappés aux parties du corps (BodyZone.js)

export const SYMPTOMS_DB = [
  // --- Tête & Visage ---
  { id: "migraine", label: "Migraine / Maux de tête", partId: "DessusdeCraneDroit", keywords: ["tete", "crane", "douleur"] },
  { id: "vertiges", label: "Vertiges", partId: "DessusdeCraneGauche", keywords: ["tournis", "equilibre"] },
  { id: "saignement_nez", label: "Saignement de nez", partId: "Nez", keywords: ["epistaxis", "nez"] },
  { id: "nez_bouche", label: "Nez bouché / Rhume", partId: "Nez", keywords: ["morve", "respiration"] },
  { id: "mal_dents", label: "Mal de dents / Rage de dents", partId: "Machoire", keywords: ["bouche", "dents"] },
  { id: "mal_gorge", label: "Mal de gorge", partId: "Cou", keywords: ["angine", "deglutition"] },
  { id: "yeux_rouges", label: "Yeux rouges / Irrités", partId: "OeilDroit", keywords: ["conjonctivite", "vue"] },
  
  // --- Torse & Dos ---
  { id: "douleur_thoracique", label: "Douleur thoracique (Poitrine)", partId: "Pecs", keywords: ["coeur", "infarctus", "oppression"] },
  { id: "toux_seche", label: "Toux sèche", partId: "CageThoracique", keywords: ["poumons", "respiration"] },
  { id: "toux_grasse", label: "Toux grasse", partId: "CageThoracique", keywords: ["poumons", "crachat"] },
  { id: "palpitations", label: "Palpitations cardiaques", partId: "Pecs", keywords: ["coeur", "battement"] },
  { id: "lumbago", label: "Lumbago / Tour de reins", partId: "BasDos", keywords: ["dos", "vertèbre"] },
  { id: "raideur_nuque", label: "Raideur de la nuque", partId: "Nuque", keywords: ["torticolis", "cou"] },

  // --- Abdomen ---
  { id: "maux_ventre", label: "Maux de ventre / Crampes", partId: "Abdos", keywords: ["estomac", "digestion"] },
  { id: "nausees", label: "Nausées / Vomissements", partId: "Abdos", keywords: ["vomir", "mal au coeur"] },
  { id: "constipation", label: "Constipation", partId: "VentreGauche", keywords: ["selles", "intestins"] },
  { id: "diarrhee", label: "Diarrhée", partId: "VentreDroit", keywords: ["selles", "intestins"] },
  
  // --- Membres Supérieurs ---
  { id: "douleur_epaule", label: "Douleur à l'épaule", partId: "EpauleDroit", keywords: ["articulation", "bras"] },
  { id: "fourmillements_main", label: "Fourmillements main/doigts", partId: "MainDroit", keywords: ["canal carpien", "sensibilité"] },
  { id: "fracture_bras", label: "Suspicion fracture bras", partId: "BrasDroit", keywords: ["os", "trauma"] },

  // --- Membres Inférieurs ---
  { id: "entorse_cheville", label: "Entorse cheville", partId: "ChevilleDroit", keywords: ["pied", "ligament"] },
  { id: "jambes_lourdes", label: "Jambes lourdes", partId: "JambeDroit", keywords: ["circulation", "veines"] },
  { id: "douleur_genou", label: "Douleur au genou", partId: "GenouxDroit", keywords: ["articulation", "marche"] },
  { id: "sciatique", label: "Sciatique", partId: "Fesse", keywords: ["nerf", "jambe", "dos"] },

  // --- Généraux (Non localisés ou systémiques) ---
  { id: "fievre", label: "Fièvre élevée", partId: null, keywords: ["température", "chaud", "frissons"] },
  { id: "fatigue", label: "Fatigue intense / Épuisement", partId: null, keywords: ["sommeil", "las"] },
  { id: "evanouissement", label: "Évanouissement / Malaise", partId: null, keywords: ["syncope", "conscience"] },
  { id: "anxiete", label: "Anxiété / Crise de panique", partId: null, keywords: ["stress", "peur"] },
  { id: "perte_appetit", label: "Perte d'appétit", partId: null, keywords: ["manger", "faim"] },
];

// Fonction de recherche intelligente
export function searchSymptoms(query) {
  if (!query || query.length < 2) return [];
  const lowerQ = query.toLowerCase();
  return SYMPTOMS_DB.filter(s => 
    s.label.toLowerCase().includes(lowerQ) || 
    s.keywords.some(k => k.includes(lowerQ))
  );
}

// Récupérer les symptômes liés à une partie 3D spécifique
export function getSymptomsForPart(partId) {
  if (!partId) return [];
  // On cherche les symptômes qui ont exactement cet ID, ou qui sont génériques pour la zone
  // Ici on fait simple : match exact sur partId
  return SYMPTOMS_DB.filter(s => s.partId === partId);
}