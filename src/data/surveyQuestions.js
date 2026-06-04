// Survey questions for NHR Patient Reported Measurement
// PREM = Patient Reported Experience Measures (Bobot 60%)
// PROM = Patient Reported Outcome Measures (Bobot 40%)

export const LIKERT_SCALE = [
  { value: 1, label: "Sangat Tidak Setuju", points: 0, stars: 1, color: "rose" },
  { value: 2, label: "Tidak Setuju", points: 25, stars: 2, color: "orange" },
  { value: 3, label: "Netral", points: 50, stars: 3, color: "amber" },
  { value: 4, label: "Setuju", points: 75, stars: 4, color: "teal" },
  { value: 5, label: "Sangat Setuju", points: 100, stars: 5, color: "emerald" },
];

export const PREM_QUESTIONS = [
  {
    id: "prem_1",
    number: 1,
    category: "Komunikasi",
    question:
      "Dokter menjelaskan rencana tindakan (primary pci/trombolisis) dengan bahasa yang mudah anda mengerti",
  },
  {
    id: "prem_2",
    number: 2,
    category: "Responsivitas",
    question:
      "Staf medis merespons dengan cepat saat anda mengalami nyeri dada atau gejala berulang di bangsal",
  },
  {
    id: "prem_3",
    number: 3,
    category: "Penghormatan",
    question:
      "Dokter dan perawat menghormati serta mendengarkan seluruh keluhan dan kekhawatiran anda",
  },
  {
    id: "prem_4",
    number: 4,
    category: "Informasi",
    question:
      "Staf medis memberi informasi yang cukup tentang kondisi jantung dan pengobatan anda",
  },
  {
    id: "prem_5",
    number: 5,
    category: "Shared Decision",
    question:
      "Anda merasa dilibatkan dalam pengambilan keputusan terkait prosedur kardiovaskular anda",
  },
  {
    id: "prem_6",
    number: 6,
    category: "Lingkungan",
    question:
      "Ruang perawatan jantung bersih, nyaman, dan kondusif untuk pemulihan anda",
  },
  {
    id: "prem_7",
    number: 7,
    category: "Edukasi Obat",
    question:
      "Resep dan petunjuk penggunaan obat (antiplatelet, beta-blocker, statin) dijelaskan dengan jelas kepada anda",
  },
  {
    id: "prem_8",
    number: 8,
    category: "Discharge",
    question:
      "Anda mendapat informasi yang jelas tentang jadwal kontrol dan tanda bahaya yang harus diwaspadai setelah pulang",
  },
  {
    id: "prem_9",
    number: 9,
    category: "Administrasi",
    question:
      "Proses administrasi (pendaftaran, pembiayaan, klaim bpjs) berjalan lancar dan tidak membebani",
  },
  {
    id: "prem_10",
    number: 10,
    category: "Kepuasan Global",
    question:
      "Secara keseluruhan, seberapa puas Anda dengan pengalaman perawatan di unit jantung ini",
  },
  {
    id: "prem_11",
    number: 11,
    category: "Aspek Keperawatan",
    question:
      "Perawat memeriksa kondisi saudara/ri, memastikan tidak sesak dan nyeri",
  },
];

export const PROM_QUESTIONS = [
  {
    id: "prom_1",
    number: 1,
    category: "Gejala (KCCQ)",
    question:
      "Nyeri dada anda hilang atau berkurang secara signifikan setelah tindakan pci/trombolisis",
  },
  {
    id: "prom_2",
    number: 2,
    category: "Kapasitas (Duke)",
    question:
      "Anda mampu berjalan setara 100 meter tanpa merasa nyeri dada atau sesak napas",
  },
  {
    id: "prom_3",
    number: 3,
    category: "Respirasi",
    question:
      "Seberapa berkurang frekuensi sesak napas Anda dalam 1 minggu terakhir dibandingkan sebelum masuk RS",
  },
  {
    id: "prom_4",
    number: 4,
    category: "Kemandirian",
    question:
      "Anda dapat melakukan aktivitas ringan sehari-hari (mandi, berpakaian) secara mandiri",
  },
  {
    id: "prom_5",
    number: 5,
    category: "Kualitas Tidur",
    question:
      "Kualitas tidur anda membaik sejak mendapat perawatan di rumah sakit",
  },
  {
    id: "prom_6",
    number: 6,
    category: "Mental",
    question:
      "Anda merasa tenang dan tidak cemas berlebihan tentang kondisi jantung anda saat ini",
  },
  {
    id: "prom_7",
    number: 7,
    category: "Kepatuhan",
    question:
      "Anda memahami dan dapat mematuhi pengobatan jangka panjang anda",
  },
  {
    id: "prom_8",
    number: 8,
    category: "Gaya Hidup",
    question:
      "Anda sudah mulai menerapkan gaya hidup sehat (berhenti merokok, diet) sesuai anjuran dokter",
  },
  {
    id: "prom_9",
    number: 9,
    category: "Kesejahteraan",
    question:
      "Semangat dan motivasi hidup anda meningkat setelah mendapat perawatan",
  },
  {
    id: "prom_10",
    number: 10,
    category: "Outcome Global",
    question:
      "Secara keseluruhan, apakah kondisi kesehatan Anda terasa lebih baik dibandingkan saat pertama kali masuk RS",
  },
  {
    id: "prom_11",
    number: 11,
    category: "Aspek Keperawatan",
    question:
      "Saya dapat bed rest dan istirahat selama perawatan",
  },
];
