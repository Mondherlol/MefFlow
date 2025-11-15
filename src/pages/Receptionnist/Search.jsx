import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useClinic } from "../../context/clinicContext";

function PatientCard({ p }) {
  const photo = p.user?.photo_url;
  const base = import.meta.env.VITE_API_URL || "";
  const photoUrl = photo ? `${base}${photo.replace('\\', '/')}` : null;

  const initials = (p.user?.full_name || p.user?.email || "")
    .split(" ")
    .map((s) => s?.[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex gap-4 items-center rounded-lg border p-4 bg-white shadow-sm">
      <div className="shrink-0">
        {photoUrl ? (
          <img src={photoUrl} alt={p.user.full_name} className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <div className="h-12 w-12 rounded-full bg-sky-100 text-sky-800 grid place-items-center font-semibold">{initials || "P"}</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <div className="truncate font-medium text-slate-900">{p.user?.full_name || p.user?.email}</div>
          <div className="ml-auto text-xs text-slate-500">{p.clinic?.name}</div>
        </div>
        <div className="mt-1 flex items-center gap-3 text-sm text-slate-600">
          <div>{p.user?.phone || "—"}</div>
          <div>•</div>
          <div>{p.date_naissance || "—"}</div>
        </div>
      </div>
      <div>
        <Link to={`/reception/patients/${p.id}`} className="text-sm text-sky-700 hover:underline">Ouvrir</Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex gap-4 items-center rounded-lg border p-4 bg-white">
      <div className="h-12 w-12 rounded-full bg-slate-200 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 bg-slate-200 animate-pulse rounded" />
        <div className="h-3 w-1/2 bg-slate-200 animate-pulse rounded" />
      </div>
    </div>
  );
}

export default function ReceptionSearch() {
  const [params] = useSearchParams();
  const {clinic} = useClinic();
  const navigate = useNavigate();
  const q = params.get("q") || params.get("search") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!q) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get(`/api/clinics/${clinic?.id}/patients/`, { params: { name: q } })
      .then((res) => {
        if (cancelled) return;
        setResults(res.data.data || []);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError(err?.message || "Erreur réseau");
        toast.error("Erreur lors de la recherche");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => (cancelled = true);
  }, [q]);

  function onNewSearch(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const val = (form.get("q") || "").toString().trim();
    if (!val) return navigate("/reception");
    navigate(`/reception/search?q=${encodeURIComponent(val)}`);
  }

  return (
    <div className="min-h-[60dvh] bg-slate-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Recherche patients</h1>
            <p className="text-sm text-slate-500">Résultats pour « {q} »</p>
          </div>
          <form onSubmit={onNewSearch} className="flex items-center gap-2">
            <input name="q" defaultValue={q} placeholder="Nom, téléphone, email..." className="rounded-lg border px-3 py-2 bg-white" />
            <button type="submit" className="px-3 py-2 rounded-md bg-sky-700 text-white">Rechercher</button>
          </form>
        </header>

        <section className="grid gap-3">
          {loading && (
            <div className="grid gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border p-4 bg-white text-red-600">Erreur: {error}</div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="rounded-lg border p-6 bg-white text-slate-600 text-center">Aucun patient trouvé pour « {q} ».</div>
          )}

          {!loading && results.length > 0 && (
            <div className="grid gap-3">
              {results.map((p) => (
                <PatientCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
