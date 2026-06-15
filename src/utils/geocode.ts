/** Приблизительные координаты по городу — для карты до подключения геокодера Firebase */
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  москва: { lat: 55.7558, lng: 37.6173 },
  'санкт-петербург': { lat: 59.9343, lng: 30.3351 },
  спб: { lat: 59.9343, lng: 30.3351 },
  казань: { lat: 55.7887, lng: 49.1221 },
  новосибирск: { lat: 55.0084, lng: 82.9357 },
  екатеринбург: { lat: 56.8389, lng: 60.6057 },
  'нижний новгород': { lat: 56.2965, lng: 43.9361 },
  самара: { lat: 53.1959, lng: 50.1002 },
  ростов: { lat: 47.2357, lng: 39.7015 },
  'ростов-на-дону': { lat: 47.2357, lng: 39.7015 },
  краснодар: { lat: 45.0355, lng: 38.9753 },
  воронеж: { lat: 51.672, lng: 39.1843 },
  пермь: { lat: 58.0105, lng: 56.2502 },
  волгоград: { lat: 48.708, lng: 44.5133 },
};

function hashOffset(seed: string): { lat: number; lng: number } {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 1000;
  const lat = ((h % 100) - 50) * 0.001;
  const lng = (((h / 100) % 100) - 50) * 0.001;
  return { lat, lng };
}

export function approximateCoords(city?: string, address?: string, name?: string): { lat?: number; lng?: number } {
  const raw = (city || address || '').toLowerCase().trim();
  if (!raw) return {};

  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (raw.includes(key)) {
      const offset = hashOffset(name || address || city || key);
      return { lat: coords.lat + offset.lat, lng: coords.lng + offset.lng };
    }
  }
  return {};
}
