// src/service/fasilitasService.js

import api from "../api/axios";

const fasilitasService = {

    // ─── GET ALL FASILITAS ─────────────────────────────
    getAllFasilitas: async (params = {}) => {
        const res = await api.get("/fasilitas", {
            params,
        });

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
        formData.append("kapasitas", data.kapasitas || "");
        formData.append("status", data.status || "aktif");

        // Jadwal array → stringify
        if (data.jadwal) {
            formData.append("jadwal", JSON.stringify(data.jadwal));
        }

        // Upload gambar
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

        if (data.nama_fasilitas !== undefined) {
            formData.append("nama_fasilitas", data.nama_fasilitas);
        }

        if (data.deskripsi !== undefined) {
            formData.append("deskripsi", data.deskripsi);
        }

        if (data.lokasi !== undefined) {
            formData.append("lokasi", data.lokasi);
        }

        if (data.kapasitas !== undefined) {
            formData.append("kapasitas", data.kapasitas);
        }

        if (data.status !== undefined) {
            formData.append("status", data.status);
        }

        if (data.jadwal !== undefined) {
            formData.append("jadwal", JSON.stringify(data.jadwal));
        }

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
        const res = await api.patch(`/fasilitas/${id}/status`, {
            status,
        });

        return res.data;
    },

    // ─── DELETE FASILITAS ──────────────────────────────
    deleteFasilitas: async (id) => {
        const res = await api.delete(`/fasilitas/${id}`);
        return res.data;
    },
};

export default fasilitasService;