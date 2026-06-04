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
      "Anda menerima informasi tertulis atau lisan yang jelas mengenai obat pengencer darah (antiplatelet/antikoagulan) yang harus diminum setelah pulang",
  },
  {
    id: "prem_5",
    number: 5,
    category: "Shared Decision",
    question:
      "Anda dilibatkan dalam keputusan tentang pilihan pengobatan (misalnya PCI vs trombolisis vs konservatif)",
  },
  {
    id: "prem_6",
    number: 6,
    category: "Lingkungan",
    question:
      "Ruang perawatan (ICCU/bangsal jantung) bersih, tenang, dan nyaman untuk pemulihan",
  },
  {
    id: "prem_7",
    number: 7,
    category: "Edukasi Obat",
    question:
      "Perawat/apoteker menjelaskan efek samping obat jantung yang harus diwaspadai (misalnya risiko perdarahan akibat antiplatelet ganda)",
  },
  {
    id: "prem_8",
    number: 8,
    category: "Discharge",
    question:
      "Saat pulang, anda mendapat penjelasan yang jelas tentang jadwal kontrol, tanda bahaya yang harus diwaspadai, dan rencana rehabilitasi jantung",
  },
  {
    id: "prem_9",
    number: 9,
    category: "Administrasi",
    question:
      "Proses pendaftaran, administrasi, dan pengurusan jaminan (BPJS/asuransi) berjalan lancar tanpa hambatan berarti",
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
      "Anda mampu berjalan di lorong bangsal atau naik tangga tanpa nyeri dada atau sesak napas yang berarti",
  },
  {
    id: "prom_3",
    number: 3,
    category: "Respirasi",
    question:
      "Sesak napas anda membaik dibanding saat pertama masuk rumah sakit",
  },
  {
    id: "prom_4",
    number: 4,
    category: "Kemandirian",
    question:
      "Anda dapat melakukan aktivitas dasar (mandi, berpakaian, makan) secara mandiri saat ini",
  },
  {
    id: "prom_5",
    number: 5,
    category: "Kualitas Tidur",
    question:
      "Anda dapat tidur dengan nyenyak tanpa terbangun karena sesak napas atau nyeri dada",
  },
  {
    id: "prom_6",
    number: 6,
    category: "Mental",
    question:
      "Anda merasa lebih tenang dan tidak cemas mengenai kondisi jantung anda setelah mendapat perawatan",
  },
  {
    id: "prom_7",
    number: 7,
    category: "Kepatuhan",
    question:
      "Anda memahami dan bersedia minum obat jantung sesuai jadwal yang diberikan dokter setelah pulang",
  },
  {
    id: "prom_8",
    number: 8,
    category: "Gaya Hidup",
    question:
      "Anda bersedia mengubah gaya hidup (berhenti merokok, diet rendah garam/lemak, olahraga teratur) sesuai anjuran dokter",
  },
  {
    id: "prom_9",
    number: 9,
    category: "Kesejahteraan",
    question:
      "Secara keseluruhan, anda merasa kondisi kesehatan anda lebih baik dibanding saat pertama kali masuk RS",
  },
  {
    id: "prom_10",
    number: 10,
    category: "Outcome Global",
    question:
      "Anda yakin bahwa perawatan yang diterima di RS ini memberikan hasil yang baik untuk kondisi jantung anda",
  },
  {
    id: "prom_11",
    number: 11,
    category: "Aspek Keperawatan",
    question:
      "Perawat memberikan edukasi tentang latihan napas dalam dan mobilisasi bertahap pasca tindakan",
  },
];


