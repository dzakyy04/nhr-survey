// API service for NHR Survey — Oracle APEX REST (ORDS)

const BASE_URL = import.meta.env.API_BASE_URL || "";

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

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Gagal memuat pertanyaan (${res.status})`);
  }

  const json = await res.json();
  const items = (json.items ?? []).map(normalizeQuestion);

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
 * @returns {Promise<{
 *   nhr_token_id: number,
 *   token: string,
 *   norm: string,
 *   regpasien_no: string,
 *   pasien_nama: string,
 *   status: string,
 *   pelayanan: string,
 *   penyakit: string,
 *   created: string
 * }>}
 */
export async function fetchTokenData(token) {
  const url = `${BASE_URL}/tokens/${encodeURIComponent(token)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (res.status === 404) {
    throw new TokenError("Token tidak ditemukan", "NOT_FOUND");
  }

  if (!res.ok) {
    throw new TokenError(`Server error (${res.status})`, "SERVER_ERROR");
  }

  const json = await res.json();

  // ORDS always wraps results in items[]
  const data = (json.items ?? [])[0];

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
 * Backend inserts all answers AND marks the token as completed
 * in one atomic transaction.
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

  // Build jawaban array
  const jawaban = entries.map(([id, nilai]) => {
    // id format: "prem_1" or "prom_12" → extract pertanyaan_id after last underscore
    const pertanyaanId = Number(id.split("_").pop());
    return { pertanyaan_id: pertanyaanId, nilai };
  });

  const res = await fetch(`${BASE_URL}/jawaban/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
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
 * Returns { prem: [...], prom: [...] } — each item normalized for QuestionCard.
 * Note: Graha questions may have null kategori.
 *
 * @param {"ranap" | "rajal"} tipe — type of care
 * @returns {Promise<{ prem: Array, prom: Array }>}
 */
export async function fetchGrahaQuestions(tipe = "ranap") {
  const url = `${BASE_URL}/pertanyaan/graha/${tipe}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Gagal memuat pertanyaan (${res.status})`);
  }

  const json = await res.json();
  const items = (json.items ?? []).map(normalizeQuestion);

  return {
    prem: items.filter((q) => q.jenis === "prem"),
    prom: items.filter((q) => q.jenis === "prom"),
  };
}

/**
 * Fetch all pelayanan (unit) options for Graha Eksekutif.
 * Handles ORDS pagination automatically to fetch all items.
 *
 * @param {"ranap" | "rajal"} tipe — type of care
 * @returns {Promise<Array<{ bagian_id: number, bagian_nama: string }>>}
 */
export async function fetchGrahaPelayanan(tipe = "rajal") {
  let allItems = [];
  // Both use /pelayanan/graha/{tipe}
  let url = `${BASE_URL}/pelayanan/graha/${tipe}`;

  while (url) {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`Gagal memuat data pelayanan (${res.status})`);
    }

    const json = await res.json();
    const items = json.items ?? [];
    allItems = allItems.concat(items);

    // Check for next page
    const nextLink = (json.links ?? []).find((l) => l.rel === "next");
    url = nextLink ? nextLink.href : null;
  }

  return allItems;
}

/**
 * Submit Graha Eksekutif survey answers in a single POST.
 * Backend inserts all answers and stores catatan on the first row.
 * The tipe field determines whether UNIT is stored as graha_ranap or graha_rajal.
 *
 * @param {string} norm — patient medical record number (self-entered)
 * @param {string} pasienNama — patient name (self-entered)
 * @param {Record<string, number>} answers — { "prem_1": 4, "prom_5": 5, ... }
 * @param {string} [catatan] — optional free text notes
 * @param {number} [bagianId] — selected pelayanan unit ID
 * @param {"ranap" | "rajal"} [tipe] — type of care
 * @returns {Promise<void>}
 */
export async function submitGrahaSurvey(norm, pasienNama, answers, catatan, bagianId, tipe) {
  const entries = Object.entries(answers);

  if (entries.length === 0) {
    throw new Error("Tidak ada jawaban untuk dikirim");
  }

  // Build jawaban array
  const jawaban = entries.map(([id, nilai]) => {
    const pertanyaanId = Number(id.split("_").pop());
    return { pertanyaan_id: pertanyaanId, nilai };
  });

  const res = await fetch(`${BASE_URL}/jawaban/graha`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
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
  /**
   * @param {string} message
   * @param {"NOT_FOUND" | "COMPLETED" | "SERVER_ERROR" | "NETWORK_ERROR"} code
   */
  constructor(message, code) {
    super(message);
    this.name = "TokenError";
    this.code = code;
  }
}
