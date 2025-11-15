import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search as SearchIcon,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  MoreHorizontal,
  Phone,
} from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useClinic } from "../../context/clinicContext";

/* ---------- Patient Card (updated) ---------- */
function PatientCard({ p }) {
  const photo = p.user?.photo_url;
  const base = import.meta.env.VITE_API_URL || "";
  const photoUrl = photo ? `${base}${photo.replace("\\", "/")}` : null;

  const initials = (p.user?.full_name || p.user?.email || "")
    .split(" ")
    .map((s) => s?.[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Badge logic (adapter en fonction de ton API)
  // Priorité : RDV aujourd'hui > Demande RDV > Prochain RDV (date)
  const nextAppt = p.next_appointment_date || p.nextAppointment || null; // adapter keys
  const hasPending = p.has_pending_request || p.pending_request || p.requested_appointment; // adapter keys

  const isToday = (() => {
    if (!nextAppt) return false;
    const d = new Date(nextAppt);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  })();

  const formattedNext = nextAppt ? new Date(nextAppt).toLocaleString() : null;

  return (
    <div className="group flex items-center gap-4 p-3 rounded-2xl bg-white shadow-sm hover:shadow-md transition">
      <div className="shrink-0">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={p.user?.full_name || "Patient"}
            className="h-14 w-14 rounded-full object-cover ring-1 ring-slate-100"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 text-sky-800 grid place-items-center font-semibold text-lg">
            {initials || "P"}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <div className="truncate font-semibold text-slate-900">
            {p.user?.full_name || p.user?.email}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Badges */}
            {isToday && (
              <div className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-100">
                RDV aujourd'hui
              </div>
            )}

            {!isToday && hasPending && (
              <div className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-100">
                Demande RDV
              </div>
            )}

            {!isToday && !hasPending && formattedNext && (
              <div className="text-xs px-2 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-100">
                Prochain: {new Date(nextAppt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3 text-sm text-slate-600">
          <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-md text-slate-700">
            <Phone size={14} className="opacity-80" />
            <span className="truncate">{p.user?.phone || "—"}</span>
          </div>

          <div className="text-slate-300">•</div>

          <div className="text-sm text-slate-600 truncate">{p.user?.email || "—"}</div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <Link
            to={`/reception/patients/${p.id}`}
            className="text-sm px-3 py-1 rounded-2xl bg-sky-600 text-white font-medium hover:brightness-95 transition"
            title="Ouvrir la fiche patient (dossier, historique, notes)"
          >
            Ouvrir
          </Link>

          <Link
            to={`/reception/consultations/new?patientId=${p.id}`}
            className="text-sm px-3 py-1 rounded-2xl bg-white border text-slate-700 hover:bg-slate-50 transition flex items-center gap-2"
            title="Créer un nouveau rendez-vous pour ce patient"
            aria-label={`Nouveau RDV pour ${p.user?.full_name || ""}`}
          >
            <UserPlus size={16} /> Nouveau RDV
          </Link>

          <button
            type="button"
            className="p-2 rounded-md bg-white border hover:bg-slate-50 transition"
            title="Plus d'actions"
            aria-label="Plus d'actions"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Skeleton (light) ---------- */
function SkeletonCard() {
  return (
    <div className="flex gap-4 items-center rounded-2xl p-3 bg-white">
      <div className="h-12 w-12 rounded-full bg-slate-200 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/5 bg-slate-200 animate-pulse rounded" />
        <div className="h-3 w-1/2 bg-slate-200 animate-pulse rounded" />
      </div>
      <div className="h-8 w-20 bg-slate-200 animate-pulse rounded" />
    </div>
  );
}

/* ---------- Main SearchBar (updated) ---------- */
export default function SearchBar({ placeholder = "Rechercher patient par nom, téléphone ou dossier..." }) {
  const { clinic } = useClinic();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timer = useRef(null);
  const wrapperRef = useRef(null);
  const [page, setPage] = useState(1);
  const perPage = 3; // fixe : max 3 résultats visibles
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);

  // outside click close
  useEffect(() => {
    function onDown(e) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  // fetch (debounced) — on query or page
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      // require at least 2 chars for search (UX)
      setResults([]);
      setTotal(0);
      setTotalPages(1);
      setError(null);
      setLoading(false);
      return;
    }

    // start loading immediately so loader appears on first search
    setLoading(true);
    setError(null);
    setOpen(true);

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      api
        .get(`/api/clinics/${clinic?.id}/patients/`, { params: { name: query, page, perPage } })
        .then((res) => {
          setResults(res.data.data || []);
          const meta = res.data.meta || {};
          setTotalPages(meta.totalPages || 1);
          setTotal(meta.total ?? (res.data.data?.length || 0));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page, clinic?.id]);

  // reset page when query changes
  useEffect(() => {
    setPage(1);
  }, [query]);

  const visibleResults = results.slice(0, perPage);

  return (
    <div className="mt-4 relative" ref={wrapperRef}>
      {/* Search input with clearer boundary */}
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              aria-label="Recherche patient"
              className="w-full rounded-2xl border px-4 py-3 pr-12 focus:outline-none transition"
              style={{
                borderColor: "#dbe7f1",
                boxShadow: "0 4px 14px rgba(16,24,40,0.04)",
                background: "linear-gradient(180deg,#ffffff,#fbfdff)",
              }}
              onFocus={() => {
                if (query && query.trim().length >= 2) setOpen(true);
              }}
            />

            {/* small spinner inside input when loading */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center gap-2">
              {loading ? (
                <svg className="h-4 w-4 animate-spin text-slate-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              ) : (
                <SearchIcon size={18} />
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              // toggle dropdown manually (useful when user wants to hide/show)
              if (!query || query.trim().length < 2) {
                setQuery("");
                setOpen(false);
                return;
              }
              setOpen((s) => !s);
            }}
            className="px-4 py-2 rounded-2xl text-white font-medium shadow bg-sky-600 hover:brightness-95 transition"
            aria-label="Basculer résultats recherche"
            title="Basculer résultats recherche"
          >
            Rechercher
          </button>
        </div>

        {/* helper text under search */}
        <div className="text-xs text-slate-500">
          Tapez au moins 2 caractères pour lancer la recherche — appuie sur Entrée pour ouvrir la fiche si sélectionnée.
        </div>
      </form>

      {/* Dropdown */}
      {open && (loading || error || visibleResults.length > 0 || (query && query.trim().length >= 2)) && (
        <div className="absolute left-0 right-0 mt-3 z-50">
          <div className="bg-white rounded-2xl shadow-lg max-h-[44vh] overflow-hidden">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-3">
              <div className="text-sm text-slate-600">
                {loading ? "Recherche en cours…" : `${total} résultat${total > 1 ? "s" : ""}`}
              </div>

              {/* pagination control */}
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className={`flex items-center gap-2 px-3 py-1 rounded-md transition ${
                    page <= 1 || loading
                      ? "bg-slate-50 text-slate-400 cursor-not-allowed"
                      : "bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                  aria-disabled={page <= 1}
                >
                  <ChevronLeft size={16} />
                  Préc
                </button>

                <div className="text-sm text-slate-600 px-2">
                  <span className="font-medium">{page}</span> / {totalPages}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                  className={`flex items-center gap-2 px-3 py-1 rounded-md transition ${
                    page >= totalPages || loading
                      ? "bg-slate-50 text-slate-400 cursor-not-allowed"
                      : "bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                  aria-disabled={page >= totalPages}
                >
                  Suiv
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="p-3 space-y-2">
              {loading && (
                <div className="grid gap-2">
                  {Array.from({ length: perPage }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              )}

              {!loading && error && (
                <div className="rounded-lg p-4 bg-red-50 text-red-700">Erreur: {error}</div>
              )}

              {!loading && !error && visibleResults.length === 0 && (
                <div className="rounded-lg p-6 text-slate-600 text-center">
                  Aucun patient trouvé pour « {query} ».
                </div>
              )}

              {!loading && visibleResults.length > 0 && (
                <div className="grid gap-2">
                  {visibleResults.map((p) => (
                    <PatientCard key={p.id} p={p} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer: compact pagination information */}
            <div className="p-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                {total > 0 ? `Résultats ${Math.min((page - 1) * perPage + 1, total)}–${Math.min(page * perPage, total)} sur ${total}` : "Aucun résultat"}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className={`text-xs px-3 py-1 rounded-md transition ${
                    page <= 1 || loading ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "bg-white border text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Précédent
                </button>

                <div className="text-xs text-slate-600 px-2">{page} / {totalPages}</div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                  className={`text-xs px-3 py-1 rounded-md transition ${
                    page >= totalPages || loading ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "bg-white border text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
