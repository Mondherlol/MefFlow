// src/pages/doctor/Home.jsx
import React, { use, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock, DollarSign, Edit, Pause } from "lucide-react";
import StatCard from "../../components/SuperAdmin/Dashboard/StatCard";
import { useAuth } from "../../context/authContext";
import toast from "react-hot-toast";

import TimelineCompact from "../../components/Doctor/HomeComponents/TimelineCompact";
import ConsultationsPanel from "../../components/Doctor/HomeComponents/ConsultationsPanel";
import MiniAction from "../../components/Doctor/HomeComponents/MiniAction";
import { timeToMin, minToTime, nowMinutes } from "../../utils/timeUtils";
import api from "../../api/axios";


const MOCK_EVENTS = [
  { id: "e1", time: "08:30", patient: "Martin Dupont", status: "confirmed", duration: 30 },
  { id: "e2", time: "09:15", patient: "Sophie Leroux", status: "confirmed", duration: 30 },
  { id: "e3", time: "10:00", patient: "Julien Marchand", status: "cancelled", duration: 30 },
  { id: "e4", time: "11:30", patient: "Laura Petit", status: "confirmed", duration: 30 },
  { id: "e5", time: "14:00", patient: "Nora Salim", status: "confirmed", duration: 60 },
  { id: "e6", time: "15:30", patient: "Marc Blond", status: "confirmed", duration: 30 },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNow, setShowNow] = useState(false);

  // state events (mock) — remplace par fetch API dans useEffect si besoin
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true); 

  // selected time et ses consultations
  const [selectedTime, setSelectedTime] = useState(null);
  const [eventsAtTime, setEventsAtTime] = useState([]);

  // sélection d'un créneau depuis la timeline
  const onSelectTime = (t, evs = null) => {
    setSelectedTime(t);
    if (evs) setEventsAtTime(evs);
    else setEventsAtTime(events.filter((e) => e.time === t));
  };

  // When events update, keep eventsAtTime consistent
  useEffect(() => {
    if (!selectedTime) return;
    const evs = events.filter((e) => e.time === selectedTime);
    setEventsAtTime(evs);
  }, [events, selectedTime]);


  const fetchConsultations = async () => {
    try {
      setLoading(true);
      // Today with YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];
      const response = await api.get(`/api/consultations/?date=${today}`);
      console.log("consultations : ", response.data.data);
      setConsultations(response.data.data);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      toast.error("Erreur lors du chargement des consultations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  return (
    <div className="min-h-[80dvh] bg-linear-to-b from-slate-50 to-slate-100/60 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Tableau de bord — Médecin</h1>
            <p className="text-sm text-slate-500 mt-1">Vue compacte pour la journée — timeline + RDV intégrés.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">
              Bonjour,&nbsp;<span className="font-medium text-slate-900">{user?.doctor?.user?.full_name || user?.name || "Médecin"}</span>
            </div>

        
          </div>
        </header>

        {/* Top tiles */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 border border-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Aujourd'hui</div>
                <div className="text-xl font-semibold text-slate-900">Planning & rendez-vous</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-56">
                  <StatCard icon={<CalendarDays className="h-5 w-5" />} label="Total des RDV" value={consultations.length} />
                </div>

                
              </div>
            </div>

            {/* Fusion timeline + liste : grid 2 cols inside */}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                {/* timeline compact left */}
                <TimelineCompact consultations={consultations} start={8} end={18} step={30} onSelectTime={onSelectTime} />
              </div>

              <div className="lg:col-span-2 flex flex-col gap-4">
                <ConsultationsPanel 
                  consultations={consultations}
                  selectedTime={selectedTime}
                  showNow={showNow}
                  setSelectedTime={setSelectedTime}
                  setShowNow={setShowNow}
                  loading={loading}
                />
              </div>
            </div>
          </div>

          {/* Right column: actions & stats */}
          <aside className="space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
              <div className="text-xs text-slate-400">Actions</div>
              <div className="mt-3 flex flex-col gap-2">
                <MiniAction title="Consulter Emploi du temps" Icon={CalendarDays} onClick={() => navigate("/doctor/emploi")} />
                <MiniAction title="Modifier mes Horaires" Icon={Clock} onClick={() => navigate("/doctor/horaires")} />
                <MiniAction title="Modifier mes Tarifs" Icon={DollarSign} onClick={() => navigate("/doctor/tarifs")} />
                <MiniAction title="Editer mon Profil" Icon={Edit} onClick={() => navigate("/doctor/profile/edit")} />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
              <div className="text-xs text-slate-400">Stats du jour</div>
                <div className="mt-3 space-y-2">
                  <div>
                    <StatCard icon={<CalendarDays className="h-5 w-5" />} label="Consultations" value={consultations.length} />
                  </div>
                  <div>
                    <StatCard icon={<DollarSign className="h-5 w-5" />} label="Argent généré" value={`${consultations.length * user?.doctor?.tarif_consultation || 0} TND `} />
                  </div>
                  
                </div>
            </div>
          </aside>
        </section>

        <footer className="text-sm text-slate-500">Interface Médecin - MedFlow © 2025</footer>
      </div>
    </div>
  );
}
