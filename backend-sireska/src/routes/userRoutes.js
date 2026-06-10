const express = require("express");
const router = express.Router();

const { authenticate: authMiddleware } = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const {
  getAllUsers,
  getUserById,
  addUser,
  editUser,
  changeRole,
  toggleActiveStatus,
  deactivateUser,
} = require("../controller/userController");

// Admin only
router.get("/", authMiddleware, requireRole(1), getAllUsers);
router.get("/:id", authMiddleware, requireRole(1), getUserById);
router.post("/", authMiddleware, requireRole(1), addUser);
router.put("/:id", authMiddleware, requireRole(1), editUser);
router.patch("/:id/role", authMiddleware, requireRole(1), changeRole);
router.patch("/:id/toggle", authMiddleware, requireRole(1), toggleActiveStatus);
router.patch("/:id/deactivate", authMiddleware, requireRole(1), deactivateUser);

module.exports = router;