import AdminTemplate from '../../components/Admin/AdminTemplate';

export default function Medecins() {
  return (
    <AdminTemplate title="Gérer médecins">
      <p className="text-sm text-slate-600">Ici vous pouvez gérer les profils des médecins, spécialités et plannings.</p>
      {/* TODO: ajouter liste, profil, planning */}
    </AdminTemplate>
  );
}
