import React from 'react';
import { Image as ImageIcon, Edit3, Trash2, Tag, Hash } from 'lucide-react';


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ServiceCard({ service, onEdit, onDelete, actionLoading }) {
  return (
    <div
      className="group relative rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition
                 hover:shadow-md hover:-translate-y-0.5"
    >
      {/* top-right soft glow */}
      <span className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full bg-sky-200/20 blur-2xl" />

      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-slate-100 ring-1 ring-inset ring-slate-200 overflow-hidden grid place-items-center shrink-0">
          {service.photo_url ? (
            <img src={`${API_URL}/${service.photo_url}`} alt={service.name} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-7 h-7 text-slate-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900 truncate">{service.name}</h3>
            {service.code && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 ring-1 ring-inset ring-slate-200 px-2 py-0.5 text-xs text-slate-700">
                <Hash className="w-3 h-3" />
                {service.code}
              </span>
            )}
          </div>
          {service.description && (
            <p className="mt-1 text-sm text-slate-600 line-clamp-3">{service.description}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          onClick={() => onEdit(service)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700
                     hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200"
        >
          <Edit3 className="w-4 h-4" />
          Modifier
        </button>
        <button
          onClick={() => onDelete(service)}
          disabled={actionLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm
                     hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-300 disabled:opacity-80"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer
        </button>
      </div>
    </div>
  );
}
