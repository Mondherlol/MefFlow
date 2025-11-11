import React from "react";
import ClinicImage from "./ClinicImage";
import InfoPill from "./InfoPill";
import { Users, Star, Clock, MapPin } from "lucide-react";
import { getImageUrl } from "../../../utils/image";


export default function AboutSection({ clinic }) {
  return (
    <section id="about" className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">À propos de notre clinique</h2>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <ClinicImage src={getImageUrl(clinic.about_image_url)} alt="À propos de notre clinique" className="w-full h-72 md:h-80" />
            <div className="space-y-6">
              <p className="text-lg leading-relaxed">
                {clinic.about_text || `Notre clinique s'engage à fournir des soins d'excellence dans un environnement moderne et accueillant. Notre équipe pluridisciplinaire met tout en œuvre pour votre bien‑être, de la prévention au suivi personnalisé.`}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <InfoPill icon={Users} color="text-gray-700">Équipe expérimentée</InfoPill>
                <InfoPill icon={Star} color="text-gray-700">Qualité certifiée</InfoPill>
                <InfoPill icon={Clock} color="text-gray-700">Urgences 24/7</InfoPill>
                <InfoPill icon={MapPin} color="text-gray-700">Accès facile</InfoPill>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
