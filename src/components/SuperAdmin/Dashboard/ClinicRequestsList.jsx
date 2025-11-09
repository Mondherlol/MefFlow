import { CheckCircle, Mail, ChevronDown, ChevronUp, XCircle, Check, X } from "lucide-react";
import Section from "./Section";
import Badge from "./Badge";
import api from "../../../api/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import Loader from "../../Loader";

const ClinicRequestsList = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [requestsPerPage, setRequestsPerPage] = useState(5);
  const [meta, setMeta] = useState({ page: 1, perPage: 5, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  // actionLoading: { id: number|null, type: 'accept'|'decline'|null }
  const [actionLoading, setActionLoading] = useState({ id: null, type: null });
    const navigate = useNavigate();

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/clinic-requests/?page=${currentPage}&perPage=${requestsPerPage}`);
      if (response.status === 200) {
        const data = response.data || {};
        const items = Array.isArray(data.items) ? data.items : [];
        const m = data.meta || { page: currentPage, perPage: requestsPerPage, total: 0, totalPages: 1 };
        setPendingRequests(items);
        setMeta(m);
        setCurrentPage(m.page);
        setRequestsPerPage(m.perPage);
      } else {
        toast.error("Erreur lors de la récupération des demandes de clinique.");
      }
    } catch (err) {
      toast.error("Erreur lors de la récupération des demandes de clinique.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, requestsPerPage]);

  const handleAccept = async (requestId) => {
    if (!requestId) return;
    // navigate(`/__superadmin/clinic-request/${requestId}`);
    setActionLoading({ id: requestId, type: 'accept' });
    try {
      const response = await api.post(`/api/clinic-requests/${requestId}/approve/`);
      if (response.status === 200) {
        toast.success("Demande acceptée avec succès.");
        // Rafraîchir la liste
        await fetchRequests();
        // Notify clinics list to refresh (a clinic may have been created)
        try { window.dispatchEvent(new CustomEvent('clinics:refresh')); } catch (e) { /* noop */ }
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || "Erreur de connexion");
      } else {
        toast.error("Erreur de connexion, veuillez réessayer.");
      }
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  const handleDecline = async (requestId) => {
    if (!requestId) return;
    setActionLoading({ id: requestId, type: 'decline' });
    try {
      const response = await api.post(`/api/clinic-requests/${requestId}/reject/`);
      if (response.status === 200) {
        toast.success("Demande refusée avec succès.");
        // Rafraîchir la liste
        await fetchRequests();
        try { window.dispatchEvent(new CustomEvent('clinics:refresh')); } catch (e) { /* noop */ }
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || "Erreur de connexion");
      } else {
        toast.error("Erreur de connexion, veuillez réessayer.");
      }
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  const handlePagination = (pageNumber) => {
    const p = Math.max(1, Math.min(pageNumber, meta.totalPages || 1));
    setCurrentPage(p);
  };

  // Squelette de chargement
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(requestsPerPage)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="grid grid-cols-12 gap-4 px-6 py-4">
            <div className="col-span-2">
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            </div>
            <div className="col-span-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="col-span-3">
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="col-span-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="col-span-2">
              <div className="flex gap-2 justify-end">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
          {index < requestsPerPage - 1 && <div className="border-b border-gray-100"></div>}
        </div>
      ))}
    </div>
  );

  return (
    <Section title="Demandes de création de clinique">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* En-tête du tableau */}
        <div className="grid grid-cols-12 gap-4 border-b border-gray-100 px-6 py-4 text-sm font-semibold text-gray-600 bg-gray-50/50">
          <div className="col-span-2">Slug</div>
          <div className="col-span-3">Clinique</div>
          <div className="col-span-3">Admin</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Contenu */}
        <div className="min-h-[300px]">
          {isLoading ? (
            <LoadingSkeleton />
          ) : pendingRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium">Aucune demande</p>
              <p className="text-sm">Toutes les demandes ont été traitées</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <ul className="divide-y divide-gray-100">
                {pendingRequests.map((request) => (
                <li
                  key={request.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/__superadmin/clinic-request/${request.id}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/__superadmin/clinic-request/${request.id}`); }}
                  className="grid grid-cols-12 gap-4 px-6 py-4 text-sm transition-all duration-200 hover:bg-orange-50/30 cursor-pointer"
                >
                  <div className="col-span-2">
                    <Badge color="orange" className="bg-orange-100 text-orange-700 border-orange-200">
                      {request.clinic_slug}
                    </Badge>
                  </div>
                  <div className="col-span-3 font-medium text-gray-900">
                    {request.clinic_name}
                  </div>
                  <div className="col-span-3 flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4 text-sky-500" />
                    <span className="truncate">{request.admin_email}</span>
                  </div>
                  <div className="col-span-2 text-gray-500">
                    {format(new Date(request.created_at), "dd/MM/yyyy")}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAccept(request.id); }}
                      disabled={!!actionLoading.id}
                      className="bg-sky-500 cursor-pointer hover:bg-sky-600 disabled:opacity-60 text-white px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
                    >
                      {actionLoading.id === request.id && actionLoading.type === 'accept' ? (
                        <span className="inline-flex items-center gap-2">
                          <svg className="w-4 h-4 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                          </svg>
                          <span className="text-sm">Traitement...</span>
                        </span>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Valider
                        </>
                      )}
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleDecline(request.id); }}
                      disabled={!!actionLoading.id}
                      className="inline-flex cursor-pointer items-center gap-2 px-3 py-2 rounded-lg border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-60 transition-colors duration-200 text-sm font-medium"
                    >
                      {actionLoading.id === request.id && actionLoading.type === 'decline' ? (
                        <span className="inline-flex items-center gap-2">
                          <svg className="w-4 h-4 text-red-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                          </svg>
                          <span className="text-sm">Refus...</span>
                        </span>
                      ) : (
                        <>
                          <X className="h-4 w-4" />
                          Refuser
                        </>
                      )}
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/__superadmin/clinic-request/${request.id}`); }}
                      className="bg-orange-500 cursor-pointer hover:bg-orange-600 text-white px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                      Détails
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>Éléments par page :</span>
              <select
                className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all duration-200"
                value={requestsPerPage}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10) || 5;
                  setRequestsPerPage(value);
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <span className="text-gray-500">
                {meta.total} élément{meta.total !== 1 ? 's' : ''} au total
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePagination(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1 font-medium"
              >
                <ChevronDown className="h-4 w-4 rotate-90" />
                Précédent
              </button>
              
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  Page <span className="text-orange-600">{currentPage}</span> sur {meta.totalPages || 1}
                </span>
              </div>
              
              <button
                onClick={() => handlePagination(currentPage + 1)}
                disabled={currentPage >= (meta.totalPages || 1) || isLoading}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1 font-medium"
              >
                Suivant
                <ChevronUp className="h-4 w-4 rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {actionLoading.id && <Loader message={"Traitement en cours..."} />}

    </Section>
  );
};

export default ClinicRequestsList;