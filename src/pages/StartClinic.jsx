// src/pages/StartClinic.jsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";

import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
} from "lucide-react";
import "react-phone-number-input/style.css";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import countryList from "country-list";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";


// Import des composants
import ClinicInfoStep from "../components/ClinicRequest/ClinicInfoStep";
import AdminInfoStep from "../components/ClinicRequest/AdminInfoStep";
import InfoSidebar from "../components/ClinicRequest/InfoSidebar";
import SuccessRequest from "../components/ClinicRequest/SuccessRequest";


/* ---------- Configuration des pays ---------- */
// Formatage des pays pour react-select
const countryOptions = getCountries().map(countryCode => {
  const countryName = countryList.getName(countryCode) || countryCode;
  return {
    value: countryCode,
    label: `${countryName}`,
    countryCode,
    callingCode: `+${getCountryCallingCode(countryCode)}`
  };
}).sort((a, b) => a.label.localeCompare(b.label));

// Style personnalisé pour react-select 
const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    height: '48px',
    borderRadius: '12px',
    border: state.isFocused ? '2px solid #fb923c' : '1px solid #cbd5e1',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(251, 146, 60, 0.1)' : 'none',
    '&:hover': {
      border: '1px solid #94a3b8'
    }
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#fb923c' : state.isFocused ? '#fed7aa' : 'white',
    color: state.isSelected ? 'white' : '#1e293b',
    '&:active': {
      backgroundColor: '#fdba74'
    }
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '12px',
    overflow: 'hidden'
  })
};

/* ---------- Tokens (thème bleu/orange) ---------- */
const tokens = {
  page: "bg-gradient-to-b from-sky-50 via-white to-white text-slate-800 min-h-screen",
  border: "border-slate-200",
  card: "rounded-2xl border border-slate-200 bg-white shadow-sm",
  cardHover: "transition-all duration-300 hover:shadow-lg",
  brandGrad: "bg-gradient-to-r from-sky-600 to-indigo-600",
  orangeBtn: "bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-300",
  blueBtn: "bg-sky-500 hover:bg-sky-600 text-white shadow-md hover:shadow-lg transition-all duration-300",
  outlineBtn: "border-2 border-slate-300 hover:bg-slate-50 text-slate-700 transition-all duration-300",
  focus: "focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400",
  input: "h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition-all duration-200",
  iconInput: "w-12 mt-6 h-12 grid place-items-center bg-sky-100 text-sky-700 rounded-xl border border-slate-200 flex-shrink-0",
  circleStep: "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300",
  stepperText: "font-semibold text-slate-700 text-sm mt-2 text-center",
};

