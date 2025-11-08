import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, UserPlus, Edit2, Trash2, Key, Mail, Phone } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Badge from "../../components/SuperAdmin/Dashboard/Badge";

// NOTE: Assumptions:
// - GET admins: /api/clinics/{id}/admins/ (returns array in response.data.data or response.data)
// - Create admin: POST /api/clinics/{id}/admins/ (if different, adjust endpoint)
// - Update/Delete admin: PATCH/DELETE /api/admin-clinics/{adminId}/

const ManageAdmins = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    api
      .get(`/api/clinics/${id}/admins/`)
      .then((res) => {
        if (!mounted) return;
        const payload = res.data && res.data.data ? res.data.data : res.data;
        setAdmins(payload);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Impossible de récupérer les administrateurs.");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => (mounted = false);
  }, [id]);

  const refreshAdmins = () => {
    setIsLoading(true);
    api
      .get(`/api/clinics/${id}/admins/`)
      .then((res) => {
        const payload = res.data && res.data.data ? res.data.data : res.data;
        setAdmins([]);
        setAdmins(payload);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  const openEdit = (admin) => {
    setEditing({
        password : '',
        email: admin.user.email,
        full_name: admin.user.full_name,
        phone: admin.user.phone,
        id: admin.id
     });
    setShowEdit(true);
  };

  const submitEdit = () => {
    if (!editing || !editing.id) return;
    const idToPatch = editing.id;
    const payload = {
      full_name: editing.full_name,
      email: editing.email,
      phone: editing.phone,
      clinic_id: id
    };
    // include password only if set
    if (editing.password) payload.password = editing.password;

    api
      .patch(`/api/admin-clinics/${idToPatch}/`, payload)
      .then((res) => {
        toast.success("Administrateur mis à jour");
        setShowEdit(false);
        // update local list
        setAdmins((prev) => prev.map((a) => (a.id === idToPatch ? (res.data && res.data.data ? res.data.data : res.data) || { ...a, ...payload, password: undefined } : a)));
      })
      .catch((err) => {
        console.error(err);
        toast.error("Erreur lors de la mise à jour");
      });
  };

  const deleteAdmin = (admin) => {
    if (!window.confirm(`Supprimer l'administrateur ${admin.user.full_name || admin.user.email} ?`)) return;
    api
      .delete(`/api/admin-clinics/${admin.id}/`)
      .then(() => {
        toast.success("Administrateur supprimé");
        setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
      })
      .catch((err) => {
        console.error(err);
        toast.error("Impossible de supprimer cet administrateur");
      });
  };

  const submitCreate = (form) => {
    setCreating(true);
    // assumed endpoint for creation
    api
      .post(`/api/clinics/${id}/admins/`, form)
      .then((res) => {
        const created = res.data && res.data.data ? res.data.data : res.data;
        toast.success("Administrateur créé");
        setShowCreate(false);
        setAdmins((prev) => [created, ...prev]);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Erreur lors de la création");
      })
      .finally(() => setCreating(false));
  };

  return (
    <div className="py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/__superadmin/dashboard")} className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-white hover:bg-orange-600 border border-orange-600 px-3 py-1.5 rounded-md transition">
              ← Retour
            </button>
            <h1 className="text-2xl font-semibold text-slate-800">Administrateurs</h1>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 bg-orange-600 text-white px-3 py-2 rounded-md hover:bg-orange-700">
              <UserPlus className="h-4 w-4" />
              <span className="text-sm">Créer un admin</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-medium text-slate-800 mb-4">Liste des administrateurs</h2>

              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-10 bg-gray-200 rounded" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              ) : admins.length === 0 ? (
                <div className="text-sm text-slate-500">Aucun administrateur pour cette clinique.</div>
              ) : (
                <ul className="space-y-3">
                  {admins.map((a) => (
                    <li key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">{a.user.full_name || '—'}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-1"><Mail className="h-3 w-3" />{a.user.email}</div>
                          {a.user.phone && <div className="text-xs text-slate-500 flex items-center gap-2 mt-1"><Phone className="h-3 w-3" />{a.user.phone}</div>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(a)} className="inline-flex items-center gap-2 px-3 py-1 rounded bg-sky-50 text-sky-700 hover:bg-sky-100">
                          <Edit2 className="h-4 w-4" />
                          <span className="text-sm">Modifier</span>
                        </button>

                        <button onClick={() => deleteAdmin(a)} className="inline-flex items-center gap-2 px-3 py-1 rounded bg-rose-500 text-white hover:bg-rose-600">
                          <Trash2 className="h-4 w-4" />
                          <span className="text-sm">Supprimer</span>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="col-span-4">
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h4 className="text-sm font-medium text-slate-800 mb-2">Aide</h4>
                <div className="text-sm text-slate-600">Ici vous pouvez créer, modifier ou supprimer des administrateurs rattachés à cette clinique.</div>
                <div className="mt-3 text-xs text-slate-500">Lorsque vous modifiez le mot de passe, laissez le champ vide pour ne pas le changer.</div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h4 className="text-sm font-medium text-slate-800 mb-2">Statut</h4>
                <div className="text-sm text-slate-600">Total admins: <span className="font-medium">{admins.length}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal (simple) */}
      {showEdit && editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center z-50 justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Modifier l'administrateur</h3>
              <button className="text-slate-500" onClick={() => setShowEdit(false)}>✕</button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm text-slate-600">Nom</label>
                <input value={editing.full_name || ''} onChange={(e) => setEditing((s) => ({ ...s, full_name: e.target.value }))} className="mt-1 block w-full border border-gray-200 rounded px-3 py-2" />
              </div>

              <div>
                <label className="text-sm text-slate-600">Email</label>
                <input value={editing.email || ''} onChange={(e) => setEditing((s) => ({ ...s, email: e.target.value }))} className="mt-1 block w-full border border-gray-200 rounded px-3 py-2" />
              </div>

              <div>
                <label className="text-sm text-slate-600">Téléphone</label>
                <input value={editing.phone || ''} onChange={(e) => setEditing((s) => ({ ...s, phone: e.target.value }))} className="mt-1 block w-full border border-gray-200 rounded px-3 py-2" />
              </div>

              <div>
                <label className="text-sm text-slate-600">Mot de passe (laisser vide = inchangé)</label>
                <input type="password" value={editing.password || ''} onChange={(e) => setEditing((s) => ({ ...s, password: e.target.value }))} className="mt-1 block w-full border border-gray-200 rounded px-3 py-2" />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button onClick={() => setShowEdit(false)} className="px-3 py-2 rounded border border-gray-200">Annuler</button>
              <button onClick={submitEdit} className="px-3 py-2 rounded bg-sky-600 text-white">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)} onCreate={submitCreate} loading={creating} />
      )}
    </div>
  );
};

const CreateModal = ({ onClose, onCreate, loading }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  const submit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Email et mot de passe requis');
      return;
    }
    onCreate(form);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white rounded-2xl w-full max-w-xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Créer un administrateur</h3>
          <button type="button" className="text-slate-500" onClick={onClose}>✕</button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-sm text-slate-600">Nom</label>
            <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} className="mt-1 block w-full border border-gray-200 rounded px-3 py-2" />
          </div>

          <div>
            <label className="text-sm text-slate-600">Email</label>
            <input value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} className="mt-1 block w-full border border-gray-200 rounded px-3 py-2" />
          </div>

          <div>
            <label className="text-sm text-slate-600">Téléphone</label>
            <input value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} className="mt-1 block w-full border border-gray-200 rounded px-3 py-2" />
          </div>

          <div>
            <label className="text-sm text-slate-600">Mot de passe</label>
            <input type="password" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} className="mt-1 block w-full border border-gray-200 rounded px-3 py-2" />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 rounded border border-gray-200">Annuler</button>
          <button type="submit" disabled={loading} className="px-3 py-2 rounded bg-orange-600 text-white">{loading ? 'Création...' : 'Créer'}</button>
        </div>
      </form>
    </div>
  );
};

export default ManageAdmins;
