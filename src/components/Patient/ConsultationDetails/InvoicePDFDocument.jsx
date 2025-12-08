import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    backgroundColor: '#ffffff',
  },
  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: '3px solid #059669',
  },
  logoSection: {
    width: '30%',
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain',
  },
  clinicInfo: {
    width: '65%',
    textAlign: 'right',
  },
  clinicName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 3,
  },
  clinicDetails: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 1,
  },
  // Title
  titleContainer: {
    backgroundColor: '#f0fdf4',
    padding: 10,
    marginBottom: 15,
    borderRadius: 6,
    borderLeft: '4px solid #059669',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#064e3b',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 9,
    color: '#64748b',
  },
  // Invoice details section
  invoiceDetailsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  detailsColumn: {
    width: '48%',
  },
  label: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 2,
    textTransform: 'uppercase',
    fontFamily: 'Helvetica-Bold',
  },
  value: {
    fontSize: 10,
    color: '#0f172a',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
  },
  statusBadge: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '4 10',
    borderRadius: 3,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  statusBadgePending: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  statusBadgeCancelled: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  // Patient/Doctor sections
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#064e3b',
    marginBottom: 6,
    paddingBottom: 4,
    borderBottom: '2px solid #e2e8f0',
    textTransform: 'uppercase',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 4,
    borderLeft: '3px solid #059669',
  },
  infoName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  infoDetails: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 2,
  },
  // Table
  table: {
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    padding: 6,
    borderBottom: '2px solid #059669',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
  },
  tableCol1: {
    flex: 3,
  },
  tableCol2: {
    flex: 1,
    textAlign: 'right',
  },
  tableCol3: {
    flex: 1,
    textAlign: 'right',
  },
  tableCol4: {
    flex: 1,
    textAlign: 'right',
  },
  headerText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#064e3b',
  },
  cellText: {
    fontSize: 9,
    color: '#334155',
  },
  cellTextBold: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  // Total section
  totalSection: {
    marginTop: 15,
    paddingTop: 12,
    borderTop: '2px solid #e2e8f0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 10,
    color: '#64748b',
    marginRight: 30,
    width: 100,
    textAlign: 'right',
  },
  totalValue: {
    fontSize: 10,
    color: '#0f172a',
    fontFamily: 'Helvetica-Bold',
    width: 80,
    textAlign: 'right',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 4,
    marginTop: 6,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#059669',
    marginRight: 30,
    width: 100,
    textAlign: 'right',
  },
  grandTotalValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#059669',
    width: 80,
    textAlign: 'right',
  },
  // Payment info
  paymentInfo: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#ecfdf5',
    borderRadius: 4,
    borderLeft: '3px solid #059669',
  },
  paymentText: {
    fontSize: 8,
    color: '#065f46',
    marginBottom: 2,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 30,
    right: 30,
    paddingTop: 10,
    borderTop: '1px solid #e2e8f0',
  },
  footerText: {
    fontSize: 7,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 2,
  },
  footerHighlight: {
    fontSize: 8,
    color: '#059669',
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
  },
});

export default function InvoicePDFDocument({ invoice, clinicInfo }) {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount, currency) => {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'PAYÉE';
      case 'pending':
        return 'EN ATTENTE';
      case 'cancelled':
        return 'ANNULÉE';
      default:
        return status?.toUpperCase() || '-';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'paid':
        return styles.statusBadge;
      case 'pending':
        return [styles.statusBadge, styles.statusBadgePending];
      case 'cancelled':
        return [styles.statusBadge, styles.statusBadgeCancelled];
      default:
        return styles.statusBadge;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
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

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>FACTURE</Text>
          <Text style={styles.subtitle}>Référence: {invoice.number}</Text>
        </View>

        {/* Invoice Details */}
        <View style={styles.invoiceDetailsSection}>
          <View style={styles.detailsColumn}>
            <Text style={styles.label}>Date d'émission</Text>
            <Text style={styles.value}>{formatDate(invoice.created_at)}</Text>
            
            {invoice.paid_at && (
              <>
                <Text style={styles.label}>Date de paiement</Text>
                <Text style={styles.value}>{formatDate(invoice.paid_at)}</Text>
              </>
            )}
            
            <Text style={styles.label}>Consultation</Text>
            <Text style={styles.value}>
              {new Date(invoice.consultation?.date).toLocaleDateString('fr-FR')}
            </Text>
          </View>
          
          <View style={styles.detailsColumn}>
            <Text style={styles.label}>Statut de la facture</Text>
            <View style={getStatusStyle(invoice.statusInvoice)}>
              <Text>{getStatusText(invoice.statusInvoice)}</Text>
            </View>
            
            <Text style={styles.label}>N° de facture</Text>
            <Text style={styles.value}>{invoice.number}</Text>
          </View>
        </View>

        {/* Patient Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations du patient</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoName}>{invoice.patient?.full_name}</Text>
            {invoice.patient?.email && (
              <Text style={styles.infoDetails}>Email: {invoice.patient.email}</Text>
            )}
            {invoice.patient?.phone && (
              <Text style={styles.infoDetails}>Téléphone: {invoice.patient.phone}</Text>
            )}
          </View>
        </View>

        {/* Doctor Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Médecin traitant</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoName}>Dr. {invoice.consultation?.doctor?.full_name}</Text>
            {invoice.consultation?.doctor?.specialite && (
              <Text style={styles.infoDetails}>
                Spécialité: {invoice.consultation.doctor.specialite}
              </Text>
            )}
            {invoice.consultation?.doctor?.email && (
              <Text style={styles.infoDetails}>
                Email: {invoice.consultation.doctor.email}
              </Text>
            )}
          </View>
        </View>

        {/* Services Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de la facturation</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <View style={styles.tableCol1}>
                <Text style={styles.headerText}>Description</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text style={styles.headerText}>Quantité</Text>
              </View>
              <View style={styles.tableCol3}>
                <Text style={styles.headerText}>Prix unitaire</Text>
              </View>
              <View style={styles.tableCol4}>
                <Text style={styles.headerText}>Total</Text>
              </View>
            </View>
            
            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={styles.cellTextBold}>{invoice.description}</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text style={styles.cellText}>1</Text>
              </View>
              <View style={styles.tableCol3}>
                <Text style={styles.cellText}>
                  {formatCurrency(invoice.amount, invoice.currency)}
                </Text>
              </View>
              <View style={styles.tableCol4}>
                <Text style={styles.cellTextBold}>
                  {formatCurrency(invoice.amount, invoice.currency)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Total Section */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.amount, invoice.currency)}
            </Text>
          </View>
          
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total à payer:</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(invoice.amount, invoice.currency)}
            </Text>
          </View>
        </View>

        {/* Payment confirmation */}
        {invoice.statusInvoice === 'paid' && invoice.paid_at && (
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentText}>
              ✓ Cette facture a été réglée le {formatDate(invoice.paid_at)}
            </Text>
            <Text style={styles.paymentText}>
              Merci pour votre confiance
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Document généré automatiquement • {clinicInfo?.name || 'Clinique MedFlow'}
          </Text>
          <Text style={styles.footerText}>
            {clinicInfo?.address || ''} • Tél: {clinicInfo?.phone || ''}
          </Text>
          {invoice.statusInvoice === 'paid' && (
            <Text style={styles.footerHighlight}>
              FACTURE ACQUITTÉE
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
}
