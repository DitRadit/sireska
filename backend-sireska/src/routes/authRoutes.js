const express = require("express");
const router = express.Router();

const auth = require("../controller/authController");
const { authenticate: authMiddleware } = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const { register, login, verifyOtp, resendOtp, getProfile, resetPassword, forgotPassword, resetPasswordWithOtp } = require('../controller/authController');

router.post("/register", auth.register);
router.post("/login", auth.login);
router.post("/verify-otp", auth.verifyOtp);      
router.post("/resend-otp", auth.resendOtp);     

router.get("/profile", authMiddleware, auth.getProfile);

router.get("/admin",
    authMiddleware,
    requireRole(1),
    (req, res) => {
        res.json({ message: "Halo Admin" });
    }
);

router.get("/user",
    authMiddleware,
    requireRole(1, 2),
    (req, res) => {
        res.json({ message: "Halo User & Admin" });
    }
);

router.post('/reset-password', resetPassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordWithOtp);
router.put('/profile', authMiddleware, auth.updateProfile);
router.post('/change-password', authMiddleware, auth.changePassword);
module.exports = router;