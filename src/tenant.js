export function getSubdomain(hostname = window.location.hostname) {
  // 1. Vérifier si c'est une route superadmin (pas de tenant nécessaire)
  if (window.location.pathname.startsWith('/__superadmin')) {
    return null;
  }
  
  // 2. Priorité au query param ?tenant= (pour production Vercel)
  const urlParams = new URLSearchParams(window.location.search);
  const tenantParam = urlParams.get('tenant');
  if (tenantParam) {
    // Sauvegarder dans localStorage pour les futures navigations
    localStorage.setItem('tenant', tenantParam);
    return tenantParam;
  }
  
  // 3. Vérifier localStorage (persistance entre pages)
  const storedTenant = localStorage.getItem('tenant');
  if (storedTenant) return storedTenant;
  
  // 4. Mode production: variable d'environnement
  const isProduction = import.meta.env.MODE === 'production';
  if (isProduction) {
    const envTenant = import.meta.env.VITE_TENANT;
    if (envTenant) return envTenant;
    
    // Fallback: vérifier si c'est un sous-domaine Vercel
    // ex: "clinique1-med-flow.vercel.app" -> "clinique1"
    const parts = hostname.split(".");
    if (parts.length >= 3 && !parts[0].includes('med-flow')) {
      return parts[0];
    }
    
    return null;
  }
  
  // 5. Mode développement: extraction depuis sous-domaine
  // ex: "clinique1.medflow.localhost:5173" -> "clinique1"
  const parts = hostname.split(".");
  if (parts.length < 3) return null; // ex: localhost / medflow.localhost
  return parts[0]; // "clinique1"
}

export const tenant = getSubdomain();
