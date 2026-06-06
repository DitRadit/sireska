import api from "../api/axios";

const fasilitasService = {
  // ─── GET ALL FASILITAS ─────────────────────────────
  getAllFasilitas: async (params = {}) => {
    const res = await api.get("/fasilitas", { params });
    return res.data;
  },

  // ─── GET DETAIL FASILITAS ──────────────────────────
  getFasilitasById: async (id) => {
    const res = await api.get(`/fasilitas/${id}`);
    return res.data;
  },

  // ─── CREATE FASILITAS ──────────────────────────────
createFasilitas: async (data) => {
  const formData = new FormData();
  formData.append("nama_fasilitas", data.nama_fasilitas);
  formData.append("deskripsi", data.deskripsi || "");
  formData.append("lokasi", data.lokasi || "");
  formData.append("tipe", data.tipe || "Outdoor");
  formData.append("alamat", data.alamat || "");
  formData.append("latitude", data.latitude || "");
  formData.append("longitude", data.longitude || "");
  formData.append("kapasitas", data.kapasitas || "");
  formData.append("jam_buka", data.jam_buka || "08:00");   // ← tambah
  formData.append("jam_tutup", data.jam_tutup || "17:00"); // ← tambah
  formData.append("status", data.status || "aktif");

  // Hapus bagian jadwal karena sudah tidak dipakai
  // if (data.jadwal) { formData.append("jadwal", ...) }

  if (data.gambar) formData.append("gambar", data.gambar);

  const res = await api.post("/fasilitas", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
},

  // ─── UPDATE FASILITAS ──────────────────────────────
  updateFasilitas: async (id, data) => {
    const formData = new FormData();

    // Cara yang lebih bersih (Clean Code) dibanding pakai banyak if
const textFields = [
  "nama_fasilitas", "deskripsi", "lokasi", "alamat",
  "latitude", "longitude",
  "tipe", "kapasitas", "status",
  "jam_buka", "jam_tutup", // ← tambah
];

    // Otomatis mengecek dan memasukkan data teks yang dikirim
    textFields.forEach((field) => {
      if (data[field] !== undefined && data[field] !== null) {
        formData.append(field, data[field]);
      }
    });

    // Handle data gambar (Hanya dikirim jika admin mengubah gambar)
    if (data.gambar) {
      formData.append("gambar", data.gambar);
    }

    const res = await api.put(`/fasilitas/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  },

  // ─── UPDATE STATUS ─────────────────────────────────
  updateStatus: async (id, status) => {
    const res = await api.patch(`/fasilitas/${id}/status`, { status });
    return res.data;
  },

  // ─── DELETE FASILITAS ──────────────────────────────
  deleteFasilitas: async (id) => {
    const res = await api.delete(`/fasilitas/${id}`);
    return res.data;
  },
};

export default fasilitasService;