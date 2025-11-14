import React, { useState } from "react";
import ReceptionistTemplate from "../../components/Receptionist/ReceptionistTemplate";
import { useClinic } from "../../context/clinicContext";
import PhoneInput from "react-phone-number-input";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Save, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";

const tokens = {
    iconInput: "w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center",
    input: "mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm",
    focus: "focus:ring-2 focus:ring-sky-200",
};

function CreatePatient() {
    const { clinic } = useClinic() || {};
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [genre, setGenre] = useState("");
    const [dateNaissance, setDateNaissance] = useState("");
    const [loading, setLoading] = useState(false);
    const [createdPatient, setCreatedPatient] = useState(null);

    const validate = () => {
        if (!clinic || !clinic.id) {
            toast.error("Clinic non disponible");
            return false;
        }
        if (!email || !email.trim()) {
            toast.error("Email requis");
            return false;
        }
        if (!fullName || !fullName.trim()) {
            toast.error("Nom complet requis");
            return false;
        }
        if (!phone || !phone.trim()) {
            toast.error("Téléphone requis");
            return false;
        }
        if (!genre) {
            toast.error("Genre requis");
            return false;
        }
        if (!dateNaissance) {
            toast.error("Date de naissance requise");
            return false;
        }
        return true;
    };

    const onSave = async () => {
        if (!validate()) return;
        try {
            setLoading(true);
            // Build multipart/form-data to send clinic_id without exposing it in the UI
            const form = new FormData();
            form.append('clinic_id', clinic.id);
            form.append('email', email);
            form.append('full_name', fullName);
            form.append('phone', phone);
            form.append('date_naissance', dateNaissance);
            form.append('genre', genre);

            const res = await api.post("/api/patients/", form);
            if (res.status === 201 || (res.status === 200 && res.data)) {
                setCreatedPatient(res.data);
                toast.success("Patient créé");
            } else {
                toast.success("Créé (réponse inattendue)");
            }
        } catch (err) {
            if (err.response && err.response.data) {
                const msg = err.response.data.message || JSON.stringify(err.response.data);
                toast.error(msg);
            } else {
                toast.error("Erreur lors de la création du patient");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ReceptionistTemplate
            title="Créer un patient"
            breadcrumbs={[{ label: "Accueil réception", to: "/reception" }, { label: "Créer un patient", current: true }]}
        >
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">Nouveau patient</h2>
                        <p className="text-sm text-slate-500 mt-1">Tous les champs sont requis — remplissez rapidement pour enregistrer le patient.</p>
                    </div>
                    <div className="text-sm text-slate-500">Clinique: <span className="font-medium text-slate-700">{clinic?.name || '—'}</span></div>
                </div>

                <div className="bg-slate-50 rounded-lg p-5 shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700">Nom complet</label>
                            <input value={fullName} onChange={(e)=>setFullName(e.target.value)} className={`${tokens.input} ${tokens.focus} mt-1`} placeholder="Nom et prénom" />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">Email</label>
                            <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" className={`${tokens.input} ${tokens.focus} mt-1`} placeholder="exemple@domaine.com" />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">Téléphone</label>
                            <div className={`rounded-xl border border-slate-300 bg-white overflow-hidden transition-all duration-200 ${tokens.focus} mt-1`}>
                                <PhoneInput
                                    international
                                    defaultCountry={clinic && clinic.country ? clinic.country.toUpperCase() : "TN"}
                                    value={phone}
                                    onChange={setPhone}
                                    placeholder="+216 9x xxx xxx"
                                    className="h-12 px-3 w-full"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">Date de naissance</label>
                            <input value={dateNaissance} onChange={(e)=>setDateNaissance(e.target.value)} type="date" className={`${tokens.input} ${tokens.focus} mt-1`} />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">Genre</label>
                            <select value={genre} onChange={(e)=>setGenre(e.target.value)} className={`${tokens.input} ${tokens.focus} mt-1`}>
                                <option value="">Sélectionner</option>
                                <option value="male">Homme</option>
                                <option value="female">Femme</option>
                                <option value="other">Autre / Préfère ne pas dire</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                    <button type="button" onClick={() => navigate('/reception')} className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-700">Annuler</button>
                    <button type="button" onClick={onSave}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        style={{ backgroundColor: clinic?.theme?.primary || "#0ea5e9" }}>
                        {loading ? (
                            <>
                                <Loader className="w-4 h-4 animate-spin" />
                                Création...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Enregistrer le patient
                            </>
                        )}
                    </button>
                </div>

                {/* Modal after creation */}
                {createdPatient && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/40" onClick={()=>setCreatedPatient(null)} />
                        <div className="bg-white rounded-lg shadow-xl p-6 z-10 w-full max-w-md">
                            <div className="flex items-start gap-4">
                                <div className="rounded-full bg-emerald-100 text-emerald-600 w-12 h-12 flex items-center justify-center">
                                    ✓
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-lg font-semibold">Patient enregistré</h2>
                                    <p className="text-sm text-slate-600 mt-1">{createdPatient.full_name || createdPatient.email} a bien été ajouté.</p>
                                </div>
                            </div>
                            <div className="mt-5 flex gap-3 justify-end">
                                <button onClick={()=>{ setCreatedPatient(null); navigate('/reception'); }} className="px-4 py-2 rounded-md bg-slate-100 text-sm">Retour à l'accueil</button>
                                <button onClick={()=>{ navigate('/consultation', { state: { patientId: createdPatient.id } }); }} className="px-4 py-2 rounded-md bg-sky-600 text-white">Créer un RDV</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ReceptionistTemplate>
    );
}

export default CreatePatient;