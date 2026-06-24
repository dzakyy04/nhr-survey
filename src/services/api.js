// API service for NHR Survey — Oracle APEX REST (ORDS)

const BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.API_BASE_URL || "";
const API_KEY = import.meta.env.VITE_API_KEY || "";

/**
 * Helper to build headers with Authorization API Key
 */
async function getAuthHeaders(additionalHeaders = {}) {
  const headers = { Accept: "application/json", ...additionalHeaders };
  if (API_KEY) {
    headers["Authorization"] = `Bearer ${API_KEY}`;
  } else {
    console.warn("VITE_API_KEY belum diatur di file .env!");
  }
  return headers;
}

/**
 * Normalize a raw ORDS pertanyaan item into the shape
 * expected by QuestionCard: { id, number, category, question, jenis }
 *
 * @param {{ pertanyaan_id, nomor, pertanyaan, jenis, kategori }} item
 */
function normalizeQuestion(item) {
  return {
    id: `${item.jenis}_${item.pertanyaan_id}`,
    number: item.nomor,
    category: item.kategori,
    question: item.pertanyaan,
    jenis: item.jenis,
  };
}

/**
 * Fetch all survey questions from ORDS.
 * Returns { prem: [...], prom: [...] } — each item normalized for QuestionCard.
 *
 * @returns {Promise<{ prem: Array, prom: Array }>}
 */
export async function fetchSurveyQuestions() {
  const url = `${BASE_URL}/pertanyaan/`;
  const headers = await getAuthHeaders();

  const res = await fetch(url, { method: "GET", headers });

  if (!res.ok) {
    throw new Error(`Gagal memuat pertanyaan (${res.status})`);
  }

  const json = await res.json();
  const items = (json.data ?? []).map(normalizeQuestion);

  return {
    prem: items.filter((q) => q.jenis === "prem"),
    prom: items.filter((q) => q.jenis === "prom"),
  };
}

/**
 * Fetch patient data by token from ORDS.
 * Response is always a Collection Query: { items: [...], hasMore, count, ... }
 *
 * @param {string} token — 32-char hex token from URL path
 */
export async function fetchTokenData(token) {
  const url = `${BASE_URL}/tokens/${encodeURIComponent(token)}`;
  const headers = await getAuthHeaders();

  const res = await fetch(url, { method: "GET", headers });

  if (res.status === 404) {
    throw new TokenError("Token tidak ditemukan", "NOT_FOUND");
  }

  if (!res.ok) {
    throw new TokenError(`Server error (${res.status})`, "SERVER_ERROR");
  }

  const json = await res.json();
  const data = (json.data ?? [])[0];

  if (!data) {
    throw new TokenError("Token tidak ditemukan", "NOT_FOUND");
  }

  if (data.status === "completed") {
    throw new TokenError(
      "Survei sudah pernah diisi untuk token ini",
      "COMPLETED",
    );
  }

  return data;
}

/**
 * Submit all survey answers in a single POST.
 *
 * @param {string} token — 32-char hex token
 * @param {string} regpasienNo — patient registration number
 * @param {Record<string, number>} answers — { "prem_1": 4, "prom_12": 5, ... }
 * @returns {Promise<void>}
 */
export async function submitSurvey(token, regpasienNo, answers) {
  const entries = Object.entries(answers);

  if (entries.length === 0) {
    throw new Error("Tidak ada jawaban untuk dikirim");
  }

  const jawaban = entries.map(([id, nilai]) => {
    const pertanyaanId = Number(id.split("_").pop());
    return { pertanyaan_id: pertanyaanId, nilai };
  });

  const headers = await getAuthHeaders({ "Content-Type": "application/json" });

  const res = await fetch(`${BASE_URL}/jawaban/`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      token,
      regpasien_no: regpasienNo,
      jawaban,
    }),
  });

  if (res.status === 409) {
    throw new Error("Survei sudah pernah diisi untuk token ini");
  }

  if (!res.ok) {
    throw new Error(`Gagal mengirim survei (${res.status})`);
  }
}

