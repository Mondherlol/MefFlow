import React from "react";
import { Calendar, Clock, User } from "lucide-react";

export default function PatientPreferredSlots({ patientOptions, patientName, onSlotSelect, selectedSlot }) {
    if (!patientOptions || patientOptions.length === 0) {
        return null;
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 shadow-sm border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-600 text-white">
                    <User className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-900">
                        Créneaux préférés de {patientName}
                    </h3>
                    <p className="text-xs text-slate-600">
                        Le patient a indiqué {patientOptions.length} créneau{patientOptions.length > 1 ? 'x' : ''} de préférence
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {patientOptions.map((slot, idx) => {
                    const slotDate = new Date(slot.date);
                    const isSelected = selectedSlot && 
                        selectedSlot.date === slot.date && 
                        selectedSlot.start === slot.start;
                    
                    return (
                        <button
                            key={idx}
                            onClick={() => onSlotSelect(slot)}
                            className={`text-left p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                                isSelected 
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                                    : 'bg-white border-blue-200 text-slate-700 hover:border-blue-400 hover:shadow-md'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className={`w-4 h-4 ${isSelected ? 'text-blue-100' : 'text-blue-600'}`} />
                                <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                    {slotDate.toLocaleDateString('fr-FR', { 
                                        weekday: 'short', 
                                        day: '2-digit', 
                                        month: 'short' 
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className={`w-4 h-4 ${isSelected ? 'text-blue-100' : 'text-blue-600'}`} />
                                <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-blue-700'}`}>
                                    {slot.start}
                                </span>
                            </div>
                            {isSelected && (
                                <div className="mt-2 text-xs font-semibold text-blue-100">
                                    ✓ Sélectionné
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 p-3 bg-white/60 rounded-lg border border-blue-100">
                <p className="text-xs text-slate-600">
                    💡 <span className="font-semibold">Astuce :</span> Cliquez sur un créneau préféré pour le sélectionner automatiquement dans le calendrier.
                </p>
            </div>
        </div>
    );
}
