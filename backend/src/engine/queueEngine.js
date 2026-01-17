const Token = require("../models/Token");
const { estimateTravelTime } = require("./travelTime");

const BUFFER_WALK = 120; // seconds
const BUFFER_DRIVE = 300;
const { sendSMS } = require("../services/smsService");

async function processQueue(shopId, io) {
  const tokens = await Token.find({
    shopId,
    status: { $in: ["waiting", "priority"] }
  }).sort({
    priority: -1,
    tokenNumber: 1
  });

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (!token.lastLocation) continue;

    const { travelTime, mode } = estimateTravelTime(
      token.lastLocation,
      token.shopLocation
    );

    const buffer = mode === "driving" ? BUFFER_DRIVE : BUFFER_WALK;
    const estimatedWait = i * token.avgServiceTime;

    if (travelTime + buffer >= estimatedWait) {
      io.to(token.customerId.toString()).emit("notify", {
        type: "START_HEADING",
        tokenId: token._id,
        message: "Start heading to the shop"
      });
    }
  }
}

async function notifyCustomer(token, message) {
  if (token.socketConnected) {
    io.to(token.customerId.toString()).emit("notify", { message });
  } else {
    await sendSMS(token.phone, message);
  }
}

module.exports = { processQueue };
