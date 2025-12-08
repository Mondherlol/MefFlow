// components/PDFPrescription.tsx
import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  // Header avec logo et info clinique
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '3px solid #0ea5e9',
  },
  logoSection: {
    width: '30%',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 5,
  },
  clinicInfo: {
    width: '65%',
    textAlign: 'right',
  },
  clinicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  clinicDetails: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 2,
  },
  // Titre de l'ordonnance
  titleContainer: {
    backgroundColor: '#f0f9ff',
    padding: 15,
    marginBottom: 25,
    borderRadius: 8,
    borderLeft: '4px solid #0ea5e9',
  },
  title: {
    fontSize: 22,
    color: '#0c4a6e',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  consultationId: {
    fontSize: 10,
    color: '#64748b',
  },
  // Section patient et médecin
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
  },
  infoBlock: {
    width: '48%',
  },
  infoLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 12,
    color: '#0f172a',
    marginBottom: 3,
  },
  // Prescription
  prescriptionSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#0c4a6e',
    marginBottom: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: 6,
  },
  medicineItem: {
    fontSize: 11,
    marginBottom: 10,
    paddingLeft: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderLeft: '3px solid #0ea5e9',
    borderRadius: 4,
  },
  medicineText: {
    color: '#334155',
    lineHeight: 1.5,
  },
  // Signature
  signatureSection: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '2px solid #e2e8f0',
  },
  signatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  signatureBlock: {
    width: '45%',
  },
  signatureLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 8,
  },
  doctorName: {
    fontSize: 12,
    color: '#0f172a',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  signatureImage: {
    width: 120,
    height: 60,
    marginTop: 10,
  },
  stampText: {
    fontSize: 8,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 15,
    borderTop: '1px solid #e2e8f0',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 3,
  },
  validityText: {
    fontSize: 9,
    color: '#0ea5e9',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

const PDFDocument = ({ prescription, doctorName, patientName, date, consultationId, clinicInfo, doctorSignature }) => {
  // Nettoyer la prescription des numéros
  const cleanPrescription = prescription.split('\n').map(line => {
    return line.replace(/^\d+\.\s*/, '').trim();
  }).filter(line => line.length > 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header avec logo et info clinique */}
        <View style={styles.headerContainer}>
          <View style={styles.logoSection}>
            {clinicInfo?.logo && (
              <Image src={clinicInfo.logo} style={styles.logo} />
            )}
          </View>
          <View style={styles.clinicInfo}>
            <Text style={styles.clinicName}>{clinicInfo?.name || 'Clinique MedFlow'}</Text>
            <Text style={styles.clinicDetails}>{clinicInfo?.address || 'Adresse de la clinique'}</Text>
            <Text style={styles.clinicDetails}>Tél: {clinicInfo?.phone || '+212 XXX XXX XXX'}</Text>
            <Text style={styles.clinicDetails}>Email: {clinicInfo?.email || 'contact@medflow.ma'}</Text>
          </View>
        </View>

        {/* Titre */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>ORDONNANCE MÉDICALE</Text>
          <Text style={styles.consultationId}>Référence: #{consultationId}</Text>
        </View>

        {/* Infos Patient et Médecin */}
        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Patient</Text>
            <Text style={styles.infoValue}>{patientName}</Text>
            <Text style={[styles.clinicDetails, { marginTop: 4 }]}>Date de consultation: {date}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Médecin prescripteur</Text>
            <Text style={styles.infoValue}>{doctorName}</Text>
            <Text style={[styles.clinicDetails, { marginTop: 4 }]}>Date d'édition: {new Date().toLocaleDateString('fr-FR')}</Text>
          </View>
        </View>

        {/* Prescription */}
        <View style={styles.prescriptionSection}>
          <Text style={styles.sectionTitle}>Prescription</Text>
          {cleanPrescription.map((line, index) => (
            <View key={index} style={styles.medicineItem}>
              <Text style={styles.medicineText}>
                {index + 1}. {line}
              </Text>
            </View>
          ))}
        </View>

        {/* Signature */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureContainer}>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureLabel}>Date et lieu</Text>
              <Text style={styles.doctorName}>
                {new Date().toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </Text>
              <Text style={styles.stampText}>Cachet de la clinique</Text>
            </View>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureLabel}>Signature du médecin</Text>
              <Text style={styles.doctorName}>{doctorName}</Text>
              {doctorSignature && (
                <Image src={doctorSignature} style={styles.signatureImage} />
              )}
              {!doctorSignature && (
                <View style={{ 
                  borderBottom: '1px solid #cbd5e1', 
                  marginTop: 30,
                  marginBottom: 10 
                }} />
              )}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.validityText}>
            ⚕ Ordonnance valable 3 mois à compter de la date de prescription ⚕
          </Text>
          <Text style={styles.footerText}>
            Ce document médical est confidentiel et ne peut être utilisé que par le patient désigné
          </Text>
          <Text style={styles.footerText}>
            Document généré électroniquement le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Exporter le PDFDocument pour pouvoir l'utiliser dans d'autres composants
export { PDFDocument };

export default function PDFPrescription({ prescription, doctorName, patientName, date, consultationId, clinicInfo, doctorInfo }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(
        <PDFDocument 
          prescription={prescription} 
          doctorName={doctorName} 
          patientName={patientName} 
          date={date} 
          consultationId={consultationId}
          clinicInfo={clinicInfo}
          doctorSignature={doctorInfo?.signature}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ordonnance-${patientName.replace(/\s/g, '_')}-${consultationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Nettoyer la prescription des numéros pour l'affichage
  const cleanPrescription = prescription.split('\n').map(line => {
    return line.replace(/^\d+\.\s*/, '').trim();
  }).filter(line => line.length > 0);

  return (
    <div className="space-y-4">
      {/* Carte d'information */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Ordonnance Médicale</h3>
              <p className="text-xs text-slate-500 mt-0.5">Consultation du {date}</p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-sky-600 to-blue-600 text-white hover:from-sky-700 hover:to-blue-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md text-sm font-medium"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Télécharger PDF
              </>
            )}
          </button>
        </div>

        {/* Liste des médicaments */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Prescription</h4>
          <ol className="space-y-2.5 list-none">
            {cleanPrescription.map((line, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-100 hover:border-sky-200 transition-colors">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center text-sky-700 text-sm font-semibold shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm text-slate-700 flex-1 leading-relaxed pt-0.5">{line}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Info médecin et date */}
        <div className="mt-5 pt-5 border-t border-slate-200 flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-500 mb-1">Prescrit par</p>
            <p className="text-sm font-semibold text-slate-900">{doctorName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-1">Date de prescription</p>
            <p className="text-sm font-semibold text-slate-900">{date}</p>
          </div>
        </div>
      </div>

      {/* Note importante */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-4 border border-sky-100">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-sky-600 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="text-sky-900 font-medium mb-1">Informations importantes</p>
            <p className="text-sky-800 text-xs leading-relaxed">
              Cette ordonnance est valable pendant <strong>3 mois</strong> à compter de la date de prescription. 
              Présentez ce document à votre pharmacien pour obtenir vos médicaments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}