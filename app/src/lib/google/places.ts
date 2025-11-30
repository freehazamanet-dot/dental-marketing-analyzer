/**
 * Google Places API連携
 * 歯科医院の口コミデータを取得
 */

interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  rating: number;
  totalReviews: number;
  reviews: PlaceReview[];
}

interface PlaceReview {
  author: string;
  rating: number;
  text: string;
  time: string;
  relativeTimeDescription: string;
}

interface PlaceSearchResult {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  totalReviews?: number;
}

const PLACES_API_BASE = "https://maps.googleapis.com/maps/api/place";

/**
 * 住所や医院名で歯科医院を検索
 */
export async function searchDentalClinics(
  query: string,
  location?: { lat: number; lng: number }
): Promise<PlaceSearchResult[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is not configured");
  }

  const params = new URLSearchParams({
    query: `${query} 歯科`,
    key: apiKey,
    language: "ja",
    type: "dentist",
  });

  if (location) {
    params.append("location", `${location.lat},${location.lng}`);
    params.append("radius", "5000"); // 5km radius
  }

  const response = await fetch(
    `${PLACES_API_BASE}/textsearch/json?${params}`
  );

  if (!response.ok) {
    throw new Error(`Places API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Places API error: ${data.status}`);
  }

  return (data.results || []).map((place: {
    place_id: string;
    name: string;
    formatted_address: string;
    rating?: number;
    user_ratings_total?: number;
  }) => ({
    placeId: place.place_id,
    name: place.name,
    address: place.formatted_address,
    rating: place.rating,
    totalReviews: place.user_ratings_total,
  }));
}

/**
 * Place IDから詳細情報と口コミを取得
 */
export async function getPlaceDetails(
  placeId: string
): Promise<PlaceDetails | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is not configured");
  }

  const params = new URLSearchParams({
    place_id: placeId,
    key: apiKey,
    language: "ja",
    fields: "place_id,name,formatted_address,rating,user_ratings_total,reviews",
  });

  const response = await fetch(
    `${PLACES_API_BASE}/details/json?${params}`
  );

  if (!response.ok) {
    throw new Error(`Places API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.status !== "OK") {
    if (data.status === "NOT_FOUND") {
      return null;
    }
    throw new Error(`Places API error: ${data.status}`);
  }

  const place = data.result;

  return {
    placeId: place.place_id,
    name: place.name,
    address: place.formatted_address,
    rating: place.rating || 0,
    totalReviews: place.user_ratings_total || 0,
    reviews: (place.reviews || []).map((review: {
      author_name: string;
      rating: number;
      text: string;
      time: number;
      relative_time_description: string;
    }) => ({
      author: review.author_name,
      rating: review.rating,
      text: review.text,
      time: new Date(review.time * 1000).toISOString(),
      relativeTimeDescription: review.relative_time_description,
    })),
  };
}

/**
 * 口コミデータをDB保存用の形式に変換
 */
export function convertToReviewData(placeDetails: PlaceDetails) {
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  for (const review of placeDetails.reviews) {
    const rating = Math.round(review.rating) as 1 | 2 | 3 | 4 | 5;
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating]++;
    }
  }

  return {
    totalReviews: placeDetails.totalReviews,
    averageRating: placeDetails.rating,
    rating5Count: ratingCounts[5],
    rating4Count: ratingCounts[4],
    rating3Count: ratingCounts[3],
    rating2Count: ratingCounts[2],
    rating1Count: ratingCounts[1],
    latestReviews: placeDetails.reviews.slice(0, 5).map((r) => ({
      author: r.author,
      rating: r.rating,
      text: r.text,
      time: r.time,
    })),
  };
}

/**
 * 住所から緯度経度を取得（ジオコーディング）
 */
export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is not configured");
  }

  const params = new URLSearchParams({
    address,
    key: apiKey,
    language: "ja",
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params}`
  );

  if (!response.ok) {
    throw new Error(`Geocoding API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.status !== "OK" || !data.results?.[0]) {
    return null;
  }

  const location = data.results[0].geometry.location;
  return { lat: location.lat, lng: location.lng };
}

/**
 * 周辺の競合歯科医院を検索
 */
export async function searchNearbyDentalClinics(
  location: { lat: number; lng: number },
  radiusMeters: number = 2000
): Promise<PlaceSearchResult[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is not configured");
  }

  const params = new URLSearchParams({
    location: `${location.lat},${location.lng}`,
    radius: radiusMeters.toString(),
    type: "dentist",
    key: apiKey,
    language: "ja",
  });

  const response = await fetch(
    `${PLACES_API_BASE}/nearbysearch/json?${params}`
  );

  if (!response.ok) {
    throw new Error(`Places API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Places API error: ${data.status}`);
  }

  return (data.results || []).map((place: {
    place_id: string;
    name: string;
    vicinity: string;
    rating?: number;
    user_ratings_total?: number;
  }) => ({
    placeId: place.place_id,
    name: place.name,
    address: place.vicinity,
    rating: place.rating,
    totalReviews: place.user_ratings_total,
  }));
}

