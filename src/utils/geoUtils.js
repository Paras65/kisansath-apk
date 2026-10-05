// किसान साथी - खेत सीमा जीपीएस व रकबा गणना मॉड्यूल (Geo & Area Calculation Engine)

const EARTH_RADIUS = 6378137; // Meters

/**
 * दो GPS निर्देशांकों के बीच की दूरी (मीटर में) - Haversine Formula
 */
export const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS * c;
};

/**
 * GPS बिंदुओं के बहुभुज (Polygon) का कुल क्षेत्रफल (Shoelace Formula with Local Cartesian Projection)
 * @param {Array<{lat: number, lng: number}>} points
 * @returns {{ sqMeters: number, acres: number, hectares: number, dismil: number, bigha: number }}
 */
export const calculatePolygonArea = (points) => {
  if (!points || points.length < 3) {
    return { sqMeters: 0, acres: 0, hectares: 0, dismil: 0, bigha: 0 };
  }

  // Centroid reference point
  const refLat = points[0].lat;
  const refLon = points[0].lng;
  const latRad = (refLat * Math.PI) / 180;

  // Project spherical coords to flat meters relative to centroid
  const xyPoints = points.map((p) => {
    const x = ((p.lng - refLon) * Math.PI / 180) * EARTH_RADIUS * Math.cos(latRad);
    const y = ((p.lat - refLat) * Math.PI / 180) * EARTH_RADIUS;
    return { x, y };
  });

  // Shoelace formula
  let areaSum = 0;
  const n = xyPoints.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    areaSum += xyPoints[i].x * xyPoints[j].y - xyPoints[j].x * xyPoints[i].y;
  }

  const sqMeters = Math.abs(areaSum) / 2;

  // Conversions
  const acres = sqMeters / 4046.8564224;
  const hectares = sqMeters / 10000;
  const dismil = acres * 100;
  const bigha = acres / 0.625; // छत्तीसगढ़ / मध्य भारत मानक (1 बीघा = 0.625 एकड़)

  return {
    sqMeters: Math.round(sqMeters * 10) / 10,
    acres: Number(acres.toFixed(3)),
    hectares: Number(hectares.toFixed(3)),
    dismil: Number(dismil.toFixed(1)),
    bigha: Number(bigha.toFixed(2))
  };
};

/**
 * खेत की कुल परिधि / मेड़ की लंबाई (मीटर व फीट में)
 */
export const calculatePerimeter = (points) => {
  if (!points || points.length < 2) return { meters: 0, feet: 0 };
  let totalMeters = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalMeters += calculateDistanceMeters(
      points[i].lat,
      points[i].lng,
      points[i + 1].lat,
      points[i + 1].lng
    );
  }
  // Add closing segment if at least 3 points
  if (points.length >= 3) {
    totalMeters += calculateDistanceMeters(
      points[points.length - 1].lat,
      points[points.length - 1].lng,
      points[0].lat,
      points[0].lng
    );
  }
  return {
    meters: Math.round(totalMeters * 10) / 10,
    feet: Math.round(totalMeters * 3.28084)
  };
};
