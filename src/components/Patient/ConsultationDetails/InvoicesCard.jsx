import React, { useState, useEffect } from "react";
import { FileText, Download, Eye, EyeOff, Loader2, Receipt } from "lucide-react";
import { pdf } from '@react-pdf/renderer';
import api from "../../../api/axios";
import toast from "react-hot-toast";
import InvoicePDFDocument from "./InvoicePDFDocument";

export default function InvoicesCard({ 
  consultationId,
  clinicInfo,
}) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [generatingId, setGeneratingId] = useState(null);

  useEffect(() => {
    if (consultationId) {
      fetchInvoices();
    }
  }, [consultationId]);

  async function fetchInvoices() {
    setLoading(true);
    try {
      const response = await api.get(`/api/invoices/consultation/${consultationId}/`);
      setInvoices(response.data || []);
    } catch (e) {
      console.error("Erreur lors du chargement des factures:", e);
    } finally {
      setLoading(false);
    }
  }

  const handleDownload = async (invoice) => {
    setGeneratingId(invoice.id);
    try {
      const blob = await pdf(
        <InvoicePDFDocument invoice={invoice} clinicInfo={clinicInfo} />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture-${invoice.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Facture téléchargée");
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error("Erreur lors du téléchargement");
    } finally {
      setGeneratingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-3 bg-gradient-to-r from-green-50 to-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-green-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Factures</h3>
          </div>
        </div>
        <div className="p-4 text-center">
          <Loader2 className="w-6 h-6 text-green-600 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-3 bg-gradient-to-r from-green-50 to-white border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-green-600" />
            <h3 className="font-semibold text-slate-900 text-sm">
              Factures ({invoices.length})
            </h3>
          </div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="p-3 space-y-2">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-sm text-slate-900">
                    {invoice.number}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      invoice.statusInvoice === "paid"
                        ? "bg-green-100 text-green-700"
                        : invoice.statusInvoice === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {invoice.statusInvoice === "paid"
                      ? "Payée"
                      : invoice.statusInvoice === "pending"
                      ? "En attente"
                      : "Annulée"}
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  {invoice.amount} {invoice.currency.toUpperCase()} •{" "}
                  {new Date(invoice.created_at).toLocaleDateString("fr-FR")}
                  {invoice.paid_at && (
                    <span className="ml-1">
                      • Payée le {new Date(invoice.paid_at).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDownload(invoice)}
                disabled={generatingId === invoice.id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white text-xs font-medium rounded-lg transition"
              >
                {generatingId === invoice.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
