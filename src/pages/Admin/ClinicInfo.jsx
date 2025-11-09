import AdminTemplate from '../../components/Admin/AdminTemplate';

export default function ClinicInfo() {
  return (
    <AdminTemplate title="Infos clinique">
      <p className="text-sm text-slate-600">Coordonnées, horaires, couleurs et médias de la clinique.</p>
      {/* TODO: forms for clinic info, media upload, theme */}
    </AdminTemplate>
  );
}
