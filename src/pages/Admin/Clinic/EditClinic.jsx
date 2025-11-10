import React, { useEffect, useMemo, useState } from "react";
import AdminTemplate from "../../../components/Admin/AdminTemplate";
import Section from "../../../components/Admin/ManageClinic/Section";
import { useClinic } from "../../../context/clinicContext";
import Select from "react-select";
import { Building2, PenLine, MapPin, Phone, Mail, Globe, Save } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import api from "../../../api/axios";
import toast from "react-hot-toast";

const tokens = {
  iconInput: "w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center",
  input: "mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm",
  focus: "focus:ring-2 focus:ring-sky-200",
};

const countryOptionsSample = [
  { value: "tn", label: "Tunisie", countryCode: "TN" },
  { value: "fr", label: "France", countryCode: "FR" },
  { value: "ma", label: "Maroc", countryCode: "MA" },
];

export default function EditClinic() {
  const { clinic, setClinic, theme } = useClinic() || {};
  const colors = useMemo(() => ({ primary: theme?.primary || "#3b82f6" }), [theme]);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState(null);
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // initialize from clinic or sample defaults
    setName(clinic?.name || "Clinique du Parc");
    // slug display is read-only here (managed by MedFlow provider elsewhere)
    setAddress(clinic?.address || "123 Avenue du Parc");
    setCountry(countryOptionsSample.find(c => c.value === clinic?.country) || countryOptionsSample[0]);
    setCity(clinic?.city || "Tunis");
    setPhone(clinic?.phone || "+216 71 000 000");
    setEmail(clinic?.email || "contact@clinique.tn");
    setWebsite(clinic?.website || "https://clinique.example");
  }, [clinic]);



  const onSave = async () => {
    // basic front-end validation
    if (!name || !name.trim()) {
      toast.error("Le nom de la clinique est requis");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name, address, country: country?.value, city, phone, email, website,
      };
      const res = await api.patch(`/api/clinics/${clinic.id}/`, payload);
      if (res.status === 200 && res.data) {
        setClinic(res.data);
        toast.success("Informations de la clinique mises à jour");
      } else {
        toast.success("Enregistré (réponse inattendue)");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminTemplate
      title="Gérer la clinique / Informations générales"
      breadcrumbs={[
        { label: "Tableau de bord", to: "/admin" },
        { label: "Gérer la clinique", to: "/admin/clinique" },
        { label: "Éditer", current: true },
      ]}
    >
      <p className="text-sm text-slate-600 mb-4">Éditez les informations générales de la clinique. Les champs ci-dessous peuvent être modifiés et sauvegardés.</p>

      <Section title="Informations principales" collapsible defaultOpen>
        <div className="space-y-6">
          {/* Name and slug on the same row. Slug is non-editable / blurred with helper message telling user to contact MedFlow provider. */}
          <div className="flex items-start gap-3">
            <div className={tokens.iconInput}><Building2 className="h-5 w-5 text-sky-600" /></div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700">Nom de la clinique</label>
              <input value={name} onChange={(e)=>setName(e.target.value)} className={`${tokens.input} ${tokens.focus}`} />
            </div>

            <div className="w-80">
              <label className="block text-sm font-medium text-slate-700">Slug (URL)</label>
              <div className="relative">
                {/* visually blurred / disabled input to indicate no rights to change */}
                {/* display clinic slug (read-only). If clinic slug missing, show a generated preview from name */}
                <input value={clinic?.slug || (name ? name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "") : "")}
                       disabled
                       className={`${tokens.input} pr-14 filter blur-sm opacity-80 cursor-not-allowed`} />
                <div className="absolute right-3 top-2.5">
                  <PenLine className="h-5 w-5 text-slate-400" />
                </div>
              </div>
              <p className="text-xs text-amber-600 mt-1">La modification du slug est réservée au fournisseur MedFlow. Contactez votre fournisseur pour le modifier.</p>
            </div>
          </div>

          {/* Country / Address / City on same row (3 columns on larger screens) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"> 
            <div className="flex items-start gap-3">
              <div className={tokens.iconInput}><MapPin className="h-5 w-5 text-sky-600" /></div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700">Pays</label>
                <Select
                  options={countryOptionsSample}
                  value={country}
                  onChange={(c)=>setCountry(c)}
                  isSearchable
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={tokens.iconInput}><MapPin className="h-5 w-5 text-sky-600" /></div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700">Adresse complète</label>
                <input value={address} onChange={(e)=>setAddress(e.target.value)} className={`${tokens.input} ${tokens.focus}`} />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={tokens.iconInput}><MapPin className="h-5 w-5 text-sky-600" /></div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700">Ville</label>
                <input value={city} onChange={(e)=>setCity(e.target.value)} className={`${tokens.input} ${tokens.focus}`} />
              </div>
            </div>
          </div>

          {/* Phone / Email / Website on same row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2"> 
            <div className="flex items-start gap-3">
              <div className={tokens.iconInput}><Phone className="h-5 w-5 text-sky-600" /></div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700">Téléphone</label>
                <div className={`rounded-xl border border-slate-300 bg-white overflow-hidden transition-all duration-200 ${tokens.focus}`}>
                  <PhoneInput
                    international
                    // use selected country code if available, fallback to TN
                    defaultCountry={country ? country.countryCode : "TN"}
                    value={phone}
                    onChange={setPhone}
                    placeholder="Entrez votre numéro de téléphone"
                    className="h-12 px-3 w-full"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Format international recommandé</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={tokens.iconInput}><Mail className="h-5 w-5 text-sky-600" /></div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" className={`${tokens.input} ${tokens.focus}`} />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={tokens.iconInput}><Globe className="h-5 w-5 text-sky-600" /></div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700">Site web</label>
                <input value={website} onChange={(e)=>setWebsite(e.target.value)} className={`${tokens.input} ${tokens.focus}`} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button type="button" onClick={onSave}
                    disabled={loading || !name}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
                    style={{ backgroundColor: colors.primary }}>
              <Save className="w-4 h-4" /> {loading ? 'Enregistrement...' : 'Enregistrer les informations'}
            </button>
          </div>
        </div>
      </Section>
    </AdminTemplate>
  );
}
