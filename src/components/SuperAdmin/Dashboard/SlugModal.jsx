import Button from "./Button";
import { CheckCircle2, LoaderCircle, CircleAlert, Hash } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";

export default function SlugModal({ open, clinic, tokens, closeModal,  reloadClinics }) {
    const [checkingSlug, setCheckingSlug] = useState(false);
    const [slugAvailable, setSlugAvailable] = useState(null);
    const [value, onChange] = useState(clinic?.slug || '');
    const [isLoading, setIsLoading] = useState(false);

    const onClose = () => {
        closeModal();
        onChange('');
        setSlugAvailable(null);
    }

    const handleUpdateSlug = async () => {
        if (!clinic) return;
        let newSlug = (value || '').toString().trim();
        if (!newSlug) {
        toast.error('Le slug ne peut pas être vide');
        return;
        }
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("slug", newSlug);
            // Mettre en form data car multipart
            const resp = await api.patch(`/api/clinics/${clinic.id}/`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            });
        if (resp.status === 200) {
            toast.success('Slug mis à jour');
            onClose();
            await reloadClinics();
        } 
        } catch (err) {
            if(err.response && err.response.data) {
                toast.error(err.response.data.message || 'Erreur lors de la mise à jour du slug');
            }else {
                toast.error('Erreur lors de la mise à jour du slug');
            }
        } finally {
        setIsLoading(false);
        }
    };

    const checkSlugAvailability = async (slug) => {
        try {
        const response = await api.get(`api/clinics/check-slug/?slug=${slug}`);
        setCheckingSlug(false);
        let availability = response.data.available;
        if( availability === false ) {
            if(clinic && clinic.slug === slug) {
                availability = true;
            }
        }
        return availability;
        } catch (error) {
        setCheckingSlug(false);
        return false;
        }
    };

     // Quand arrêter d'écrire le nom de la clinique, vérifier la disponibilité du slug
    useEffect(() => {
    if( !value || value.length < 2) return;
    setCheckingSlug(true);

    const delayDebounceFn = setTimeout(() => {
        if (value && value.length > 0) {
        checkSlugAvailability(value).then((available) => {
            setSlugAvailable(available);
        });
        }
        setCheckingSlug(false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
    }, [value]);







  if (!open) return null;

  // safe defaults
  const isChecking = !!checkingSlug;
  const available = typeof slugAvailable === "boolean" ? slugAvailable : null;
  const showSlugIcons = value && value.length >= 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className={`w-full bg-white max-w-lg mx-4 ${tokens.card} rounded-lg shadow-lg border border-slate-200`} onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4">
          <h3 className="text-lg font-medium">Modifier le slug</h3>
          <p className="mt-2 text-sm text-slate-600">Nouveau slug pour <strong className="text-slate-800">{clinic?.name}</strong>
           <span className=" text-slate-400"> <Hash className="inline-block ml-1 h-4 w-4 -translate-y-0.5" />{clinic?.slug}</span>
          </p>

          <div className="mt-4">
            <div className="relative flex items-center gap-3">
                <div className="relative flex-1">
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${tokens.focus} border-slate-300 bg-white`}
                placeholder="nouveau-slug"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onSubmit(); } }}
              />

              {/* Dynamic icon on the right */}
              <div className="absolute right-3 top-3">
                {isChecking && showSlugIcons ? (
                  <div className="animate-spin">
                    <LoaderCircle className="h-5 w-5 text-slate-400" />
                  </div>
                ) : available === true && showSlugIcons ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : available === false && showSlugIcons ? (
                  <CircleAlert className="h-5 w-5 text-red-500" />
                ) : null}
              </div>
              </div>
              

              <button
                disabled={isLoading || isChecking || !value || value.length < 2 || (available === false)}
                className={`px-4 py-2 text-sm font-medium cursor-pointer text-white bg-orange-600 rounded-2xl hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={(e) => { e.stopPropagation(); handleUpdateSlug(); }}>Valider</button>
            </div>

            {/* Availability / status messages */}
            <div className="mt-2">
              {showSlugIcons && isChecking ? (
                <p className="text-xs text-slate-500 mt-1">Vérification de la disponibilité...</p>
              ) : showSlugIcons && available === true ? (
                <p className="text-xs text-green-500 mt-1">Ce slug est disponible !</p>
              ) : showSlugIcons && available === false ? (
                <p className="text-xs text-red-500 mt-1">Ce slug est déjà utilisé. Veuillez en choisir un autre.</p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="px-6 py-3 bg-slate-50 flex justify-end gap-3 rounded-b-lg">
          <Button variant="subtle" onClick={(e) => { e.stopPropagation(); onClose(); }}>Fermer</Button>
        </div>
      </div>
    </div>
  );
}
