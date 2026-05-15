// src/routes/reservasiRoutes.js
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const reservasi = require("../controller/reservasiController");

// ─── USER ROUTES ──────────────────────────────────────────────────────────────

// FR-04: Buat reservasi
router.post(
    "/",
    authMiddleware,
    requireRole("admin", "user"),
    reservasi.createReservasi
);

// FR-05: Lihat semua reservasi milik user yang login
router.get(
    "/my",
    authMiddleware,
    requireRole("admin", "user"),
    reservasi.getMyReservasi
);

// FR-05: Detail reservasi milik user
router.get(
    "/my/:id",
    authMiddleware,
    requireRole("admin", "user"),
    reservasi.getMyReservasiById
);

// FR-04: Batalkan reservasi (hanya jika masih menunggu)
router.patch(
    "/my/:id/cancel",
    authMiddleware,
    requireRole("admin", "user"),
    reservasi.cancelReservasi
);

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

// FR-06: Admin lihat semua reservasi
router.get(
    "/admin",
    authMiddleware,
    requireRole("admin"),
    reservasi.getAllReservasiAdmin
);

// FR-06: Admin lihat detail reservasi
router.get(
    "/admin/:id",
    authMiddleware,
    requireRole("admin"),
    reservasi.getReservasiByIdAdmin
);

// FR-07: Admin setujui reservasi
router.patch(
    "/admin/:id/approve",
    authMiddleware,
    requireRole("admin"),
    reservasi.approveReservasi
);

// FR-07: Admin tolak reservasi
router.patch(
    "/admin/:id/reject",
    authMiddleware,
    requireRole("admin"),
    reservasi.rejectReservasi
);

module.exports = router;