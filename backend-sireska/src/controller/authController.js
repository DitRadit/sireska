const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateOTP, saveOTP, sendOTP, verifyOTP } = require("../utils/otp");

const prisma = new PrismaClient();

// REGISTER
exports.register = async (req, res) => {
    const { nim_nip, nama_lengkap, email, password } = req.body;

    if (!nim_nip || !nama_lengkap || !email || !password) {
        return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { nim_nip }]
            }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email atau NIM/NIP sudah digunakan"
            });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                nim_nip,
                nama_lengkap,
                email,
                password_hash: hash,
                role_id: 2,
                is_verified: false
            }
        });

        const otp = generateOTP();

        saveOTP(email, otp);

        await sendOTP(email, otp);

      res.status(201).json({
        message: "Register berhasil, cek email untuk OTP",
        user_id: user.user_id,
        email: user.email  
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
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        if (!user.is_verified) {
        return res.status(403).json({
            message: "Akun belum diverifikasi, cek email untuk OTP",
            email: user.email  
        });
    }

        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return res.status(401).json({ message: "Password salah" });
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                role_id: user.role_id
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login berhasil",
            token
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email dan password baru wajib diisi" });
    }

    try {
        // Cari user berdasarkan email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ message: "User dengan email tersebut tidak ditemukan" });
        }

        // Hash password baru
        const hash = await bcrypt.hash(password, 10);

        // Update password_hash di database
        await prisma.user.update({
            where: { email },
            data: { password_hash: hash }
        });

        res.json({ message: "Password berhasil diperbarui" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

//PROFILE
exports.getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { user_id: req.user.user_id },
            select: {
                user_id: true,
                nama_lengkap: true,
                email: true,
                role_id: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        res.json({
            message: "Berhasil ambil profile",
            user
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

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

        await prisma.user.update({
            where: { email },
            data: { is_verified: true }
        });

        res.json({ message: "Verifikasi berhasil" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

exports.resendOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email wajib diisi" });
    }

    try {

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ message: "Email tidak ditemukan" });
        }

        if (user.is_verified) {
            return res.status(400).json({ message: "Akun sudah terverifikasi" });
        }

        const otp = generateOTP();
        saveOTP(email, otp);
        await sendOTP(email, otp);

        res.json({ message: "OTP berhasil dikirim ulang" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal kirim OTP" });
    }
};