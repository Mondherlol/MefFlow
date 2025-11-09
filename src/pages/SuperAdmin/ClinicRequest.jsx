import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mail, Calendar, ArrowLeft, CheckCircle, XCircle, MapPin, FileText, ExternalLink } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import Loader from "../../components/Loader";

const ClinicRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // actionLoading: null | 'accept' | 'decline' (so we can show which action is in progress)
  const [actionLoading, setActionLoading] = useState(null);
  const [otherRequests, setOtherRequests] = useState([]);
  const [adminClinics, setAdminClinics] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalType, setModalType] = useState(null); // 'request' or 'clinic'

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api
      .get(`/api/clinic-requests/${id}/`)
      .then(async (res) => {
        if (res.status === 200) {
          const data = res.data || {};
          setRequest(data);
          await fetchOtherRequests(data);
        } else {
          toast.error("Impossible de charger la demande.");
        }
      })
      .catch(() => {
        toast.error("Impossible de charger la demande.");
      })
      .finally(() => setIsLoading(false));
  }, [id]);
  const fetchOtherRequests = async (req = null) => {
    const target = req || request;
    if (!target || !target.admin_email) return;
    try {
      const res = await api.get(`/api/clinics/by-email/?email=${target.admin_email}`);
      if (res.status === 200) {
        // Retirer la demande actuelle des autres demandes
        const filteredRequests = res.data.clinic_requests.filter((r) => r.id !== target.id);
        setOtherRequests(filteredRequests);
        setAdminClinics(res.data.clinics || []);
        console.log("Other Requests:", filteredRequests);
        console.log("Admin Clinics:", res.data.clinics);
      }
    } catch (error) {
        console.error("Erreur lors de la récupération des autres demandes :", error);
        toast.error("Impossible de charger les autres demandes de cet utilisateur.");
    }
  };
  

  const handleAccept = async () => {
    setActionLoading("accept");
    try {
        const response = await api.post(`/api/clinic-requests/${id}/approve/`);
        if (response.status === 200) {
            toast.success(" Demande acceptée avec succès.");
            console.log("Response data:", response.data);
            // Rediriger vers la page des infos de la clinique créée
            const clinicId = response.data.clinic_id;
            if (clinicId) {
                navigate(`/__superadmin/clinic-infos/${clinicId}`);
            } else {
                toast.error("ID de la clinique manquant dans la réponse.");
            }
        }
    } catch (error) {
       if (error.response) {
        // Erreur backend
        toast.error(error.response.data.message || "Erreur de connexion");
      } else {
        // Erreur réseau
        toast.error("Erreur de connexion, veuillez réessayer.");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async () => {
    setActionLoading("decline");
    try {
      const response = await api.post(`/api/clinic-requests/${id}/reject/`);
      if (response.status === 200) {
        toast.success("Demande refusée avec succès.");
        navigate(-1); // Retour à la page précédente
      }
    } catch (error) {
      if (error.response) {
        // Erreur backend
        toast.error(error.response.data.message || "Erreur de connexion");
      } else {
        // Erreur réseau
        toast.error("Erreur de connexion, veuillez réessayer.");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const openModal = (item, type) => {
    setModalData(item);
    setModalType(type);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalData(null);
    setModalType(null);
  };

  const navigateFromModal = () => {
    if (!modalData) return;
    if (modalType === 'request') {
      if (modalData.id) navigate(`/__superadmin/clinic-request/${modalData.id}`);
    } else if (modalType === 'clinic') {
      if (modalData.id) navigate(`/__superadmin/clinic-infos/${modalData.id}`);
    }
    closeModal();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-48 bg-gray-100 rounded" />
          </div>
        ) : !request ? (
          <div className="text-center py-12 text-gray-500">Demande introuvable.</div>
        ) : (
          <div className="grid gap-6">
            <header className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold">
                    {request.clinic_slug || "-"}
                  </span>
                  <h2 className="text-xl font-semibold text-gray-900">{request.clinic_name || "Nom de la clinique"}</h2>
                </div>
                <p className="text-sm text-gray-500 mt-1">Demande reçue le {request.created_at ? format(new Date(request.created_at), "dd/MM/yyyy HH:mm") : "-"}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDecline}
                  disabled={!!actionLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 font-medium"
                >
                  {actionLoading === 'decline' ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      <span className="text-sm">Refus en cours...</span>
                    </span>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" /> Refuser
                    </>
                  )}
                </button>
                <button
                  onClick={handleAccept}
                  disabled={!!actionLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 font-medium"
                >
                  {actionLoading === 'accept' ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      <span className="text-sm">Traitement...</span>
                    </span>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" /> Accepter
                    </>
                  )}
                </button>
              </div>
            </header>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-sky-500 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500">Admin Email</div>
                    <div className="font-medium text-gray-900">{request.admin_email || "-"}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-gray-400 mt-1">👤</div>
                  <div>
                    <div className="text-sm text-gray-500">Admin</div>
                    <div className="font-medium text-gray-900">{(request.admin_firstname || request.admin_name) ?? "-"}</div>
                    {request.admin_phone && <div className="text-sm text-gray-500">{request.admin_phone}</div>}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500">Demandée le</div>
                    <div className="font-medium text-gray-900">{request.created_at ? format(new Date(request.created_at), "PPpp") : "-"}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Adresse</div>
                  <div className="font-medium text-gray-900">{request.address || "-"}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Description</div>
                  <div className="text-gray-700">{request.description || "Aucune description fournie."}</div>
                </div>
              </div>
            </div>

            {request.metadata && (
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Informations supplémentaires</div>
                <pre className="text-xs text-gray-800 mt-2 overflow-auto">{JSON.stringify(request.metadata, null, 2)}</pre>
              </div>
            )}

            {/* Autres demandes et autres cliniques de l'admin */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-sky-500" />
                    <h3 className="text-sm font-semibold text-gray-900">Autres demandes</h3>
                  </div>
                  <div className="text-xs text-gray-500">{otherRequests.length} trouvée(s)</div>
                </div>

                {otherRequests.length === 0 ? (
                  <div className="text-sm text-gray-500">Aucune autre demande trouvée pour cet utilisateur.</div>
                ) : (
                  <div className="space-y-3">
                    {otherRequests.map((r) => (
                      <div
                        key={r.id || r.pk || JSON.stringify(r)}
                        onClick={() => openModal(r, 'request')}
                        className="p-3 rounded-lg bg-white border border-gray-100 hover:shadow-lg transition-shadow flex items-start gap-3 cursor-pointer"
                      >
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-sky-50 text-sky-700 font-semibold text-sm">
                          {(r.clinic_slug || r.slug || "-").slice(0,2).toUpperCase()
                          }
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                {r.clinic_name || r.name || r.clinic_slug || "Clinique"}
                                <span className="text-xs text-gray-500">{r.clinic_slug || r.slug ? `/${r.clinic_slug || r.slug}` : ''}</span>
                              </div>
                              <div className="text-xs text-gray-500">Reçue le {r.created_at ? format(new Date(r.created_at), "dd/MM/yyyy") : "-"}</div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              {r.status && (
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.status === 'accepted' ? 'bg-green-100 text-green-700' : r.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {r.status}
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModal(r, 'request');
                                }}
                                className="text-xs inline-flex items-center gap-1 text-sky-600 hover:underline"
                              >
                                <FileText className="w-3 h-3" /> Voir
                              </button>
                            </div>
                          </div>

                          {r.description && <div className="text-sm text-gray-600 mt-2 truncate">{r.description}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-rose-500" />
                    <h3 className="text-sm font-semibold text-gray-900">Autres cliniques</h3>
                  </div>
                  <div className="text-xs text-gray-500">{adminClinics.length} trouvée(s)</div>
                </div>

                {adminClinics.length === 0 ? (
                  <div className="text-sm text-gray-500">Aucune clinique associée trouvée pour cet utilisateur.</div>
                ) : (
                  <div className="grid gap-3">
                    {adminClinics.map((c) => (
                      <div
                        key={c.id || c.pk || JSON.stringify(c)}
                        onClick={() => openModal(c, 'clinic')}
                        className="p-3 rounded-lg bg-white border border-gray-100 hover:shadow-lg transition-shadow flex items-start gap-3 cursor-pointer"
                      >
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-rose-50 text-rose-600 font-semibold text-sm">{(c.slug || c.clinic_slug || "-").slice(0,2).toUpperCase()}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{c.name || c.clinic_name || c.clinic_slug || "Clinique"} <span className="text-xs text-gray-500">{c.slug || c.clinic_slug ? `/${c.slug || c.clinic_slug}` : ''}</span></div>
                              {c.address && <div className="text-xs text-gray-500">{c.address}</div>}
                            </div>
                            <div className="text-xs">
                              {typeof c.is_active !== 'undefined' ? (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                  {c.is_active ? 'Active' : 'Inactive'}
                                </span>
                              ) : null}
                              <button
                                onClick={(e) => { e.stopPropagation(); openModal(c, 'clinic'); }}
                                className="block mt-2 text-xs text-sky-600 hover:underline"
                              >
                                Voir
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

  {actionLoading && <Loader message={"Traitement en cours..."} />}

  {modalOpen && modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl mx-4 p-6 shadow-lg z-10">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{modalType === 'request' ? (modalData.clinic_name || modalData.clinic_slug) : (modalData.name || modalData.clinic_name)}</h3>
                <div className="text-xs text-gray-500">Slug: <span className="font-medium text-gray-700">{modalData.clinic_slug || modalData.slug || '-'}</span></div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={navigateFromModal} className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-600 text-white hover:bg-sky-700 text-sm"><ExternalLink className="w-4 h-4" />Naviguer</button>
                <button onClick={closeModal} className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"><XCircle className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {modalData.admin_email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-sky-500 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500">Admin Email</div>
                    <div className="font-medium text-gray-900">{modalData.admin_email}</div>
                  </div>
                </div>
              )}

              {(modalData.admin_firstname || modalData.admin_name) && (
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-gray-400 mt-1">👤</div>
                  <div>
                    <div className="text-sm text-gray-500">Admin</div>
                    <div className="font-medium text-gray-900">{(modalData.admin_firstname || modalData.admin_name) ?? "-"}</div>
                    {modalData.admin_phone && <div className="text-sm text-gray-500">{modalData.admin_phone}</div>}
                  </div>
                </div>
              )}

              {modalData.address && (
                <div>
                  <div className="text-sm text-gray-500">Adresse</div>
                  <div className="font-medium text-gray-900">{modalData.address}</div>
                </div>
              )}

              {modalData.description && (
                <div>
                  <div className="text-sm text-gray-500">Description</div>
                  <div className="text-gray-700">{modalData.description}</div>
                </div>
              )}

              {modalData.metadata && (
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Informations supplémentaires</div>
                  <pre className="text-xs text-gray-800 mt-2 overflow-auto">{JSON.stringify(modalData.metadata, null, 2)}</pre>
                </div>
              )}

              {modalData.created_at && (
                <div className="text-xs text-gray-500">Demandée le {format(new Date(modalData.created_at), 'PPpp')}</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClinicRequest;