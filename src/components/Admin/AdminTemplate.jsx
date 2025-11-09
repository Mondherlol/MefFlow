import { Link } from 'react-router-dom';

export default function AdminTemplate({ title, children, breadcrumbs }) {
  // default breadcrumbs: Dashboard -> current title
  const crumbs = breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs : [
    { label: 'Tableau de bord', to: '/admin' },
    { label: title }
  ];

  return (
    <div className="min-h-[80dvh] bg-gradient-to-b from-slate-50 to-slate-100/40 p-6 md:p-10 relative">
      <div className="max-w-7xl mx-auto">
        {/* Back button top-left */}
        <div className="absolute left-6 top-6">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 bg-white/80 border border-slate-200 shadow-sm hover:bg-white"
          >
            ← Retour
          </Link>
        </div>

        <div className="mb-4 pt-8">
          <div className="mb-2">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">{title}</h1>
            {/* <p className="text-sm text-slate-500 mt-1">Gestion — {title}</p> */}
          </div>

          {/* Breadcrumbs */}
          <nav className="text-sm text-slate-500" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2">
              {crumbs.map((c, idx) => (
                <li key={idx} className="flex items-center">
                  {c.to && idx < crumbs.length - 1 ? (
                    <Link to={c.to} className="text-slate-600 hover:text-slate-800">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-slate-700">{c.label}</span>
                  )}
                  {idx < crumbs.length - 1 && (
                    <span className="mx-2 text-slate-400">/</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mt-4">
          {children}
        </div>
      </div>
    </div>
  );
}
