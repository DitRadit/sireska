const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

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
            role: user.role.role_name
        };

        next();

    } catch (err) {
        return res.status(401).json({ message: "Token tidak valid" });
    }
};

module.exports = authMiddleware;