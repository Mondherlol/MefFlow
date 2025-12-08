import React, { useState, useEffect } from "react";
import { FileText, Download, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { pdf } from '@react-pdf/renderer';

export default function DocumentsCard({ 
  prescription, 
  doctorName, 
  patientName, 
  date, 
  consultationId,
  clinicInfo,
  doctorInfo,
  PDFDocumentComponent,
  isPaid,
  onPay,
  tarif
}) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    if (prescription && PDFDocumentComponent && isPaid) {
      generatePdfPreview();
    }
  }, [prescription, doctorName, patientName, date, consultationId, isPaid]);

  const generatePdfPreview = async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(
        PDFDocumentComponent
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Erreur lors de la génération de la preview:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(PDFDocumentComponent).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ordonnance-${patientName.replace(/\s/g, '_')}-${consultationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!prescription) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-3 bg-gradient-to-r from-orange-50 to-white border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Documents</h3>
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
        <div className="p-3 space-y-3">
          {/* Preview du PDF */}
          {isGenerating ? (
            <div className="flex items-center justify-center h-48 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Génération...</p>
              </div>
            </div>
          ) : isPaid && pdfUrl ? (
            <div className="relative group">
              <div className="rounded-lg overflow-hidden border-2 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <iframe
                  src={pdfUrl}
                  className="w-full h-48 bg-white"
                  title="Aperçu de l'ordonnance"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
            </div>
          ) : (
            <div className="relative">
              <div className="rounded-lg overflow-hidden border-2 border-slate-200 shadow-sm blur-sm">
                <div className="w-full h-48 bg-white p-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-orange-100 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded w-full"></div>
                    <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                    <div className="h-3 bg-slate-100 rounded w-full"></div>
                    <div className="mt-4 space-y-2">
                      <div className="h-3 bg-orange-50 rounded w-2/3"></div>
                      <div className="h-3 bg-orange-50 rounded w-3/4"></div>
                      <div className="h-3 bg-orange-50 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-transparent flex items-center justify-center rounded-lg">
                <button
                  onClick={onPay}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-orange-700 text-white font-semibold hover:from-orange-700 hover:to-orange-800 text-sm shadow-lg"
                >
                  <Lock className="w-4 h-4" />
                  Débloquer · {tarif} €
                </button>
              </div>
            </div>
          )}

          {/* Bouton de téléchargement seulement si payé */}
          {isPaid && (
            <button
              onClick={handleDownload}
              disabled={isGenerating || !pdfUrl}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 transition-all shadow-sm hover:shadow text-sm font-medium"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Télécharger l'ordonnance
                </>
              )}
            </button>
          )}

          {/* Info */}
          {isPaid && (
            <div className="text-xs text-slate-500 text-center">
              <p>Document généré automatiquement</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
