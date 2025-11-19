// Base de données des symptômes mappés aux parties du corps (BodyZone.js)
// ⚠️ Cet outil est purement informatif et ne remplace pas un avis médical professionnel.

export const SYMPTOMS_DB = [
  // ===================== TÊTE & VISAGE =====================
  // Crâne / dessus de tête
  {
    id: "migraine",
    label: "Migraine / Maux de tête",
    partId: "DessusdeCraneDroit",
    keywords: ["tete", "crane", "douleur", "pulsatile", "lumiere"],
  },
  {
    id: "cephalee_tension",
    label: "Céphalée de tension",
    partId: "DessusdeCraneGauche",
    keywords: ["tete", "pression", "stress", "casque"],
  },
  {
    id: "mal_tete_fievre",
    label: "Maux de tête avec fièvre",
    partId: "DessusdeCraneDroit",
    keywords: ["tete", "fievre", "infection"],
  },
  {
    id: "mal_tete_sinus",
    label: "Maux de tête sinus (front / pommettes)",
    partId: "TempeGauche",
    keywords: ["sinusite", "front", "nez", "pression"],
  },
  {
    id: "mal_tete_cou",
    label: "Maux de tête liés au cou",
    partId: "TempeDroit",
    keywords: ["tete", "nuque", "raideur"],
  },

  // Yeux
  {
    id: "yeux_rouges",
    label: "Yeux rouges / Irrités",
    partId: "OeilDroit",
    keywords: ["conjonctivite", "allergie", "vue"],
  },
  {
    id: "yeux_secs",
    label: "Yeux secs / Picotements",
    partId: "OeilGauche",
    keywords: ["ecran", "fatigue", "secheresse"],
  },
  {
    id: "vision_floue",
    label: "Vision floue passagère",
    partId: "OeilDroit",
    keywords: ["vue", "flou", "maux de tete"],
  },
  {
    id: "mouches_volantes",
    label: "Points noirs / Mouches volantes",
    partId: "OeilGauche",
    keywords: ["vue", "taches", "luminosite"],
  },
  {
    id: "douleur_oeil",
    label: "Douleur derrière l'œil",
    partId: "OeilDroit",
    keywords: ["pression", "migraine", "sinus"],
  },

  // Oreilles
  {
    id: "otalgie_gauche",
    label: "Douleur d'oreille (Otalgie)",
    partId: "OreilleGauche",
    keywords: ["otite", "douleur", "oreille"],
  },
  {
    id: "otalgie_droite",
    label: "Douleur d'oreille (Otalgie)",
    partId: "OreilleDroit",
    keywords: ["otite", "douleur", "oreille"],
  },
  {
    id: "acouphenes_gauche",
    label: "Acouphènes (sifflements)",
    partId: "OreilleGauche",
    keywords: ["bruit", "sifflement", "bourdonnement"],
  },
  {
    id: "acouphenes_droit",
    label: "Acouphènes (sifflements)",
    partId: "OreilleDroit",
    keywords: ["bruit", "sifflement", "bourdonnement"],
  },
  {
    id: "perte_audition_subite",
    label: "Baisse brutale de l’audition",
    partId: "OreilleDroit",
    keywords: ["surdité", "baisse", "oreille"],
  },

  // Nez / Sinus
  {
    id: "saignement_nez",
    label: "Saignement de nez (Épistaxis)",
    partId: "Nez",
    keywords: ["epistaxis", "nez", "sang"],
  },
  {
    id: "nez_bouche",
    label: "Nez bouché / Rhume",
    partId: "Nez",
    keywords: ["rhume", "morve", "respiration"],
  },
  {
    id: "sinusite_aigue",
    label: "Douleur des sinus / Sinusite",
    partId: "Nez",
    keywords: ["sinus", "front", "joues", "pression"],
  },
  {
    id: "allergie_nasale",
    label: "Allergie nasale (éternuements, démangeaisons)",
    partId: "Nez",
    keywords: ["allergie", "pollen", "eternuements"],
  },
  {
    id: "perte_odorat",
    label: "Perte d’odorat (Anosmie)",
    partId: "Nez",
    keywords: ["odorat", "odeur", "rhume"],
  },

  // Bouche / Mâchoire
  {
    id: "mal_dents",
    label: "Mal de dents / Rage de dents",
    partId: "Machoire",
    keywords: ["dents", "carie", "douleur"],
  },
  {
    id: "aphtes_buccaux",
    label: "Aphtes dans la bouche",
    partId: "Bouche",
    keywords: ["aphtes", "ulcere", "bouche"],
  },
  {
    id: "gencives_saignantes",
    label: "Gencives qui saignent",
    partId: "Bouche",
    keywords: ["gencive", "sang", "brossage"],
  },
  {
    id: "trismus",
    label: "Difficulté à ouvrir la bouche",
    partId: "Machoire",
    keywords: ["machoire", "bloquee", "douleur"],
  },
  {
    id: "bruxisme",
    label: "Grincement des dents (Bruxisme)",
    partId: "Machoire",
    keywords: ["grincer", "stress", "dents"],
  },

  // Gorge / Cou / Nuque (partie tête)
  {
    id: "mal_gorge",
    label: "Mal de gorge (déglutition douloureuse)",
    partId: "Cou",
    keywords: ["angine", "gorge", "deglutition"],
  },
  {
    id: "gorge_irritee",
    label: "Gorge irritée / Sécheresse",
    partId: "Cou",
    keywords: ["toux", "secheresse", "fumer"],
  },
  {
    id: "raideur_nuque",
    label: "Raideur de la nuque",
    partId: "Nuque",
    keywords: ["torticolis", "cou", "bloque"],
  },
  {
    id: "torticolis_aigu",
    label: "Torticolis aigu",
    partId: "Nuque",
    keywords: ["nuque", "blocage", "mouvements"],
  },
  {
    id: "ganglions_cervicaux",
    label: "Ganglions douloureux au cou",
    partId: "Cou",
    keywords: ["boules", "ganglion", "infection"],
  },

  // Joues / visage
  {
    id: "douleur_joue_gauche",
    label: "Douleur au niveau de la joue",
    partId: "JoueGauche",
    keywords: ["sinus", "dent", "trauma"],
  },
  {
    id: "douleur_joue_droite",
    label: "Douleur au niveau de la joue",
    partId: "JoueDroit",
    keywords: ["sinus", "dent", "trauma"],
  },
  {
    id: "engourdissement_visage",
    label: "Engourdissement / fourmillement du visage",
    partId: "JoueGauche",
    keywords: ["paresthésie", "fourmis", "visage"],
  },
  {
    id: "asymetrie_sourire",
    label: "Sourire asymétrique (paralysie faciale ?)",
    partId: "JoueDroit",
    keywords: ["paralysie", "visage", "nerf"],
  },
  {
    id: "eruption_visage",
    label: "Boutons / rougeurs sur le visage",
    partId: "JoueGauche",
    keywords: ["acne", "allergie", "eruption"],
  },

  // ===================== TORSE / DOS =====================
  // Poitrine / Pectoraux / Cage thoracique
  {
    id: "douleur_thoracique",
    label: "Douleur thoracique (Poitrine)",
    partId: "Pecs",
    keywords: ["coeur", "infarctus", "oppression", "poitrine"],
  },
  {
    id: "douleur_thoracique_effort",
    label: "Douleur à la poitrine à l’effort",
    partId: "Pecs",
    keywords: ["angor", "effort", "coeur"],
  },
  {
    id: "oppression_thoracique",
    label: "Oppression thoracique / Poitrine serrée",
    partId: "CageThoracique",
    keywords: ["poitrine", "respiration", "angoisse"],
  },
  {
    id: "brulure_derriere_sternum",
    label: "Brûlure derrière le sternum (RGO)",
    partId: "CageThoracique",
    keywords: ["reflux", "brulure", "estomac"],
  },
  {
    id: "douleur_cote",
    label: "Douleur sur un côté de la cage thoracique",
    partId: "CageThoracique",
    keywords: ["cote", "traumatisme", "fracture"],
  },
  {
    id: "palpitations",
    label: "Palpitations cardiaques",
    partId: "Pecs",
    keywords: ["coeur", "battement", "rythme"],
  },
  {
    id: "essoufflement_repos",
    label: "Essoufflement au repos",
    partId: "CageThoracique",
    keywords: ["dyspnee", "poumons", "respirer"],
  },
  {
    id: "toux_seche",
    label: "Toux sèche",
    partId: "CageThoracique",
    keywords: ["toux", "poumons", "irritation"],
  },
  {
    id: "toux_grasse",
    label: "Toux grasse avec crachats",
    partId: "CageThoracique",
    keywords: ["toux", "mucus", "bronchite"],
  },
  {
    id: "douleur_respiratoire",
    label: "Douleur à la respiration profonde",
    partId: "CageThoracique",
    keywords: ["pleuresie", "poumons", "respiration"],
  },

  // Dos / Rachis
  {
    id: "lumbago",
    label: "Lumbago / Tour de reins",
    partId: "BasDos",
    keywords: ["dos", "bas du dos", "blocage"],
  },
  {
    id: "douleur_haut_dos",
    label: "Douleur haut du dos",
    partId: "HautDos",
    keywords: ["scapula", "tension", "muscle"],
  },
  {
    id: "contracture_dorsale",
    label: "Contracture musculaire dorsale",
    partId: "HautDos",
    keywords: ["contracture", "muscle", "tension"],
  },
  {
    id: "douleur_dos_prolongee",
    label: "Douleur chronique du dos",
    partId: "BasDos",
    keywords: ["chronique", "rachis", "lombalgie"],
  },
  {
    id: "douleur_dos_irradiant",
    label: "Douleur dans le dos irradiant dans la jambe",
    partId: "BasDos",
    keywords: ["sciatique", "nerf", "jambe"],
  },

  // ===================== ABDOMEN / VENTRE =====================
  {
    id: "maux_ventre",
    label: "Maux de ventre / Crampes",
    partId: "Abdos",
    keywords: ["ventre", "crampe", "douleur", "estomac"],
  },
  {
    id: "nausees",
    label: "Nausées / Vomissements",
    partId: "Abdos",
    keywords: ["vomir", "mal au coeur", "estomac"],
  },
  {
    id: "ballonnements",
    label: "Ballonnements / Gaz",
    partId: "Abdos",
    keywords: ["balloné", "gaz", "digestion"],
  },
  {
    id: "douleur_estomac",
    label: "Douleur à l’estomac (haut du ventre)",
    partId: "VentreGauche",
    keywords: ["brulure", "gastrite", "ulcere"],
  },
  {
    id: "douleur_ombilicale",
    label: "Douleur autour du nombril",
    partId: "Abdos",
    keywords: ["nombril", "crampe", "appendicite"],
  },
  {
    id: "constipation",
    label: "Constipation",
    partId: "VentreGauche",
    keywords: ["selles", "bloque", "intestins"],
  },
  {
    id: "diarrhee",
    label: "Diarrhée",
    partId: "VentreDroit",
    keywords: ["selles", "liquide", "infection"],
  },
  {
    id: "douleur_fosse_droite",
    label: "Douleur fosse iliaque droite (appendicite ?)",
    partId: "VentreDroit",
    keywords: ["appendicite", "fosse droite", "ventre"],
  },
  {
    id: "douleur_fosse_gauche",
    label: "Douleur fosse iliaque gauche",
    partId: "VentreGauche",
    keywords: ["sigmoide", "colon", "ventre"],
  },
  {
    id: "douleur_pubis",
    label: "Douleur au niveau du pubis",
    partId: "Pubis",
    keywords: ["pubalgie", "adducteur", "bas ventre"],
  },

  // ===================== FESSES / HANCHES =====================
  {
    id: "sciatique",
    label: "Douleur de type sciatique",
    partId: "Fesse",
    keywords: ["nerf", "jambe", "dos"],
  },
  {
    id: "douleur_fesse_assise",
    label: "Douleur en position assise prolongée",
    partId: "Fesse",
    keywords: ["ischion", "pression", "sciatique"],
  },
  {
    id: "douleur_hanche_droite",
    label: "Douleur de hanche droite",
    partId: "HancheDroit",
    keywords: ["hanche", "marche", "arthrose"],
  },
  {
    id: "douleur_hanche_gauche",
    label: "Douleur de hanche gauche",
    partId: "HancheGauche",
    keywords: ["hanche", "arthrose", "marche"],
  },
  {
    id: "raidissement_hanches",
    label: "Raideur matinale des hanches",
    partId: "HancheGauche",
    keywords: ["raideur", "arthrite", "inflammation"],
  },

  // ===================== MEMBRES SUPÉRIEURS DROIT =====================
  // Épaule / bras / coude / poignet / main (droit)
  {
    id: "douleur_epaule_droite",
    label: "Douleur à l'épaule droite",
    partId: "EpauleDroit",
    keywords: ["epaule", "tendinite", "rotateur"],
  },
  {
    id: "epaule_bloquee",
    label: "Épaule bloquée (capsulite)",
    partId: "EpauleDroit",
    keywords: ["capsulite", "gelée", "blocage"],
  },
  {
    id: "douleur_bras_droit",
    label: "Douleur diffuse dans le bras droit",
    partId: "BrasDroit",
    keywords: ["douleur", "irradiation", "coeur"],
  },
  {
    id: "paresthesies_bras_droit",
    label: "Fourmillements bras droit",
    partId: "BrasDroit",
    keywords: ["fourmis", "engourdissement", "nerf"],
  },
  {
    id: "epicondylite_droite",
    label: "Douleur coude (Tennis elbow)",
    partId: "CoudeDroit",
    keywords: ["epicondylite", "coude", "effort"],
  },
  {
    id: "douleur_poignet_droit",
    label: "Douleur au poignet droit",
    partId: "PoignéeDroit",
    keywords: ["entorse", "tendinite", "poignet"],
  },
  {
    id: "canal_carpien_droit",
    label: "Syndrome du canal carpien (main droite)",
    partId: "MainDroit",
    keywords: ["main", "fourmillement", "nuit"],
  },
  {
    id: "arthrose_doigts_droit",
    label: "Douleurs doigts main droite (arthrose)",
    partId: "MainDroit",
    keywords: ["doigts", "arthrose", "raideur"],
  },
  {
    id: "entorse_pouce_droit",
    label: "Entorse du pouce droit",
    partId: "PouceDroit",
    keywords: ["pouce", "entorse", "trauma"],
  },
  {
    id: "infection_doigt_droit",
    label: "Rougeur / infection d’un doigt droit",
    partId: "IndexDroit",
    keywords: ["panaris", "infection", "pus"],
  },

  // MEMBRES SUPÉRIEURS GAUCHE
  {
    id: "douleur_epaule_gauche",
    label: "Douleur à l'épaule gauche",
    partId: "EpauleGauche",
    keywords: ["epaule", "tendinite", "rotateur"],
  },
  {
    id: "douleur_bras_gauche",
    label: "Douleur diffuse dans le bras gauche",
    partId: "BrasGauche",
    keywords: ["douleur", "irradiation", "coeur"],
  },
  {
    id: "paresthesies_bras_gauche",
    label: "Fourmillements bras gauche",
    partId: "BrasGauche",
    keywords: ["fourmis", "engourdissement", "nerf"],
  },
  {
    id: "douleur_poignet_gauche",
    label: "Douleur au poignet gauche",
    partId: "PoignéeGauche",
    keywords: ["entorse", "tendinite", "poignet"],
  },
  {
    id: "canal_carpien_gauche",
    label: "Syndrome du canal carpien (main gauche)",
    partId: "MainGauche",
    keywords: ["main", "fourmillement", "nuit"],
  },
  {
    id: "arthrose_doigts_gauche",
    label: "Douleurs doigts main gauche (arthrose)",
    partId: "MainGauche",
    keywords: ["doigts", "arthrose", "raideur"],
  },
  {
    id: "entorse_pouce_gauche",
    label: "Entorse du pouce gauche",
    partId: "PouceGauche",
    keywords: ["pouce", "entorse", "trauma"],
  },
  {
    id: "douleur_coude_gauche",
    label: "Douleur au coude gauche",
    partId: "CoudeGauche",
    keywords: ["tennis elbow", "epicondylite"],
  },
  {
    id: "douleur_creux_coude_gauche",
    label: "Douleur dans le creux du coude gauche",
    partId: "CreuCoudeGauche",
    keywords: ["veine", "prise de sang", "trauma"],
  },
  {
    id: "douleur_avant_bras_gauche",
    label: "Douleur / tension avant-bras gauche",
    partId: "AvantBrasGauche",
    keywords: ["tendinite", "muscle", "effort"],
  },

  // ===================== MEMBRES INFÉRIEURS DROIT =====================
  {
    id: "douleur_cuisse_droite",
    label: "Douleur à la cuisse droite",
    partId: "CuisseDroit",
    keywords: ["muscle", "claquage", "crampe"],
  },
  {
    id: "douleur_genou_droit",
    label: "Douleur au genou droit",
    partId: "GenouxDroit",
    keywords: ["genou", "arthrose", "ligament"],
  },
  {
    id: "gonflement_genou_droit",
    label: "Genou droit gonflé",
    partId: "GenouxDroit",
    keywords: ["gonfle", "epanchement", "trauma"],
  },
  {
    id: "jambes_lourdes_droite",
    label: "Jambe droite lourde",
    partId: "JambeDroit",
    keywords: ["circulation", "veines", "varices"],
  },
  {
    id: "crampes_jambe_droite",
    label: "Crampes dans la jambe droite",
    partId: "JambeDroit",
    keywords: ["crampe", "nuit", "sport"],
  },
  {
    id: "entorse_cheville_droite",
    label: "Entorse cheville droite",
    partId: "ChevilleDroit",
    keywords: ["cheville", "entorse", "torsion"],
  },
  {
    id: "douleur_pied_droit",
    label: "Douleur sous le pied droit",
    partId: "PiedDroit",
    keywords: ["plantar", "fasciite", "marche"],
  },
  {
    id: "ampoules_pied_droit",
    label: "Ampoules / frottements pied droit",
    partId: "PiedDroit",
    keywords: ["ampoule", "chaussure", "frottement"],
  },
  {
    id: "douleur_talon_droit",
    label: "Douleur au talon droit",
    partId: "TalonDroit",
    keywords: ["epine", "talon", "douleur"],
  },
  {
    id: "douleur_orteil_droit",
    label: "Douleur à un orteil droit",
    partId: "OrteilDroit",
    keywords: ["ongle", "incarne", "trauma"],
  },

  // MEMBRES INFÉRIEURS GAUCHE
  {
    id: "douleur_cuisse_gauche",
    label: "Douleur à la cuisse gauche",
    partId: "CuisseGauche",
    keywords: ["muscle", "claquage", "crampe"],
  },
  {
    id: "douleur_genou_gauche",
    label: "Douleur au genou gauche",
    partId: "GenouxGauche",
    keywords: ["genou", "arthrose", "ligament"],
  },
  {
    id: "gonflement_genou_gauche",
    label: "Genou gauche gonflé",
    partId: "GenouxGauche",
    keywords: ["gonfle", "e panchement", "trauma"],
  },
  {
    id: "jambes_lourdes_gauche",
    label: "Jambe gauche lourde",
    partId: "JambeGauche",
    keywords: ["circulation", "veines", "varices"],
  },
  {
    id: "crampes_jambe_gauche",
    label: "Crampes dans la jambe gauche",
    partId: "JambeGauche",
    keywords: ["crampe", "nuit", "sport"],
  },
  {
    id: "entorse_cheville_gauche",
    label: "Entorse cheville gauche",
    partId: "ChevilleGauche",
    keywords: ["cheville", "entorse", "torsion"],
  },
  {
    id: "douleur_pied_gauche",
    label: "Douleur sous le pied gauche",
    partId: "PiedGauche",
    keywords: ["plantar", "fasciite", "marche"],
  },
  {
    id: "ampoules_pied_gauche",
    label: "Ampoules / frottements pied gauche",
    partId: "PiedGauche",
    keywords: ["ampoule", "chaussure", "frottement"],
  },
  {
    id: "douleur_talon_gauche",
    label: "Douleur au talon gauche",
    partId: "TalonGauche",
    keywords: ["epine", "talon", "douleur"],
  },
  {
    id: "douleur_orteil_gauche",
    label: "Douleur à un orteil gauche",
    partId: "OrteilGauche",
    keywords: ["ongle", "incarne", "trauma"],
  },

  // ===================== GÉNÉRAUX (NON LOCALISÉS / SYSTÉMIQUES) =====================
  {
    id: "fievre",
    label: "Fièvre élevée",
    partId: null,
    keywords: ["temperature", "chaud", "frissons"],
  },
  {
    id: "fatigue_intense",
    label: "Fatigue intense / Épuisement",
    partId: null,
    keywords: ["fatigue", "epuisé", "sommeil"],
  },
  {
    id: "perte_poids",
    label: "Perte de poids involontaire",
    partId: null,
    keywords: ["maigrir", "appetit", "poids"],
  },
  {
    id: "prise_poids",
    label: "Prise de poids rapide",
    partId: null,
    keywords: ["gonfler", "oedeme", "poids"],
  },
  {
    id: "frissons",
    label: "Frissons / sensation de froid",
    partId: null,
    keywords: ["fievre", "infection", "tremblement"],
  },
  {
    id: "sueurs_nocturnes",
    label: "Sueurs nocturnes",
    partId: null,
    keywords: ["transpiration", "nuit", "pyjama"],
  },
  {
    id: "evanouissement",
    label: "Évanouissement / Malaise",
    partId: null,
    keywords: ["syncope", "perte connaissance", "chute"],
  },
  {
    id: "etourdissements",
    label: "Étourdisssements / Vertiges",
    partId: null,
    keywords: ["tournis", "equilibre", "instable"],
  },
  {
    id: "anxiete",
    label: "Anxiété / Crise de panique",
    partId: null,
    keywords: ["angoisse", "peur", "coeur", "respiration"],
  },
  {
    id: "depression_signes",
    label: "Tristesse persistante / Idées noires",
    partId: null,
    keywords: ["moral", "deprime", "tristesse"],
  },
  {
    id: "perte_appetit",
    label: "Perte d'appétit",
    partId: null,
    keywords: ["manger", "faim", "nausee"],
  },
  {
    id: "douleurs_diffuses",
    label: "Douleurs musculaires diffuses",
    partId: null,
    keywords: ["courbature", "muscle", "body ache"],
  },
  {
    id: "allergie_generale",
    label: "Réaction allergique (démangeaisons, rougeurs)",
    partId: null,
    keywords: ["allergie", "urticaire", "plaques"],
  },
  {
    id: "palpitations_generales",
    label: "Palpitations (sans localisation précise)",
    partId: null,
    keywords: ["coeur", "battement", "stress"],
  },
  {
    id: "essoufflement_generalisé",
    label: "Essoufflement à l’effort",
    partId: null,
    keywords: ["fatigue", "respirer", "poumons"],
  },
];

// Fonction de recherche intelligente
export function searchSymptoms(query) {
  if (!query || query.length < 2) return [];
  const lowerQ = query.toLowerCase();
  return SYMPTOMS_DB.filter(
    (s) =>
      s.label.toLowerCase().includes(lowerQ) ||
      s.keywords.some((k) => k.toLowerCase().includes(lowerQ))
  );
}

// Récupérer les symptômes liés à une partie 3D spécifique
export function getSymptomsForPart(partId) {
  if (!partId) return [];
  // Match exact sur partId
  return SYMPTOMS_DB.filter((s) => s.partId === partId);
}
