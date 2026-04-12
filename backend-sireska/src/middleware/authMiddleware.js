const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Token tidak ada" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: {
                user_id: decoded.user_id
            },
            include: {
                role: true
            }
        });

        if (!user) {
            return res.status(401).json({ message: "User tidak ditemukan" });
        }

        req.user = user;
        next();

    } catch (err) {
        return res.status(401).json({ message: "Token tidak valid" });
    }
};

module.exports = authMiddleware;