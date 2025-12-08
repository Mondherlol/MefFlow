import React from "react";
import { User } from "lucide-react";
import { getImageUrl } from "../../../utils/image.jsx";

export default function PatientCard({ patient }) {
  const avatar = getImageUrl(patient.photo_url || null);

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200">
      <div className="flex items-center gap-3">
        {avatar ? (
          <img src={avatar} alt={patient.full_name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-2 border-slate-100 flex-shrink-0">
            <User className="w-6 h-6 text-blue-600" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 text-sm truncate">{patient.full_name}</h3>
          <p className="text-xs text-slate-600 truncate">{patient.email}</p>
          {patient.phone && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">{patient.phone}</p>
          )}
        </div>
      </div>
    </div>
  );
}
