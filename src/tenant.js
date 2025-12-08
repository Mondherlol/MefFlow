export function getSubdomain(hostname = window.location.hostname) {
  // Mode production: récupérer depuis une variable d'environnement ou query param
  const isProduction = import.meta.env.MODE === 'production';
  
  if (isProduction) {
    // En production, on peut utiliser une variable d'environnement
    const envTenant = import.meta.env.VITE_TENANT;
    if (envTenant) return envTenant;
    
    // Ou récupérer depuis un query param pour supporter multi-tenant en prod
    const urlParams = new URLSearchParams(window.location.search);
    const tenantParam = urlParams.get('tenant');
    if (tenantParam) return tenantParam;
    
    // Ou stocker dans localStorage après connexion
    const storedTenant = localStorage.getItem('tenant');
    if (storedTenant) return storedTenant;
    
    // Fallback: vérifier si c'est un sous-domaine Vercel
    // ex: "clinique1-med-flow.vercel.app" -> "clinique1"
    const parts = hostname.split(".");
    if (parts.length >= 3 && !parts[0].includes('med-flow')) {
      return parts[0];
    }
    
    return null;
  }
  
  // Mode développement: extraction depuis sous-domaine
  // ex: "clinique1.medflow.localhost:5173" -> "clinique1"
  const parts = hostname.split(".");
  if (parts.length < 3) return null; // ex: localhost / medflow.localhost
  return parts[0]; // "clinique1"
}

export const tenant = getSubdomain();
