import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Check,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  Loader2,
  ClipboardCheck,
  Heart,
  Sparkles,
  User,
  IdCard,
  MessageSquare,
  AlertCircle,
  Building2,
  Search,
  ChevronDown,
  X,
} from "lucide-react";
import { LIKERT_SCALE } from "./data/surveyQuestions";
import { fetchGrahaQuestions, submitGrahaSurvey, fetchGrahaPelayanan, fetchPasienByNorm } from "./services/api";

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
   SEARCHABLE DROPDOWN
   ═══════════════════════════════════════════════════════════ */
function SearchableDropdown({ options, value, onChange, loading, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const term = search.toLowerCase();
    return options.filter((o) => o.bagian_nama.toLowerCase().includes(term));
  }, [options, search]);

  const selected = options.find((o) => o.bagian_id === value);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleToggle = () => {
    if (loading) return;
    setIsOpen((prev) => !prev);
    setSearch("");
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleSelect = (item) => {
    onChange(item.bagian_id);
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className="graha-dropdown-wrap" ref={wrapperRef}>
      <div
        className={`graha-dropdown-trigger ${isOpen ? "open" : ""} ${value ? "has-value" : ""}`}
        onClick={handleToggle}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        id="graha-pelayanan"
      >
        <Building2 size={18} strokeWidth={2.2} className="graha-dropdown-icon" />
        <div className="graha-dropdown-display">
          {selected ? (
            <>
              <span className="graha-dropdown-label-float">
                Unit Pelayanan <span style={{ color: "#ef4444" }}>*</span>
              </span>
              <span className="graha-dropdown-value">{selected.bagian_nama}</span>
            </>
          ) : (
            <span className="graha-dropdown-placeholder">
              {loading ? "Memuat data..." : (
                <>
                  {placeholder || "Pilih Unit Pelayanan"} <span style={{ color: "#ef4444" }}>*</span>
                </>
              )}
            </span>
          )}
        </div>
        <div className="graha-dropdown-actions">
          {value && (
            <button type="button" className="graha-dropdown-clear" onClick={handleClear} aria-label="Hapus pilihan">
              <X size={14} strokeWidth={2.5} />
            </button>
          )}
          <ChevronDown
            size={18}
            strokeWidth={2}
            className={`graha-dropdown-chevron ${isOpen ? "rotated" : ""}`}
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="graha-dropdown-panel"
            initial={{ opacity: 0, y: -6, scaleY: 0.96 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -6, scaleY: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="graha-dropdown-search">
              <Search size={16} strokeWidth={2} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Cari unit pelayanan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
              />
            </div>
            <ul className="graha-dropdown-list" role="listbox">
              {filtered.length === 0 ? (
                <li className="graha-dropdown-empty">Tidak ditemukan</li>
              ) : (
                filtered.map((item) => (
                  <li
                    key={item.bagian_id}
                    className={`graha-dropdown-item ${item.bagian_id === value ? "selected" : ""}`}
                    onClick={() => handleSelect(item)}
                    role="option"
                    aria-selected={item.bagian_id === value}
                  >
                    <span>{item.bagian_nama}</span>
                    {item.bagian_id === value && <Check size={16} strokeWidth={2.5} />}
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN GRAHA APP — Single Page
   ═══════════════════════════════════════════════════════════ */

const TIPE_CONFIG = {
  ranap: {
    label: "Rawat Inap",
    heroDesc: "Jawablah pertanyaan berikut berdasarkan pengalaman Anda selama mendapatkan pelayanan rawat inap di Graha Eksekutif RS Mohammad Hoesin.",
    successMsg: "Jawaban Anda sangat berarti untuk meningkatkan kualitas pelayanan rawat inap Graha Eksekutif kami.",
  },
  rajal: {
    label: "Rawat Jalan",
    heroDesc: "Jawablah pertanyaan berikut berdasarkan pengalaman Anda selama mendapatkan pelayanan rawat jalan di Graha Eksekutif RS Mohammad Hoesin.",
    successMsg: "Jawaban Anda sangat berarti untuk meningkatkan kualitas pelayanan rawat jalan Graha Eksekutif kami.",
  },
};

export default function GrahaApp({ tipe = "ranap" }) {
  const config = TIPE_CONFIG[tipe] || TIPE_CONFIG.ranap;
  // Patient identity (self-entered)
  const [nama, setNama] = useState("");
  const [norm, setNorm] = useState("");

  // Pelayanan (unit) from API
  const [pelayananList, setPelayananList] = useState([]);
  const [pelayananLoading, setPelayananLoading] = useState(true);
  const [selectedBagianId, setSelectedBagianId] = useState(null);

  // Questions from API
  const [questions, setQuestions] = useState({ prem: [], prom: [] });
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState(null);

  // Survey states
  const [answers, setAnswers] = useState({});
  const [catatan, setCatatan] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Fetch questions on mount
  useEffect(() => {
    fetchGrahaQuestions(tipe)
      .then((qs) => setQuestions(qs))
      .catch((err) => setQuestionsError(err.message))
      .finally(() => setQuestionsLoading(false));

    fetchGrahaPelayanan(tipe)
      .then((list) => setPelayananList(list))
      .catch(() => {}) // silently fail — dropdown will just be empty
      .finally(() => setPelayananLoading(false));
  }, [tipe]);

  // Autofill patient name based on norm (requires minimum 8 characters)
  useEffect(() => {
    if (!norm || norm.length < 8) return;
    
    const handler = setTimeout(async () => {
      try {
        const pasienNama = await fetchPasienByNorm(norm);
        if (pasienNama) {
          setNama(pasienNama);
        }
      } catch (err) {
        // silently fail if patient not found
      }
    }, 600);

    return () => clearTimeout(handler);
  }, [norm]);

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

  const identityFilled = nama.trim().length > 0 && selectedBagianId !== null;
  const canSubmit = identityFilled && answered === total && total > 0;

  // Submit
  const handleSubmit = useCallback(async () => {
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await submitGrahaSurvey(
        norm.trim(),
        nama.trim(),
        answers,
        catatan || null,
        selectedBagianId,
        tipe,
      );
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, submitting, nama, norm, answers, catatan, selectedBagianId, tipe]);

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
              fetchGrahaQuestions(tipe)
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
            {config.successMsg}
          </p>

          <div className="success-patient-card">
            <div className="success-patient-row">
              <span className="success-patient-label">Nama</span>
              <span className="success-patient-value">{nama}</span>
            </div>
            <div className="success-patient-row">
              <span className="success-patient-label">No. RM</span>
              <span className="success-patient-value">{norm || "-"}</span>
            </div>
            <div className="success-patient-row">
              <span className="success-patient-label">Jenis Layanan</span>
              <span className="success-patient-value">{config.label}</span>
            </div>
            <div className="success-patient-row">
              <span className="success-patient-label">Unit Pelayanan</span>
              <span className="success-patient-value">
                {pelayananList.find((p) => p.bagian_id === selectedBagianId)?.bagian_nama ?? "-"}
              </span>
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
            <span>Semoga lekas sehat dan pemulihan berjalan lancar</span>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  /* ─── Survey form (single page) ─── */
  return (
    <>
      {/* ── Sticky progress strip ── */}
      <div className="progress-strip">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      {/* ── Hero header ── */}
      <header className="hero">
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
            <div className="hero-badge">
              <ClipboardCheck size={16} strokeWidth={2} />
              <span>{config.label}</span>
            </div>
            <h1>Survei Kepuasan Pasien</h1>
            <p className="hero-desc">
              {config.heroDesc}
              {" "}Jawaban Anda bersifat <strong>rahasia</strong>.
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
        {/* ── Patient identity inputs ── */}
        <div className="card graha-identity-inline">
          <p className="graha-inline-title">
            <User size={16} strokeWidth={2.5} />
            Data Pasien
          </p>
          <div className="graha-inline-fields">
            <div className="graha-inline-row">
              <div className="graha-input-group">
                <input
                  id="graha-norm"
                  type="text"
                  placeholder=" "
                  value={norm}
                  onChange={(e) => setNorm(e.target.value)}
                  autoComplete="off"
                />
                <label htmlFor="graha-norm">
                  <IdCard size={18} strokeWidth={2.2} />
                  No. Rekam Medis
                </label>
              </div>
              <div className="graha-input-group">
                <input
                  id="graha-nama"
                  type="text"
                  placeholder=" "
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  autoComplete="name"
                />
                <label htmlFor="graha-nama">
                  <User size={18} strokeWidth={2.2} />
                  Nama Lengkap <span style={{ color: "#ef4444" }}>*</span>
                </label>
              </div>
            </div>
            <SearchableDropdown
              options={pelayananList}
              value={selectedBagianId}
              onChange={setSelectedBagianId}
              loading={pelayananLoading}
              placeholder="Pilih Unit Pelayanan"
            />
          </div>
        </div>

        {/* Guide */}
        <div className="card guide-card">
          <p className="guide-title">Panduan Penilaian</p>
          <p className="guide-desc">
            Pilih jumlah bintang yang sesuai untuk setiap pertanyaan
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

        {/* ── Catatan Lainnya ── */}
        <div className="card graha-catatan-card">
          <div className="graha-catatan-header">
            <MessageSquare size={18} strokeWidth={2} />
            <span>Catatan Lainnya</span>
          </div>
          <textarea
            className="graha-catatan-textarea"
            placeholder="Tuliskan saran, keluhan, atau masukan lainnya di sini..."
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
                  ? "Lengkapi data pasien terlebih dahulu"
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
