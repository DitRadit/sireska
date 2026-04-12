const requireRole = (...allowedRoles) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!req.user.role) {
            return res.status(403).json({ message: "Role tidak ditemukan" });
        }

        const userRole = req.user.role.toLowerCase();
        const roles = allowedRoles.map(r => r.toLowerCase());

        if (!roles.includes(userRole)) {
            return res.status(403).json({ message: "Akses ditolak" });
        }

        next();
    };
};

module.exports = requireRole;