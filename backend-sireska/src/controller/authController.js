const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

// REGISTER
exports.register = async (req, res) => {
    const { nim_nip, nama_lengkap, email, password } = req.body;

    if (!nim_nip || !nama_lengkap || !email || !password) {
        return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "Email sudah digunakan" });
        }

        const existingNim = await prisma.user.findUnique({ where: { nim_nip } });
        if (existingNim) {
            return res.status(409).json({ message: "NIM/NIP sudah digunakan" });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                nim_nip,
                nama_lengkap,
                email,
                password_hash: hash,
                role_id: 2 
            }
        });

        res.status(201).json({
            message: "Register berhasil",
            user_id: user.user_id
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
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