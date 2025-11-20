import React, { useEffect, useRef, useState } from 'react';
import api from '../../api/axios';
import { useClinic } from '../../context/clinicContext';
import toast from 'react-hot-toast';
import UserCard from '../Admin/ManageUser/UserCard';
import UserModal from '../Admin/ManageUser/UserModal';
import SkeletonUserCard from '../Admin/ManageUser/SkeletonUserCard';
import { Plus, Search, UserPlus } from 'lucide-react';

export default function PatientsManager({ Template, title = 'Gérer patients' }) {
  const { clinic } = useClinic();
  const initialLoad = useRef(true);

  const [patients, setPatients] = useState([]);
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

  // UI helpers
  const [q, setQ] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setPhoto(null);
    setEditingRec(null);
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
    setIsModalOpen(true);
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/clinics/${clinic.id}/patients/`);
      if (response?.data?.data) setPatients(response.data.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error("Erreur lors du chargement des patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clinic) return;
    if (initialLoad.current) {
      initialLoad.current = false;
      fetchPatients();
    }
  }, [clinic]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      if (editingRec) {
        const form = new FormData();
        if (email !== editingRec.user?.email) form.append('email', email);
        if (fullName !== editingRec.user?.full_name) form.append('full_name', fullName);
        if (phone !== (editingRec.user?.phone || '')) form.append('phone', phone);
        if (password) form.append('password', password);
        if (photo) form.append('photo', photo);

        if (Array.from(form.keys()).length === 0) {
          toast('Aucune modification détectée.');
          setIsModalOpen(false);
          setActionLoading(false);
          return;
        }

        form.append('clinic_id', clinic.id);

        await api.patch(`/api/patients/${editingRec.id}/`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Patient mis à jour');
      } else {
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
        if (phone) form.append('phone', phone);
        if (photo) form.append('photo', photo);

        await api.post('/api/patients/', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Patient créé');
      }

      setIsModalOpen(false);
      resetForm();
      await fetchPatients();
    } catch (error) {
      console.error('Error saving patient:', error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Erreur lors de l'enregistrement du patient");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (rec) => {
    if (!confirm(`Supprimer le patient "${rec.user?.full_name || rec.user?.email}" ? Cette action est irréversible.`)) return;
    setActionLoading(true);
    try {
      await api.delete(`/api/patients/${rec.id}/`);
      toast.success('Patient supprimé');
      await fetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = q
    ? patients.filter(
        (r) =>
          r.user?.full_name?.toLowerCase().includes(q.toLowerCase()) ||
          r.user?.email?.toLowerCase().includes(q.toLowerCase()) ||
          r.user?.phone?.toLowerCase().includes(q.toLowerCase())
      )
    : patients;

  const brandPrimary = clinic?.theme?.primary || 'indigo';

  if (!Template) return null;

  return (
    <Template title={title}>
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Patients</h2>
          <p className="text-sm text-slate-600">Créez, modifiez et gérez les patients de la clinique.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un patient…"
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
            <p className="text-slate-700 font-medium">Aucun patient</p>
            <p className="text-sm text-slate-500 mt-1">Ajoutez un patient pour commencer.</p>
            <button
              onClick={openCreate}
              className={`mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white shadow-sm bg-${brandPrimary}-600 hover:bg-${brandPrimary}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-300`}
            >
              <Plus className="w-4 h-4" />
              Nouveau patient
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <UserCard key={r.id} record={r} onEdit={openEdit} onDelete={handleDelete} actionLoading={actionLoading} brandPrimary={brandPrimary} />
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
        onSubmit={handleSubmit}
        actionLoading={actionLoading}
      />
    </Template>
  );
}
