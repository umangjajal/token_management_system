const Token = require("../models/Token");
const Shop = require("../models/Shop");
const User = require("../models/User");

/**
 * HAVERSINE FORMULA: Calculate distance between two coordinates
 * @param {Object} point1 - { lat, lng }
 * @param {Object} point2 - { lat, lng }
 * @returns {number} Distance in kilometers
 */
function calculateDistance(point1, point2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * ESTIMATE TRAVEL TIME: Calculate time needed to reach shop
 * @param {Object} userLocation - Customer's current location { lat, lng, speed }
 * @param {Object} shopLocation - Shop's location { lat, lng }
 * @returns {Object} { seconds, mode, distance }
 */
function estimateTravelTime(userLocation, shopLocation) {
  if (!userLocation || !shopLocation) {
    return {
      seconds: 0,
      mode: "unknown",
      distance: 0
    };
  }

  const distanceKm = calculateDistance(userLocation, shopLocation);

  // Get current speed (convert from m/s to km/h)
  const speedMs = userLocation.speed || 1.4; // Default walking speed: 1.4 m/s
  let mode = "walking";

  if (speedMs > 5) {
    mode = "cycling"; // 5-15 m/s
  }
  if (speedMs > 15) {
    mode = "driving"; // > 15 m/s
  }

  // Determine expected speed in km/h based on mode
  const expectedSpeedsKmH = {
    walking: 3.5, // km/h
    cycling: 15, // km/h
    driving: 40 // km/h (conservative estimate)
  };

  const speedKmH = expectedSpeedsKmH[mode] || speedMs * 3.6;
  const timeHours = distanceKm / speedKmH;
  const timeSeconds = Math.round(timeHours * 3600);

  return {
    seconds: Math.max(60, timeSeconds), // Minimum 1 minute
    mode,
    distance: parseFloat(distanceKm.toFixed(2))
  };
}

/**
 * CALCULATE QUEUE POSITION: Determine customer's position in queue
 * @param {string} shopId - Shop ID
 * @param {boolean} isPriority - Is customer VIP/priority
 * @returns {number} Position in queue
 */
async function calculateQueuePosition(shopId, isPriority = false) {
  let position = 1;

  if (!isPriority) {
    // Count all non-priority tokens ahead
    const nonPriorityCount = await Token.countDocuments({
      shopId,
      status: { $in: ["waiting", "called"] },
      priority: 0
    });
    position = nonPriorityCount + 1;
  } else {
    // Priority tokens get better position
    const priorityCount = await Token.countDocuments({
      shopId,
      status: { $in: ["waiting", "called"] },
      priority: { $gt: 0 }
    });
    position = priorityCount + 1;
  }

  return position;
}

/**
 * CALCULATE WAIT TIME: Estimate how long customer will wait
 * @param {string} shopId - Shop ID
 * @param {number} avgServiceTime - Average service time in seconds
 * @returns {number} Estimated wait time in minutes
 */
async function calculateWaitTime(shopId, avgServiceTime = 300) {
  // Get all active tokens (being called or waiting)
  const activeTokens = await Token.find({
    shopId,
    status: { $in: ["called", "waiting"] }
  }).sort({ tokenNumber: 1 });

  if (activeTokens.length === 0) {
    return 0;
  }

  // Estimate wait time based on position and average service time
  let waitSeconds = 0;
  const shop = await Shop.findById(shopId);
  const counters = shop?.counters || 1;

  // Distribute queue across counters
  const tokensAhead = Math.max(0, activeTokens.length - counters);
  waitSeconds = tokensAhead * avgServiceTime;

  return Math.round(waitSeconds / 60); // Convert to minutes
}

/**
 * CREATE TOKEN WITH SMART BOOKING
 * @param {Object} params - { shopId, customerId, location, priority, groupSize }
 * @returns {Object} Created token with all calculations
 */
async function createSmartToken(params) {
  const { shopId, customerId, location, priority = 0, groupSize = 1 } = params;

  try {
    // Get shop details
    const shop = await Shop.findById(shopId);
    if (!shop) {
      throw new Error("Shop not found");
    }

    // Get next token number
    const lastToken = await Token.findOne({ shopId }).sort({ tokenNumber: -1 });
    const nextNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

    // Calculate travel time
    const travelTimeData = estimateTravelTime(location, {
      lat: shop.coordinates?.lat,
      lng: shop.coordinates?.lng
    });

    // Calculate estimated arrival time
    const bookingTime = new Date();
    const estimatedArrivalTime = new Date(
      bookingTime.getTime() + travelTimeData.seconds * 1000
    );

    // Calculate queue position
    const positionInQueue = await calculateQueuePosition(shopId, priority > 0);

    // Calculate wait time
    const estimatedWaitTime = await calculateWaitTime(shopId, 300);

    // Create token
    const token = await Token.create({
      shopId,
      customerId,
      tokenNumber: nextNumber,
      status: "waiting",
      priority,
      groupSize,
      bookingTime,
      lastLocation: {
        lat: location.lat,
        lng: location.lng,
        speed: location.speed,
        timestamp: new Date(),
        accuracy: location.accuracy || 50
      },
      shopLocation: {
        lat: shop.coordinates?.lat,
        lng: shop.coordinates?.lng,
        name: shop.name
      },
      estimatedTravelTime: travelTimeData,
      estimatedArrivalTime,
      positionInQueue,
      estimatedWaitTime,
      avgServiceTime: 300
    });

    return token;
  } catch (error) {
    console.error("❌ Smart token creation error:", error);
    throw error;
  }
}

/**
 * GET TOKEN DETAILS WITH CUSTOMER INFO
 * @param {string} tokenId - Token ID
 * @returns {Object} Token with customer details
 */
async function getTokenWithDetails(tokenId) {
  const token = await Token.findById(tokenId)
    .populate("customerId", "name email phone")
    .populate("shopId", "name coordinates");

  if (!token) return null;

  // Calculate updated wait time and position
  const activeTokens = await Token.countDocuments({
    shopId: token.shopId,
    status: { $in: ["waiting", "called"] },
    tokenNumber: { $lt: token.tokenNumber }
  });

  return {
    ...token.toObject(),
    updatedPositionInQueue: activeTokens + 1,
    timeUntilCall: token.estimatedArrivalTime
  };
}

/**
 * UPDATE TOKEN STATUS AND TIMINGS
 * @param {string} tokenId - Token ID
 * @param {string} newStatus - New status
 * @returns {Object} Updated token
 */
async function updateTokenStatus(tokenId, newStatus) {
  const token = await Token.findById(tokenId);
  if (!token) throw new Error("Token not found");

  const updatedData = { status: newStatus };

  switch (newStatus) {
    case "called":
      updatedData.calledNotificationSent = true;
      break;
    case "served":
      updatedData.serviceStartTime = new Date();
      updatedData.completedNotificationSent = true;
      if (token.serviceStartTime) {
        const actualServiceTime = (new Date() - token.serviceStartTime) / 1000;
        updatedData.actualServiceTime = actualServiceTime;
      }
      break;
    case "cancelled":
      // No additional processing
      break;
  }

  return await Token.findByIdAndUpdate(tokenId, updatedData, { new: true });
}

/**
 * GET SHOP QUEUE ANALYTICS
 * @param {string} shopId - Shop ID
 * @returns {Object} Queue analytics
 */
async function getQueueAnalytics(shopId) {
  const waitingTokens = await Token.find({
    shopId,
    status: "waiting"
  }).sort({ tokenNumber: 1 });

  const calledTokens = await Token.find({
    shopId,
    status: "called"
  });

  const servedToday = await Token.find({
    shopId,
    status: "served",
    createdAt: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0))
    }
  });

  // Calculate average service time
  const avgServiceTime =
    servedToday.length > 0
      ? servedToday.reduce((sum, t) => sum + (t.actualServiceTime || 0), 0) /
        servedToday.length
      : 300;

  return {
    waitingCount: waitingTokens.length,
    calledCount: calledTokens.length,
    servedTodayCount: servedToday.length,
    averageServiceTime: Math.round(avgServiceTime),
    estimatedWaitForNew: Math.round((waitingTokens.length * avgServiceTime) / 60),
    queue: waitingTokens.map((t, index) => ({
      tokenNumber: t.tokenNumber,
      customerId: t.customerId,
      position: index + 1,
      priority: t.priority,
      estimatedWaitTime: Math.round(((index + 1) * avgServiceTime) / 60)
    }))
  };
}

module.exports = {
  createSmartToken,
  getTokenWithDetails,
  updateTokenStatus,
  getQueueAnalytics,
  estimateTravelTime,
  calculateDistance,
  calculateQueuePosition,
  calculateWaitTime
};
