const express = require("express");
const router = express.Router();

const auth = require("../controller/authController");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

router.post("/register", auth.register);
router.post("/login", auth.login);
router.get("/profile", authMiddleware, auth.getProfile);

router.get("/admin",
    authMiddleware,
    requireRole("admin"),
    (req, res) => {
        res.json({ message: "Halo Admin" });
    }
);

router.get("/user",
    authMiddleware,
    requireRole("admin", "user"),
    (req, res) => {
        res.json({ message: "Halo User & Admin" });
    }
);

module.exports = router;