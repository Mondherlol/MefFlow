import AdminTemplate from '../../components/Admin/AdminTemplate';

export default function Patients() {
  return (
    <AdminTemplate title="Gérer patients">
      <p className="text-sm text-slate-600">Liste des patients, dossiers médicaux et rendez-vous.</p>
      {/* TODO: historique patient, recherche, actions */}
    </AdminTemplate>
  );
}
