import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import PatientTemplate from "../../components/Patient/PatientTemplate";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    confirmPayment();
  }, []);

  async function confirmPayment() {
    const invoiceId = searchParams.get("invoice");
    const consultationId = searchParams.get("consultation");
    let sessionId = searchParams.get("session_id");

    // Nettoyer le session_id en cas de duplication dans l'URL
    if (sessionId && sessionId.includes("?session_id=")) {
      sessionId = sessionId.split("?session_id=")[0];
    }

    if (!invoiceId || !sessionId) {
      setStatus("error");
      setMessage("Informations de paiement manquantes");
      return;
    }

    try {
      const response = await api.post("/api/payments/confirm/", {
        invoice_id: invoiceId,
        session_id: sessionId,
      });

      setStatus("success");
      setMessage("Votre paiement a été confirmé avec succès !");
      toast.success("Paiement confirmé !");

      // Rediriger vers la page de consultation après 3 secondes
      setTimeout(() => {
        if (consultationId) {
          navigate(`/patient/appointments/${consultationId}`);
        } else {
          navigate("/patient/appointments");
        }
      }, 3000);
    } catch (e) {
      console.error("Payment confirmation error:", e);
      const errorMessage = e.response?.data?.error || 
                          e.response?.data?.message || 
                          "Erreur lors de la confirmation du paiement";
      setStatus("error");
      setMessage(errorMessage);
      toast.error("Impossible de confirmer le paiement");
      
      // En cas d'erreur, rediriger quand même après 5 secondes
      setTimeout(() => {
        if (consultationId) {
          navigate(`/patient/appointments/${consultationId}`);
        } else {
          navigate("/patient/appointments");
        }
      }, 5000);
    }
  }

  return (
    <PatientTemplate
      title="Paiement"
      breadcrumbs={[
        { label: "Accueil", to: "/patient" },
        { label: "Paiement" },
      ]}
    >
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          {status === "loading" && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <Loader2 className="w-20 h-20 text-blue-500 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Confirmation en cours...
              </h2>
              <p className="text-slate-600">
                Nous vérifions votre paiement, veuillez patienter.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Paiement réussi !
              </h2>
              <p className="text-slate-600 mb-6">{message}</p>
              <div className="text-sm text-slate-500">
                Redirection automatique vers votre consultation...
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Erreur de paiement
              </h2>
              <p className="text-slate-600 mb-6">{message}</p>
              <button
                onClick={() => navigate("/patient/appointments")}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Retour aux consultations
              </button>
            </>
          )}
        </div>
      </div>
    </PatientTemplate>
  );
}
