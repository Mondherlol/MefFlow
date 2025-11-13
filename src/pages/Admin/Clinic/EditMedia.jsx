import React, {useEffect, useMemo, useState} from "react";
import { UploadCloud, Trash2, Save, Image as ImageIcon, Loader as LoaderIcon } from "lucide-react";
import { useClinic } from "../../../context/clinicContext";
import { getImageUrl } from "../../../utils/image";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import Loader from "../../../components/Loader";
import AdminTemplate from "../../../components/Admin/AdminTemplate";

export default function EditMedia() {
  const { clinic, setClinic, theme } = useClinic() || {};
  const colors = useMemo(() => ({
    primary: theme?.primary || "#3b82f6",
    secondary: theme?.secondary || "#1e40af",
    accent: theme?.accent || "#f59e0b",
  }), [theme]);

  // Local state for media
  const [logo, setLogo] = useState(null); // File or url string
  const [logoPreview, setLogoPreview] = useState(null);

  const [hero, setHero] = useState(null);
  const [heroPreview, setHeroPreview] = useState(null);

  const [about, setAbout] = useState(null);
  const [aboutPreview, setAboutPreview] = useState(null);

  // gallery: array of { id?, url?, file?, preview }
  const [gallery, setGallery] = useState([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [removedGalleryUrls, setRemovedGalleryUrls] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // populate from clinic data
    if (!clinic) return;
    setLogo(clinic.logo_url ? getImageUrl(clinic.logo_url) : null);
    setLogoPreview(clinic.logo_url ? getImageUrl(clinic.logo_url) : null);

    setHero(clinic.hero_image_url ? getImageUrl(clinic.hero_image_url) : null);
    setHeroPreview(clinic.hero_image_url ? getImageUrl(clinic.hero_image_url) : null);

    setAbout(clinic.about_image_url ? getImageUrl(clinic.about_image_url) : null);
    setAboutPreview(clinic.about_image_url ? getImageUrl(clinic.about_image_url) : null);

    const imgs = Array.isArray(clinic.images_urls) ? clinic.images_urls.map((u, idx) => ({ id: idx, url: u, preview: getImageUrl(u) })) : [];
    setGallery(imgs);
    setNewGalleryFiles([]);
    setRemovedGalleryUrls([]);
  }, [clinic]);

  // helpers to generate preview for file inputs
  useEffect(() => {
    if (logo && logo instanceof File) {
      const url = URL.createObjectURL(logo);
      setLogoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    if (typeof logo === "string") setLogoPreview(logo);
  }, [logo]);

  useEffect(() => {
    if (hero && hero instanceof File) {
      const url = URL.createObjectURL(hero);
      setHeroPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    if (typeof hero === "string") setHeroPreview(hero);
  }, [hero]);

  useEffect(() => {
    if (about && about instanceof File) {
      const url = URL.createObjectURL(about);
      setAboutPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    if (typeof about === "string") setAboutPreview(about);
  }, [about]);

  // add new gallery images (files)
  const handleAddGalleryFiles = (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    const items = list.map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setNewGalleryFiles((s) => [...s, ...items]);
  };

  const handleRemoveExistingGallery = (url) => {

    // Remove with api
    api.delete(`/api/clinics/${clinic.id}/gallery-image/?path=${encodeURIComponent(url)}`)
    .then((res) => {
        // on success, remove from gallery state and add to removedGalleryUrls
        setGallery((s) => s.filter((it) => it.url !== url));
        setRemovedGalleryUrls((s) => [...s, url]);
        toast.success("Image de la galerie supprimée");
    })
    .catch((err) => {
      console.error("Error deleting gallery image:", err);
      toast.error("Erreur lors de la suppression de l'image");
    }
    )
   
  };

  const handleRemoveNewGallery = (preview) => {
    // revoke object url and remove
    setNewGalleryFiles((s) => s.filter((i) => i.preview !== preview));
    URL.revokeObjectURL(preview);
  };

  // Save handler: will send multipart/form-data with changed files and removal list
  const handleSave = async () => {
    if (!clinic) return toast.error("Aucune clinique sélectionnée.");
    try {
      setLoading(true);
      const form = new FormData();
      // files
      if (logo instanceof File) form.append("logo", logo);
      if (hero instanceof File) form.append("hero_image", hero);
      if (about instanceof File) form.append("about_image", about);
      // new gallery files
      newGalleryFiles.forEach((it) => form.append("images", it.file));

      // if any removed gallery urls, send them as JSON string in remove_images
      // NOTE: ceci suppose que l'API supporte un champ 'remove_images' acceptant un JSON array of urls or filenames.
      if (removedGalleryUrls.length) form.append("remove_images", JSON.stringify(removedGalleryUrls));

      const response = await api.patch(`/api/clinics/${clinic.id}/`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response?.status === 200 && response.data) {
        setClinic(response.data);
        toast.success("Médias mis à jour avec succès");
        // cleanup new previews
        newGalleryFiles.forEach((f) => URL.revokeObjectURL(f.preview));
        setNewGalleryFiles([]);
        setRemovedGalleryUrls([]);
      } else {
        toast.error("Impossible de sauvegarder les médias");
      }
    } catch (err) {
      console.error("Save media error:", err);
      toast.error("Erreur lors de la sauvegarde. Vérifiez la console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminTemplate
      title="Gérer la clinique / Médias"
      breadcrumbs={[
        { label: "Tableau de bord", to: "/admin" },
        { label: "Gérer la clinique", to: "/admin/clinique" },
        { label: "Médias", current: true },
      ]}
    >
      <div>
        <h2 className="text-lg font-bold mb-2">Gestion des médias</h2>
        <p className="text-sm text-slate-600 mb-6">Gérez les médias publics de la clinique (logo, hero, à propos, galerie).</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: previews */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-600" />
                <h3 className="font-semibold">Logo</h3>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-28 h-28 rounded-md overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
                {logoPreview ? (
                  // eslint-disable-next-line jsx-a11y/img-redundant-alt
                  <img src={logoPreview} alt="logo" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-slate-400">Aucun logo</div>
                )}
              </div>
              <div className="flex-1">
                <label className="inline-flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <UploadCloud className="w-4 h-4" /> Changer le logo
                  <input type="file" accept="image/*" className="sr-only" onChange={(e)=>setLogo(e.target.files?.[0]||null)} />
                </label>
                <p className="text-xs text-slate-500 mt-2">Format recommandé : PNG transparent, 300x300 max.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-600" />
                <h3 className="font-semibold">Hero (image de fond)</h3>
              </div>
            </div>
            <div className="w-full h-44 rounded-md overflow-hidden bg-slate-50 border border-slate-100 mb-3">
              {heroPreview ? (
                <img src={heroPreview} alt="hero" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">Aucune image</div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                <UploadCloud className="w-4 h-4" /> Changer l'image
                <input type="file" accept="image/*" className="sr-only" onChange={(e)=>setHero(e.target.files?.[0]||null)} />
              </label>
              <p className="text-xs text-slate-500">Largeur recommandée pour hero : 1200px+</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-600" />
                <h3 className="font-semibold">Image « À propos »</h3>
              </div>
            </div>
            <div className="w-full h-36 rounded-md overflow-hidden bg-slate-50 border border-slate-100 mb-3">
              {aboutPreview ? (
                <img src={aboutPreview} alt="about" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">Aucune image</div>
              )}
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <UploadCloud className="w-4 h-4" /> Changer l'image
              <input type="file" accept="image/*" className="sr-only" onChange={(e)=>setAbout(e.target.files?.[0]||null)} />
            </label>
          </div>
        </div>

        {/* Right column: gallery + actions */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Galerie</h3>
              <p className="text-xs text-slate-500">Images publiques visibles sur la page</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              {gallery.map((it) => (
                <div key={it.url} className="relative w-full h-24 rounded-md overflow-hidden border border-slate-100">
                  <img src={getImageUrl(it.url)} alt="gallery" className="w-full h-full object-cover" />
                  <button type="button" onClick={()=>handleRemoveExistingGallery(it.url)} className="absolute top-1 right-1 bg-white/80 rounded p-1 text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {newGalleryFiles.map((it) => (
                <div key={it.preview} className="relative w-full h-24 rounded-md overflow-hidden border border-dashed border-slate-200">
                  <img src={it.preview} alt="new" className="w-full h-full object-cover" />
                  <button type="button" onClick={()=>handleRemoveNewGallery(it.preview)} className="absolute top-1 right-1 bg-white/80 rounded p-1 text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <label className="inline-flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <UploadCloud className="w-4 h-4" /> Ajouter des images
              <input type="file" accept="image/*" multiple className="sr-only" onChange={(e)=>handleAddGalleryFiles(e.target.files)} />
            </label>
            <p className="text-xs text-slate-500 mt-2">Formats acceptés : JPG/PNG. Maximum recommandé : 2MB par image.</p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 bg-white flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: colors.primary }} onClick={handleSave} disabled={loading}>
              {!loading ? <><Save className="w-4 h-4" /> Sauvegarder</> : <><LoaderIcon className="w-4 h-4 animate-spin" /> Sauvegarde...</>}
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm border" onClick={() => {
              // reset local changes
              setLogo(clinic?.logo_url ? getImageUrl(clinic.logo_url) : null);
              setHero(clinic?.hero_image_url ? getImageUrl(clinic.hero_image_url) : null);
              setAbout(clinic?.about_image_url ? getImageUrl(clinic.about_image_url) : null);
              const imgs = Array.isArray(clinic?.images_urls) ? clinic.images_urls.map((u, idx) => ({ id: idx, url: u, preview: getImageUrl(u) })) : [];
              setGallery(imgs);
              newGalleryFiles.forEach((f)=>URL.revokeObjectURL(f.preview));
              setNewGalleryFiles([]);
              setRemovedGalleryUrls([]);
              toast("Modifications locales annulées");
            }}>Annuler</button>
          </div>
        </aside>
        </div>

        {/* small note about API assumptions */}
        <p className="text-xs text-slate-400 mt-4">Note: l'upload utilise un patch multipart/form-data. L'API doit accepter les champs 'logo', 'hero_image', 'about_image', 'images' (plusieurs) et 'remove_images' (JSON) pour la suppression. Si votre backend attend d'autres noms, je peux adapter.</p>
      </div>
    </AdminTemplate>
  );
}