export default function StartClinic() {
  const { register, handleSubmit, setValue, watch, trigger, clearErrors, formState: { errors, touchedFields } } = useForm({ mode: 'onTouched' });
  const [step, setStep] = useState(0);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [phoneValue, setPhoneValue] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [slugAvailable, setSlugAvailable] = useState(true);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    const submitted = Cookies.get("clinicRequestSubmitted");
    if (submitted === "true") {
      setAlreadySubmitted(true);
    }
  }, []);

  const onSubmit = async (data) => {
    // Préparer les données à envoyer
    const formData = new FormData();
    formData.append("clinic_name", data.clinicName);
    formData.append("clinic_slug ", slug);
    formData.append("admin_name ", data.fullName);
    formData.append("admin_email ", data.adminEmail);
    formData.append("admin_phone ", data.phoneNumber);
    formData.append("country", data.country);
    formData.append("city", data.city);
    formData.append("address", data.address);
    formData.append("phoneNumber", data.phoneNumber);
    if( logo ){
      formData.append("logo", logo);
    }
    console.log("Submitting clinic data:", Object.fromEntries(formData.entries()));
    api.post("/api/clinic-requests/", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }).then(response => {
      toast.success("Demande de création de clinique soumise avec succès.");
      setAlreadySubmitted(true);
      Cookies.set("clinicRequestSubmitted", "true");
      Cookies.set("clinicRequestData", JSON.stringify({clinicName: data.clinicName, adminEmail: data.adminEmail, fullName: data.fullName}));
    }).catch(async error => {
      console.error("Error submitting clinic registration:", error);
      if(error.code === 'ERR_NETWORK') {
        toast.error("Erreur réseau. Veuillez vérifier votre connexion internet et réessayer.");
      }else {
        console.log(error.response.data);
        toast.error(error.response.data.message || "Une erreur est survenue lors de l'inscription.");
        await checkSlugAvailability(slug); // Re-vérifier la disponibilité du slug en cas d'erreur
      }
    })
  };

  // Register les champs tel et pays
  useEffect(() => {
    register("country", { required: "Le pays est requis" });
    register("phoneNumber", { required: "Le téléphone est requis" });
  }, [register]);

  // Pour le champs telephone
  useEffect(() => {
    setValue("phoneNumber", phoneValue);
    if (phoneValue) {
      clearErrors("phoneNumber");
    }
  }, [phoneValue, setValue, clearErrors]);

  // Pour les autres champs & effacer les erreurs si touché
  const formValues = watch();
  useEffect(() => {
    Object.keys(errors || {}).forEach((field) => {
      const val = formValues ? formValues[field] : undefined;
      const touched = touchedFields ? touchedFields[field] : false;
      // Sauf lemail car histoire de regex machin
      if (field !== "adminEmail") {
        if (touched && val !== undefined && val !== "") {
          clearErrors(field);
        }
      }
    });
  }, [formValues, errors, clearErrors, touchedFields]);

  const clinicName = watch("clinicName");
  const slug = clinicName ? clinicName.toLowerCase().replace(/\s+/g, "-") : "";

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleNext = async () => {
    // Validate required fields of step 0 before moving to step 1
    if (step === 0) {
      const valid = await trigger(["clinicName", "country", "city", "address"]);
      if (!valid) return;
    }

    if (step < 1) {
      setStep(step + 1);
      // Scroll to top when changing step
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const checkSlugAvailability = async (slug) => {
    try {
      const response = await api.get(`api/clinics/check-slug/?slug=${slug}`);
      console.log("Slug availability response:", response.data);
      setCheckingSlug(false);
      return response.data.available;

    } catch (error) {
      console.error("Error checking slug availability:", error);
      setCheckingSlug(false);
      return false;
    }
  };

  // Quand arrêter d'écrire le nom de la clinique, vérifier la disponibilité du slug
  useEffect(() => {
    if( !slug || slug.length < 2) return;
    setCheckingSlug(true);

    const delayDebounceFn = setTimeout(() => {
      if (slug && slug.length > 0) {
        checkSlugAvailability(slug).then((available) => {
          setSlugAvailable(available);
        });
      }
      setCheckingSlug(false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [clinicName]);

  if( alreadySubmitted ) {
    return <SuccessRequest setAlreadySubmitted={setAlreadySubmitted} />;
  }

  return (
    <main className={tokens.page}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12 -mt-8">

        {/* Stepper */}
        <div className="mb-12">
          <div className="flex justify-center items-center gap-8">
            {[0, 1].map((index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className={`${tokens.circleStep} ${
                    step >= index 
                      ? "bg-orange-500 text-white shadow-md" 
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {step > index ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                </div>
                <div className={`${tokens.stepperText} ${
                  step >= index ? "text-orange-600" : "text-slate-500"
                }`}>
                  {index === 0 ? "Informations Clinique" : "Vos Informations"}
                </div>
              </div>
            ))}
          </div>
          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div 
              className="absolute inset-0 flex items-center transition-all duration-500"
              style={{ width: step >= 1 ? '100%' : '50%' }}
            >
              <div className="w-full border-t-2 border-orange-500"></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Formulaire principal */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              {/* Étape 1 - Informations de la clinique */}
              {step === 0 && (
                <ClinicInfoStep
                  register={register}
                  errors={errors}
                  trigger={trigger}
                  watch={watch}
                  setValue={setValue}
                  clearErrors={clearErrors}
                  selectedCountry={selectedCountry}
                  setSelectedCountry={setSelectedCountry}
                  logoPreview={logoPreview}
                  handleLogoChange={handleLogoChange}
                  checkingSlug={checkingSlug}
                  slugAvailable={slugAvailable}
                  customSelectStyles={customSelectStyles}
                  countryOptions={countryOptions}
                  tokens={tokens}
                />
              )}

              {/* Étape 2 - Informations admin */}
              {step === 1 && (
                <AdminInfoStep
                  register={register}
                  errors={errors}
                  phoneValue={phoneValue}
                  setPhoneValue={setPhoneValue}
                  selectedCountry={selectedCountry}
                  tokens={tokens}
                />
              )}
            </div>
          </div>

          {/* Panneau latéral d'information */}
          <InfoSidebar tokens={tokens} />
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={step === 0}
            className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300 ${
              step === 0 
                ? "text-slate-400 cursor-not-allowed" 
                : `${tokens.outlineBtn}`
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </button>

          {step === 0 ? (
            <button
              onClick={handleNext}
              className={`flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-medium ${tokens.orangeBtn}`}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit(onSubmit)}
              className={`flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-medium ${tokens.blueBtn}`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Soumettre la demande
            </button>
          )}
        </div>
      </div>
    </main>
  );
}