import { useState, useCallback, useMemo } from "react";
import {
  PREM_QUESTIONS,
  PROM_QUESTIONS,
  LIKERT_SCALE,
} from "./data/surveyQuestions";

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

const C = "#277B85";
const C_LIGHT = "#e6f3f4";

function Stars({ count, size = 14, maxW }) {
  return (
    <span className="opt-stars" style={{ fontSize: size, ...(maxW ? { maxWidth: maxW } : {}) }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= count ? "on" : "off"}>★</span>
      ))}
    </span>
  );
}

function Question({ q, value, onSelect }) {
  return (
    <div className="survey-card" id={`q-${q.id}`}>
      <div className="flex items-start gap-3 mb-3">
        <span
          className="shrink-0 w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center"
          style={{ background: C }}
        >
          {q.number}
        </span>
        <div>
          <span
            className="inline-block text-[11px] font-medium px-2 py-0.5 rounded mb-1"
            style={{ color: C, background: C_LIGHT }}
          >
            {q.category}
          </span>
          <p className="text-[13.5px] sm:text-sm text-[#2a3a4a] leading-relaxed">
            {q.question}
          </p>
        </div>
      </div>
      <div className="flex items-stretch gap-1.5 sm:gap-2.5">
        {LIKERT_SCALE.map((opt) => {
          const sel = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(q.id, opt.value)}
              className={`opt-btn ${sel ? `selected-${opt.value}` : ""}`}
            >
              <Stars count={opt.stars} size={11} maxW={36} />
              <span className="text-[10px] sm:text-[11px] font-medium leading-tight text-center text-[#4a5a6a]">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const params = useMemo(getParams, []);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const disease = DISEASES[params.disease] || { name: "-", service: "-" };

  const handleSelect = useCallback((id, val) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  }, []);

  const total = PREM_QUESTIONS.length + PROM_QUESTIONS.length;
  const answered = Object.keys(answers).length;

  const GUIDE_STYLES = {
    5: { bg: "#ecfdf5", border: "#a7f3d0", text: "#059669" },
    4: { bg: "#f0fdfa", border: "#99f6e4", text: "#0d9488" },
    3: { bg: "#fffbeb", border: "#fde68a", text: "#d97706" },
    2: { bg: "#fff7ed", border: "#fed7aa", text: "#ea580c" },
    1: { bg: "#fff1f2", border: "#fecdd3", text: "#e11d48" },
  };

  return (
    <>
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-6 py-5 sm:py-6 space-y-4 sm:space-y-5">

        {/* Header */}
        <div className="survey-card">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: C }}
            >
              <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
                <path d="M9 14l2 2 4-4"/>
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1a2b3c]">
                Patient Reported Measurement (PRM)
              </h1>
              <p className="text-xs text-[#6b7b8d]">PREM & PROM Assessment</p>
            </div>
          </div>
          <div
            className="rounded-xl px-4 py-3 text-[13px] leading-relaxed"
            style={{ background: C_LIGHT, color: "#2a5560" }}
          >
            Survei ini mengevaluasi pengalaman dan hasil perawatan Anda.
            Jawaban bersifat <strong className="font-semibold text-[#1a2b3c]">rahasia</strong> dan
            akan membantu meningkatkan kualitas pelayanan.
          </div>
        </div>

        {/* Patient info */}
        <div className="survey-card">
          <h2 className="text-sm font-bold text-[#1a2b3c] mb-3">Data Pasien</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] text-[#6b7b8d] mb-1">Nama Lengkap</label>
              <div className="bg-[#f5f7fa] rounded-lg px-3 py-2 text-sm font-medium text-[#1a2b3c] border border-[#e5e9ee]">
                {params.name}
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-[#6b7b8d] mb-1">Nomor Rekam Medis</label>
              <div className="bg-[#f5f7fa] rounded-lg px-3 py-2 text-sm font-medium text-[#1a2b3c] border border-[#e5e9ee]">
                {params.rm}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ background: C_LIGHT }}>
            <svg width="16" height="16" fill="none" stroke={C} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            <span className="text-[12px] text-[#3a5060]">
              <strong style={{ color: C }}>Pelayanan: {disease.service}</strong>
              <span className="mx-1.5 text-[#c0c8d0]">|</span>
              Penyakit: {disease.name}
            </span>
          </div>
        </div>

        {/* Scoring guide */}
        <div className="survey-card">
          <h2 className="text-sm font-bold text-[#1a2b3c] mb-3">Panduan Penilaian</h2>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
            {LIKERT_SCALE.map((item) => {
              const s = GUIDE_STYLES[item.value];
              return (
                <div
                  key={item.value}
                  className="flex flex-col items-center gap-1.5 p-2 sm:p-4 rounded-xl"
                  style={{ background: s.bg, border: `1.5px solid ${s.border}` }}
                >
                  <Stars count={item.stars} size={14} maxW={46} />
                  <span
                    className="text-[10px] sm:text-xs font-semibold text-center leading-tight"
                    style={{ color: s.text }}
                  >
                    {item.label}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-[#9aa5b0]">{item.points} poin</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* PREM */}
        <div className="survey-card" style={{ background: C_LIGHT }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: C }}>
              <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1a2b3c]">PREM - Pengalaman Pasien</h2>
              <p className="text-[11px] text-[#6b7b8d]">Patient Reported Experience (Bobot 60%)</p>
            </div>
          </div>
        </div>

        {PREM_QUESTIONS.map((q) => (
          <Question key={q.id} q={q} value={answers[q.id]} onSelect={handleSelect} />
        ))}

        {/* PROM */}
        <div className="survey-card" style={{ background: C_LIGHT }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: C }}>
              <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1a2b3c]">PROM - Hasil Pengobatan</h2>
              <p className="text-[11px] text-[#6b7b8d]">Patient Reported Outcome (Bobot 40%)</p>
            </div>
          </div>
        </div>

        {PROM_QUESTIONS.map((q) => (
          <Question key={q.id} q={q} value={answers[q.id]} onSelect={handleSelect} />
        ))}

        {/* Submit inline */}
        <div className="survey-card text-center">
          <p className="text-[12px] text-[#6b7b8d] mb-3">
            {answered} dari {total} pertanyaan telah dijawab
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="w-full py-3 rounded-xl text-white text-sm font-semibold active:scale-[.97] transition-transform"
            style={{ background: C }}
          >
            Kirim Survey
          </button>
        </div>

        <div className="h-6" />
      </div>

      {/* Success modal */}
      {submitted && (
        <div className="overlay" onClick={() => setSubmitted(false)}>
          <div className="overlay-card" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full bg-[#ecfdf5] flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <path d="M22 4L12 14.01l-3-3"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[#1a2b3c] mb-1.5">Survey Berhasil Dikirim</h2>
            <p className="text-sm text-[#6b7b8d] leading-relaxed mb-5">
              Terima kasih atas partisipasi Anda. Jawaban Anda akan membantu
              meningkatkan kualitas pelayanan rumah sakit.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="w-full py-2.5 rounded-xl text-white text-sm font-semibold active:scale-[.97] transition-transform"
              style={{ background: C }}
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </>
  );
}
