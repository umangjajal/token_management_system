const Token = require("../models/Token");

async function staffingHeatmap(shopId) {
  return Token.aggregate([
    {
      $group: {
        _id: {
          day: { $dayOfWeek: "$createdAt" },
          hour: { $hour: "$createdAt" }
        },
        avgWait: { $avg: "$avgServiceTime" },
        count: { $sum: 1 }
      }
    }
  ]);
}

module.exports = { staffingHeatmap };
