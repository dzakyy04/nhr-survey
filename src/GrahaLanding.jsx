import { motion } from "framer-motion";
import {
  ClipboardCheck,
  BedDouble,
  Footprints,
  ArrowRight,
  Sparkles,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════ */
const TYPES = [
  {
    key: "ranap",
    label: "Rawat Inap",
    desc: "Survei untuk pasien yang mendapatkan perawatan rawat inap di Graha Eksekutif",
    icon: BedDouble,
    gradient: "linear-gradient(135deg, #0EB4A9 0%, #0a9e94 100%)",
    lightBg: "rgba(14, 180, 169, 0.08)",
    lightBorder: "rgba(14, 180, 169, 0.18)",
    iconBg: "rgba(255,255,255,0.2)",
  },
  {
    key: "rajal",
    label: "Rawat Jalan",
    desc: "Survei untuk pasien yang mendapatkan pelayanan rawat jalan di Graha Eksekutif",
    icon: Footprints,
    gradient: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
    lightBg: "rgba(99, 102, 241, 0.08)",
    lightBorder: "rgba(99, 102, 241, 0.18)",
    iconBg: "rgba(255,255,255,0.2)",
  },
];

/* ═══════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════ */
export default function GrahaLanding() {
  const handleSelect = (key) => {
    window.location.href = `/graha-eksekutif/${key}`;
  };

  return (
    <div className="landing-page">
      {/* Background decorations */}
      <div className="landing-decor">
        <div className="landing-decor-circle landing-decor-circle-1" />
        <div className="landing-decor-circle landing-decor-circle-2" />
        <div className="landing-decor-plus landing-decor-plus-1">+</div>
        <div className="landing-decor-plus landing-decor-plus-2">+</div>
        <div className="landing-decor-dots" />
      </div>

      <motion.div
        className="landing-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Logo */}
        <div className="landing-logo-wrap">
          <img src="/logo-rsmh.png" alt="Logo RSMH" className="landing-logo" />
        </div>

        {/* Badge */}
        <motion.div
          className="landing-badge"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <ClipboardCheck size={14} strokeWidth={2} />
          <span>Patient Reported Measurement</span>
        </motion.div>

        {/* Title */}
        <h1 className="landing-title">Survei Kepuasan Pasien</h1>
        <p className="landing-subtitle">
          Graha Eksekutif RS Mohammad Hoesin
        </p>
        <p className="landing-desc">
          Silakan pilih jenis layanan yang Anda terima untuk memulai survei kepuasan
        </p>

        {/* Type cards */}
        <div className="landing-cards">
          {TYPES.map((type, index) => {
            const Icon = type.icon;
            return (
              <motion.button
                key={type.key}
                className="landing-card"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3 + index * 0.12,
                  duration: 0.45,
                  type: "spring",
                  stiffness: 120,
                }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelect(type.key)}
                style={{
                  "--card-gradient": type.gradient,
                  "--card-light-bg": type.lightBg,
                  "--card-light-border": type.lightBorder,
                  "--card-icon-bg": type.iconBg,
                }}
              >
                <div className="landing-card-icon" style={{ background: type.gradient }}>
                  <Icon size={28} strokeWidth={1.8} />
                </div>
                <div className="landing-card-body">
                  <h3>{type.label}</h3>
                  <p>{type.desc}</p>
                </div>
                <div className="landing-card-arrow">
                  <ArrowRight size={18} strokeWidth={2} />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Footer note */}
        <motion.p
          className="landing-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Sparkles size={13} strokeWidth={2} />
          Jawaban Anda bersifat <strong>rahasia</strong> dan sangat berarti bagi kami
        </motion.p>
      </motion.div>
    </div>
  );
}
