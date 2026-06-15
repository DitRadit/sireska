const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateOTP, saveOTP, sendOTP, verifyOTP } = require("../utils/otp");

const prisma = new PrismaClient();

// Role IDs
const ROLE_USER  = 2; // mahasiswa/dosen dengan NIM/NIP
const ROLE_GUEST = 3; // tamu tanpa NIM/NIP

// REGISTER
exports.register = async (req, res) => {
    const { nim_nip, nama_lengkap, email, password } = req.body;

    // nim_nip boleh kosong → jadi guest
    if (!nama_lengkap || !email || !password) {
        return res.status(400).json({ message: "nama_lengkap, email, dan password wajib diisi" });
    }

    try {
        // Cek duplikat email
        const existingByEmail = await prisma.user.findUnique({ where: { email } });
        if (existingByEmail) {
            return res.status(409).json({ message: "Email sudah digunakan" });
        }

        // Cek duplikat NIM/NIP hanya jika diisi
        if (nim_nip) {
            const existingByNimNip = await prisma.user.findUnique({ where: { nim_nip } });
            if (existingByNimNip) {
                return res.status(409).json({ message: "NIM/NIP sudah digunakan" });
            }
        }

        const hash = await bcrypt.hash(password, 10);

        // Tentukan role: jika ada NIM/NIP → user biasa, jika tidak → guest
        const role_id = nim_nip ? ROLE_USER : ROLE_GUEST;

        const user = await prisma.user.create({
            data: {
                nim_nip:      nim_nip || null,
                nama_lengkap,
                email,
                password_hash: hash,
                role_id,
                is_verified:  false,
            },
        });

        const otp = generateOTP();
        saveOTP(email, otp);
        await sendOTP(email, otp);

        const tipeAkun = nim_nip ? "pengguna" : "guest";

        res.status(201).json({
            message:  `Register berhasil sebagai ${tipeAkun}, cek email untuk OTP`,
            user_id:  user.user_id,
            email:    user.email,
            tipe:     tipeAkun,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// LOGIN
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email dan password wajib diisi" });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        if (!user.is_verified) {
            return res.status(403).json({
                message: "Akun belum diverifikasi, cek email untuk OTP",
                email:   user.email,
            });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ message: "Password salah" });
        }

        const token = jwt.sign(
            { user_id: user.user_id, role_id: user.role_id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login berhasil",
            token,
            user: {
                user_id:      user.user_id,
                email:        user.email,
                nama_lengkap: user.nama_lengkap,
                nim_nip:      user.nim_nip,
                role_id:      user.role_id,
                is_guest:     user.role_id === ROLE_GUEST,
            },
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email dan password baru wajib diisi" });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User dengan email tersebut tidak ditemukan" });
        }

        const hash = await bcrypt.hash(password, 10);
        await prisma.user.update({ where: { email }, data: { password_hash: hash } });

        res.json({ message: "Password berhasil diperbarui" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

// PROFILE
exports.getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { user_id: req.user.user_id },
            select: {
                user_id:      true,
                nama_lengkap: true,
                email:        true,
                nim_nip:      true,
                role_id:      true,
            },
        });

        if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

        res.json({
            message:  "Berhasil ambil profile",
            user: {
                ...user,
                is_guest: user.role_id === ROLE_GUEST,
            },
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// VERIFY OTP
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: "Email dan OTP wajib diisi" });
    }

    try {
        const result = verifyOTP(email, otp);
        if (!result.status) {
            return res.status(400).json({ message: result.message });
        }

        await prisma.user.update({ where: { email }, data: { is_verified: true } });

        res.json({ message: "Verifikasi berhasil" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// RESEND OTP
exports.resendOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email wajib diisi" });

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user)          return res.status(404).json({ message: "Email tidak ditemukan" });
        if (user.is_verified) return res.status(400).json({ message: "Akun sudah terverifikasi" });

        const otp = generateOTP();
        saveOTP(email, otp);
        await sendOTP(email, otp);

        res.json({ message: "OTP berhasil dikirim ulang" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal kirim OTP" });
    }
};

// FORGOT PASSWORD — Kirim OTP dulu ke email
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email wajib diisi" });

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: "Email tidak terdaftar" });

        const otp = generateOTP();
        saveOTP(email, otp);
        await sendOTP(email, otp);

        res.json({ message: "OTP reset password telah dikirim ke email Anda" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal mengirim OTP" });
    }
};

// VERIFY OTP RESET PASSWORD — Verifikasi OTP lalu ganti password
exports.resetPasswordWithOtp = async (req, res) => {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
        return res.status(400).json({ message: "Email, OTP, dan password baru wajib diisi" });
    }

    try {
        const result = verifyOTP(email, otp);
        if (!result.status) {
            return res.status(400).json({ message: result.message });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

        const hash = await bcrypt.hash(password, 10);
        await prisma.user.update({ where: { email }, data: { password_hash: hash } });

        res.json({ message: "Password berhasil diperbarui" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

// UPDATE PROFILE (user yang login)
exports.updateProfile = async (req, res) => {
    const { nama_lengkap, no_hp, nim_nip } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { user_id: req.user.user_id }
        });
        if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

        // Cek nim_nip duplikat jika diubah
        if (nim_nip && nim_nip !== user.nim_nip) {
            const existing = await prisma.user.findUnique({ where: { nim_nip } });
            if (existing) return res.status(409).json({ message: "NIM/NIP sudah digunakan akun lain" });
        }

        const updated = await prisma.user.update({
            where: { user_id: req.user.user_id },
            data: {
                ...(nama_lengkap && { nama_lengkap }),
                ...(no_hp !== undefined && { no_hp }),
                ...(nim_nip !== undefined && { nim_nip: nim_nip || null }),
            },
            select: {
                user_id: true,
                nama_lengkap: true,
                email: true,
                nim_nip: true,
                no_hp: true,
                role_id: true,
            }
        });

        res.json({ message: "Profil berhasil diperbarui", user: updated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// GANTI PASSWORD (user yang login, perlu password lama)
exports.changePassword = async (req, res) => {
    const { password_lama, password_baru } = req.body;
    if (!password_lama || !password_baru) {
        return res.status(400).json({ message: "Password lama dan baru wajib diisi" });
    }

    try {
        const user = await prisma.user.findUnique({ where: { user_id: req.user.user_id } });
        if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

        const isValid = await bcrypt.compare(password_lama, user.password_hash);
        if (!isValid) return res.status(401).json({ message: "Password lama salah" });

        const hash = await bcrypt.hash(password_baru, 10);
        await prisma.user.update({
            where: { user_id: req.user.user_id },
            data: { password_hash: hash }
        });

        res.json({ message: "Password berhasil diubah" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};