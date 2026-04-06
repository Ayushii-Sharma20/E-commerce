const Order = require("../../models/Order");

// ✅ GET STATS
exports.getStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    const revenue = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" }
        }
      }
    ]);

    res.json({
      totalOrders,
      totalRevenue: revenue[0]?.totalRevenue || 0
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};