import { useState, useEffect, useCallback, useMemo } from "react";
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
  Loader2,
  AlertTriangle,
  ShieldX,
  ClipboardCheck,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import {
  PREM_QUESTIONS,
  PROM_QUESTIONS,
  LIKERT_SCALE,
} from "./data/surveyQuestions";
import { fetchTokenData, TokenError } from "./services/api";

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════ */

/**
 * Extract token from URL path.
 * e.g. "/abc123def456" → "abc123def456"
 *      "/some/path/abc123" → null (not a direct token)
 */
function getTokenFromPath() {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
  // Token should be a non-empty string without slashes
  if (path && !path.includes("/")) {
    return path;
  }
  return null;
}

// Face icons: sad → happy, each with idle tint color
const FACES = [
  { value: 1, Icon: Angry, color: "#EF4444", bg: "#FEF2F2", idle: "#D4A0A0" },
  { value: 2, Icon: Frown, color: "#F97316", bg: "#FFF7ED", idle: "#D4B48A" },
  { value: 3, Icon: Meh,   color: "#EAB308", bg: "#FEFCE8", idle: "#C0AD5C" },
  { value: 4, Icon: Smile, color: "#1BBAAF", bg: "#F0FDFB", idle: "#7CC0B8" },
  { value: 5, Icon: Laugh, color: "#22C55E", bg: "#F0FDF4", idle: "#7CC08A" },
];

/* ═══════════════════════════════════════════════════════════
   FULL-PAGE STATE SCREENS
   ═══════════════════════════════════════════════════════════ */

/** Loading — shown while fetching token data */
function LoadingPage() {
  return (
    <motion.div
      className="state-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="state-content">
        <motion.div
          className="state-icon state-icon--loading"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
        >
          <Loader2 size={36} strokeWidth={1.8} />
        </motion.div>
        <h2>Memuat Data Pasien</h2>
        <p>Memvalidasi token dan mengambil informasi pasien Anda…</p>
      </div>
    </motion.div>
  );
}

/** Error — token not found, network error, etc. */
function ErrorPage({ code, message, onRetry }) {
  const isNetwork = code === "NETWORK_ERROR";

  return (
    <motion.div
      className="state-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="state-content"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        <div className={`state-icon ${isNetwork ? "state-icon--warning" : "state-icon--error"}`}>
          {isNetwork ? (
            <WifiOff size={36} strokeWidth={1.8} />
          ) : (
            <ShieldX size={36} strokeWidth={1.8} />
          )}
        </div>
        <h2>{isNetwork ? "Gagal Terhubung" : "Token Tidak Valid"}</h2>
        <p>{message}</p>
        {isNetwork && onRetry && (
          <button className="state-btn" onClick={onRetry}>
            <RefreshCw size={16} strokeWidth={2} />
            Coba Lagi
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

/** Completed — survey already submitted for this token */
function CompletedPage() {
  return (
    <motion.div
      className="state-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="state-content"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        <div className="state-icon state-icon--completed">
          <ClipboardCheck size={36} strokeWidth={1.8} />
        </div>
        <h2>Survei Sudah Diisi</h2>
        <p>
          Token ini sudah digunakan untuk mengisi survei sebelumnya.
          Terima kasih atas partisipasi Anda.
        </p>
      </motion.div>
    </motion.div>
  );
}

/** No Token — root page or invalid path */
function NoTokenPage() {
  return (
    <motion.div
      className="state-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="state-content"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        <div className="state-icon state-icon--warning">
          <AlertTriangle size={36} strokeWidth={1.8} />
        </div>
        <h2>Token Diperlukan</h2>
        <p>
          Silakan scan barcode yang diberikan oleh petugas rumah sakit
          untuk mengakses formulir survei.
        </p>
      </motion.div>
    </motion.div>
  );
}

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
  // Token from URL path
  const token = useMemo(getTokenFromPath, []);

  // API fetch states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // { code, message }
  const [patient, setPatient] = useState(null);

  // Survey states
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Fetch patient data from API
  const loadPatientData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchTokenData(token);
      setPatient(data);
    } catch (err) {
      if (err instanceof TokenError) {
        setError({ code: err.code, message: err.message });
      } else {
        setError({
          code: "NETWORK_ERROR",
          message: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

  // Survey logic
  const total = PREM_QUESTIONS.length + PROM_QUESTIONS.length;
  const answered = Object.keys(answers).length;
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  const premAnswered = PREM_QUESTIONS.filter((q) => answers[q.id]).length;
  const promAnswered = PROM_QUESTIONS.filter((q) => answers[q.id]).length;

  const handleSelect = useCallback((id, val) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  }, []);

  const canSubmit = !!patient;

  /* ─── Loading ─── */
  if (loading) {
    return <LoadingPage />;
  }

  /* ─── Error states ─── */
  if (error) {
    if (error.code === "COMPLETED") {
      return <CompletedPage />;
    }
    return (
      <ErrorPage
        code={error.code}
        message={error.message}
        onRetry={loadPatientData}
      />
    );
  }

  /* ─── Success (submitted) ─── */
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
        {patient && (
          <div className="card patient-card">
            <div className="patient-field patient-field--full">
              <label>Nama Lengkap</label>
              <span className="value">{patient.pasien_nama}</span>
            </div>
            <div className="patient-row">
              <div className="patient-field">
                <label>No. RM</label>
                <span className="value">{patient.norm}</span>
              </div>
              <div className="patient-field">
                <label>No. Registrasi</label>
                <span className="value">{patient.regpasien_no}</span>
              </div>
            </div>
            <div className="patient-row">
              <div className="patient-field patient-field--teal">
                <label>Pelayanan</label>
                <span className="value">{patient.pelayanan}</span>
              </div>
              <div className="patient-field patient-field--teal">
                <label>Penyakit</label>
                <span className="value">{patient.penyakit}</span>
              </div>
            </div>
          </div>
        )}

        {!token && (
          <div className="card no-token-banner">
            <AlertTriangle size={18} strokeWidth={2} />
            <p>Scan barcode dari petugas RS untuk mengisi survei. Tanpa token, survei tidak dapat dikirim.</p>
          </div>
        )}

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
            className={`submit-btn ${!canSubmit ? "submit-btn--disabled" : ""}`}
            type="button"
            whileTap={canSubmit ? { scale: 0.97 } : {}}
            onClick={() => canSubmit && setSubmitted(true)}
            disabled={!canSubmit}
          >
            {canSubmit ? "Kirim Survei" : "Token diperlukan untuk mengirim"}
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
