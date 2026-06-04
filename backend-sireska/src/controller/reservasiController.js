// src/controller/reservasiController.js
const { PrismaClient } = require("@prisma/client");
const { coreApi }      = require("../config/midtrans");

const prisma = new PrismaClient();

const ROLE_GUEST = 3;

const HARI_MAP = {
    0: "minggu", 1: "senin", 2: "selasa", 3: "rabu",
    4: "kamis",  5: "jumat", 6: "sabtu",
};

const parseLocalDate = (tanggal) => {
    const [year, month, day] = tanggal.split("-").map(Number);
    return new Date(year, month - 1, day);
};

const hitungDurasiJam = (jam_buka, jam_tutup) => {
    const [h1, m1] = jam_buka.split(":").map(Number);
    const [h2, m2] = jam_tutup.split(":").map(Number);
    return ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
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
        const fasilitas = await prisma.fasilitas.findUnique({
            where: { fasilitas_id: parseInt(fasilitas_id) },
        });

        if (!fasilitas) return res.status(404).json({ message: "Fasilitas tidak ditemukan" });
        if (fasilitas.status !== "aktif") {
            return res.status(400).json({ message: `Fasilitas tidak tersedia, status: ${fasilitas.status}` });
        }

        const jadwal = await prisma.jadwalFasilitas.findUnique({
            where: { jadwal_id: parseInt(jadwal_id) },
        });

        if (!jadwal || jadwal.fasilitas_id !== parseInt(fasilitas_id)) {
            return res.status(404).json({ message: "Jadwal tidak ditemukan untuk fasilitas ini" });
        }

        const tglObj      = parseLocalDate(tanggal);
        const hariTanggal = HARI_MAP[tglObj.getDay()];

        if (hariTanggal !== jadwal.hari) {
            return res.status(400).json({
                message: `Tanggal yang dipilih adalah hari ${hariTanggal}, jadwal ini untuk hari ${jadwal.hari}`,
            });
        }

        const konflik = await prisma.reservasi.findFirst({
            where: {
                fasilitas_id: parseInt(fasilitas_id),
                jadwal_id:    parseInt(jadwal_id),
                tanggal:      tglObj,
                status:       { in: ["menunggu", "disetujui"] },
            },
        });

        if (konflik) {
            return res.status(409).json({ message: "Slot jadwal pada tanggal tersebut sudah dipesan" });
        }

        const bookingUser = await prisma.reservasi.findFirst({
            where: {
                user_id,
                fasilitas_id: parseInt(fasilitas_id),
                tanggal:      tglObj,
                status:       { in: ["menunggu", "disetujui"] },
            },
        });

        if (bookingUser) {
            return res.status(409).json({
                message: "Kamu sudah memiliki reservasi aktif untuk fasilitas ini pada tanggal tersebut",
            });
        }

        const reservasi = await prisma.reservasi.create({
            data: {
                user_id,
                fasilitas_id: parseInt(fasilitas_id),
                jadwal_id:    parseInt(jadwal_id),
                tanggal:      tglObj,
                keperluan:    keperluan || null,
                status:       "menunggu",
            },
            include: {
                fasilitas: { select: { nama_fasilitas: true, lokasi: true, harga_per_jam: true } },
                jadwal:    { select: { hari: true, jam_buka: true, jam_tutup: true } },
            },
        });

        res.status(201).json({
            message: "Reservasi berhasil dibuat, menunggu persetujuan admin",
            data:    reservasi,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── FR-05: LIHAT STATUS RESERVASI ────────────────────────────────────────────
exports.getMyReservasi = async (req, res) => {
    const user_id = req.user.user_id;
    const { status } = req.query;

    try {
        const where = { user_id };
        if (status) where.status = status;

        const reservasi = await prisma.reservasi.findMany({
            where,
            include: {
                fasilitas: { select: { nama_fasilitas: true, lokasi: true, gambar_url: true } },
                jadwal:    { select: { hari: true, jam_buka: true, jam_tutup: true } },
            },
            orderBy: { created_at: "desc" },
        });

        res.json({
            message: "Berhasil ambil data reservasi",
            total:   reservasi.length,
            data:    reservasi,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── FR-05: DETAIL RESERVASI MILIK USER ───────────────────────────────────────
exports.getMyReservasiById = async (req, res) => {
    const user_id = req.user.user_id;
    const { id }  = req.params;

    try {
        const reservasi = await prisma.reservasi.findFirst({
            where: { reservasi_id: parseInt(id), user_id },
            include: {
                fasilitas: {
                    select: { nama_fasilitas: true, lokasi: true, gambar_url: true, deskripsi: true },
                },
                jadwal: { select: { hari: true, jam_buka: true, jam_tutup: true } },
            },
        });

        if (!reservasi) return res.status(404).json({ message: "Reservasi tidak ditemukan" });

        res.json({ message: "Berhasil ambil detail reservasi", data: reservasi });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── FR-04: BATALKAN RESERVASI ─────────────────────────────────────────────────
exports.cancelReservasi = async (req, res) => {
    const user_id = req.user.user_id;
    const { id }  = req.params;

    try {
        const reservasi = await prisma.reservasi.findFirst({
            where: { reservasi_id: parseInt(id), user_id },
        });

        if (!reservasi) return res.status(404).json({ message: "Reservasi tidak ditemukan" });
        if (reservasi.status !== "menunggu") {
            return res.status(400).json({ message: `Reservasi tidak bisa dibatalkan, status: ${reservasi.status}` });
        }

        await prisma.reservasi.update({
            where: { reservasi_id: parseInt(id) },
            data:  { status: "ditolak", catatan_admin: "Dibatalkan oleh pengguna" },
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
        if (status)       where.status       = status;
        if (fasilitas_id) where.fasilitas_id = parseInt(fasilitas_id);
        if (tanggal)      where.tanggal      = parseLocalDate(tanggal);

        const reservasi = await prisma.reservasi.findMany({
            where,
            include: {
                user: {
                    select: { user_id: true, nama_lengkap: true, email: true, nim_nip: true, role_id: true },
                },
                fasilitas: { select: { nama_fasilitas: true, lokasi: true } },
                jadwal:    { select: { hari: true, jam_buka: true, jam_tutup: true } },
            },
            orderBy: { created_at: "desc" },
        });

        const summary = {
            total:     reservasi.length,
            menunggu:  reservasi.filter((r) => r.status === "menunggu").length,
            disetujui: reservasi.filter((r) => r.status === "disetujui").length,
            ditolak:   reservasi.filter((r) => r.status === "ditolak").length,
        };

        res.json({ message: "Berhasil ambil semua data reservasi", summary, data: reservasi });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── FR-06: ADMIN — DETAIL RESERVASI ──────────────────────────────────────────
exports.getReservasiByIdAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        const reservasi = await prisma.reservasi.findUnique({
            where: { reservasi_id: parseInt(id) },
            include: {
                user: {
                    select: { user_id: true, nama_lengkap: true, email: true, nim_nip: true, no_hp: true, role_id: true },
                },
                fasilitas: {
                    select: { nama_fasilitas: true, lokasi: true, gambar_url: true, deskripsi: true, harga_per_jam: true },
                },
                jadwal: { select: { hari: true, jam_buka: true, jam_tutup: true } },
            },
        });

        if (!reservasi) return res.status(404).json({ message: "Reservasi tidak ditemukan" });

        res.json({ message: "Berhasil ambil detail reservasi", data: reservasi });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── FR-07: ADMIN — SETUJUI RESERVASI ─────────────────────────────────────────
exports.approveReservasi = async (req, res) => {
    const { id }            = req.params;
    const { catatan_admin } = req.body;

    try {
        const reservasi = await prisma.reservasi.findUnique({
            where: { reservasi_id: parseInt(id) },
            include: {
                user:      { select: { user_id: true, nama_lengkap: true, email: true, role_id: true } },
                fasilitas: { select: { nama_fasilitas: true, harga_per_jam: true } },
                jadwal:    { select: { hari: true, jam_buka: true, jam_tutup: true } },
            },
        });

        if (!reservasi) return res.status(404).json({ message: "Reservasi tidak ditemukan" });
        if (reservasi.status !== "menunggu") {
            return res.status(400).json({ message: `Reservasi sudah diproses, status: ${reservasi.status}` });
        }

        let midtransData = {};

        if (reservasi.user.role_id === ROLE_GUEST) {
            const harga_per_jam = parseFloat(reservasi.fasilitas.harga_per_jam || 0);
            const durasi        = hitungDurasiJam(reservasi.jadwal.jam_buka, reservasi.jadwal.jam_tutup);
            const total_harga   = Math.round(harga_per_jam * durasi);

            if (total_harga <= 0) {
                return res.status(400).json({
                    message: "Harga fasilitas belum diatur, tidak bisa generate QRIS",
                });
            }

            const order_id = `SIRESKA-${reservasi.reservasi_id}-${Date.now()}`;

            console.log("Midtrans server key:", process.env.MIDTRANS_SERVER_KEY);

            const chargeResponse = await coreApi.charge({
                payment_type: "qris",
                transaction_details: {
                    order_id,
                    gross_amount: total_harga,
                },
                qris: {
                    acquirer: "gopay",
                },
                customer_details: {
                    first_name: reservasi.user.nama_lengkap,
                    email:      reservasi.user.email,
                },
                item_details: [
                    {
                        id:       `FAC-${reservasi.fasilitas_id}`,
                        price:    total_harga,
                        quantity: 1,
                        name:     `Reservasi ${reservasi.fasilitas.nama_fasilitas} (${durasi} jam)`,
                    },
                ],
            });

            console.log("Midtrans charge response:", JSON.stringify(chargeResponse, null, 2));

            midtransData = {
                midtrans_order_id: order_id,
                midtrans_qris_url: chargeResponse?.qr_string || null,
                total_harga,
                status_pembayaran: "menunggu_pembayaran",
            };
        }

        const updated = await prisma.reservasi.update({
            where: { reservasi_id: parseInt(id) },
            data: {
                status:        "disetujui",
                catatan_admin: catatan_admin || null,
                ...midtransData,
            },
            include: {
                user:      { select: { nama_lengkap: true, email: true, role_id: true } },
                fasilitas: { select: { nama_fasilitas: true, harga_per_jam: true } },
                jadwal:    { select: { hari: true, jam_buka: true, jam_tutup: true } },
            },
        });

        res.json({
            message:     "Reservasi berhasil disetujui",
            data:        updated,
            qris_url:    updated.midtrans_qris_url || null,
            total_harga: updated.total_harga || null,
            is_guest:    reservasi.user.role_id === ROLE_GUEST,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server: " + err.message });
    }
};

// ─── FR-07: ADMIN — TOLAK RESERVASI ───────────────────────────────────────────
exports.rejectReservasi = async (req, res) => {
    const { id }            = req.params;
    const { catatan_admin } = req.body;

    try {
        const reservasi = await prisma.reservasi.findUnique({
            where: { reservasi_id: parseInt(id) },
        });

        if (!reservasi) return res.status(404).json({ message: "Reservasi tidak ditemukan" });
        if (reservasi.status !== "menunggu") {
            return res.status(400).json({ message: `Reservasi sudah diproses, status: ${reservasi.status}` });
        }

        const updated = await prisma.reservasi.update({
            where: { reservasi_id: parseInt(id) },
            data: {
                status:        "ditolak",
                catatan_admin: catatan_admin || null,
            },
            include: {
                user:      { select: { nama_lengkap: true, email: true } },
                fasilitas: { select: { nama_fasilitas: true } },
                jadwal:    { select: { hari: true, jam_buka: true, jam_tutup: true } },
            },
        });

        res.json({ message: "Reservasi berhasil ditolak", data: updated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── MIDTRANS WEBHOOK ──────────────────────────────────────────────────────────
exports.midtransNotification = async (req, res) => {
    try {
        const notification = await coreApi.transaction.notification(req.body);
        const { order_id, transaction_status, fraud_status } = notification;

        let status_pembayaran;
        if (transaction_status === "settlement" || transaction_status === "capture") {
            if (fraud_status === "accept" || !fraud_status) {
                status_pembayaran = "lunas";
            }
        } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
            status_pembayaran = "expired";
        } else if (transaction_status === "pending") {
            status_pembayaran = "menunggu_pembayaran";
        }

        if (status_pembayaran) {
            await prisma.reservasi.updateMany({
                where: { midtrans_order_id: order_id },
                data:  { status_pembayaran },
            });
        }

        res.status(200).json({ message: "OK" });
    } catch (err) {
        console.error("Midtrans notification error:", err);
        res.status(500).json({ message: err.message });
    }
};

// ─── DELETE RESERVASI ──────────────────────────────────────────────────────────
exports.deleteReservasi = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.reservasi.delete({ where: { reservasi_id: parseInt(id) } });
        res.json({ message: "Reservasi berhasil dihapus" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal menghapus reservasi" });
    }
};

// ─── DEV ONLY: Simulasi pembayaran sandbox ────────────────────────────────────
exports.simulasiPembayaran = async (req, res) => {
    const { id } = req.params;

    try {
        const reservasi = await prisma.reservasi.findUnique({
            where: { reservasi_id: parseInt(id) },
        });

        if (!reservasi) return res.status(404).json({ message: "Reservasi tidak ditemukan" });
        if (!reservasi.midtrans_order_id) {
            return res.status(400).json({ message: "Order ID tidak ditemukan" });
        }

        const response = await coreApi.transaction.status(reservasi.midtrans_order_id);
        console.log("Transaction status:", response);

        // Trigger settle via Midtrans sandbox
        const settleResponse = await fetch(
            `https://api.sandbox.midtrans.com/v2/${reservasi.midtrans_order_id}/settle`,
            {
                method: "POST",
                headers: {
                    Authorization:  `Basic ${Buffer.from(process.env.MIDTRANS_SERVER_KEY + ":").toString("base64")}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const result = await settleResponse.json();
        console.log("Settle response:", result);

        // Update status langsung di DB
        await prisma.reservasi.update({
            where: { reservasi_id: parseInt(id) },
            data:  { status_pembayaran: "lunas" },
        });

        res.json({ message: "Simulasi pembayaran berhasil", data: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Simulasi gagal: " + err.message });
    }
};