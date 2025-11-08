export function getSubdomain(hostname = window.location.hostname) {
  // ex: "clinique1.medflow.localhost:5173" -> "clinique1"
  const parts = hostname.split(".");
  if (parts.length < 3) return null; // ex: localhost / medflow.localhost
  return parts[0]; // "clinique1"
}

export const tenant = getSubdomain();
