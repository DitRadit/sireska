import api from "../api/axios";

const bookingService = {
    // ─── User ──────────────────────────────────────────────────────────────────
createBooking: async (data) => {
    const formData = new FormData();
    formData.append("fasilitas_id", data.fasilitas_id);
    formData.append("tanggal",      data.tanggal);
    formData.append("jam_mulai",    data.jam_mulai);
    formData.append("jam_selesai",  data.jam_selesai);
    formData.append("keperluan",    data.keperluan || "");
    if (data.dokumen) formData.append("dokumen", data.dokumen); // ← opsional

    const res = await api.post("/reservasi", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
},
    cancelBooking: async (id) => {
        const res = await api.patch(`/reservasi/${id}/cancel`);
        return res.data;
    },
    getBookingById: async (id) => {
        const res = await api.get(`/reservasi/my/${id}`);
        return res.data;
    },
    getMyBookings: async (status) => {
        const params = status ? { status } : {};
        const res = await api.get("/reservasi/my", { params });
        return res.data;
    },
    getSlotTersedia: async (fasilitas_id, tanggal) => {
        const res = await api.get("/reservasi/slot-tersedia", {
            params: { fasilitas_id, tanggal },
        });
        return res.data;
    },

    // ─── Admin ─────────────────────────────────────────────────────────────────
    getAllBookings: async ({ status, fasilitas_id, tanggal } = {}) => {
        const params = {};
        if (status)       params.status       = status;
        if (fasilitas_id) params.fasilitas_id = fasilitas_id;
        if (tanggal)      params.tanggal      = tanggal;
        const res = await api.get("/reservasi/admin", { params });
        return res.data;
    },
    getBookingByIdAdmin: async (id) => {
        const res = await api.get(`/reservasi/admin/${id}`);
        return res.data;
    },
    approveBooking: async (id, catatan_admin) => {
        const res = await api.patch(`/reservasi/admin/${id}/approve`, { catatan_admin });
        return res.data;
    },
    rejectBooking: async (id, catatan_admin) => {
        const res = await api.patch(`/reservasi/admin/${id}/reject`, { catatan_admin });
        return res.data;
    },
    deleteBooking: async (id) => {
        const res = await api.delete(`/reservasi/admin/${id}`);
        return res.data;
    },
    simulasiPembayaran: async (id) => {
        const res = await api.post(`/reservasi/dev/simulasi/${id}`);
        return res.data;
    },
};

export default bookingService;