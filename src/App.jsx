import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Angry,
  Frown,
  Meh,
  Smile,
  Laugh,
  Check,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
} from "lucide-react";
import {
  PREM_QUESTIONS,
  PROM_QUESTIONS,
  LIKERT_SCALE,
} from "./data/surveyQuestions";

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════ */
function getParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    name: p.get("name") || "Pasien",
    rm: p.get("rm") || "-",
    disease: p.get("disease") || "0",
  };
}

const DISEASES = {
  0: { name: "STEMI (ST-Elevation Myocardial Infarction)", service: "Kardiologi" },
  1: { name: "NSTEMI (Non-ST-Elevation Myocardial Infarction)", service: "Kardiologi" },
  2: { name: "Unstable Angina", service: "Kardiologi" },
  3: { name: "Heart Failure", service: "Kardiologi" },
  4: { name: "Atrial Fibrillation", service: "Kardiologi" },
  5: { name: "Stroke Iskemik", service: "Neurologi" },
  6: { name: "Stroke Hemoragik", service: "Neurologi" },
  7: { name: "Pneumonia", service: "Pulmonologi" },
  8: { name: "PPOK", service: "Pulmonologi" },
  9: { name: "Diabetes Melitus Tipe 2", service: "Penyakit Dalam" },
  10: { name: "Gagal Ginjal Kronik", service: "Nefrologi" },
};

// Face icons: sad → happy, each with idle tint color
const FACES = [
  { value: 1, Icon: Angry, color: "#EF4444", bg: "#FEF2F2", idle: "#D4A0A0" },
  { value: 2, Icon: Frown, color: "#F97316", bg: "#FFF7ED", idle: "#D4B48A" },
  { value: 3, Icon: Meh,   color: "#EAB308", bg: "#FEFCE8", idle: "#C0AD5C" },
  { value: 4, Icon: Smile, color: "#1BBAAF", bg: "#F0FDFB", idle: "#7CC0B8" },
  { value: 5, Icon: Laugh, color: "#22C55E", bg: "#F0FDF4", idle: "#7CC08A" },
];

/* ═══════════════════════════════════════════════════════════
   QUESTION CARD
   ═══════════════════════════════════════════════════════════ */
