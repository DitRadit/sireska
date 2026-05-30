// src/controller/fasilitasController.js
const { PrismaClient } = require("@prisma/client");
const { cloudinary } = require("../config/cloudinary");

const prisma = new PrismaClient();

// ─── GET SEMUA FASILITAS ───────────────────────────────────────────────────────
exports.getAllFasilitas = async (req, res) => {
    try {
        const { status, search } = req.query;

        const where = {};

        if (status) {
            where.status = status;
        }

        if (search) {
            where.nama_fasilitas = {
                contains: search,
            };
        }

        const fasilitas = await prisma.fasilitas.findMany({
            where,
            include: {
                jadwal: {
                    orderBy: { hari: "asc" },
                },
            },
            orderBy: { created_at: "desc" },
        });

        res.json({
            message: "Berhasil ambil data fasilitas",
            total: fasilitas.length,
            data: fasilitas,
        });
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
            include: {
                jadwal: {
                    orderBy: { hari: "asc" },
                },
            },
        });

        if (!fasilitas) {
            return res.status(404).json({ message: "Fasilitas tidak ditemukan" });
        }

        res.json({
            message: "Berhasil ambil detail fasilitas",
            data: fasilitas,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── TAMBAH FASILITAS ──────────────────────────────────────────────────────────
exports.createFasilitas = async (req, res) => {
  const { nama_fasilitas, deskripsi, lokasi, alamat, latitude, longitude, kapasitas, status, jadwal } = req.body;

  if (!nama_fasilitas) {
    return res.status(400).json({ message: "Nama fasilitas wajib diisi" });
  }

  try {
    let gambar_url = null;
    let gambar_public_id = null;
    if (req.file) {
      gambar_url = req.file.path;
      gambar_public_id = req.file.filename;
    }

    let jadwalData = [];
    if (jadwal) {
      const parsed = typeof jadwal === "string" ? JSON.parse(jadwal) : jadwal;
      jadwalData = parsed.map((j) => ({
        hari: j.hari.toLowerCase(),
        jam_buka: j.jam_buka,
        jam_tutup: j.jam_tutup,
      }));
    }

    const fasilitas = await prisma.fasilitas.create({
      data: {
        nama_fasilitas,
        deskripsi: deskripsi || null,
        lokasi: lokasi || null,
        alamat: alamat || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        kapasitas: kapasitas ? parseInt(kapasitas) : null,
        gambar_url,
        gambar_public_id,
        status: status || "aktif",
        jadwal: { create: jadwalData },
      },
      include: { jadwal: true },
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
  const { nama_fasilitas, deskripsi, lokasi, alamat, latitude, longitude, kapasitas, status, jadwal } = req.body;

  try {
    const existing = await prisma.fasilitas.findUnique({
      where: { fasilitas_id: parseInt(id) },
    });

    if (!existing) {
      return res.status(404).json({ message: "Fasilitas tidak ditemukan" });
    }

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
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (lokasi !== undefined) updateData.lokasi = lokasi;
    if (alamat !== undefined) updateData.alamat = alamat;
    if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;
    if (kapasitas !== undefined) updateData.kapasitas = parseInt(kapasitas);
    if (status !== undefined) updateData.status = status;

    if (jadwal !== undefined) {
      const parsed = typeof jadwal === "string" ? JSON.parse(jadwal) : jadwal;
      await prisma.jadwalFasilitas.deleteMany({ where: { fasilitas_id: parseInt(id) } });
      updateData.jadwal = {
        create: parsed.map((j) => ({
          hari: j.hari.toLowerCase(),
          jam_buka: j.jam_buka,
          jam_tutup: j.jam_tutup,
        })),
      };
    }

    const updated = await prisma.fasilitas.update({
      where: { fasilitas_id: parseInt(id) },
      data: updateData,
      include: { jadwal: true },
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

        if (!existing) {
            return res.status(404).json({ message: "Fasilitas tidak ditemukan" });
        }

        const updated = await prisma.fasilitas.update({
            where: { fasilitas_id: parseInt(id) },
            data: { status },
        });

        res.json({
            message: `Status fasilitas diubah ke "${status}"`,
            data: updated,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ─── HAPUS FASILITAS ──────────────────────────────────────────────────────────
exports.deleteFasilitas = async (req, res) => {
    const { id } = req.params;

    try {
        const existing = await prisma.fasilitas.findUnique({
            where: { fasilitas_id: parseInt(id) },
        });

        if (!existing) {
            return res.status(404).json({ message: "Fasilitas tidak ditemukan" });
        }

        // Hapus gambar dari Cloudinary jika ada
        if (existing.gambar_public_id) {
            await cloudinary.uploader.destroy(existing.gambar_public_id);
        }

        // Jadwal terhapus otomatis karena onDelete: Cascade di schema
        await prisma.fasilitas.delete({
            where: { fasilitas_id: parseInt(id) },
        });

        res.json({ message: "Fasilitas berhasil dihapus" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};