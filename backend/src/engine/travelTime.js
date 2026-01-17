function estimateTravelTime(userLoc, shopLoc) {
  const distanceKm = haversine(userLoc, shopLoc);
  const speed = userLoc.speed || 1.4; // m/s fallback

  let mode = "walking";
  if (speed > 8) mode = "driving";

  const speedKmH = speed * 3.6;
  const timeHours = distanceKm / speedKmH;

  return {
    travelTime: Math.floor(timeHours * 3600),
    mode
  };
}

function haversine(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;

  const sa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(sa));
}

module.exports = { estimateTravelTime };
