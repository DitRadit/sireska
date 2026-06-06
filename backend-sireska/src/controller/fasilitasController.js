// src/controller/fasilitasController.js
const { PrismaClient } = require("@prisma/client");
const { cloudinary } = require("../config/cloudinary");

const prisma = new PrismaClient();
const ROLE_GUEST = 3;

const filterHarga = (fasilitas, role_id) => {
    const isGuest = !role_id || role_id === ROLE_GUEST;
    if (!isGuest) {
        const { harga_per_jam, ...rest } = fasilitas;
        return rest;
    }
    return fasilitas;
};

// ─── GET SEMUA FASILITAS ───────────────────────────────────────────────────────
exports.getAllFasilitas = async (req, res) => {
    try {
        const { status, search } = req.query;
        const where = {};
        if (status) where.status = status;
        if (search) where.nama_fasilitas = { contains: search };

        const fasilitasList = await prisma.fasilitas.findMany({
            where,
            orderBy: { created_at: "desc" },
        });

        const role_id = req.user?.role_id;
        const data = fasilitasList.map((f) => filterHarga(f, role_id));

        res.json({ message: "Berhasil ambil data fasilitas", total: data.length, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── GET DETAIL FASILITAS ──────────────────────────────────────────────────────
exports.getFasilitasById = async (req, res) => {
    const { id } = req.params;
    try {
        const fasilitas = await prisma.fasilitas.findUnique({
            where: { fasilitas_id: parseInt(id) },
        });

        if (!fasilitas) return res.status(404).json({ message: "Fasilitas tidak ditemukan" });

        const role_id = req.user?.role_id;
        const data = filterHarga(fasilitas, role_id);

        res.json({ message: "Berhasil ambil detail fasilitas", data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── TAMBAH FASILITAS ──────────────────────────────────────────────────────────
exports.createFasilitas = async (req, res) => {
    const {
        nama_fasilitas, deskripsi, lokasi, kapasitas,
        status, harga_per_jam, jam_buka, jam_tutup,latitude, longitude,
    } = req.body;

    if (!nama_fasilitas) {
        return res.status(400).json({ message: "Nama fasilitas wajib diisi" });
    }
    if (!jam_buka || !jam_tutup) {
        return res.status(400).json({ message: "jam_buka dan jam_tutup wajib diisi" });
    }

    try {
        let gambar_url = null;
        let gambar_public_id = null;
        if (req.file) {
            gambar_url = req.file.path;
            gambar_public_id = req.file.filename;
        }

        const fasilitas = await prisma.fasilitas.create({
            data: {
                nama_fasilitas,
                deskripsi:    deskripsi  || null,
                lokasi:       lokasi     || null,
                kapasitas:    kapasitas  ? parseInt(kapasitas)     : null,
                harga_per_jam: harga_per_jam ? parseInt(harga_per_jam) : null,
                jam_buka,
                jam_tutup,
                latitude:      latitude      ? parseFloat(latitude)   : null, // ← tambah
                longitude:     longitude     ? parseFloat(longitude)  : null,
                gambar_url,
                gambar_public_id,
                status: status || "aktif",
            },
        });

        res.status(201).json({ message: "Fasilitas berhasil ditambahkan", data: fasilitas });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── EDIT FASILITAS ────────────────────────────────────────────────────────────
exports.updateFasilitas = async (req, res) => {
    const { id } = req.params;
    const {
        nama_fasilitas, deskripsi, lokasi, kapasitas,
        status, harga_per_jam, jam_buka, jam_tutup, latitude, longitude,
    } = req.body;

    try {
        const existing = await prisma.fasilitas.findUnique({
            where: { fasilitas_id: parseInt(id) },
        });

        if (!existing) return res.status(404).json({ message: "Fasilitas tidak ditemukan" });

        let gambar_url = existing.gambar_url;
        let gambar_public_id = existing.gambar_public_id;

        if (req.file) {
            if (existing.gambar_public_id) {
                await cloudinary.uploader.destroy(existing.gambar_public_id);
            }
            gambar_url = req.file.path;
            gambar_public_id = req.file.filename;
        }

        const updateData = { gambar_url, gambar_public_id };

        if (nama_fasilitas !== undefined) updateData.nama_fasilitas = nama_fasilitas;
        if (deskripsi      !== undefined) updateData.deskripsi      = deskripsi;
        if (lokasi         !== undefined) updateData.lokasi         = lokasi;
        if (kapasitas      !== undefined) updateData.kapasitas      = parseInt(kapasitas);
        if (status         !== undefined) updateData.status         = status;
        if (latitude  !== undefined) updateData.latitude  = latitude  ? parseFloat(latitude)  : null; // ← tambah
if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null; // ← tambah
        if (jam_buka       !== undefined) updateData.jam_buka       = jam_buka;
        if (jam_tutup      !== undefined) updateData.jam_tutup      = jam_tutup;
        if (harga_per_jam  !== undefined) updateData.harga_per_jam  = harga_per_jam ? parseInt(harga_per_jam) : null;

        const updated = await prisma.fasilitas.update({
            where: { fasilitas_id: parseInt(id) },
            data:  updateData,
        });

        res.json({ message: "Fasilitas berhasil diperbarui", data: updated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── UPDATE STATUS SAJA ────────────────────────────────────────────────────────
exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatus = ["aktif", "maintenance", "nonaktif"];
    if (!status || !validStatus.includes(status)) {
        return res.status(400).json({
            message: `Status tidak valid. Pilihan: ${validStatus.join(", ")}`,
        });
    }

    try {
        const existing = await prisma.fasilitas.findUnique({
            where: { fasilitas_id: parseInt(id) },
        });
        if (!existing) return res.status(404).json({ message: "Fasilitas tidak ditemukan" });

        const updated = await prisma.fasilitas.update({
            where: { fasilitas_id: parseInt(id) },
            data:  { status },
        });

        res.json({ message: `Status fasilitas diubah ke "${status}"`, data: updated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── HAPUS FASILITAS ───────────────────────────────────────────────────────────
exports.deleteFasilitas = async (req, res) => {
    const { id } = req.params;

    try {
        const existing = await prisma.fasilitas.findUnique({
            where: { fasilitas_id: parseInt(id) },
        });
        if (!existing) return res.status(404).json({ message: "Fasilitas tidak ditemukan" });

        if (existing.gambar_public_id) {
            await cloudinary.uploader.destroy(existing.gambar_public_id);
        }

        await prisma.fasilitas.delete({
            where: { fasilitas_id: parseInt(id) },
        });

        res.json({ message: "Fasilitas berhasil dihapus" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};