import React, { useEffect, useState } from "react";
import Card from "./Card";
import ClinicImage from "./ClinicImage";
import { ArrowRight, Stethoscope, HeartPulse, Activity } from "lucide-react";
import api from "../../../api/axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getImage = (imagePath) => {
  if (!imagePath) return null;
  return `${API_URL}/${imagePath}`;
}

export default function ServicesSection({ clinic, theme }) {

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

   const fetchServices = async () => {
    setLoading(true);
    try {
      console.log('Fetching services for clinic ID:', clinic.id);
      const response = await api.get(`/api/clinics/${clinic.id}/services/`);
      console.log('Services fetched:', response.data);
      if (response?.data?.data) setServices(response.data.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [clinic]);

  if (loading) {
    return (
      <section id="services" className="py-16 bg-gray-50/60">
        <div className="container mx-auto px-4 text-center">
          <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des services…</p>
        </div>
      </section>
    );
  }

  if(services.length === 0) {
    return null;
  }

  return (
    <section id="services" className="py-16 bg-gray-50/60">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Nos services</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <Card key={idx} className="overflow-hidden">
              {service.photo_url ? (
                <div className="relative">
                  <ClinicImage src={getImage(service.photo_url)} alt={service.name} className="w-full h-44" rounded="rounded-2xl rounded-b-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white/95 font-semibold flex items-center gap-2">
                    {service.icon ? <service.icon className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
                    {service.name}
                  </div>
                </div>
              ) : (
                <div className="p-6 pb-2 flex items-center gap-3">
                  {service.icon ? <service.icon className="w-6 h-6" style={{ color: theme.primary }} /> : <Stethoscope className="w-6 h-6" style={{ color: theme.primary }} />}
                  <h3 className="text-lg font-semibold">{service.name}</h3>
                </div>
              )}
              <div className="p-6 pt-4">
                {service.photo_url && <h3 className="text-lg font-semibold mb-2">{service.name}</h3>}
                <p className="text-gray-600 mb-4">{service.description}</p>
                <button className="inline-flex items-center gap-2 font-semibold group/lnk" style={{ color: theme.primary }}>
                  En savoir plus
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/lnk:translate-x-0.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
