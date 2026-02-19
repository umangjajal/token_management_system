const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    tokenNumber: Number,

    status: {
      type: String,
      enum: ["waiting", "called", "served", "snoozed", "cancelled", "no-show"],
      default: "waiting"
    },

    priority: { type: Number, default: 0 }, // PRIORITY PASS (VIP customers get higher priority)

    groupSize: { type: Number, default: 1 },

    // SMART BOOKING FIELDS
    bookingTime: { type: Date, default: Date.now }, // When customer booked
    estimatedArrivalTime: Date, // Calculated based on travel time
    actualArrivalTime: Date, // When customer actually arrived
    serviceStartTime: Date, // When service started
    serviceEndTime: Date, // When service completed

    // Travel & Location Data
    lastLocation: {
      lat: Number,
      lng: Number,
      speed: Number, // in m/s
      timestamp: Date,
      accuracy: Number // accuracy of location in meters
    },

    shopLocation: {
      lat: Number,
      lng: Number,
      name: String
    },

    // TRAVEL TIME ESTIMATION
    estimatedTravelTime: {
      seconds: Number,
      mode: {
        type: String,
        enum: ["walking", "driving", "transit"],
        default: "walking"
      },
      distance: Number // in kilometers
    },

    // QUEUE MANAGEMENT
    positionInQueue: Number,
    estimatedWaitTime: Number, // In minutes
    avgServiceTime: { type: Number, default: 300 }, // In seconds
    actualServiceTime: Number, // In seconds

    // NOTIFICATION FLAGS
    arrivedNotificationSent: { type: Boolean, default: false },
    calledNotificationSent: { type: Boolean, default: false },
    completedNotificationSent: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Token", TokenSchema);
