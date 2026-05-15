// src/routes/fasilitasRoutes.js
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const { upload } = require("../config/cloudinary");
const fasilitas = require("../controller/fasilitasController");

// ─── PUBLIC (siapa saja bisa lihat) ──────────────────────────────────────────
router.get("/", fasilitas.getAllFasilitas);
router.get("/:id", fasilitas.getFasilitasById);

// ─── ADMIN ONLY ───────────────────────────────────────────────────────────────
router.post(
    "/",
    authMiddleware,
    requireRole(1),
    upload.single("gambar"),
    fasilitas.createFasilitas
);

router.put(
    "/:id",
    authMiddleware,
    requireRole(1),
    upload.single("gambar"),
    fasilitas.updateFasilitas
);

router.patch(
    "/:id/status",
    authMiddleware,
    requireRole(1),
    fasilitas.updateStatus
);

router.delete(
    "/:id",
    authMiddleware,
    requireRole(1),
    fasilitas.deleteFasilitas
);

module.exports = router;