import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon, CalendarDays, ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
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
    <div className="group flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition">
      <div className="shrink-0">
        {photoUrl ? (
          <img src={photoUrl} alt={p.user.full_name} className="h-14 w-14 rounded-full object-cover ring-1 ring-slate-100" />
        ) : (
          <div className="h-14 w-14 rounded-full bg-linear-to-br from-sky-100 to-sky-200 text-sky-800 grid place-items-center font-semibold text-lg">{initials || "P"}</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <div className="truncate font-semibold text-slate-900">{p.user?.full_name || p.user?.email}</div>
          <div className="ml-2 truncate text-xs text-slate-500">{p.user?.email || ''}</div>
          <div className="ml-auto text-xs text-slate-500">{p.clinic?.name}</div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-md text-slate-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="opacity-80"><path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M7 10a5 5 0 0 1 10 0" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
            <span className="truncate">{p.user?.phone || '—'}</span>
          </div>

          <div className="text-slate-300">•</div>

          <div className="text-sm text-slate-600">{p.date_naissance || '—'}</div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <Link to={`/reception/patients/${p.id}`} className="text-sm text-sky-700 font-medium hover:underline">Ouvrir</Link>
        <Link to={`/reception/patients/${p.id}/appointments`} className="text-xs px-2 py-1 bg-slate-100 rounded-md text-slate-600">Nouvel RDV</Link>
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

export default function SearchBar({ placeholder = "Rechercher patient par nom, téléphone ou dossier..." }) {
  const { clinic } = useClinic();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timer = useRef(null);
  const wrapperRef = useRef(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    if (timer.current) clearTimeout(timer.current);
    // debounce
    timer.current = setTimeout(() => {
      api
        .get(`/api/clinics/${clinic?.id}/patients/`, { params: { name: query, page, perPage } })
        .then((res) => {
          setResults(res.data.data || []);
          const meta = res.data.meta || {};
          setTotalPages(meta.totalPages || 1);
          setTotal(meta.total || 0);
        })
        .catch((err) => {
          console.error(err);
          setError(err?.message || "Erreur réseau");
          toast.error("Erreur lors de la recherche");
        })
        .finally(() => setLoading(false));
    }, 400);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query, clinic?.id]);

  // when query changes, reset page to 1
  useEffect(() => {
    setPage(1);
  }, [query]);

  // fetch when page or perPage changes (and there is a query)
  useEffect(() => {
    if (!query) return;
    if (timer.current) clearTimeout(timer.current);
    setLoading(true);
    api
      .get(`/api/clinics/${clinic?.id}/patients/`, { params: { name: query, page, perPage } })
      .then((res) => {
        setResults(res.data.data || []);
        const meta = res.data.meta || {};
        setTotalPages(meta.totalPages || 1);
        setTotal(meta.total || 0);
      })
      .catch((err) => {
        console.error(err);
        setError(err?.message || "Erreur réseau");
        toast.error("Erreur lors de la recherche");
      })
      .finally(() => setLoading(false));
  }, [page, perPage]);

  // close dropdown when clicking outside
  useEffect(() => {
    function onDown(e) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) {
        setQuery("");
      }
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div className="mt-4 relative" ref={wrapperRef}>
      <form onSubmit={(e) => e.preventDefault()} className="mt-4 flex gap-3">
        <div className="flex-1 relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            aria-label="Recherche patient"
            className="w-full rounded-lg border px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
            style={{ borderColor: "#e6edf3" }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon size={18} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => { /* noop - search is live */ }}
          className="px-4 py-2 rounded-md text-white font-medium shadow hover:brightness-95 transition cursor-pointer bg-sky-600"
        >
          Rechercher
        </button>
      </form>

      {/* Dropdown results: floating panel */}
      {(query || loading || error) && (
        <div className="absolute left-0 right-0 mt-2 z-50">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xl max-h-[48vh] overflow-auto p-3">
            {loading && (
              <div className="grid gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="rounded-lg p-4 bg-red-50 text-red-700">Erreur: {error}</div>
            )}

            {!loading && !error && query && results.length === 0 && (
              <div className="rounded-lg p-6 bg-white text-slate-600 text-center">Aucun patient trouvé pour « {query} ».</div>
            )}

            {!loading && results.length > 0 && (
              <div className="grid gap-2">
                {results.map((p) => (
                  <PatientCard key={p.id} p={p} />
                ))}
              </div>
            )}

            {/* Pagination footer */}
            {!loading && totalPages > 1 && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-sm text-slate-500">{total} résultats</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-2 px-3 py-1 rounded-md bg-white border text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                    Préc
                  </button>
                  <div className="text-sm text-slate-600 px-2">{page} / {totalPages}</div>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="flex items-center gap-2 px-3 py-1 rounded-md bg-white border text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Suiv
                    <ChevronRight size={16} />
                  </button>
                  <select
                    value={perPage}
                    onChange={(e) => setPerPage(Number(e.target.value))}
                    className="ml-2 text-sm rounded-md border px-2 py-1 bg-white"
                  >
                    <option value={5}>5 / page</option>
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
