// API service for NHR Survey — Oracle APEX REST (ORDS)

const BASE_URL = import.meta.env.API_BASE_URL || "";

/**
 * Fetch patient data by token from ORDS.
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

  // ORDS Collection Query wraps data in items[]
  // ORDS Collection Item returns object directly
  const data = json.items ? json.items[0] : json;

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
