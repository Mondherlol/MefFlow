import AdminTemplate from '../../components/Admin/AdminTemplate';

export default function Factures() {
  return (
    <AdminTemplate title="Factures">
      <p className="text-sm text-slate-600">Liste des factures, export PDF/CSV et envoi par email.</p>
      {/* TODO: factures table, filtres, export */}
    </AdminTemplate>
  );
}
