import React, { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';
import AdminTemplate from '../../components/Admin/AdminTemplate';
import { useClinic } from '../../context/clinicContext';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import { Plus, ScanHeart, Search } from 'lucide-react';
import ServicesModal from '../../components/Admin/Services/ServicesModal';
import ServiceCard from '../../components/Admin/Services/ServiceCard';
import SkeletonGrid from '../../components/Admin/Services/SkeletonGrid';

export default function Services() {
  const { clinic } = useClinic();
  const initialLoad = useRef(true);

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null); // null => create

  // form fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);

  // UI helpers
  const [q, setQ] = useState('');

  if (!clinic) {
    return (
      <AdminTemplate title="Services">
        <div className="py-8 flex items-center justify-center">
          <Loader />
        </div>
      </AdminTemplate>
    );
  }

  const resetForm = () => {
    setName('');
    setCode('');
    setDescription('');
    setPhoto(null);
    setEditingService(null);
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (service) => {
    setEditingService(service);
    setName(service.name || '');
    setCode(service.code || '');
    setDescription(service.description || '');
    setPhoto(null);
    setIsModalOpen(true);
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/services/', { params: { clinic_id: clinic.id } });
      if (response?.data?.data) setServices(response.data.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Erreur lors du chargement des services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      fetchServices();
    }
  }, [clinic]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      if (editingService) {
        const form = new FormData();
        if (name !== editingService.name) form.append('name', name);
        if (code !== editingService.code) form.append('code', code);
        if (description !== (editingService.description || '')) form.append('description', description);
        if (photo) form.append('photo', photo);
        if (!editingService.clinic_id) form.append('clinic_id', clinic.id);

        if (Array.from(form.keys()).length === 0) {
          toast('Aucune modification détectée.');
          setIsModalOpen(false);
          setActionLoading(false);
          return;
        }

        await api.patch(`/api/services/${editingService.id}/`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Service mis à jour');
      } else {
        const form = new FormData();
        form.append('clinic_id', clinic.id);
        form.append('name', name);
        form.append('code', code);
        if (description) form.append('description', description);
        if (photo) form.append('photo', photo);

        await api.post('/api/services/', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Service créé');
      }

      setIsModalOpen(false);
      resetForm();
      await fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error("Erreur lors de l'enregistrement du service");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (service) => {
    if (!confirm(`Supprimer le service "${service.name}" ? Cette action est irréversible.`)) return;
    setActionLoading(true);
    try {
      await api.delete(`/api/services/${service.id}/`);
      toast.success('Service supprimé');
      await fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = q
    ? services.filter(
        (s) =>
          s.name?.toLowerCase().includes(q.toLowerCase()) ||
          s.code?.toLowerCase().includes(q.toLowerCase()) ||
          s.description?.toLowerCase().includes(q.toLowerCase())
      )
    : services;

  const brandPrimary = clinic?.theme?.primary || 'indigo';

  return (
    <AdminTemplate title="Services">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Services médicaux</h2>
          <p className="text-sm text-slate-600">
            Créez, catégorisez et publiez vos actes médicaux.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un service…"
              className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white shadow-sm text-sm
                         focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-slate-300"
            />
          </div>

          <button
            onClick={openCreate}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white shadow-sm
                        bg-${brandPrimary}-600 hover:bg-${brandPrimary}-700
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-300`}
          >
            <Plus className="w-4 h-4" />
            Nouveau
          </button>
        </div>
      </div>

      {/* Content Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        {loading ? (
          <div className="py-4">
            <SkeletonGrid />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center">
            <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-slate-100 grid place-items-center">
              <span className="text-slate-400">
                <ScanHeart className="w-8 h-8" />
              </span>
            </div>
            <p className="text-slate-700 font-medium">Aucun service</p>
            <p className="text-sm text-slate-500 mt-1">Ajoutez un service pour commencer.</p>
            <button
              onClick={openCreate}
              className={`mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white shadow-sm
                          bg-${brandPrimary}-600 hover:bg-${brandPrimary}-700
                          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-300`}
            >
              <Plus className="w-4 h-4" />
              Nouveau service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <ServiceCard
                key={s.id}
                service={s}
                onEdit={openEdit}
                onDelete={handleDelete}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <ServicesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingService={editingService}
        name={name}
        setName={setName}
        code={code}
        setCode={setCode}
        description={description}
        setDescription={setDescription}
        photo={photo}
        setPhoto={setPhoto}
        onSubmit={handleSubmit}
        actionLoading={actionLoading}
      />
    </AdminTemplate>
  );
}
