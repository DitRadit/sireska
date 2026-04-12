const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

// REGISTER
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "Email sudah digunakan" });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { name, email, password: hash }
        });

        res.status(201).json({ message: "Register berhasil", userId: user.id });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
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

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({ message: "Password salah" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login berhasil",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};

//PROFILE
exports.getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
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
        res.status(500).json({ message: "Internal server error" });
    }
};