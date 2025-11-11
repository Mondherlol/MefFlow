import { ArrowRight, CalendarCheck, ShieldCheck, Star } from "lucide-react";
import { withAlpha } from "../../../utils/colors";
import ClinicImage from "./ClinicImage";
import InfoPill from "./InfoPill";
import CTAButton from "./CTAButton";

import { motion } from "motion/react";
import { getImageUrl } from "../../../utils/image";


function Hero({ clinic, theme }) {
    return ( <>
          <div className="absolute inset-0 overflow-hidden rounded-b-[3rem]">
          {clinic.hero_image_url ? (
            <ClinicImage src={getImageUrl(clinic.hero_image_url)} alt="Image principale de la clinique" className="w-full h-full" rounded="rounded-b-[3rem]" />
          ) : (
            <div className="w-full h-full rounded-b-[3rem]"
                 style={{ background: `linear-gradient(135deg, ${withAlpha(theme.primary,.9)} 0%, ${withAlpha(theme.secondary,.9)} 100%)` }} />
          )}
          <div className="absolute inset-0 rounded-b-[3rem]" style={{ background: `linear-gradient(180deg, ${withAlpha('#000',.35)} 0%, ${withAlpha('#000',.55)} 65%, ${withAlpha('#000',.65)} 100%)` }} />
        </div>

        <div className="relative container mx-auto px-4 text-center text-white">
          <div className="mx-auto max-w-3xl">
            <motion.div className="mb-4 flex items-center justify-center gap-2" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }}>
              <InfoPill icon={ShieldCheck} color="text-white" ringColor="ring-white/30">Clinique certifiée</InfoPill>
              <InfoPill icon={Star} color="text-white" ringColor="ring-white/30">4,9/5 patients satisfaits</InfoPill>
            </motion.div>

            <motion.h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-[1.1]" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.65 }}>
              {clinic.slogan || "Votre santé, notre priorité"}
            </motion.h1>

            <motion.p className="text-lg md:text-xl text-white/90 mb-8" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, delay: 0.05 }}>
              {clinic.subtitle || "Des soins médicaux de qualité dans un environnement chaleureux et professionnel."}
            </motion.p>

            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, delay: 0.08 }}>
              <CTAButton
                className="shadow-lg"
                style={{ backgroundColor: theme.accent, boxShadow: `0 10px 30px -10px ${withAlpha(theme.accent,.8)}` }}
                aria-label="Prendre rendez-vous"
              >
                <CalendarCheck className="w-5 h-5" />
                Prendre rendez-vous
              </CTAButton>
              <CTAButton
                className="border-2 text-white hover:bg-white/15"
                style={{ borderColor: "white" }}
                aria-label="Voir nos services"
              >
                Nos services
                <ArrowRight className="w-4 h-4" />
              </CTAButton>
            </motion.div>
          </div>
        </div>
        </>
    )
}
export default Hero;