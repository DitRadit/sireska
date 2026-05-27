// src/controller/reservasiController.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Mapping hari ke enum Prisma
const HARI_MAP = {
    0: "minggu",
    1: "senin",
    2: "selasa",
    3: "rabu",
    4: "kamis",
    5: "jumat",
    6: "sabtu",
};

// Helper: parse "YYYY-MM-DD" tanpa timezone shift
const parseLocalDate = (tanggal) => {
    const [year, month, day] = tanggal.split("-").map(Number);
    return new Date(year, month - 1, day);
};

// ─── FR-04: BUAT RESERVASI ─────────────────────────────────────────────────────
exports.createReservasi = async (req, res) => {
    const { fasilitas_id, jadwal_id, tanggal, keperluan } = req.body;
    const user_id = req.user.user_id;

    if (!fasilitas_id || !jadwal_id || !tanggal) {
        return res.status(400).json({
            message: "fasilitas_id, jadwal_id, dan tanggal wajib diisi",
        });
    }

    try {
        // 1. Cek fasilitas ada dan statusnya aktif
        const fasilitas = await prisma.fasilitas.findUnique({
            where: { fasilitas_id: parseInt(fasilitas_id) },
        });

        if (!fasilitas) {
            return res.status(404).json({ message: "Fasilitas tidak ditemukan" });
        }

        if (fasilitas.status !== "aktif") {
            return res.status(400).json({
                message: `Fasilitas tidak tersedia, status: ${fasilitas.status}`,
            });
        }

        // 2. Cek jadwal milik fasilitas tersebut
        const jadwal = await prisma.jadwalFasilitas.findUnique({
            where: { jadwal_id: parseInt(jadwal_id) },
        });

        if (!jadwal || jadwal.fasilitas_id !== parseInt(fasilitas_id)) {
            return res.status(404).json({
                message: "Jadwal tidak ditemukan untuk fasilitas ini",
            });
        }

        // 3. Validasi hari tanggal sesuai jadwal (fix timezone)
        const tglObj = parseLocalDate(tanggal);
        const hariTanggal = HARI_MAP[tglObj.getDay()];

        if (hariTanggal !== jadwal.hari) {
            return res.status(400).json({
                message: `Tanggal yang dipilih adalah hari ${hariTanggal}, jadwal ini untuk hari ${jadwal.hari}`,
            });
        }

        // 4. Cek apakah slot sudah ada yang booking (status menunggu atau disetujui)
        const konflik = await prisma.reservasi.findFirst({
            where: {
                fasilitas_id: parseInt(fasilitas_id),
                jadwal_id: parseInt(jadwal_id),
                tanggal: tglObj,
                status: { in: ["menunggu", "disetujui"] },
            },
        });

        if (konflik) {
            return res.status(409).json({
                message: "Slot jadwal pada tanggal tersebut sudah dipesan",
            });
        }

        // 5. Cek user tidak booking 2x di tanggal & fasilitas yang sama
        const bookingUser = await prisma.reservasi.findFirst({
            where: {
                user_id,
                fasilitas_id: parseInt(fasilitas_id),
                tanggal: tglObj,
                status: { in: ["menunggu", "disetujui"] },
            },
        });

        if (bookingUser) {
            return res.status(409).json({
                message: "Kamu sudah memiliki reservasi aktif untuk fasilitas ini pada tanggal tersebut",
            });
        }

        // 6. Buat reservasi
        const reservasi = await prisma.reservasi.create({
            data: {
                user_id,
                fasilitas_id: parseInt(fasilitas_id),
                jadwal_id: parseInt(jadwal_id),
                tanggal: tglObj,
                keperluan: keperluan || null,
                status: "menunggu",
            },
            include: {
                fasilitas: {
                    select: { nama_fasilitas: true, lokasi: true },
                },
                jadwal: {
                    select: { hari: true, jam_buka: true, jam_tutup: true },
                },
            },
        });

        res.status(201).json({
            message: "Reservasi berhasil dibuat, menunggu persetujuan admin",
            data: reservasi,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── FR-05: LIHAT STATUS RESERVASI (user melihat miliknya sendiri) ─────────────
exports.getMyReservasi = async (req, res) => {
    const user_id = req.user.user_id;
    const { status } = req.query;

    try {
        const where = { user_id };
        if (status) where.status = status;

        const reservasi = await prisma.reservasi.findMany({
            where,
            include: {
                fasilitas: {
                    select: {
                        nama_fasilitas: true,
                        lokasi: true,
                        gambar_url: true,
                    },
                },
                jadwal: {
                    select: { hari: true, jam_buka: true, jam_tutup: true },
                },
            },
            orderBy: { created_at: "desc" },
        });

        res.json({
            message: "Berhasil ambil data reservasi",
            total: reservasi.length,
            data: reservasi,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── FR-05: DETAIL RESERVASI MILIK USER ───────────────────────────────────────
exports.getMyReservasiById = async (req, res) => {
    const user_id = req.user.user_id;
    const { id } = req.params;

    try {
        const reservasi = await prisma.reservasi.findFirst({
            where: {
                reservasi_id: parseInt(id),
                user_id,
            },
            include: {
                fasilitas: {
                    select: {
                        nama_fasilitas: true,
                        lokasi: true,
                        gambar_url: true,
                        deskripsi: true,
                    },
                },
                jadwal: {
                    select: { hari: true, jam_buka: true, jam_tutup: true },
                },
            },
        });

        if (!reservasi) {
            return res.status(404).json({ message: "Reservasi tidak ditemukan" });
        }

        res.json({
            message: "Berhasil ambil detail reservasi",
            data: reservasi,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── FR-04: BATALKAN RESERVASI (oleh user, hanya jika masih menunggu) ─────────
exports.cancelReservasi = async (req, res) => {
    const user_id = req.user.user_id;
    const { id } = req.params;

    try {
        const reservasi = await prisma.reservasi.findFirst({
            where: {
                reservasi_id: parseInt(id),
                user_id,
            },
        });

        if (!reservasi) {
            return res.status(404).json({ message: "Reservasi tidak ditemukan" });
        }

        if (reservasi.status !== "menunggu") {
            return res.status(400).json({
                message: `Reservasi tidak bisa dibatalkan, status: ${reservasi.status}`,
            });
        }

        await prisma.reservasi.update({
            where: { reservasi_id: parseInt(id) },
            data: { status: "ditolak", catatan_admin: "Dibatalkan oleh pengguna" },
        });

        res.json({ message: "Reservasi berhasil dibatalkan" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── FR-06: ADMIN — LIHAT SEMUA RESERVASI ─────────────────────────────────────
exports.getAllReservasiAdmin = async (req, res) => {
    const { status, fasilitas_id, tanggal } = req.query;

    try {
        const where = {};

        if (status) where.status = status;
        if (fasilitas_id) where.fasilitas_id = parseInt(fasilitas_id);
        if (tanggal) where.tanggal = parseLocalDate(tanggal);

        const reservasi = await prisma.reservasi.findMany({
            where,
            include: {
                user: {
                    select: {
                        user_id: true,
                        nama_lengkap: true,
                        email: true,
                        nim_nip: true,
                    },
                },
                fasilitas: {
                    select: {
                        nama_fasilitas: true,
                        lokasi: true,
                    },
                },
                jadwal: {
                    select: { hari: true, jam_buka: true, jam_tutup: true },
                },
            },
            orderBy: { created_at: "desc" },
        });

        const summary = {
            total: reservasi.length,
            menunggu: reservasi.filter((r) => r.status === "menunggu").length,
            disetujui: reservasi.filter((r) => r.status === "disetujui").length,
            ditolak: reservasi.filter((r) => r.status === "ditolak").length,
        };

        res.json({
            message: "Berhasil ambil semua data reservasi",
            summary,
            data: reservasi,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── FR-06: ADMIN — DETAIL RESERVASI ─────────────────────────────────────────
exports.getReservasiByIdAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        const reservasi = await prisma.reservasi.findUnique({
            where: { reservasi_id: parseInt(id) },
            include: {
                user: {
                    select: {
                        user_id: true,
                        nama_lengkap: true,
                        email: true,
                        nim_nip: true,
                        no_hp: true,
                    },
                },
                fasilitas: {
                    select: {
                        nama_fasilitas: true,
                        lokasi: true,
                        gambar_url: true,
                        deskripsi: true,
                    },
                },
                jadwal: {
                    select: { hari: true, jam_buka: true, jam_tutup: true },
                },
            },
        });

        if (!reservasi) {
            return res.status(404).json({ message: "Reservasi tidak ditemukan" });
        }

        res.json({
            message: "Berhasil ambil detail reservasi",
            data: reservasi,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── FR-07: ADMIN — SETUJUI RESERVASI ─────────────────────────────────────────
exports.approveReservasi = async (req, res) => {
    const { id } = req.params;
    const { catatan_admin } = req.body;

    try {
        const reservasi = await prisma.reservasi.findUnique({
            where: { reservasi_id: parseInt(id) },
        });

        if (!reservasi) {
            return res.status(404).json({ message: "Reservasi tidak ditemukan" });
        }

        if (reservasi.status !== "menunggu") {
            return res.status(400).json({
                message: `Reservasi sudah diproses sebelumnya, status: ${reservasi.status}`,
            });
        }

        const updated = await prisma.reservasi.update({
            where: { reservasi_id: parseInt(id) },
            data: {
                status: "disetujui",
                catatan_admin: catatan_admin || null,
            },
            include: {
                user: {
                    select: { nama_lengkap: true, email: true },
                },
                fasilitas: {
                    select: { nama_fasilitas: true },
                },
                jadwal: {
                    select: { hari: true, jam_buka: true, jam_tutup: true },
                },
            },
        });

        res.json({
            message: "Reservasi berhasil disetujui",
            data: updated,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── FR-07: ADMIN — TOLAK RESERVASI ──────────────────────────────────────────
exports.rejectReservasi = async (req, res) => {
    const { id } = req.params;
    const { catatan_admin } = req.body;

    try {
        const reservasi = await prisma.reservasi.findUnique({
            where: { reservasi_id: parseInt(id) },
        });

        if (!reservasi) {
            return res.status(404).json({ message: "Reservasi tidak ditemukan" });
        }

        if (reservasi.status !== "menunggu") {
            return res.status(400).json({
                message: `Reservasi sudah diproses sebelumnya, status: ${reservasi.status}`,
            });
        }

        const updated = await prisma.reservasi.update({
            where: { reservasi_id: parseInt(id) },
            data: {
                status: "ditolak",
                catatan_admin: catatan_admin || null,
            },
            include: {
                user: {
                    select: { nama_lengkap: true, email: true },
                },
                fasilitas: {
                    select: { nama_fasilitas: true },
                },
                jadwal: {
                    select: { hari: true, jam_buka: true, jam_tutup: true },
                },
            },
        });

        res.json({
            message: "Reservasi berhasil ditolak",
            data: updated,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

exports.deleteReservasi = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.reservasi.delete({
            where: { reservasi_id: parseInt(id) }
        });
        res.json({ message: "Reservasi berhasil dihapus" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal menghapus reservasi" });
    }
};