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
  Heart,
  Sparkles,
} from "lucide-react";
import { LIKERT_SCALE } from "./data/surveyQuestions";
import {
  fetchTokenData,
  fetchSurveyQuestions,
  submitSurvey,
  TokenError,
} from "./services/api";

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
  { value: 3, Icon: Meh, color: "#EAB308", bg: "#FEFCE8", idle: "#C0AD5C" },
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
        <h2>Mohon Tunggu</h2>
        <p>Sedang memuat data Anda…</p>
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
        <div
          className={`state-icon ${isNetwork ? "state-icon--warning" : "state-icon--error"}`}
        >
          {isNetwork ? (
            <WifiOff size={36} strokeWidth={1.8} />
          ) : (
            <ShieldX size={36} strokeWidth={1.8} />
          )}
        </div>
        <h2>{isNetwork ? "Gagal Memuat" : "Link Tidak Valid"}</h2>
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
      className="success-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background decorations */}
      <div className="success-decor">
        <div className="success-decor-circle success-decor-circle-1" />
        <div className="success-decor-circle success-decor-circle-2" />
        <div className="success-decor-plus success-decor-plus-1">+</div>
        <div className="success-decor-plus success-decor-plus-2">+</div>
        <div className="success-decor-dots" />
      </div>

      <motion.div
        className="success-content"
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45, type: "spring", stiffness: 120 }}
      >
        <motion.div
          className="success-icon completed-icon"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 12 }}
        >
          <ClipboardCheck size={44} strokeWidth={1.6} />
        </motion.div>

        <motion.div
          className="success-sparkle"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <CheckCircle2 size={14} strokeWidth={2} />
          <span>Survei Sudah Tercatat</span>
        </motion.div>

        <h2>Survei Sudah Diisi</h2>
        <p className="success-main-text">
          Anda sudah pernah mengisi survei ini sebelumnya.
          Terima kasih atas partisipasi Anda dalam membantu
          meningkatkan kualitas pelayanan kami.
        </p>

        <div className="success-message">
          <Heart size={15} strokeWidth={2} />
          <span>Semoga lekas sehat dan pemulihan berjalan lancar</span>
        </div>
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
          Silakan scan barcode yang diberikan oleh petugas rumah sakit untuk
          mengakses formulir survei.
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

  // Questions from API
  const [questions, setQuestions] = useState({ prem: [], prom: [] });

  // Survey states
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Fetch patient data + questions in parallel
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Questions are always fetched; token data only when token exists
      const [qs, patientData] = await Promise.all([
        fetchSurveyQuestions(),
        token ? fetchTokenData(token) : Promise.resolve(null),
      ]);

      setQuestions(qs);
      setPatient(patientData);
    } catch (err) {
      if (err instanceof TokenError) {
        setError({ code: err.code, message: err.message });
      } else {
        setError({
          code: "NETWORK_ERROR",
          message:
            "Tidak dapat memuat data. Silakan periksa koneksi internet Anda dan coba lagi.",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Survey logic
  const premQuestions = questions.prem;
  const promQuestions = questions.prom;
  const total = premQuestions.length + promQuestions.length;
  const answered = Object.keys(answers).length;
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  const premAnswered = premQuestions.filter((q) => answers[q.id]).length;
  const promAnswered = promQuestions.filter((q) => answers[q.id]).length;

  const handleSelect = useCallback((id, val) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  }, []);

  const canSubmit = !!patient && answered === total && total > 0;

  // Handle submit — send answers to API
  const handleSubmit = useCallback(async () => {
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await submitSurvey(token, patient.regpasien_no, answers);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, submitting, patient, answers]);

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
        onRetry={loadData}
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
        transition={{ duration: 0.4 }}
      >
        {/* Background decorations */}
        <div className="success-decor">
          <div className="success-decor-circle success-decor-circle-1" />
          <div className="success-decor-circle success-decor-circle-2" />
          <div className="success-decor-plus success-decor-plus-1">+</div>
          <div className="success-decor-plus success-decor-plus-2">+</div>
          <div className="success-decor-dots" />
        </div>

        <motion.div
          className="success-content"
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45, type: "spring", stiffness: 120 }}
        >
          {/* Animated check icon */}
          <motion.div
            className="success-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 12 }}
          >
            <CheckCircle2 size={44} strokeWidth={1.6} />
          </motion.div>

          {/* Sparkle badges */}
          <motion.div
            className="success-sparkle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Sparkles size={14} strokeWidth={2} />
            <span>Survei Berhasil Terkirim</span>
          </motion.div>

          <h2>Terima Kasih!</h2>
          <p className="success-main-text">
            Jawaban Anda sangat berarti untuk meningkatkan kualitas pelayanan
            rumah sakit kami.
          </p>

          {/* Patient info summary */}
          {patient && (
            <div className="success-patient-card">
              <div className="success-patient-row">
                <span className="success-patient-label">Nama</span>
                <span className="success-patient-value">{patient.pasien_nama}</span>
              </div>
              <div className="success-patient-row">
                <span className="success-patient-label">Pelayanan</span>
                <span className="success-patient-value">{patient.pelayanan}</span>
              </div>
              <div className="success-patient-row">
                <span className="success-patient-label">Pertanyaan Dijawab</span>
                <span className="success-patient-value success-patient-value--highlight">
                  {answered}/{total}
                </span>
              </div>
            </div>
          )}

          <div className="success-message">
            <Heart size={15} strokeWidth={2} />
            <span>Semoga lekas sehat dan pemulihan berjalan lancar</span>
          </div>
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
        {/* Background decorations */}
        <div className="hero-decor">
          <div className="decor-blur" />
          <div className="decor-plus decor-plus-1">+</div>
          <div className="decor-plus decor-plus-2">+</div>
          <div className="decor-plus decor-plus-3">+</div>
          <div className="decor-heart">♡</div>
          <div className="decor-dots decor-dots-top" />
          <div className="decor-dots decor-dots-bottom" />
          <div className="decor-wave-lines">
            <div className="decor-line" />
            <div className="decor-line" />
            <div className="decor-line" />
            <div className="decor-line" />
          </div>
          <div className="decor-hospital">
            <div className="decor-building decor-building-left" />
            <div className="decor-building decor-building-center">
              <div className="decor-cross" />
            </div>
            <div className="decor-building decor-building-right" />
          </div>
          <div className="decor-leaf-group">
            <div className="decor-leaf" />
            <div className="decor-leaf" />
            <div className="decor-leaf" />
          </div>
          <svg className="decor-wave decor-wave-1" viewBox="0 0 1440 320">
            <path
              fill="white"
              d="M0,224L60,208C120,192,240,160,360,176C480,192,600,256,720,272C840,288,960,256,1080,218.7C1200,181,1320,139,1380,117.3L1440,96V320H0Z"
            />
          </svg>
          <svg className="decor-wave decor-wave-2" viewBox="0 0 1440 320">
            <path
              fill="white"
              d="M0,160L60,170.7C120,181,240,203,360,224C480,245,600,267,720,250.7C840,235,960,181,1080,149.3C1200,117,1320,107,1380,101.3L1440,96V320H0Z"
            />
          </svg>
        </div>

        {/* Logo top-right */}
        <div className="hero-logo-wrap">
          <img src="/logo-rsmh.png" alt="Logo RSMH" className="hero-logo" />
        </div>

        <div className="hero-inner">
          <div className="hero-text">
            <div className="hero-badge">
              <ClipboardCheck size={16} strokeWidth={2} />
              <span>Patient Reported Measurement</span>
            </div>
            <h1>
              Survei Kepuasan Pasien
            </h1>
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
            <p>
              Silakan scan barcode yang diberikan petugas rumah sakit untuk
              dapat mengirim survei.
            </p>
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
                    <face.Icon size={22} color={face.color} strokeWidth={1.8} />
                  </div>
                  <span
                    className="guide-face-label"
                    style={{ color: face.color }}
                  >
                    {label.label}
                  </span>
                  <span className="guide-face-points">{label.points} poin</span>
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
            {premAnswered}/{premQuestions.length}
          </span>
        </div>

        {premQuestions.map((q) => (
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
            {promAnswered}/{promQuestions.length}
          </span>
        </div>

        {promQuestions.map((q) => (
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
          {submitError && (
            <p className="submit-error">
              {submitError}
            </p>
          )}
          <motion.button
            className={`submit-btn ${!canSubmit || submitting ? "submit-btn--disabled" : ""}`}
            type="button"
            whileTap={canSubmit && !submitting ? { scale: 0.97 } : {}}
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
          >
            {submitting
              ? "Mengirim..."
              : canSubmit
                ? "Kirim Survei"
                : !patient
                  ? "Scan barcode untuk mengirim survei"
                  : `Jawab semua pertanyaan (${answered}/${total})`}
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
