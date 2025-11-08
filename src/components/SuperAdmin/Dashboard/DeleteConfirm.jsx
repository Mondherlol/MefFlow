import Button from "./Button";

export default function DeleteConfirm({ open, clinic, tokens, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className={`w-full bg-white max-w-md mx-4 ${tokens.card} rounded-lg shadow-lg border border-slate-200`} onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4">
          <h3 className="text-lg font-medium">Confirmer la suppression</h3>
          <p className="mt-2 text-sm text-slate-600">Voulez-vous vraiment supprimer la clinique <strong className="text-slate-800">{clinic?.name}</strong> ? Cette action est irréversible.</p>
        </div>
        <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3 rounded-b-lg">
          <Button variant="subtle" onClick={(e) => { e.stopPropagation(); onClose(); }}>Annuler</Button>
          <Button variant="outline" className="text-red-600" onClick={(e) => { e.stopPropagation(); onConfirm(); }}>Supprimer</Button>
        </div>
      </div>
    </div>
  );
}
