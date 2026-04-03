/**
 * Real-time weather & AQI service
 *
 * Uses:
 *  - OpenWeatherMap (current weather + air pollution) → VITE_OPENWEATHER_API_KEY
 *  - WAQI (World Air Quality Index)                  → VITE_WAQI_TOKEN (fallback: "demo")
 *
 * City → lat/lon mapping for accurate geo-based queries
 */

export const CITY_COORDS = {
  Chennai:     { lat: 13.0827, lon: 80.2707, owm: 'Chennai,IN',     waqi: 'chennai' },
  Mumbai:      { lat: 19.0760, lon: 72.8777, owm: 'Mumbai,IN',      waqi: 'mumbai' },
  Delhi:       { lat: 28.6139, lon: 77.2090, owm: 'Delhi,IN',       waqi: 'delhi' },
  Bengaluru:   { lat: 12.9716, lon: 77.5946, owm: 'Bangalore,IN',   waqi: 'bangalore' },
  Coimbatore:  { lat: 11.0168, lon: 76.9558, owm: 'Coimbatore,IN',  waqi: 'coimbatore' },
};

// OWM AQI index → approximate AQI numeric (US EPA scale approximation)
const OWM_AQI_MAP = { 1: 25, 2: 75, 3: 150, 4: 250, 5: 400 };

// ─── Rain / Temp from OpenWeatherMap ─────────────────────────────────────────

export async function fetchWeather(zone) {
  const OWM_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const city = CITY_COORDS[zone];
  if (!city) return null;

  if (!OWM_KEY || OWM_KEY === 'your_openweather_api_key') {
    return null; // Will trigger fallback
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city.owm}&appid=${OWM_KEY}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OWM error ${res.status}`);
    const data = await res.json();

    // rain['1h'] = mm in last hour; multiply ×24 to estimate daily
    const rainPerHour = data.rain?.['1h'] ?? data.rain?.['3h'] / 3 ?? 0;
    const rainPerDay = Math.round(rainPerHour * 24 * 10) / 10;
    const tempC = Math.round(data.main.temp * 10) / 10;
    const description = data.weather?.[0]?.description ?? '';
    const humidity = data.main.humidity;
    const feelsLike = Math.round(data.main.feels_like * 10) / 10;

    return { rain: rainPerDay, temp: tempC, description, humidity, feelsLike, source: 'OpenWeatherMap' };
  } catch (e) {
    console.warn(`[Weather] Failed for ${zone}:`, e.message);
    return null;
  }
}

// ─── AQI from WAQI ───────────────────────────────────────────────────────────

export async function fetchAQI(zone) {
  const WAQI_TOKEN = import.meta.env.VITE_WAQI_TOKEN || 'demo';
  const city = CITY_COORDS[zone];
  if (!city) return null;

  try {
    const url = `https://api.waqi.info/feed/${city.waqi}/?token=${WAQI_TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`WAQI error ${res.status}`);
    const data = await res.json();

    if (data.status !== 'ok') throw new Error(`WAQI status: ${data.status}`);

    const aqi = data.data.aqi;
    const dominantPollutant = data.data.dominentpol ?? '';
    const stationName = data.data.city?.name ?? zone;
    const time = data.data.time?.s ?? '';

    return { aqi, dominantPollutant, stationName, time, source: 'WAQI' };
  } catch (e) {
    console.warn(`[AQI] Failed for ${zone}:`, e.message);
    return null;
  }
}

// ─── AQI fallback using OpenWeatherMap Air Pollution API ─────────────────────

export async function fetchAQIFromOWM(zone) {
  const OWM_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const city = CITY_COORDS[zone];
  if (!city || !OWM_KEY || OWM_KEY === 'your_openweather_api_key') return null;

  try {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${city.lat}&lon=${city.lon}&appid=${OWM_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OWM AQ error ${res.status}`);
    const data = await res.json();

    const aqiIndex = data.list?.[0]?.main?.aqi ?? 1;
    const components = data.list?.[0]?.components ?? {};
    const aqi = OWM_AQI_MAP[aqiIndex] ?? 25;

    return {
      aqi,
      pm25: Math.round(components.pm2_5),
      pm10: Math.round(components.pm10),
      no2: Math.round(components.no2),
      source: 'OpenWeatherMap AQI',
    };
  } catch (e) {
    console.warn(`[OWM AQI] Failed for ${zone}:`, e.message);
    return null;
  }
}

// ─── Fetch all data for a zone ────────────────────────────────────────────────

export async function fetchAllWeatherData(zone) {
  const [weather, waqiAqi, owmAqi] = await Promise.allSettled([
    fetchWeather(zone),
    fetchAQI(zone),
    fetchAQIFromOWM(zone),
  ]);

  const weatherData = weather.status === 'fulfilled' ? weather.value : null;
  const aqiData = waqiAqi.status === 'fulfilled' && waqiAqi.value
    ? waqiAqi.value
    : owmAqi.status === 'fulfilled'
    ? owmAqi.value
    : null;

  return { weather: weatherData, aqi: aqiData };
}

// ─── Fetch all zones at once ──────────────────────────────────────────────────

export async function fetchAllZonesWeather() {
  const zones = Object.keys(CITY_COORDS);
  const results = {};
  await Promise.all(
    zones.map(async (zone) => {
      results[zone] = await fetchAllWeatherData(zone);
    })
  );
  return results;
}

// ─── AQI label helper ─────────────────────────────────────────────────────────

export function getAQILabel(aqi) {
  if (aqi <= 50)  return { label: 'Good',       color: 'text-green-400' };
  if (aqi <= 100) return { label: 'Moderate',   color: 'text-yellow-400' };
  if (aqi <= 150) return { label: 'Unhealthy*', color: 'text-orange-400' };
  if (aqi <= 200) return { label: 'Unhealthy',  color: 'text-red-400' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: 'text-purple-400' };
  return { label: 'Hazardous', color: 'text-red-600' };
}
