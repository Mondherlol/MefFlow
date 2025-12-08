import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import PatientTemplate from "../../components/Patient/PatientTemplate";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useClinic } from "../../context/clinicContext";
import { getImageUrl } from "../../utils/image";
import ConsultationHeader from "../../components/Patient/ConsultationDetails/ConsultationHeader.jsx";
import PatientCard from "../../components/Patient/ConsultationDetails/PatientCard.jsx";
import DoctorCard from "../../components/Patient/ConsultationDetails/DoctorCard.jsx";
import AutoDiagnosticCard from "../../components/Patient/ConsultationDetails/AutoDiagnosticCard.jsx";
import PaymentModal from "../../components/Patient/ConsultationDetails/PaymentModal.jsx";
import DiagnosticSection from "../../components/Patient/ConsultationDetails/DiagnosticSection.jsx";
import PrescriptionSection from "../../components/Patient/ConsultationDetails/PrescriptionSection.jsx";
import PendingConsultation from "../../components/Patient/ConsultationDetails/PendingConsultation.jsx";
import DocumentsCard from "../../components/Patient/ConsultationDetails/DocumentsCard.jsx";
import InvoicesCard from "../../components/Patient/ConsultationDetails/InvoicesCard.jsx";
import { PDFDocument } from "../../components/PDFPrescription.jsx";

export default function ConsultationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clinic } = useClinic();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchConsultation();
  }, [id]);

  async function fetchConsultation() {
    setLoading(true);
    try {
      const res = await api.get(`/api/consultations/${id}/`);
      setConsultation(res.data);
      setPaid(res.data.payee );
    } catch (e) {
      toast.error("Impossible de charger la consultation.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!consultation) return;
    if (!confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) return;
    setActionLoading(true);
    try {
      await api.patch(`/api/consultations/${id}/cancel/`);
      toast.success('Consultation annulée');
      setConsultation({ ...consultation, statusConsultation: 'annule' });
    } catch (e) {
      toast.error('Erreur lors de l\'annulation');
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePay() {
    if (!consultation) return;
    setActionLoading(true);
    setShowPaymentModal(false);
    try {
      const response = await api.post('/api/payments/checkout/', {
        consultation_id: id
      });
      
      // Rediriger vers la page de paiement Stripe
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        toast.error('URL de paiement non reçue');
        setActionLoading(false);
      }
    } catch (e) {
      toast.error('Erreur lors de l\'initialisation du paiement');
      console.error(e);
      setActionLoading(false);
    }
  }

  if (loading) return (
    <PatientTemplate title="Consultation" breadcrumbs={[{ label: 'Consultation' }]}>
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 text-sm">Chargement...</p>
        </div>
      </div>
    </PatientTemplate>
  );

  if (!consultation) return (
    <PatientTemplate title="Consultation" breadcrumbs={[{ label: 'Consultation' }]}>
      <div className="py-12 text-center">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-900 mb-2">Consultation introuvable</h3>
        <p className="text-slate-600 text-sm">La consultation demandée n'existe pas ou a été supprimée.</p>
      </div>
    </PatientTemplate>
  );

  const status = (consultation.statusConsultation || '').toLowerCase();
  const patient = consultation.patient || {};
  const doctor = consultation.doctor || {};

  return (
    <>
      {showPaymentModal && (
        <PaymentModal
          doctor={doctor}
          tarif={consultation.tarif_consultation}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handlePay}
          actionLoading={actionLoading}
        />
      )}
      
      <PatientTemplate 
        title={`Consultation — ${consultation.id ? String(consultation.id).slice(0,8) : ''}`} 
        breadcrumbs={[
          { label: 'Accueil', to: '/patient' }, 
          { label: 'Consultations', to: '/patient/appointments' }, 
          { label: 'Détails' }
        ]}
      >
        <div className="space-y-4">
          <ConsultationHeader
            consultation={consultation}
            doctor={doctor}
            patient={patient}
            onCancel={handleCancel}
            actionLoading={actionLoading}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <PatientCard patient={patient} />
              
              <DoctorCard
                doctor={doctor}
                tarif={consultation.tarif_consultation}
                paid={paid}
                onPay={() => setShowPaymentModal(true)}
                actionLoading={actionLoading}
                isTermine={status === 'termine'}
              />

              {status === 'termine' && consultation.ordonnance && (
                <DocumentsCard
                  prescription={consultation.ordonnance}
                  doctorName={doctor.full_name}
                  patientName={patient.full_name}
                  date={consultation.date}
                  consultationId={consultation.id}
                  isPaid={paid}
                  onPay={() => setShowPaymentModal(true)}
                  tarif={consultation.tarif_consultation}
                  clinicInfo={{
                    name: clinic?.name || 'Clinique MedFlow',
                    address: clinic?.address || '',
                    phone: clinic?.phone || '',
                    email: clinic?.email || '',
                    logo: clinic?.logo ? getImageUrl(clinic.logo) : null,
                  }}
                  doctorInfo={{
                    signature: doctor?.signature ? getImageUrl(doctor.signature) : null,
                  }}
                  PDFDocumentComponent={
                    <PDFDocument
                      prescription={consultation.ordonnance}
                      doctorName={doctor.full_name}
                      patientName={patient.full_name}
                      date={consultation.date}
                      consultationId={consultation.id}
                      clinicInfo={{
                        name: clinic?.name || 'Clinique MedFlow',
                        address: clinic?.address || '',
                        phone: clinic?.phone || '',
                        email: clinic?.email || '',
                        logo: clinic?.logo ? getImageUrl(clinic.logo) : null,
                      }}
                      doctorSignature={doctor?.signature ? getImageUrl(doctor.signature) : null}
                    />
                  }
                />
              )}

              <InvoicesCard
                consultationId={consultation.id}
                clinicInfo={{
                  name: clinic?.name || 'Clinique MedFlow',
                  address: clinic?.address || '',
                  phone: clinic?.phone || '',
                  email: clinic?.email || '',
                  logo: clinic?.logo ? getImageUrl(clinic.logo) : null,
                }}
              />

              <AutoDiagnosticCard autoDiagnostic={consultation.auto_diagnostic} />
            </div>

            {/* Main content area */}
            <div className="lg:col-span-2">
              {status !== 'termine' ? (
                <PendingConsultation status={status} />
              ) : (
                <div className="space-y-4">
                  <DiagnosticSection
                    diagnostic={consultation.diagnostique}
                    tarif={consultation.tarif_consultation}
                    isPaid={paid}
                    onUnlock={() => setShowPaymentModal(true)}
                  />

                  <PrescriptionSection
                    prescription={consultation.ordonnance}
                    doctorName={doctor.full_name}
                    patientName={patient.full_name}
                    date={consultation.date}
                    consultationId={consultation.id}
                    tarif={consultation.tarif_consultation}
                    isPaid={paid}
                    onUnlock={() => setShowPaymentModal(true)}
                    clinicInfo={{
                      name: clinic?.name || 'Clinique MedFlow',
                      address: clinic?.address || '',
                      phone: clinic?.phone || '',
                      email: clinic?.email || '',
                      logo: clinic?.logo ? getImageUrl(clinic.logo) : null,
                    }}
                    doctorInfo={{
                      signature: doctor?.signature ? getImageUrl(doctor.signature) : null,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </PatientTemplate>
    </>
  );
}