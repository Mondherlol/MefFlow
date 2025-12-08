import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Eye, EyeOff, Key, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import AdminTemplate from '../../components/Admin/AdminTemplate';
import { useClinic } from '../../context/clinicContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const StripeConfig = () => {
  const { clinic, refreshClinic } = useClinic();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  
  const [formData, setFormData] = useState({
    publishable_key: '',
    secret_key: '',
    enabled: false,
  });

  const [initialData, setInitialData] = useState({
    publishable_key: '',
    has_secret_key: false,
    enabled: false,
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!clinic?.id) return;
    fetchStripeConfig();
  }, [clinic?.id]);

  useEffect(() => {
    // Vérifier si les données ont changé
    const changed = 
      formData.publishable_key !== initialData.publishable_key ||
      formData.secret_key !== '' ||
      formData.enabled !== initialData.enabled;
    setHasChanges(changed);
  }, [formData, initialData]);

  const fetchStripeConfig = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/clinics/${clinic.id}/stripe-config/`);
      
      setInitialData({
        publishable_key: response.data.publishable_key || '',
        has_secret_key: response.data.has_secret_key || false,
        enabled: response.data.enabled || false,
      });

      setFormData({
        publishable_key: response.data.publishable_key || '',
        secret_key: '',
        enabled: response.data.enabled || false,
      });
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration Stripe', error);
      toast.error('Impossible de charger la configuration Stripe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const errors = [];

    // Validation de la clé publique
    if (formData.publishable_key && !formData.publishable_key.startsWith('pk_')) {
      errors.push('La clé publique doit commencer par "pk_"');
    }

    // Validation de la clé secrète (si fournie)
    if (formData.secret_key && !formData.secret_key.startsWith('sk_')) {
      errors.push('La clé secrète doit commencer par "sk_"');
    }

    // Si Stripe est activé, les clés doivent être présentes
    if (formData.enabled) {
      if (!formData.publishable_key) {
        errors.push('La clé publique est requise pour activer Stripe');
      }
      if (!formData.secret_key && !initialData.has_secret_key) {
        errors.push('La clé secrète est requise pour activer Stripe');
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        publishable_key: formData.publishable_key,
        enabled: formData.enabled,
      };

      // N'inclure la clé secrète que si elle a été modifiée
      if (formData.secret_key) {
        payload.secret_key = formData.secret_key;
      }

      await api.put(`/api/clinics/${clinic.id}/stripe-config/`, payload);

      toast.success('Configuration Stripe mise à jour avec succès');
      
      // Rafraîchir les données de la clinique
      if (refreshClinic) {
        await refreshClinic();
      }

      // Recharger la configuration
      await fetchStripeConfig();
      
      // Réinitialiser le champ secret_key
      setFormData(prev => ({ ...prev, secret_key: '' }));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration Stripe', error);
      
      if (error.response?.data?.message) {
        toast.error(`Erreur: ${error.response.data.message}`);
      } else if (error.response?.data) {
        const errorMessages = Object.values(error.response.data).flat();
        errorMessages.forEach(msg => toast.error(msg));
      } else {
        toast.error('Impossible de sauvegarder la configuration Stripe');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      publishable_key: initialData.publishable_key,
      secret_key: '',
      enabled: initialData.enabled,
    });
    setShowSecretKey(false);
  };

  if (isLoading) {
    return (
      <AdminTemplate title="Configuration Stripe">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </AdminTemplate>
    );
  }

  return (
    <AdminTemplate 
      title="Configuration Stripe"
      breadcrumbs={[
        { label: 'Tableau de bord', to: '/admin' },
        { label: 'Configuration Stripe' }
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* En-tête avec statut */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-200">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-violet-50 text-violet-600">
              <CreditCard size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Intégration Stripe
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Configurez vos clés API Stripe pour activer les paiements en ligne et la facturation automatique.
              </p>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            formData.enabled 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}>
            {formData.enabled ? (
              <>
                <CheckCircle size={16} />
                Activé
              </>
            ) : (
              <>
                <AlertCircle size={16} />
                Désactivé
              </>
            )}
          </div>
        </div>

        {/* Avertissement de sécurité */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-900 mb-1">
              Sécurité des clés API
            </p>
            <ul className="text-amber-800 space-y-1 list-disc list-inside">
              <li>Ne partagez jamais vos clés secrètes publiquement</li>
              <li>Utilisez les clés de test (commençant par pk_test_ et sk_test_) en développement</li>
              <li>Les clés de production (pk_live_ et sk_live_) doivent être utilisées uniquement en production</li>
              <li>Changez vos clés immédiatement si vous suspectez une compromission</li>
            </ul>
          </div>
        </div>

        {/* Champs du formulaire */}
        <div className="space-y-6">
          {/* Clé publique */}
          <div>
            <label htmlFor="publishable_key" className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Key size={16} className="text-slate-500" />
              Clé publique (Publishable Key)
            </label>
            <input
              type="text"
              id="publishable_key"
              value={formData.publishable_key}
              onChange={(e) => handleInputChange('publishable_key', e.target.value)}
              placeholder="pk_test_... ou pk_live_..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 
                       placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 
                       focus:border-transparent transition-all font-mono text-sm"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Cette clé est utilisée côté client et peut être visible publiquement
            </p>
          </div>

          {/* Clé secrète */}
          <div>
            <label htmlFor="secret_key" className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Shield size={16} className="text-slate-500" />
              Clé secrète (Secret Key)
              {initialData.has_secret_key && (
                <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  ✓ Configurée
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showSecretKey ? "text" : "password"}
                id="secret_key"
                value={formData.secret_key}
                onChange={(e) => handleInputChange('secret_key', e.target.value)}
                placeholder={
                  initialData.has_secret_key 
                    ? "Laisser vide pour conserver la clé actuelle" 
                    : "sk_test_... ou sk_live_..."
                }
                className="w-full px-4 py-2.5 pr-12 rounded-lg border border-slate-300 bg-white text-slate-900 
                         placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 
                         focus:border-transparent transition-all font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 
                         transition-colors p-1"
                aria-label={showSecretKey ? "Masquer la clé" : "Afficher la clé"}
              >
                {showSecretKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              {initialData.has_secret_key 
                ? "Laissez ce champ vide si vous ne souhaitez pas modifier la clé secrète" 
                : "Cette clé doit rester confidentielle et n'est utilisée que côté serveur"}
            </p>
          </div>

          {/* Toggle activation */}
          <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) => handleInputChange('enabled', e.target.checked)}
              className="mt-1 w-4 h-4 text-violet-600 bg-white border-slate-300 rounded 
                       focus:ring-2 focus:ring-violet-500 transition-all cursor-pointer"
            />
            <label htmlFor="enabled" className="flex-1 cursor-pointer">
              <span className="text-sm font-medium text-slate-900 block">
                Activer l'intégration Stripe
              </span>
              <span className="text-xs text-slate-600 block mt-1">
                Une fois activé, les paiements Stripe seront disponibles pour vos patients et les factures 
                seront automatiquement générées.
              </span>
            </label>
          </div>
        </div>

        {/* Guide rapide */}
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
          <h3 className="text-sm font-semibold text-sky-900 mb-2 flex items-center gap-2">
            <Key size={16} />
            Comment obtenir vos clés Stripe ?
          </h3>
          <ol className="text-sm text-sky-800 space-y-2 ml-6 list-decimal">
            <li>Connectez-vous à votre <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-sky-900">tableau de bord Stripe</a></li>
            <li>Accédez à <strong>Développeurs → Clés API</strong></li>
            <li>Copiez votre <strong>Clé publique</strong> et votre <strong>Clé secrète</strong></li>
            <li>Collez-les dans les champs ci-dessus</li>
            <li>Activez l'intégration et sauvegardez</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={handleCancel}
            disabled={!hasChanges || isSaving}
            className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 
                     font-medium text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={!hasChanges || isSaving}
            className="px-6 py-2.5 rounded-lg bg-violet-600 text-white font-medium text-sm 
                     hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 
                     focus:ring-offset-2 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Enregistrer la configuration
              </>
            )}
          </button>
        </div>
      </form>
    </AdminTemplate>
  );
};

export default StripeConfig;
