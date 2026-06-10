// controllers/userManagement.controller.js

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// ─── GET ALL USERS ────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      role_id,
      is_active,
      is_verified,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(search && {
        OR: [
          { nama_lengkap: { contains: search } },
          { email: { contains: search } },
          { nim_nip: { contains: search } },
        ],
      }),
      ...(role_id && { role_id: parseInt(role_id) }),
      ...(is_active !== undefined && { is_active: is_active === "true" }),
      ...(is_verified !== undefined && {
        is_verified: is_verified === "true",
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          user_id: true,
          nim_nip: true,
          nama_lengkap: true,
          email: true,
          no_hp: true,
          foto_ktm_url: true,
          is_verified: true,
          is_active: true,
          last_login: true,
          created_at: true,
          updated_at: true,
          role: {
            select: { role_id: true, role_name: true },
          },
        },
        orderBy: { created_at: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
      message: "Berhasil mengambil data user",
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("getAllUsers error:", err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// ─── GET USER BY ID ───────────────────────────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { user_id: parseInt(id) },
      select: {
        user_id: true,
        nim_nip: true,
        nama_lengkap: true,
        email: true,
        no_hp: true,
        foto_ktm_url: true,
        is_verified: true,
        is_active: true,
        last_login: true,
        created_at: true,
        updated_at: true,
        role: {
          select: { role_id: true, role_name: true, deskripsi: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    return res.status(200).json({
      message: "Berhasil mengambil data user",
      data: user,
    });
  } catch (err) {
    console.error("getUserById error:", err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// ─── ADD USER ─────────────────────────────────────────────────────────────────
const addUser = async (req, res) => {
  try {
    const {
      role_id,
      nim_nip,
      nama_lengkap,
      email,
      password,
      no_hp,
      is_verified = false,
      is_active = true,
    } = req.body;

    // Validasi field wajib
    if (!role_id || !nama_lengkap || !email || !password) {
      return res.status(400).json({
        message: "role_id, nama_lengkap, email, dan password wajib diisi",
      });
    }

    // Cek email duplikat
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }

    // Cek nim_nip duplikat (kalau diisi)
    if (nim_nip) {
      const existingNim = await prisma.user.findUnique({
        where: { nim_nip },
      });
      if (existingNim) {
        return res.status(409).json({ message: "NIM/NIP sudah terdaftar" });
      }
    }

    // Cek role valid
    const role = await prisma.role.findUnique({
      where: { role_id: parseInt(role_id) },
    });
    if (!role) {
      return res.status(400).json({ message: "Role tidak valid" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        role_id: parseInt(role_id),
        nim_nip: nim_nip || null,
        nama_lengkap,
        email,
        password_hash,
        no_hp: no_hp || null,
        is_verified,
        is_active,
      },
      select: {
        user_id: true,
        nim_nip: true,
        nama_lengkap: true,
        email: true,
        no_hp: true,
        is_verified: true,
        is_active: true,
        created_at: true,
        role: { select: { role_id: true, role_name: true } },
      },
    });

    return res.status(201).json({
      message: "User berhasil ditambahkan",
      data: newUser,
    });
  } catch (err) {
    console.error("addUser error:", err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// ─── EDIT USER ────────────────────────────────────────────────────────────────
const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nim_nip, nama_lengkap, email, no_hp, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { user_id: parseInt(id) },
    });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Cek email duplikat (selain user ini sendiri)
    if (email && email !== user.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return res.status(409).json({ message: "Email sudah digunakan" });
      }
    }

    // Cek nim_nip duplikat (selain user ini sendiri)
    if (nim_nip && nim_nip !== user.nim_nip) {
      const existingNim = await prisma.user.findUnique({
        where: { nim_nip },
      });
      if (existingNim) {
        return res.status(409).json({ message: "NIM/NIP sudah digunakan" });
      }
    }

    const updateData = {
      ...(nim_nip !== undefined && { nim_nip }),
      ...(nama_lengkap && { nama_lengkap }),
      ...(email && { email }),
      ...(no_hp !== undefined && { no_hp }),
    };

    // Ganti password kalau diisi
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { user_id: parseInt(id) },
      data: updateData,
      select: {
        user_id: true,
        nim_nip: true,
        nama_lengkap: true,
        email: true,
        no_hp: true,
        is_verified: true,
        is_active: true,
        updated_at: true,
        role: { select: { role_id: true, role_name: true } },
      },
    });

    return res.status(200).json({
      message: "User berhasil diperbarui",
      data: updated,
    });
  } catch (err) {
    console.error("editUser error:", err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// ─── GANTI ROLE ───────────────────────────────────────────────────────────────
const changeRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_id } = req.body;

    if (!role_id) {
      return res.status(400).json({ message: "role_id wajib diisi" });
    }

    const [user, role] = await Promise.all([
      prisma.user.findUnique({ where: { user_id: parseInt(id) } }),
      prisma.role.findUnique({ where: { role_id: parseInt(role_id) } }),
    ]);

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    if (!role) {
      return res.status(400).json({ message: "Role tidak valid" });
    }

    // Cegah admin mengubah role dirinya sendiri
    if (parseInt(id) === req.user.user_id) {
      return res
        .status(403)
        .json({ message: "Tidak bisa mengubah role sendiri" });
    }

    const updated = await prisma.user.update({
      where: { user_id: parseInt(id) },
      data: { role_id: parseInt(role_id) },
      select: {
        user_id: true,
        nama_lengkap: true,
        email: true,
        role: { select: { role_id: true, role_name: true } },
        updated_at: true,
      },
    });

    return res.status(200).json({
      message: `Role user berhasil diubah menjadi ${role.role_name}`,
      data: updated,
    });
  } catch (err) {
    console.error("changeRole error:", err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// ─── TOGGLE AKTIF / NONAKTIF ──────────────────────────────────────────────────
const toggleActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { user_id: parseInt(id) },
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Cegah admin menonaktifkan dirinya sendiri
    if (parseInt(id) === req.user.user_id) {
      return res
        .status(403)
        .json({ message: "Tidak bisa menonaktifkan akun sendiri" });
    }

    const updated = await prisma.user.update({
      where: { user_id: parseInt(id) },
      data: { is_active: !user.is_active },
      select: {
        user_id: true,
        nama_lengkap: true,
        email: true,
        is_active: true,
        updated_at: true,
      },
    });

    const statusMsg = updated.is_active ? "diaktifkan" : "dinonaktifkan";

    return res.status(200).json({
      message: `Akun user berhasil ${statusMsg}`,
      data: updated,
    });
  } catch (err) {
    console.error("toggleActiveStatus error:", err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// ─── NONAKTIFKAN PAKSA (tanpa toggle, langsung set false) ─────────────────────
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.user_id) {
      return res
        .status(403)
        .json({ message: "Tidak bisa menonaktifkan akun sendiri" });
    }

    const user = await prisma.user.findUnique({
      where: { user_id: parseInt(id) },
    });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    if (!user.is_active) {
      return res.status(400).json({ message: "Akun sudah dalam keadaan nonaktif" });
    }

    const updated = await prisma.user.update({
      where: { user_id: parseInt(id) },
      data: { is_active: false },
      select: {
        user_id: true,
        nama_lengkap: true,
        email: true,
        is_active: true,
        updated_at: true,
      },
    });

    return res.status(200).json({
      message: "Akun user berhasil dinonaktifkan",
      data: updated,
    });
  } catch (err) {
    console.error("deactivateUser error:", err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  addUser,
  editUser,
  changeRole,
  toggleActiveStatus,
  deactivateUser,
};