/* ═══════════════════════════════════════════════════════════
   GRAHA EKSEKUTIF API
   ═══════════════════════════════════════════════════════════ */

/**
 * Fetch all survey questions for Graha Eksekutif from ORDS.
 *
 * @param {"ranap" | "rajal"} tipe — type of care
 * @returns {Promise<{ prem: Array, prom: Array }>}
 */
export async function fetchGrahaQuestions(tipe = "ranap") {
  const url = `${BASE_URL}/pertanyaan/graha/${tipe}`;
  const headers = await getAuthHeaders();

  const res = await fetch(url, { method: "GET", headers });

  if (!res.ok) {
    throw new Error(`Gagal memuat pertanyaan (${res.status})`);
  }

  const json = await res.json();
  const items = (json.data ?? []).map(normalizeQuestion);

  return {
    prem: items.filter((q) => q.jenis === "prem"),
    prom: items.filter((q) => q.jenis === "prom"),
  };
}

/**
 * Fetch all pelayanan (unit) options for Graha Eksekutif.
 *
 * @param {"ranap" | "rajal"} tipe — type of care
 * @returns {Promise<Array<{ bagian_id: number, bagian_nama: string }>>}
 */
export async function fetchGrahaPelayanan(tipe = "rajal") {
  let allItems = [];
  let url = `${BASE_URL}/pelayanan/graha/${tipe}`;

  while (url) {
    const headers = await getAuthHeaders();
    const res = await fetch(url, { method: "GET", headers });

    if (!res.ok) {
      throw new Error(`Gagal memuat data pelayanan (${res.status})`);
    }

    const json = await res.json();
    const items = json.data ?? [];
    allItems = allItems.concat(items);

    const nextLink = (json.links ?? []).find((l) => l.rel === "next");
    url = nextLink ? nextLink.href : null;
  }

  return allItems;
}

/**
 * Submit Graha Eksekutif survey answers in a single POST.
 *
 * @param {string} norm — patient medical record number
 * @param {string} pasienNama — patient name
 * @param {Record<string, number>} answers
 * @param {string} [catatan]
 * @param {number} [bagianId]
 * @param {"ranap" | "rajal"} [tipe]
 * @returns {Promise<void>}
 */
export async function submitGrahaSurvey(norm, pasienNama, answers, catatan, bagianId, tipe) {
  const entries = Object.entries(answers);

  if (entries.length === 0) {
    throw new Error("Tidak ada jawaban untuk dikirim");
  }

  const jawaban = entries.map(([id, nilai]) => {
    const pertanyaanId = Number(id.split("_").pop());
    return { pertanyaan_id: pertanyaanId, nilai };
  });

  const headers = await getAuthHeaders({ "Content-Type": "application/json" });

  const res = await fetch(`${BASE_URL}/jawaban/graha`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      norm,
      pasien_nama: pasienNama,
      catatan: catatan || null,
      bagian_id: bagianId || null,
      tipe: tipe || "ranap",
      jawaban,
    }),
  });

  if (!res.ok) {
    throw new Error(`Gagal mengirim survei (${res.status})`);
  }
}

/**
 * Custom error class for token-related errors.
 */
export class TokenError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "TokenError";
    this.code = code;
  }
}

/**
 * Fetch patient name by NORM
 * @param {string} norm 
 * @returns {Promise<string|null>} patient name or null if not found
 */
export async function fetchPasienByNorm(norm) {
  const url = `${BASE_URL}/pasien/${norm}`;
  const headers = await getAuthHeaders();
  
  const res = await fetch(url, { method: "GET", headers });
  if (!res.ok) return null;
  const json = await res.json();
  const data = (json.data ?? [])[0];
  return data ? data.pasien_nama : null;
}
