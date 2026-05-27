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

    // Field teks standar
    formData.append("nama_fasilitas", data.nama_fasilitas);
    formData.append("deskripsi", data.deskripsi || "");
    formData.append("lokasi", data.lokasi || "");
    formData.append("tipe", data.tipe || "Outdoor"); // <-- BUG FIX: Tipe ditambahkan
    formData.append("kapasitas", data.kapasitas || "");
    formData.append("status", data.status || "aktif");

    // Jadwal array → stringify
    if (data.jadwal) {
      formData.append("jadwal", JSON.stringify(data.jadwal));
    }

    // Upload gambar (jika ada)
    if (data.gambar) {
      formData.append("gambar", data.gambar);
    }

    const res = await api.post("/fasilitas", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  },

  // ─── UPDATE FASILITAS ──────────────────────────────
  updateFasilitas: async (id, data) => {
    const formData = new FormData();

    // Cara yang lebih bersih (Clean Code) dibanding pakai banyak if
    const textFields = [
      "nama_fasilitas",
      "deskripsi",
      "lokasi",
      "tipe", // <-- BUG FIX: Tipe ditambahkan
      "kapasitas",
      "status"
    ];

    // Otomatis mengecek dan memasukkan data teks yang dikirim
    textFields.forEach((field) => {
      if (data[field] !== undefined && data[field] !== null) {
        formData.append(field, data[field]);
      }
    });

    // Handle data spesial (Jadwal)
    if (data.jadwal !== undefined) {
      formData.append("jadwal", JSON.stringify(data.jadwal));
    }

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