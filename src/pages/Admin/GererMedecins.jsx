import React, { useEffect, useRef, useState } from 'react';
import AdminTemplate from '../../components/Admin/AdminTemplate';
import api from '../../api/axios';
import { useClinic } from '../../context/clinicContext';
import toast from 'react-hot-toast';
// replaced Loader with skeleton placeholder component
import UserCard from '../../components/Admin/ManageUser/UserCard';
import UserModal from '../../components/Admin/ManageUser/UserModal';
import SkeletonUserCard from '../../components/Admin/ManageUser/SkeletonUserCard';
import { Plus, Search, UserPlus } from 'lucide-react';

export default function Medecins() {
  const { clinic } = useClinic();
  const initialLoad = useRef(true);

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRec, setEditingRec] = useState(null); // null => create

  // form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState(null);
  const [specialite, setSpecialite] = useState('');

  // UI helpers
  const [q, setQ] = useState('');

  if (!clinic) {
    return (
      <AdminTemplate title="Médecins">
        <div className="py-8 flex items-center justify-center">
          <SkeletonUserCard />
        </div>
      </AdminTemplate>
    );
  }

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setPhoto(null);
    setEditingRec(null);
    setSpecialite('');
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (rec) => {
    setEditingRec(rec);
    setEmail(rec.user?.email || '');
    setFullName(rec.user?.full_name || '');
    setPhone(rec.user?.phone || '');
    setPassword('');
    setPhoto(null);
    setSpecialite(rec.specialite || '');
    setIsModalOpen(true);
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      // GET /api/clinics/{id}/doctors
      const response = await api.get(`/api/clinics/${clinic.id}/doctors/`);
      if (response?.data?.data) setDoctors(response.data.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error("Erreur lors du chargement des médecins.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      fetchDoctors();
    }
  }, [clinic]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      if (editingRec) {
        // PATCH /api/doctors/{id}/
        const form = new FormData();
        if (email !== editingRec.user?.email) form.append('email', email);
        if (fullName !== editingRec.user?.full_name) form.append('full_name', fullName);
        if (phone !== (editingRec.user?.phone || '')) form.append('phone', phone);
        if (password) form.append('password', password);
        if (photo) form.append('photo', photo);
        if (specialite !== (editingRec.specialite || '')) form.append('specialite', specialite);

        if (Array.from(form.keys()).length === 0) {
          toast('Aucune modification détectée.');
          setIsModalOpen(false);
          setActionLoading(false);
          return;
        }

        form.append("clinic_id", clinic.id);


        await api.patch(`/api/doctors/${editingRec.id}/`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Medecin mis à jour');
      } else {
        // POST /api/doctors/
        if (!email || !password || !fullName) {
          toast.error('Email, mot de passe et nom complet sont requis');
          setActionLoading(false);
          return;
        }

        const form = new FormData();
        form.append('clinic_id', clinic.id);
        form.append('email', email);
        form.append('password', password);
        form.append('full_name', fullName);
        form.append('specialite', "generaliste");
        if (phone) form.append('phone', phone);
        if (photo) form.append('photo', photo);

        await api.post('/api/doctors/', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Medecin créé');
      }

      setIsModalOpen(false);
      resetForm();
      await fetchDoctors();
    } catch (error) {
      console.error('Error saving receptionist:', error);
      if(error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
      toast.error("Erreur lors de l'enregistrement du medecin");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (rec) => {
    if (!confirm(`Supprimer le medecin "${rec.user?.full_name || rec.user?.email}" ? Cette action est irréversible.`)) return;
    setActionLoading(true);
    try {
      await api.delete(`/api/doctors/${rec.id}/`);
      toast.success('Médecin supprimé');
      await fetchDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = q
    ? doctors.filter(
        (r) =>
          r.user?.full_name?.toLowerCase().includes(q.toLowerCase()) ||
          r.user?.email?.toLowerCase().includes(q.toLowerCase()) ||
          r.user?.phone?.toLowerCase().includes(q.toLowerCase())
      )
    : doctors;

  const brandPrimary = clinic?.theme?.primary || 'indigo';


  return (
    <AdminTemplate title="Gérer médecins">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Médecins</h2>
          <p className="text-sm text-slate-600">Créez, modifiez et gérez les médecins de la clinique.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={q}
              name={fullName}
              isDoctor={true}
              placeholder="Rechercher un medecin…"
              className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-slate-300"
            />
          </div>

          <button
            onClick={openCreate}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white shadow-sm bg-${brandPrimary}-600 hover:bg-${brandPrimary}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-300`}
          >
            <Plus className="w-4 h-4" />
            Nouveau
          </button>
        </div>
      </div>

      {/* Content Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        {loading ? (
          <div className="py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonUserCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center">
            <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-slate-100 grid place-items-center">
              <span className="text-slate-400">
                <UserPlus className="w-8 h-8" />
              </span>
            </div>
            <p className="text-slate-700 font-medium">Aucun medecin</p>
            <p className="text-sm text-slate-500 mt-1">Ajoutez un medecin pour commencer.</p>
            <button
              onClick={openCreate}
              className={`mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white shadow-sm bg-${brandPrimary}-600 hover:bg-${brandPrimary}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-300`}
            >
              <Plus className="w-4 h-4" />
              Nouveau medecin
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <UserCard key={r.id} record={r} onEdit={openEdit} onDelete={handleDelete} onDoctorSaved={fetchDoctors} actionLoading={actionLoading} brandPrimary={brandPrimary} />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingUser={editingRec}
        name={fullName}
        setName={setFullName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        phone={phone}
        setPhone={setPhone}
        photo={photo}
        setPhoto={setPhoto}
        specialite={specialite}
        setSpecialite={setSpecialite}
        onSubmit={handleSubmit}
        actionLoading={actionLoading}
        isDoctor={true}
      />
    </AdminTemplate>
  );
}
