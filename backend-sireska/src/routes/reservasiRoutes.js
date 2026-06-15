// src/routes/reservasiRoutes.js
const express    = require("express");
const router     = express.Router();
const reservasi       = require("../controller/reservasiController");
const { authenticate: authMiddleware } = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const { upload } = require("../config/cloudinary");

// ─── Webhook Midtrans (tidak butuh auth, dipanggil oleh Midtrans server) ──────
router.post("/payment/notification", reservasi.midtransNotification);

// ─── User routes ──────────────────────────────────────────────────────────────
router.get("/slot-tersedia", reservasi.getSlotTersedia);
// Di routes/reservasiRoutes.js

router.post("/", authMiddleware, upload.single("dokumen"), reservasi.createReservasi);
router.get(   "/my",      authMiddleware, reservasi.getMyReservasi);
router.get(   "/my/:id",  authMiddleware, reservasi.getMyReservasiById);
router.patch( "/:id/cancel", authMiddleware, reservasi.cancelReservasi);
router.post("/dev/simulasi/:id", authMiddleware, reservasi.simulasiPembayaran);

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.get(   "/admin",          authMiddleware, requireRole(1), reservasi.getAllReservasiAdmin);
router.get(   "/admin/:id",      authMiddleware, requireRole(1), reservasi.getReservasiByIdAdmin);
router.patch( "/admin/:id/approve", authMiddleware, requireRole(1), reservasi.approveReservasi);
router.patch( "/admin/:id/reject",  authMiddleware, requireRole(1), reservasi.rejectReservasi);
router.delete("/admin/:id",      authMiddleware, requireRole(1), reservasi.deleteReservasi);
router.post("/payment/notification", reservasi.midtransNotification);

router.get('/admin/laporan/reservasi', authMiddleware, requireRole(1), reservasi.getLaporanReservasi);
router.get('/admin/laporan/fasilitas', authMiddleware, requireRole(1), reservasi.getLaporanFasilitas);

module.exports = router;