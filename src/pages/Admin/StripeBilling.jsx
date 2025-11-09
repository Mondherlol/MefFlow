import AdminTemplate from '../../components/Admin/AdminTemplate';

export default function StripeBilling() {
  return (
    <AdminTemplate title="Paiements Stripe">
      <p className="text-sm text-slate-600">Encaissements, remboursements et rapprochements Stripe.</p>
      {/* TODO: intégration Stripe, actions, logs */}
    </AdminTemplate>
  );
}
