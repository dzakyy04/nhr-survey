import { useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Check,
  CheckCircle2,
  Loader2,
  ClipboardCheck,
  Heart,
  Sparkles,
  AlertCircle,
  MessageSquare,
  Stethoscope,
  BadgeCheck,
  UserCog,
  ChevronDown,
  Search,
  Building2,
} from "lucide-react";
import { LIKERT_SCALE } from "./data/surveyQuestions";
import { fetchGrahaDpjpQuestions, fetchGrahaDpjpDivisi, submitGrahaDpjpSurvey } from "./services/api";
import { useEffect } from "react";

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════ */

const STAR_COLORS = [
  { value: 1, color: "#EF4444", label: "Sangat Tidak Setuju" },
  { value: 2, color: "#F97316", label: "Tidak Setuju" },
  { value: 3, color: "#EAB308", label: "Netral" },
  { value: 4, color: "#1BBAAF", label: "Setuju" },
  { value: 5, color: "#22C55E", label: "Sangat Setuju" },
];

/* ═══════════════════════════════════════════════════════════
   QUESTION CARD
   ═══════════════════════════════════════════════════════════ */
function QuestionCard({ q, value, onSelect }) {
  const starInfo = value ? STAR_COLORS[value - 1] : null;

  return (
    <div className={`q-card ${value ? "answered" : ""}`} id={`q-${q.id}`}>
      {value && (
        <div className="q-done">
          <Check size={13} strokeWidth={2.5} />
        </div>
      )}

      <div className="q-header-inline">
        <span className="q-num">{q.number}.</span>
        <p className="q-text">
          {q.question} <span style={{ color: "#ef4444" }}>*</span>
        </p>
      </div>

      <div className="star-row">
        <div className="star-buttons">
          {STAR_COLORS.map((star) => {
            const filled = value >= star.value;
            const isExact = value === star.value;
            return (
              <motion.button
                key={star.value}
                type="button"
                whileTap={{ scale: 0.85 }}
                className={`star-btn ${filled ? "filled" : ""} ${isExact ? "exact" : ""}`}
                onClick={() => onSelect(q.id, star.value)}
                aria-label={star.label}
                aria-pressed={isExact}
              >
                <Star
                  size={28}
                  className="star-icon"
                  fill={filled ? "#FBBF24" : "none"}
                  color={filled ? "#F59E0B" : "#D1D5DB"}
                  strokeWidth={filled ? 1.5 : 1.4}
                />
              </motion.button>
            );
          })}
        </div>
        <AnimatePresence mode="wait">
          {starInfo && (
            <motion.div
              key={value}
              className="star-label"
              style={{ color: starInfo.color }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <span className="star-label-text">{starInfo.label}</span>
              <span className="star-label-points">
                {LIKERT_SCALE[value - 1].points} poin
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN DPJP APP
   ═══════════════════════════════════════════════════════════ */
export default function GrahaDpjpApp() {
  // DPJP identity — divisi + jenis kelamin
  const [divisi, setDivisi] = useState(null);
  const [deptList, setDeptList] = useState([]);
  const [deptOpen, setDeptOpen] = useState(false);
  const [deptSearch, setDeptSearch] = useState("");
  const deptRef = useRef(null);
  const [jenisKelamin, setJenisKelamin] = useState("");

  // Questions from API
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState(null);

  // Survey states
  const [answers, setAnswers] = useState({});
  const [catatan, setCatatan] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Fetch questions + divisi on mount
  useEffect(() => {
    fetchGrahaDpjpQuestions()
      .then((qs) => setQuestions(qs))
      .catch((err) => setQuestionsError(err.message))
      .finally(() => setQuestionsLoading(false));

    fetchGrahaDpjpDivisi()
      .then((list) => setDeptList(list))
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (deptRef.current && !deptRef.current.contains(e.target)) {
        setDeptOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filtered dept list
  const filteredDepts = useMemo(() => {
    if (!deptSearch.trim()) return deptList;
    const q = deptSearch.toLowerCase();
    return deptList.filter((d) => d.nama.toLowerCase().includes(q));
  }, [deptList, deptSearch]);

  // Survey logic
  const starTotal = questions.length;
  const starAnswered = Object.keys(answers).length;
  const total = starTotal + 1; // +1 for pertanyaan terbuka
  const answered = starAnswered + (catatan.trim().length > 0 ? 1 : 0);
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  const handleSelect = useCallback((id, val) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  }, []);

  const identityFilled = divisi !== null && jenisKelamin.length > 0;
  const canSubmit = identityFilled && answered === total && total > 0;

  // Submit
  const handleSubmit = useCallback(async () => {
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await submitGrahaDpjpSurvey(
        divisi.id,
        divisi.nama,
        jenisKelamin,
        answers,
        catatan || null,
      );
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, submitting, divisi, jenisKelamin, answers, catatan]);

  /* ─── Loading ─── */
  if (questionsLoading) {
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
          <p>Sedang memuat pertanyaan survei…</p>
        </div>
      </motion.div>
    );
  }

  /* ─── Error loading questions ─── */
  if (questionsError) {
    return (
      <motion.div
        className="state-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="state-content">
          <div className="state-icon state-icon--error">
            <AlertCircle size={36} strokeWidth={1.8} />
          </div>
          <h2>Gagal Memuat</h2>
          <p>{questionsError}</p>
          <button
            className="state-btn"
            onClick={() => {
              setQuestionsError(null);
              setQuestionsLoading(true);
              fetchGrahaDpjpQuestions()
                .then((qs) => setQuestions(qs))
                .catch((err) => setQuestionsError(err.message))
                .finally(() => setQuestionsLoading(false));
            }}
          >
            Coba Lagi
          </button>
        </div>
      </motion.div>
    );
  }

  /* ─── Success ─── */
  if (submitted) {
    return (
      <motion.div
        className="success-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
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
          transition={{
            delay: 0.15,
            duration: 0.45,
            type: "spring",
            stiffness: 120,
          }}
        >
          <motion.div
            className="success-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.3,
              type: "spring",
              stiffness: 200,
              damping: 12,
            }}
          >
            <CheckCircle2 size={44} strokeWidth={1.6} />
          </motion.div>

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
            Masukan Anda sangat berarti untuk meningkatkan kualitas layanan Graha Eksekutif RS Mohammad Hoesin.
          </p>

          <div className="success-patient-card">
            <div className="success-patient-row">
              <span className="success-patient-label">Divisi</span>
              <span className="success-patient-value">{divisi?.nama}</span>
            </div>
            <div className="success-patient-row">
              <span className="success-patient-label">Jenis Kelamin</span>
              <span className="success-patient-value">{jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
            </div>
            <div className="success-patient-row">
              <span className="success-patient-label">Pertanyaan Dijawab</span>
              <span className="success-patient-value success-patient-value--highlight">
                {answered}/{total}
              </span>
            </div>
          </div>

          <div className="success-message">
            <Heart size={15} strokeWidth={2} />
            <span>Bersama membangun layanan kesehatan yang lebih baik</span>
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
      <header className="hero dpjp-hero">
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

        <div className="hero-logo-wrap">
          <img src="/logo-rsmh.png" alt="Logo RSMH" className="hero-logo" />
        </div>

        <div className="hero-inner">
          <div className="hero-text">
            <div className="hero-badge dpjp-badge">
              <UserCog size={16} strokeWidth={2} />
              <span>DPJP Graha Eksekutif</span>
            </div>
            <h1>Survei Kepuasan DPJP</h1>
            <p className="hero-desc">
              Jawablah pertanyaan berikut berdasarkan pengalaman dan penilaian
              Anda sebagai Dokter Penanggung Jawab Pelayanan (DPJP) di Graha
              Eksekutif RS Mohammad Hoesin.{" "}
              Jawaban Anda bersifat <strong>rahasia</strong>.
            </p>
          </div>

          <img
            src="/hero-medical.png"
            alt="Ilustrasi dokter"
            className="hero-image"
          />
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="survey-wrap">
        {/* ── DPJP identity — divisi + jenis kelamin ── */}
        <div className="card graha-identity-inline">
          <p className="graha-inline-title">
            <UserCog size={16} strokeWidth={2.5} />
            Data DPJP
          </p>
          <div className="graha-inline-fields">
            <div className="graha-inline-row">
              <div className={`graha-input-group graha-dept-select ${divisi ? "has-value" : ""}`} ref={deptRef}>
                <button
                  type="button"
                  className={`graha-dept-trigger ${divisi ? "has-value" : ""}`}
                  onClick={() => { setDeptOpen((o) => !o); setDeptSearch(""); }}
                  id="dpjp-divisi"
                >
                  <span className="graha-dept-trigger-text">
                    {divisi?.nama || ""}
                  </span>
                  <ChevronDown size={16} className={`graha-dept-chevron ${deptOpen ? "open" : ""}`} />
                </button>
                <label className="graha-dept-label">
                  <Building2 style={{ width: 16, height: 16 }} />
                  Divisi <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <AnimatePresence>
                  {deptOpen && (
                    <motion.div
                      className="graha-dept-dropdown"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                    >
                      <div className="graha-dept-search-wrap">
                        <Search size={14} strokeWidth={2} />
                        <input
                          type="text"
                          className="graha-dept-search"
                          placeholder="Cari divisi..."
                          value={deptSearch}
                          onChange={(e) => setDeptSearch(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="graha-dept-list">
                        {filteredDepts.length === 0 && (
                          <div className="graha-dept-empty">Divisi tidak ditemukan</div>
                        )}
                        {filteredDepts.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            className={`graha-dept-option ${divisi?.id === d.id ? "active" : ""}`}
                            onClick={() => { setDivisi(d); setDeptOpen(false); }}
                          >
                            {divisi?.id === d.id && <Check size={14} strokeWidth={2.5} />}
                            <span>{d.nama}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="graha-inline-row" style={{ marginTop: 12 }}>
              <div className="graha-gender-group">
                <span className="graha-gender-label">Jenis Kelamin <span style={{ color: "#ef4444" }}>*</span></span>
                <div className="graha-gender-options">
                  <label className={`graha-gender-btn ${jenisKelamin === 'L' ? 'active' : ''}`}>
                    <input type="radio" name="jenisKelamin" value="L" checked={jenisKelamin === 'L'} onChange={(e) => setJenisKelamin(e.target.value)} />
                    Laki-laki
                  </label>
                  <label className={`graha-gender-btn ${jenisKelamin === 'P' ? 'active' : ''}`}>
                    <input type="radio" name="jenisKelamin" value="P" checked={jenisKelamin === 'P'} onChange={(e) => setJenisKelamin(e.target.value)} />
                    Perempuan
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guide */}
        <div className="card guide-card">
          <p className="guide-title">Panduan Penilaian</p>
          <p className="guide-desc">
            Pilih jumlah bintang yang sesuai untuk setiap pernyataan
          </p>
          <div className="guide-stars">
            {STAR_COLORS.map((star) => {
              const label = LIKERT_SCALE[star.value - 1];
              return (
                <div key={star.value} className="guide-star-item">
                  <div className="guide-star-icons">
                    {Array.from({ length: star.value }, (_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill="#FBBF24"
                        color="#F59E0B"
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <span
                    className="guide-star-label"
                    style={{ color: star.color }}
                  >
                    {label.label}
                  </span>
                  <span className="guide-star-points">{label.points} poin</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Section header ── */}
        <div className="section-card">
          <div className="section-icon-wrap">
            <Stethoscope size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2>Pernyataan Penilaian</h2>
            <p>Silakan berikan penilaian Anda terhadap setiap pernyataan berikut</p>
          </div>
          <span className="section-badge">
            {answered}/{total}
          </span>
        </div>

        {/* ── Questions ── */}
        {questions.map((q) => (
          <QuestionCard
            key={q.id}
            q={q}
            value={answers[q.id]}
            onSelect={handleSelect}
          />
        ))}

        {/* ── Pertanyaan Terbuka ── */}
        <div className="card graha-catatan-card">
          <div className="graha-catatan-header">
            <MessageSquare size={18} strokeWidth={2} />
            <span>Pertanyaan Terbuka</span>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.75rem", lineHeight: 1.6 }}>
            Perubahan apa yang paling Anda harapkan agar Anda semakin berminat
            mengembangkan praktik layanan graha eksekutif di RSMH? <span style={{ color: "#ef4444" }}>*</span>
          </p>
          <textarea
            className="graha-catatan-textarea"
            placeholder="Tuliskan jawaban Anda di sini..."
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows={4}
          />
        </div>

        {/* ── Submit ── */}
        <div className="card submit-section">
          <p className="submit-count">
            {answered} dari {total} pertanyaan dijawab
          </p>
          {submitError && <p className="submit-error">{submitError}</p>}
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
                : !identityFilled
                  ? "Lengkapi Divisi dan Jenis Kelamin"
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
