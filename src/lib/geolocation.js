import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'

/**
 * Obtiene la ubicación del usuario de forma unificada para web y app nativa.
 * Devuelve { lat, lng } o null si no se pudo obtener.
 */
export async function getUserLocation(options = {}) {
  const config = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000,
    ...options,
  }

  try {
    // Usamos siempre el plugin de Capacitor: en nativo usa APIs propias
    // y en web internamente llama a navigator.geolocation.
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: config.enableHighAccuracy,
      timeout: config.timeout,
      maximumAge: config.maximumAge,
    })

    const { latitude, longitude } = position.coords || {}
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      return { lat: latitude, lng: longitude }
    }
  } catch (err) {
    console.error('Error getting user location (Capacitor Geolocation)', err)
  }

  // Fallback explícito por si el plugin falla en algún entorno web antiguo
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
        },
        (error) => {
          console.error('Error getting user location (navigator.geolocation)', error)
          resolve(null)
        },
        config,
      )
    })
  }

  return null
}
