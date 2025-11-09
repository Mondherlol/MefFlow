import React, { useEffect, useState } from 'react';
import { X, Loader2, Check, BadgePlus, Image, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


export default function ServicesModal({
  isOpen,
  onClose,
  editingService,
  name,
  setName,
  code,
  setCode,
  description,
  setDescription,
  photo,
  setPhoto,
  onSubmit,
  actionLoading,
}) {
  if (!isOpen) return null;

  const [previewSrc, setPreviewSrc] = useState(null);

  // create slug from name
  const slugify = (str) =>
    String(str)
      .normalize('NFD') // separate accents
      .replace(/\p{Diacritic}/gu, '') // remove accents
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  // when name changes, update code (auto-generate)
  useEffect(() => {
    try {
      const generated = name ? slugify(name) : '';
      // keep code visible but disabled (auto-generated)
      setCode(generated);
    } catch (e) {
      // noop
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  // manage preview when photo prop changes (File or existing URL)
  useEffect(() => {
    let objectUrl = null;
    if (photo instanceof File) {
      objectUrl = URL.createObjectURL(photo);
      setPreviewSrc(objectUrl);
    } else if (!photo && editingService?.photo) {
      // show existing service photo (assume URL)
      setPreviewSrc(editingService.photo);
    } else if (!photo) {
      setPreviewSrc(null);
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo, editingService]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center rounded-xl bg-sky-50 ring-1 ring-sky-100 text-sky-600 p-2">
              <BadgePlus className="w-4 h-4" />
            </span>
            <h3 className="text-base font-semibold text-slate-900">
              {editingService ? 'Modifier le service' : 'Nouveau service'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-5 pb-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Nom <span className="text-red-500">*</span></label>
              <input
                required
                placeholder="Ex : Service pédiatrique"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Code <span className="text-slate-400">(généré)</span></label>
              <input
                placeholder="généré automatiquement"
                value={code}
                disabled
                className="mt-1 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Le code est généré automatiquement depuis le nom.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              rows={4}
              placeholder="Brève description du service (optionnel)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-slate-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Nouvelle Photo</label>
            <div className="mt-1 flex items-center gap-3">
              <label htmlFor="service-photo" className="inline-flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                <Image className="w-4 h-4 text-slate-500" />
                <span>Choisir une photo</span>
                <input
                  id="service-photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                  className="sr-only"
                />
              </label>

              {previewSrc ? (
                <div className="relative">
                  <img src={previewSrc} alt="aperçu" className="h-16 w-16 rounded-lg object-cover border border-slate-200" />
                  <button
                    type="button"
                    onClick={() => { setPhoto(null); setPreviewSrc(null); }}
                    title="Supprimer la photo"
                    className="absolute -top-2 -right-2 inline-flex items-center justify-center rounded-full bg-white p-1 text-slate-500 shadow"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-400">Aucune photo sélectionnée</div>
              )}
            </div>
            {editingService && !photo && editingService.photo && (
              <p className="text-xs text-slate-500 mt-2">Une photo est déjà associée à ce service (aperçu affiché ci-dessus).</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm hover:bg-slate-50
                         focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm
                         hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-300 disabled:opacity-80"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {editingService ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
