export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${process.env.OPENCAGE_API_KEY}&language=en&countrycode=in`
    )
    const data = await res.json()
    const comp = data.results?.[0]?.components
    if (!comp) return `${lat}, ${lng}`
    
    // Fallbacks to avoid returning purely empty pieces
    const area = comp.suburb || comp.neighbourhood || '';
    const city = comp.city || comp.town || comp.county || '';
    const state = comp.state || '';
    
    const parts = [area, city, state].filter(Boolean);
    if (parts.length === 0) return `${lat}, ${lng}`;
    return parts.join(', ');
  } catch (error) {
    console.error("Reverse geocoding failed", error);
    return `${lat}, ${lng}`;
  }
}

export async function getCoordinates(address: string): Promise<{ lat: number, lng: number } | null> {
  try {
    const res = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${process.env.OPENCAGE_API_KEY}&language=en&limit=1&countrycode=in`
    )
    const data = await res.json()
    const result = data.results?.[0]
    if (!result) return null

    return {
      lat: result.geometry.lat,
      lng: result.geometry.lng
    }
  } catch (error) {
    console.error("Geocoding failed", error);
    return null;
  }
}
