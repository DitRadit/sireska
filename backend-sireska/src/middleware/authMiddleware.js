const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ─── WAJIB LOGIN ──────────────────────────────────────────────────────────────
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Token tidak ada" });
    }

    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Format token salah" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token tidak valid" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { user_id: decoded.user_id },
            include: { role: true }
        });

        if (!user) {
            return res.status(401).json({ message: "User tidak ditemukan" });
        }

        if (!user.is_active) {
            return res.status(403).json({ message: "User tidak aktif" });
        }

        if (!user.is_verified) {
            return res.status(403).json({ message: "Akun belum diverifikasi" });
        }

        req.user = {
            user_id: user.user_id,
            role_id: user.role_id,
        };

        next();

    } catch (err) {
        return res.status(401).json({ message: "Token tidak valid" });
    }
};

// ─── OPSIONAL (untuk route publik yang perlu tahu siapa user) ─────────────────
const authenticateOptional = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return next();

    const token = authHeader.split(" ")[1];
    if (!token) return next();

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { user_id: decoded.user_id }
        });
        if (user && user.is_active && user.is_verified) {
            req.user = { user_id: user.user_id, role_id: user.role_id };
        }
    } catch {
        // token invalid → lanjut tanpa user
    }
    next();
};

module.exports = { authenticate: authMiddleware, authenticateOptional };