const router = require("express").Router();

const {
  registerUser,
  loginUser,
  getProfile,
  toggleBlockUser,
  getAllUsers,
  getAllSellers,
  updateSellerStatus,
  getAdminAnalytics,
  getChatContacts
} = require("../controllers/userController");

const verifyToken = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/authorize");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", verifyToken, getProfile);
router.get(
  "/chat/contacts",
  verifyToken,
  verifyRole(["buyer", "seller", "admin"]),
  getChatContacts
);

router.get("/admin/users", verifyToken, verifyRole(["admin"]), getAllUsers);
router.get("/admin/sellers", verifyToken, verifyRole(["admin"]), getAllSellers);
router.get(
  "/admin/analytics",
  verifyToken,
  verifyRole(["admin"]),
  getAdminAnalytics
);
router.patch(
  "/admin/users/:id/block",
  verifyToken,
  verifyRole(["admin"]),
  toggleBlockUser
);
router.patch(
  "/admin/sellers/:id/status",
  verifyToken,
  verifyRole(["admin"]),
  updateSellerStatus
);

router.patch("/users/:id/block", verifyToken, verifyRole(["admin"]), toggleBlockUser);

module.exports = router;
