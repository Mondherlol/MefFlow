import { useEffect, useMemo, useState, useRef } from "react";
import {
  Building2,
  UsersRound,
  Search,
  Globe,
  Settings,
  PlayCircle,
  PauseCircle,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Play,
  PlayCircleIcon,
} from "lucide-react";
import Section from "./Section";
import Button from "./Button";
import Badge from "./Badge";
import DeleteConfirm from "./DeleteConfirm";
import SlugModal from "./SlugModal";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import toast from "react-hot-toast";

export default function ClinicsList({ tokens , fetchStats }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState(""); 
  const [status, setStatus] = useState("all");
  const [clinics, setClinics] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 5, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingRows, setLoadingRows] = useState({});
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [slugModal, setSlugModal] = useState({ open: false, clinic: null, value: "" });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, clinic: null });

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    // pour pas request a chaque tape
    const t = setTimeout(() => {
      const params = [`page=${page}`, `perPage=${perPage}`];
      if (search && search !== "") params.push(`name=${encodeURIComponent(search)}`);
      if (status && status !== "all") {
        params.push(status === "active" ? "active=true" : "active=false");
      }
      const qs = params.join("&");
      setIsLoading(true);
      api.get(`/api/clinics/?${qs}`, { signal: controller.signal })
        .then((response) => {
          if (!mounted) return;
          if (response.status === 200) {
            setClinics(response.data.data || []);
            if (response.data.meta) {
              setMeta(response.data.meta);
              setPage(response.data.meta.page || 1);
              setPerPage(response.data.meta.perPage || perPage);
            }
          }
        })
        .catch((err) => {
          toast.error("Erreur lors de la récupération des cliniques.");
        })
        .finally(() => {
          if (mounted) setIsLoading(false);
        });
    }, 400);

    return () => {
      mounted = false;
      controller.abort();
      clearTimeout(t);
    };
  }, [search, page, perPage, status]);

  const paramsRef = useRef({ search, page, perPage, status });
  useEffect(() => {
    paramsRef.current = { search, page, perPage, status };
  }, [search, page, perPage, status]);

  const reloadClinicsImmediate = async () => {
    const { search: s, page: p, perPage: pp, status: st } = paramsRef.current;
    setIsLoading(true);
    try {
      const params = [`page=${p}`, `perPage=${pp}`];
      if (s && s !== "") params.push(`name=${encodeURIComponent(s)}`);
      if (st && st !== "all") {
        params.push(st === "active" ? "active=true" : "active=false");
      }
      const qs = params.join("&");
      const response = await api.get(`/api/clinics/?${qs}`);
      if (response.status === 200) {
        setClinics(response.data.data || []);
        if (response.data.meta) {
          setMeta(response.data.meta);
          setPage(response.data.meta.page || 1);
          setPerPage(response.data.meta.perPage || pp);
        }

        fetchStats();
      }
    } catch (err) {
      toast.error("Erreur lors de la récupération des cliniques.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = () => {
      reloadClinicsImmediate();
    };
    window.addEventListener('clinics:refresh', handler);
    return () => window.removeEventListener('clinics:refresh', handler);
  }, []);

  // Close active menu on outside click
  useEffect(() => {
    const onDocClick = () => setActiveMenuId(null);
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const handleDeleteClinic = async () => {
    const clinic = deleteConfirm.clinic;
    if (!clinic) return;
    setIsLoading(true);
    try {
      const resp = await api.delete(`/api/clinics/${clinic.id}/`);
      if (resp.status === 200 || resp.status === 204) {
        toast.success('Clinique supprimée');
        setDeleteConfirm({ open: false, clinic: null });
        await reloadClinicsImmediate();
      }
    } catch (err) {
      toast.error('Erreur lors de la suppression de la clinique');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeStatus = async (clinicId, newStatus) => {
    setLoadingRows((prev) => ({ ...prev, [clinicId]: true }));
    try {
      const resp = await api.post(`/api/clinics/${clinicId}/set_status/`, { status: newStatus });

      setClinics((prev) =>
        prev.map((c) => {
          if (c.id !== clinicId) return c;
          const updated = resp && resp.data ? resp.data : null;
          if (updated && typeof updated === 'object') {
            const candidate = updated.data && updated.data.id ? updated.data : updated;
            return { ...c, ...candidate };
          }
          return { ...c, status: newStatus };
        })
      );

      if (resp && resp.status === 200) {
        let etat = newStatus === "ACTIVE" ? "réactivée" : "mise en pause";
        toast.success(`Clinique ${etat} avec succès`);
        fetchStats();
      } else {
        // generic success message if non-200 but no error thrown
        let etat = newStatus === "ACTIVE" ? "réactivée" : "mise en pause";
        toast.success(`Clinique ${etat}`);
      }
    } catch (err) {
      toast.error('Erreur lors de la mise à jour du statut de la clinique');
    } finally {
      // clear the row loading flag
      setLoadingRows((prev) => {
        const copy = { ...prev };
        delete copy[clinicId];
        return copy;
      });
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(perPage)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="grid grid-cols-12 gap-4 px-4 py-3">
            <div className="col-span-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gray-200" />
              <div className="w-40 h-4 bg-gray-200 rounded" />
            </div>

            <div className="col-span-2">
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>

            <div className="col-span-1">
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>

            <div className="col-span-5 flex items-center justify-end gap-2">
              <div className="h-8 w-20 bg-gray-200 rounded" />
              <div className="h-8 w-16 bg-gray-200 rounded" />
            </div>
          </div>
          {index < perPage - 1 && <div className="border-b border-slate-200" />}
        </div>
      ))}
    </div>
  );

  const displayed = useMemo(() => clinics, [clinics]);

  return (
    <>
    <Section
      title="Gestion des cliniques"
      right={
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); 
              }}
              placeholder="Rechercher (nom, domaine, id)…"
              className={`h-10 w-64 rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm ${tokens.focus}`}
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className={`h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm ${tokens.focus}`}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actives</option>
            <option value="paused">En pause</option>
          </select>
        </div>
      }
    >
      <div className={`${tokens.card} ${tokens.cardHover} overflow-hidden`}>
        <div className={`grid grid-cols-12 gap-4 border-b border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 ${tokens.stickyHead}`}>
          <div className="col-span-4">Clinique</div>
          <div className="col-span-2">Domaine</div>
          <div className="col-span-2">Utilisateurs</div>
          <div className="col-span-4 text-right">Actions</div>
        </div>
        <div className="min-h-[200px]">
          {isLoading ? (
            <LoadingSkeleton />
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-lg font-medium">Aucune clinique</p>
              <p className="text-sm">Aucune clinique trouvée pour ces critères</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <ul className="divide-y divide-slate-200">
                {displayed.map((c) => (
                <li
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/__superadmin/clinic-infos/${c.id}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/__superadmin/clinic-infos/${c.id}`); }}
                  className={`relative grid grid-cols-12 gap-4 px-4 py-3 text-sm ${tokens.rowHover} cursor-pointer`}
                >
              <div className="col-span-4 flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-sky-100 text-sky-800 ring-1 ring-sky-200">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium leading-tight">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.email}</div>
                </div>
                {c.status === "ACTIVE" ? (
                  <Badge color="green">Active</Badge>
                ) : (
                  <Badge color="gray">En pause</Badge>
                )}
              </div>

              <div className="col-span-2 flex items-center gap-2">
                <div className="flex items-center gap-2" 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(`${c.slug}.medflow.localhost:5173`);
                    toast.success("Domaine copié dans le presse-papiers");
                  }}
                  title="Cliquer pour copier le domaine"
                  >
                  <Globe className="h-4 w-4 text-slate-400" />
                  <span className="truncate text-slate-700">{c.slug}.medflow.tn</span>
                </div>
              </div>

              <div className="col-span-1 flex items-center gap-2"><strong className="text-orange-500">{c.users} </strong> utilisateur{c.users > 1 ? "s" : ""}</div>

              <div className="col-span-5 flex items-center justify-end gap-2">
                <Button 
                  onClick={(e) => { e.stopPropagation(); navigate(`/__superadmin/manage-admins/${c.id}`); }}
                  variant="subtle" className="px-3 py-1.5">
                  <UsersRound className="h-4 w-4" /> Admins
                </Button>
                <Button variant="subtle" className="px-3 py-1.5">
                  <Settings className="h-4 w-4" /> Gérer
                </Button>
                {loadingRows[c.id] ? (
                  <button
                    onClick={(e) => e.stopPropagation()}
                    disabled
                    className="px-3 py-1.5 bg-white border border-gray-300 text-slate-700 rounded-lg flex items-center gap-2"
                  >
                    <svg
                      className="animate-spin h-4 w-4 text-blue-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                  </button>
                ) : c.status === "ACTIVE" ? (
                  <Button variant="outline" className="px-3 py-1.5" title="Mettre en pause" onClick={(e) => { e.stopPropagation(); handleChangeStatus(c.id, "PAUSED"); }}>
                    <PauseCircle className="h-4 w-4" /> Mettre en pause
                  </Button>
                ) : (
                  <Button variant="primary" className="px-3 py-1.5" title="Réactiver" onClick={(e) => { e.stopPropagation(); handleChangeStatus(c.id, "ACTIVE"); }}>
                    <PlayCircleIcon className="h-4 w-4" /> Réactiver
                  </Button>
                )}
                {/* More / context menu */}
                <div className="relative">
                  <Button
                    variant="outline"
                    className="px-3 py-1.5"
                    title="Plus"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId((prev) => (prev === c.id ? null : c.id));
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>

                  {activeMenuId === c.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className={`absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg z-50 ${tokens.card} ${tokens.cardHover} border border-slate-200`}
                    >
                      <ul className="py-1">
                        <li>
                          <button
                            className="w-full cursor-pointer text-left px-4 py-2 text-sm hover:bg-slate-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              setSlugModal({ open: true, clinic: c, value: c.slug || "" });
                            }}
                          >
                            Modifier le slug
                          </button>
                        </li>
                        <li>
                          <button
                            className="w-full cursor-pointer text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              setDeleteConfirm({ open: true, clinic: c });
                            }}
                          >
                            Supprimer
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
            </ul>
            </div>
          )}
        </div>
      </div>

      {/* Pagination (styled like ClinicRequestsList) */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span>Éléments par page :</span>
            <select
              className={`px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all duration-200 ${tokens.focus}`}
              value={perPage}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10) || 5;
                setPerPage(value);
                setPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span className="text-slate-500">
              {meta.total} élément{meta.total !== 1 ? 's' : ''} au total
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="px-4 py-2 bg-white border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1 font-medium"
            >
            <ChevronDown className="h-4 w-4 rotate-90" />
              Précédent
            </button>

            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg">
              <span className="text-sm font-medium text-slate-700">
                Page <span className="text-orange-600">{page}</span> sur {meta.totalPages || 1}
              </span>
            </div>

            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages || 1, p + 1))}
              disabled={page >= (meta.totalPages || 1) || isLoading}
              className="px-4 py-2 bg-white border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1 font-medium"
            >
            <ChevronUp className="h-4 w-4 rotate-90" />
                
              Suivant
            </button>
          </div>
        </div>
      </div>
    </Section>

    <DeleteConfirm
      open={deleteConfirm.open}
      clinic={deleteConfirm.clinic}
      tokens={tokens}
      onClose={() => setDeleteConfirm({ open: false, clinic: null })}
      onConfirm={handleDeleteClinic}
    />

    <SlugModal
      open={slugModal.open}
      clinic={slugModal.clinic}
      tokens={tokens}
      closeModal={() => setSlugModal({ open: false, clinic: null, value: '' })}
      reloadClinics={reloadClinicsImmediate}
    />

    </>
  );
}