function QuestionCard({ q, value, onSelect }) {
  return (
    <div className={`q-card ${value ? "answered" : ""}`} id={`q-${q.id}`}>
      {value && (
        <div className="q-done">
          <Check size={13} strokeWidth={2.5} />
        </div>
      )}

      <div className="q-top">
        <span className="q-num">{q.number}.</span>
        <span className="q-cat">{q.category}</span>
      </div>

      <p className="q-text">{q.question}</p>

      <div className="face-row">
        {FACES.map((face) => {
          const sel = value === face.value;
          return (
            <motion.button
              key={face.value}
              type="button"
              whileTap={{ scale: 0.88 }}
              className={`face-btn ${sel ? "selected" : ""}`}
              style={{
                "--face-color": face.color,
                "--face-bg": face.bg,
                "--face-idle": face.idle,
              }}
              onClick={() => onSelect(q.id, face.value)}
              aria-label={LIKERT_SCALE[face.value - 1].label}
              aria-pressed={sel}
            >
              <face.Icon
                size={26}
                className="face-icon"
                strokeWidth={sel ? 2.2 : 1.6}
              />
              <span className="face-label">
                {LIKERT_SCALE[face.value - 1].label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════ */
export default function App() {
  const params = useMemo(getParams, []);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const disease = DISEASES[params.disease] || { name: "-", service: "-" };
  const total = PREM_QUESTIONS.length + PROM_QUESTIONS.length;
  const answered = Object.keys(answers).length;
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  const premAnswered = PREM_QUESTIONS.filter((q) => answers[q.id]).length;
  const promAnswered = PROM_QUESTIONS.filter((q) => answers[q.id]).length;

  const handleSelect = useCallback((id, val) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  }, []);

  /* ─── Success ─── */
  if (submitted) {
    return (
      <motion.div
        className="success-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="success-content"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          <div className="success-icon">
            <CheckCircle2 size={40} color="#059669" strokeWidth={1.8} />
          </div>
          <h2>Terima Kasih!</h2>
          <p>
            Survei berhasil dikirim. Jawaban Anda akan membantu meningkatkan
            kualitas pelayanan rumah sakit.
          </p>
          <button
            className="success-btn"
            onClick={() => setSubmitted(false)}
          >
            Selesai
          </button>
        </motion.div>
      </motion.div>
    );
  }

  /* ─── Survey form ─── */
  return (
    <>
      {/* ── Sticky progress strip ── */}
      <div className="progress-strip">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      {/* ── Hero header ── */}
      <header className="hero">
        <div className="hero-inner">
          <div className="hero-text">
            <span className="hero-badge">Patient Reported Measurement</span>
            <h1>Survei Kepuasan Pasien</h1>
            <p className="hero-desc">
              Jawab pertanyaan berikut sesuai pengalaman Anda selama dirawat di
              rumah sakit ini. Jawaban Anda bersifat <strong>rahasia</strong>.
            </p>
          </div>

          <img
            src="/hero-medical.png"
            alt="Ilustrasi dokter dan pasien"
            className="hero-image"
          />
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="survey-wrap">
        {/* Patient info */}
        <div className="card patient-card">
          <div className="patient-row">
            <div className="patient-field">
              <label>Nama Lengkap</label>
              <span className="value">{params.name}</span>
            </div>
            <div className="patient-field">
              <label>No. Rekam Medis</label>
              <span className="value">{params.rm}</span>
            </div>
          </div>
          <div className="patient-disease">
            <strong>{disease.service}</strong>&nbsp;— {disease.name}
          </div>
        </div>

        {/* Guide */}
        <div className="card guide-card">
          <p className="guide-title">Panduan Penilaian</p>
          <p className="guide-desc">
            Pilih ekspresi wajah yang sesuai untuk setiap pertanyaan
          </p>
          <div className="guide-faces">
            {FACES.map((face) => {
              const label = LIKERT_SCALE[face.value - 1];
              return (
                <div key={face.value} className="guide-face-item">
                  <div
                    className="guide-face-circle"
                    style={{ background: face.bg }}
                  >
                    <face.Icon
                      size={22}
                      color={face.color}
                      strokeWidth={1.8}
                    />
                  </div>
                  <span
                    className="guide-face-label"
                    style={{ color: face.color }}
                  >
                    {label.label}
                  </span>
                  <span className="guide-face-points">
                    {label.points} poin
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── PREM ── */}
        <div className="section-card">
          <div className="section-icon-wrap">
            <Stethoscope size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2>PREM - Pengalaman Pasien</h2>
            <p>Patient Reported Experience (Bobot 60%)</p>
          </div>
          <span className="section-badge">
            {premAnswered}/{PREM_QUESTIONS.length}
          </span>
        </div>

        {PREM_QUESTIONS.map((q) => (
          <QuestionCard
            key={q.id}
            q={q}
            value={answers[q.id]}
            onSelect={handleSelect}
          />
        ))}

        {/* ── PROM ── */}
        <div className="section-card">
          <div className="section-icon-wrap">
            <HeartPulse size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2>PROM - Hasil Pengobatan</h2>
            <p>Patient Reported Outcome (Bobot 40%)</p>
          </div>
          <span className="section-badge">
            {promAnswered}/{PROM_QUESTIONS.length}
          </span>
        </div>

        {PROM_QUESTIONS.map((q) => (
          <QuestionCard
            key={q.id}
            q={q}
            value={answers[q.id]}
            onSelect={handleSelect}
          />
        ))}

        {/* ── Submit ── */}
        <div className="card submit-section">
          <p className="submit-count">
            {answered} dari {total} pertanyaan dijawab
          </p>
          <motion.button
            className="submit-btn"
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setSubmitted(true)}
          >
            Kirim Survei
          </motion.button>
        </div>
      </main>

      {/* ── Floating progress pill ── */}
      <AnimatePresence>
        {answered > 0 && answered < total && (
          <motion.div
            className="progress-pill"
            initial={{ opacity: 0, y: 20, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            <CheckCircle2 size={14} strokeWidth={2.5} />
            <span>
              {answered}/{total} dijawab
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
