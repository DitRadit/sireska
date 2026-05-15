const requireRole = (...allowedRoles) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        if (!req.user.role_id) {
            return res.status(403).json({
                message: "Role tidak ditemukan"
            });
        }

        const userRole = req.user.role_id;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: "Akses ditolak"
            });
        }

        next();
    };
};

module.exports = requireRole;