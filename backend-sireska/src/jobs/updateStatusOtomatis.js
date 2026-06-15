const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const timeToMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
};

const updateStatusOtomatis = async () => {
    const now     = new Date();
    const jamWIB  = new Date(now.getTime() + 7 * 60 * 60 * 1000); // offset WIB
    const nowMin  = jamWIB.getHours() * 60 + jamWIB.getMinutes();

    // Tanggal hari ini (UTC midnight = WIB tanggal)
    const todayStr = jamWIB.toISOString().split("T")[0];
    const todayObj = new Date(todayStr + "T00:00:00.000Z");

    try {
        // ── 1. Ambil semua reservasi disetujui di tanggal hari ini ──────────────
        const reservasiHariIni = await prisma.reservasi.findMany({
            where: {
                tanggal: todayObj,
                status:  "disetujui",
            },
            include: {
                user: { select: { role_id: true } },
            },
        });

        for (const r of reservasiHariIni) {
            const mulai   = timeToMinutes(r.jam_mulai);
            const selesai = timeToMinutes(r.jam_selesai);
            const isGuest = r.user.role_id === 3;

            // Cek apakah reservasi ini valid untuk dipakai
            // Guest: harus sudah lunas. Non-guest: cukup disetujui
            const sudahBayar = !isGuest || r.status_pembayaran === "lunas";

            if (!sudahBayar) continue;

            // Jam sudah selesai → update reservasi jadi selesai
            if (nowMin >= selesai) {
                await prisma.reservasi.update({
                    where: { reservasi_id: r.reservasi_id },
                    data:  { status: "selesai" },
                });
                console.log(`[CRON] Reservasi #${r.reservasi_id} → selesai`);
            }
        }

        // ── 2. Update status fasilitas berdasarkan reservasi aktif sekarang ─────
        const semuaFasilitas = await prisma.fasilitas.findMany({
            where: { status: { in: ["aktif", "sedang_digunakan"] } },
        });

        for (const f of semuaFasilitas) {
            // Cari reservasi yang sedang berlangsung di fasilitas ini
            const sedangBerlangsung = await prisma.reservasi.findFirst({
                where: {
                    fasilitas_id: f.fasilitas_id,
                    tanggal:      todayObj,
                    status:       "disetujui",
                },
                include: {
                    user: { select: { role_id: true } },
                },
            });

            let adaYangAktif = false;

            if (sedangBerlangsung) {
                const mulai   = timeToMinutes(sedangBerlangsung.jam_mulai);
                const selesai = timeToMinutes(sedangBerlangsung.jam_selesai);
                const isGuest = sedangBerlangsung.user.role_id === 3;
                const sudahBayar = !isGuest || sedangBerlangsung.status_pembayaran === "lunas";

                if (sudahBayar && nowMin >= mulai && nowMin < selesai) {
                    adaYangAktif = true;
                }
            }

            const statusBaru = adaYangAktif ? "sedang_digunakan" : "aktif";

            if (f.status !== statusBaru) {
                await prisma.fasilitas.update({
                    where: { fasilitas_id: f.fasilitas_id },
                    data:  { status: statusBaru },
                });
                console.log(`[CRON] Fasilitas #${f.fasilitas_id} → ${statusBaru}`);
            }
        }

        console.log(`[CRON] updateStatusOtomatis selesai — ${jamWIB.toISOString()}`);
    } catch (err) {
        console.error("[CRON] Error:", err);
    }
};

module.exports = updateStatusOtomatis;