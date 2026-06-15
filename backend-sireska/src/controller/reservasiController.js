// src/controller/reservasiController.js
const { PrismaClient } = require("@prisma/client");
const { coreApi }      = require("../config/midtrans");
const { cloudinary } = require("../config/cloudinary");

const prisma     = new PrismaClient();
const ROLE_GUEST = 3;

const parseLocalDate = (tanggal) => {
    return new Date(tanggal + "T00:00:00.000Z");
};

const timeToMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
};

const hitungDurasiJam = (jam_mulai, jam_selesai) => {
    return (timeToMinutes(jam_selesai) - timeToMinutes(jam_mulai)) / 60;
};

// ─── GET SLOT TERSEDIA ─────────────────────────────────────────────────────────
exports.getSlotTersedia = async (req, res) => {
    const { fasilitas_id, tanggal } = req.query;

    if (!fasilitas_id || !tanggal)
        return res.status(400).json({ message: "fasilitas_id dan tanggal wajib diisi" });

    try {
        const fasilitas = await prisma.fasilitas.findUnique({
            where: { fasilitas_id: parseInt(fasilitas_id) },
        });

        if (!fasilitas) return res.status(404).json({ message: "Fasilitas tidak ditemukan" });

        const tglObj = parseLocalDate(tanggal);

        // Reservasi aktif di tanggal ini
        const reservasiAda = await prisma.reservasi.findMany({
            where: {
                fasilitas_id: parseInt(fasilitas_id),
                tanggal:      tglObj,
                status:       { in: ["menunggu", "disetujui"] },
            },
            select: { jam_mulai: true, jam_selesai: true },
        });

        // Slot yang diblokir admin
        const slotDiblokir = await prisma.slotTidakTersedia.findMany({
            where: {
                fasilitas_id: parseInt(fasilitas_id),
                tanggal:      tglObj,
            },
            select: { jam_mulai: true, jam_selesai: true },
        });

        // Generate slot per jam dari jam_buka sampai jam_tutup
        const slots   = [];
        let current   = timeToMinutes(fasilitas.jam_buka);
        const end     = timeToMinutes(fasilitas.jam_tutup);

        while (current < end) {
            const jam_mulai   = `${String(Math.floor(current / 60)).padStart(2, "0")}:${String(current % 60).padStart(2, "0")}`;
            const jam_selesai = `${String(Math.floor((current + 60) / 60)).padStart(2, "0")}:${String((current + 60) % 60).padStart(2, "0")}`;

            const dipesan = reservasiAda.some((r) =>
                timeToMinutes(r.jam_mulai) < current + 60 &&
                timeToMinutes(r.jam_selesai) > current
            );

            const diblokir = slotDiblokir.some((s) =>
                timeToMinutes(s.jam_mulai) < current + 60 &&
                timeToMinutes(s.jam_selesai) > current
            );

            slots.push({ jam_mulai, jam_selesai, tersedia: !dipesan && !diblokir });
            current += 60;
        }

        res.json({
            message:        "Berhasil ambil slot tersedia",
            fasilitas_id:   fasilitas.fasilitas_id,
            nama_fasilitas: fasilitas.nama_fasilitas,
            harga_per_jam:  fasilitas.harga_per_jam,
            jam_buka:       fasilitas.jam_buka,
            jam_tutup:      fasilitas.jam_tutup,
            tanggal,
            slots,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── BUAT RESERVASI ────────────────────────────────────────────────────────────
exports.createReservasi = async (req, res) => {
    const { fasilitas_id, tanggal, jam_mulai, jam_selesai, keperluan } = req.body;
    const user_id = req.user.user_id;

    if (!fasilitas_id || !tanggal || !jam_mulai || !jam_selesai) {
        return res.status(400).json({ message: "fasilitas_id, tanggal, jam_mulai, jam_selesai wajib diisi" });
    }

    if (timeToMinutes(jam_mulai) >= timeToMinutes(jam_selesai)) {
        return res.status(400).json({ message: "jam_mulai harus lebih awal dari jam_selesai" });
    }

    try {
        const fasilitas = await prisma.fasilitas.findUnique({
            where: { fasilitas_id: parseInt(fasilitas_id) },
        });

        if (!fasilitas) return res.status(404).json({ message: "Fasilitas tidak ditemukan" });
        if (fasilitas.status !== "aktif")
            return res.status(400).json({ message: `Fasilitas tidak tersedia, status: ${fasilitas.status}` });

        // Validasi dalam jam operasional
        if (
            timeToMinutes(jam_mulai)   < timeToMinutes(fasilitas.jam_buka) ||
            timeToMinutes(jam_selesai) > timeToMinutes(fasilitas.jam_tutup)
        ) {
            return res.status(400).json({
                message: `Jam operasional fasilitas: ${fasilitas.jam_buka} - ${fasilitas.jam_tutup}`,
            });
        }

        const tglObj = parseLocalDate(tanggal);

        // Cek konflik dengan reservasi lain
        const konflik = await prisma.reservasi.findFirst({
            where: {
                fasilitas_id: parseInt(fasilitas_id),
                tanggal:      tglObj,
                status:       { in: ["menunggu", "disetujui"] },
                AND: [
                    { jam_mulai:   { lt: jam_selesai } },
                    { jam_selesai: { gt: jam_mulai   } },
                ],
            },
        });

        if (konflik)
            return res.status(409).json({ message: "Slot waktu tersebut sudah dipesan" });

        // Cek slot diblokir admin
        const diblokir = await prisma.slotTidakTersedia.findFirst({
            where: {
                fasilitas_id: parseInt(fasilitas_id),
                tanggal:      tglObj,
                AND: [
                    { jam_mulai:   { lt: jam_selesai } },
                    { jam_selesai: { gt: jam_mulai   } },
                ],
            },
        });

        if (diblokir)
            return res.status(409).json({ message: "Slot waktu tersebut tidak tersedia" });

        // Cek user sudah punya reservasi aktif di fasilitas + tanggal yang sama
        const bookingUser = await prisma.reservasi.findFirst({
            where: {
                user_id,
                fasilitas_id: parseInt(fasilitas_id),
                tanggal:      tglObj,
                status:       { in: ["menunggu", "disetujui"] },
            },
        });

        if (bookingUser)
            return res.status(409).json({
                message: "Kamu sudah memiliki reservasi aktif untuk fasilitas ini pada tanggal tersebut",
            });

        const durasi      = hitungDurasiJam(jam_mulai, jam_selesai);
        const total_harga = fasilitas.harga_per_jam
            ? Math.round(parseFloat(fasilitas.harga_per_jam) * durasi)
            : null;

        let dokumen_url       = null;
        if (req.file) {
            dokumen_url       = req.file.path;
        }
        const reservasi = await prisma.reservasi.create({
            data: {
                user_id,
                fasilitas_id: parseInt(fasilitas_id),
                tanggal:      tglObj,
                jam_mulai,
                jam_selesai,
                keperluan:    keperluan || null,
                dokumen_url,
                status:       "menunggu",
            },
            include: {
                fasilitas: { select: { nama_fasilitas: true, lokasi: true, harga_per_jam: true } },
            },
        });

        res.status(201).json({
            message: "Reservasi berhasil dibuat, menunggu persetujuan admin",
            data:    { ...reservasi, durasi, total_harga },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server: " + err.message });
    }
};

// ─── LIHAT RESERVASI MILIK USER ────────────────────────────────────────────────
exports.getMyReservasi = async (req, res) => {
    const user_id    = req.user.user_id;
    const { status } = req.query;

    try {
        const where = { user_id };
        if (status) where.status = status;

        const reservasi = await prisma.reservasi.findMany({
            where,
            include: {
                fasilitas: { select: { nama_fasilitas: true, lokasi: true, gambar_url: true } },
            },
            orderBy: { created_at: "desc" },
        });

        res.json({ message: "Berhasil ambil data reservasi", total: reservasi.length, data: reservasi });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── DETAIL RESERVASI MILIK USER ───────────────────────────────────────────────
exports.getMyReservasiById = async (req, res) => {
    const user_id = req.user.user_id;
    const { id }  = req.params;

    try {
        const reservasi = await prisma.reservasi.findFirst({
            where: { reservasi_id: parseInt(id), user_id },
            include: {
                fasilitas: {
                    select: { nama_fasilitas: true, lokasi: true, gambar_url: true, deskripsi: true, harga_per_jam: true },
                },
            },
        });

        if (!reservasi) return res.status(404).json({ message: "Reservasi tidak ditemukan" });

        res.json({ message: "Berhasil ambil detail reservasi", data: reservasi });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── BATALKAN RESERVASI ────────────────────────────────────────────────────────
exports.cancelReservasi = async (req, res) => {
    const user_id = req.user.user_id;
    const { id }  = req.params;

    try {
        const reservasi = await prisma.reservasi.findFirst({
            where: { reservasi_id: parseInt(id), user_id },
        });

        if (!reservasi) return res.status(404).json({ message: "Reservasi tidak ditemukan" });
        if (reservasi.status !== "menunggu")
            return res.status(400).json({ message: `Reservasi tidak bisa dibatalkan, status: ${reservasi.status}` });

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

// ─── ADMIN: LIHAT SEMUA RESERVASI ─────────────────────────────────────────────
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

// ─── ADMIN: DETAIL RESERVASI ───────────────────────────────────────────────────
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
            },
        });

        if (!reservasi) return res.status(404).json({ message: "Reservasi tidak ditemukan" });

        res.json({ message: "Berhasil ambil detail reservasi", data: reservasi });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── ADMIN: APPROVE RESERVASI ──────────────────────────────────────────────────
exports.approveReservasi = async (req, res) => {
    const { id }            = req.params;
    const { catatan_admin } = req.body;

    try {
        const reservasi = await prisma.reservasi.findUnique({
            where: { reservasi_id: parseInt(id) },
            include: {
                user:      { select: { user_id: true, nama_lengkap: true, email: true, role_id: true } },
                fasilitas: { select: { nama_fasilitas: true, harga_per_jam: true } },
            },
        });

        if (!reservasi) return res.status(404).json({ message: "Reservasi tidak ditemukan" });
        if (reservasi.status !== "menunggu")
            return res.status(400).json({ message: `Reservasi sudah diproses, status: ${reservasi.status}` });

        let midtransData = {};

        if (reservasi.user.role_id === ROLE_GUEST) {
            const harga_per_jam = parseFloat(reservasi.fasilitas.harga_per_jam || 0);
            const durasi        = hitungDurasiJam(reservasi.jam_mulai, reservasi.jam_selesai);
            const total_harga   = Math.round(harga_per_jam * durasi);

            if (total_harga <= 0)
                return res.status(400).json({ message: "Harga fasilitas belum diatur, tidak bisa generate QRIS" });

            const order_id = `SIRESKA-${reservasi.reservasi_id}-${Date.now()}`;

            const chargeResponse = await coreApi.charge({
                payment_type:        "qris",
                transaction_details: { order_id, gross_amount: total_harga },
                qris:                { acquirer: "gopay" },
                customer_details: {
                    first_name: reservasi.user.nama_lengkap,
                    email:      reservasi.user.email,
                },
                item_details: [{
                    id:       `FAC-${reservasi.fasilitas_id}`,
                    price:    total_harga,
                    quantity: 1,
                    name:     `Reservasi ${reservasi.fasilitas.nama_fasilitas} (${durasi} jam)`,
                }],
            });

console.log("=== MIDTRANS RESPONSE ===");
console.log(JSON.stringify(chargeResponse, null, 2));
console.log("=========================");

// Fetch gambar QRIS dari Midtrans lalu upload ke Cloudinary
let qrisImgUrl = null;
const qrisMidtransUrl = chargeResponse?.actions?.find(a => a.name === "generate-qr-code")?.url;

if (qrisMidtransUrl) {
    const imgRes = await fetch(qrisMidtransUrl, {
        headers: {
            Authorization: `Basic ${Buffer.from(process.env.MIDTRANS_SERVER_KEY + ":").toString("base64")}`,
        },
    });

    const arrayBuffer = await imgRes.arrayBuffer();
    const base64      = Buffer.from(arrayBuffer).toString("base64");
    const dataUri     = `data:image/png;base64,${base64}`;

    const uploaded = await cloudinary.uploader.upload(dataUri, {
        folder:    "sireska/qris",
        public_id: `qris-${order_id}`,
    });

    qrisImgUrl = uploaded.secure_url;
}

midtransData = {
    midtrans_order_id: order_id,
    midtrans_qris_url: chargeResponse?.qr_string || null,
    midtrans_qris_img: qrisImgUrl,
    total_harga,
    status_pembayaran: "menunggu_pembayaran",
};
        }

        const updated = await prisma.reservasi.update({
            where: { reservasi_id: parseInt(id) },
            data:  { status: "disetujui", catatan_admin: catatan_admin || null, ...midtransData },
            include: {
                user:      { select: { nama_lengkap: true, email: true, role_id: true } },
                fasilitas: { select: { nama_fasilitas: true, harga_per_jam: true } },
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

// ─── ADMIN: TOLAK RESERVASI ────────────────────────────────────────────────────
exports.rejectReservasi = async (req, res) => {
    const { id }            = req.params;
    const { catatan_admin } = req.body;

    try {
        const reservasi = await prisma.reservasi.findUnique({
            where: { reservasi_id: parseInt(id) },
        });

        if (!reservasi) return res.status(404).json({ message: "Reservasi tidak ditemukan" });
        if (reservasi.status !== "menunggu")
            return res.status(400).json({ message: `Reservasi sudah diproses, status: ${reservasi.status}` });

        const updated = await prisma.reservasi.update({
            where: { reservasi_id: parseInt(id) },
            data:  { status: "ditolak", catatan_admin: catatan_admin || null },
            include: {
                user:      { select: { nama_lengkap: true, email: true } },
                fasilitas: { select: { nama_fasilitas: true } },
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
            if (fraud_status === "accept" || !fraud_status) status_pembayaran = "lunas";
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

// ─── ADMIN: DELETE RESERVASI ───────────────────────────────────────────────────
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

        if (!reservasi)                   return res.status(404).json({ message: "Reservasi tidak ditemukan" });
        if (!reservasi.midtrans_order_id) return res.status(400).json({ message: "Order ID tidak ditemukan" });

        const settleResponse = await fetch(
            `https://api.sandbox.midtrans.com/v2/${reservasi.midtrans_order_id}/settle`,
            {
                method:  "POST",
                headers: {
                    Authorization:  `Basic ${Buffer.from(process.env.MIDTRANS_SERVER_KEY + ":").toString("base64")}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const result = await settleResponse.json();

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

// ─── LAPORAN RESERVASI (Admin) — Export CSV ───────────────────────────────────
exports.getLaporanReservasi = async (req, res) => {
    const { status, status_pembayaran, dari, sampai, format = 'json' } = req.query;

    try {
        const where = {
            ...(status && { status }),
            ...(status_pembayaran && { status_pembayaran }),
            ...(dari && sampai && {
                tanggal: {
                    gte: parseLocalDate(dari),
                    lte: parseLocalDate(sampai),
                }
            }),
        };

        const data = await prisma.reservasi.findMany({
            where,
            orderBy: { created_at: 'desc' },
            include: {
                user: { select: { nama_lengkap: true, email: true, nim_nip: true, no_hp: true } },
                fasilitas: { select: { nama_fasilitas: true, lokasi: true } },
            }
        });

        if (format === 'csv') {
            const rows = [
                ['No', 'ID Reservasi', 'Tanggal', 'Jam Mulai', 'Jam Selesai', 'Fasilitas', 'Lokasi',
                 'Nama Pemesan', 'Email', 'NIM/NIP', 'No HP', 'Keperluan',
                 'Status', 'Status Pembayaran', 'Total Harga', 'Catatan Admin', 'Dibuat'].join(',')
            ];

            data.forEach((r, i) => {
                const escape = (val) => `"${(val || '').toString().replace(/"/g, '""')}"`;
                rows.push([
                    i + 1,
                    r.reservasi_id,
                    escape(r.tanggal ? new Date(r.tanggal).toLocaleDateString('id-ID') : ''),
                    escape(r.jam_mulai),
                    escape(r.jam_selesai),
                    escape(r.fasilitas?.nama_fasilitas),
                    escape(r.fasilitas?.lokasi),
                    escape(r.user?.nama_lengkap),
                    escape(r.user?.email),
                    escape(r.user?.nim_nip),
                    escape(r.user?.no_hp),
                    escape(r.keperluan),
                    escape(r.status),
                    escape(r.status_pembayaran),
                    r.total_harga || 0,
                    escape(r.catatan_admin),
                    escape(r.created_at ? new Date(r.created_at).toLocaleString('id-ID') : ''),
                ].join(','));
            });

            const csvContent = rows.join('\n');
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="laporan-reservasi-${Date.now()}.csv"`);
            // BOM untuk Excel agar UTF-8 terbaca benar
            return res.send('\uFEFF' + csvContent);
        }

        // Default: JSON untuk ditampilkan di halaman
        res.json({
            message: 'Berhasil mengambil laporan reservasi',
            total: data.length,
            data
        });
    } catch (err) {
        console.error('getLaporanReservasi error:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

// ─── LAPORAN KONDISI FASILITAS (Admin) — Export CSV ──────────────────────────
exports.getLaporanFasilitas = async (req, res) => {
    const { status, format = 'json' } = req.query;

    try {
        const fasilitas = await prisma.fasilitas.findMany({
            where: { ...(status && { status }) },
            orderBy: { created_at: 'asc' },
            include: {
                _count: { select: { reservasi: true } },
                reservasi: {
                    where: { status: 'disetujui', status_pembayaran: 'lunas' },
                    select: { total_harga: true }
                }
            }
        });

        const result = fasilitas.map(f => ({
            fasilitas_id: f.fasilitas_id,
            nama_fasilitas: f.nama_fasilitas,
            lokasi: f.lokasi,
            kapasitas: f.kapasitas,
            harga_per_jam: f.harga_per_jam,
            jam_buka: f.jam_buka,
            jam_tutup: f.jam_tutup,
            status: f.status,
            total_reservasi: f._count.reservasi,
            total_pendapatan: f.reservasi.reduce((acc, r) => acc + Number(r.total_harga || 0), 0),
            created_at: f.created_at,
        }));

        if (format === 'csv') {
            const rows = [
                ['No', 'ID', 'Nama Fasilitas', 'Lokasi', 'Kapasitas', 'Harga/Jam',
                 'Jam Buka', 'Jam Tutup', 'Status', 'Total Reservasi', 'Total Pendapatan (Rp)', 'Dibuat'].join(',')
            ];

            result.forEach((f, i) => {
                const escape = (val) => `"${(val || '').toString().replace(/"/g, '""')}"`;
                rows.push([
                    i + 1,
                    f.fasilitas_id,
                    escape(f.nama_fasilitas),
                    escape(f.lokasi),
                    f.kapasitas || 0,
                    f.harga_per_jam || 0,
                    escape(f.jam_buka),
                    escape(f.jam_tutup),
                    escape(f.status),
                    f.total_reservasi,
                    f.total_pendapatan,
                    escape(f.created_at ? new Date(f.created_at).toLocaleString('id-ID') : ''),
                ].join(','));
            });

            const csvContent = rows.join('\n');
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="laporan-fasilitas-${Date.now()}.csv"`);
            return res.send('\uFEFF' + csvContent);
        }

        res.json({ message: 'Berhasil mengambil laporan fasilitas', total: result.length, data: result });
    } catch (err) {
        console.error('getLaporanFasilitas error:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};