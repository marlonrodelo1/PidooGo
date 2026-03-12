import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import RestaurantCard from '../components/RestaurantCard.jsx'
import MapModal from '../map/MapModal.jsx'
import { buildStoreUrl } from '../lib/storeUrls'
import { getUserLocation } from '../lib/geolocation'

// Radio máximo para considerar un restaurante "cercano" al usuario (en km)
const RADIUS_KM = 15

function StorePage() {
  const { slug } = useParams()
  const [store, setStore] = useState(null)
  const [restaurants, setRestaurants] = useState([])
  const [baseRestaurants, setBaseRestaurants] = useState([])
  const [featuredRestaurants, setFeaturedRestaurants] = useState([])
  const [restaurantCategories, setRestaurantCategories] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => {
    const loadStoreAndRestaurants = async () => {
      setLoading(true)
      setError('')

      const { data: storeData, error: storeError } = await supabase
        .from('driver_stores')
        .select('*')
        .eq('slug', slug)
        .single()

      if (storeError || !storeData) {
        console.error(storeError)
        setError('Store not found')
        setLoading(false)
        return
      }

      console.log('store:', storeData)

      setStore(storeData)

      const { data: driverRestaurants, error } = await supabase
        .from('driver_restaurants')
        .select(
          `
          restaurant_id,
          featured,
          restaurants (
            id,
            name,
            latitude,
            longitude,
            logo_image_url,
            banner_image_url,
            is_open,
            menu_url
          )
        `,
        )
        .eq('driver_store_id', storeData.id)

      if (error) {
        console.error('Error loading driver_restaurants:', error)
        setError('No se pudieron cargar los restaurantes de la tienda.')
        setLoading(false)
        return
      }

      console.log('driver_restaurants raw:', driverRestaurants)

      const extractedRestaurantsRaw = (driverRestaurants ?? [])
        .map((row) => ({ ...row.restaurants, featured: row.featured }))
        .filter((r) => r)

      // Build categories map for all restaurants in this store
      const restaurantIds = extractedRestaurantsRaw
        .map((r) => r.id)
        .filter((id) => id != null)

      if (restaurantIds.length > 0) {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('restaurant_categories')
          .select('restaurant_id, categories (name, icon)')
          .in('restaurant_id', restaurantIds)

        if (categoriesError) {
          console.error('Error loading restaurant categories:', categoriesError)
        } else {
          const categoriesByRestaurant = {}
          for (const row of categoriesData ?? []) {
            const rid = row.restaurant_id
            if (!rid || !row.categories) continue
            if (!categoriesByRestaurant[rid]) categoriesByRestaurant[rid] = []
            categoriesByRestaurant[rid].push(row.categories)
          }
          setRestaurantCategories(categoriesByRestaurant)
        }
      } else {
        setRestaurantCategories({})
      }

      console.log('restaurants loaded (raw):', extractedRestaurantsRaw)

      const featured = extractedRestaurantsRaw.filter((r) => r.featured)
      setFeaturedRestaurants(featured)

      // Guardamos la lista base completa (aunque algún restaurante no tenga
      // coordenadas) y también la lista visible inicial sin filtrar por distancia.
      // Si el usuario permite geolocalización, más abajo filtraremos por RADIUS_KM.
      setBaseRestaurants(extractedRestaurantsRaw)
      setRestaurants(extractedRestaurantsRaw)
      setLoading(false)
    }

    if (slug) {
      loadStoreAndRestaurants()
    }
  }, [slug])

  // Obtener ubicación del usuario al montar la página (web + app nativa)
  useEffect(() => {
    let isMounted = true

    const loadLocation = async () => {
      const location = await getUserLocation()
      if (!isMounted) return
      if (location) {
        console.log('user location', location)
        setUserLocation(location)
      }
    }

    loadLocation()

    return () => {
      isMounted = false
    }
  }, [])

  // Cuando tenemos ubicación del usuario y restaurantes base,
  // filtramos por RADIUS_KM usando latitude/longitude de la tabla restaurants.
  useEffect(() => {
    if (!userLocation || baseRestaurants.length === 0) return

    const R = 6371 // km

    const toRad = (value) => (value * Math.PI) / 180

    const withDistances = baseRestaurants
      .map((restaurant) => {
        const lat = Number(restaurant.latitude)
        const lng = Number(restaurant.longitude)

        if (Number.isNaN(lat) || Number.isNaN(lng)) return null

        const dLat = toRad(lat - userLocation.lat)
        const dLng = toRad(lng - userLocation.lng)
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(userLocation.lat)) *
            Math.cos(toRad(lat)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distanceKm = R * c

        return { restaurant, distanceKm }
      })
      .filter(Boolean)

    const filtered = withDistances
      .filter((item) => item.distanceKm <= RADIUS_KM)
      .map(({ restaurant, distanceKm }) => ({
        ...restaurant,
        distance_km: distanceKm,
      }))

    // Si hay restaurantes dentro del radio, mostramos solo esos (ordenados por cercanía)
    if (filtered.length > 0) {
      const sorted = [...filtered].sort((a, b) => a.distance_km - b.distance_km)
      setRestaurants(sorted)
      return
    }

    // Si no hay ninguno en el radio, dejamos la lista completa sin filtrar
    // para no mostrar una tienda "vacía".
    setRestaurants(baseRestaurants)
  }, [userLocation, baseRestaurants])

  if (loading) {
    return <p className="text-sm text-slate-500">Cargando tienda...</p>
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>
  }

  if (!store) {
    return <p className="text-sm text-slate-500">Store not found</p>
  }

  const primaryColor = store.primary_color || '#0f172a'
  const storeUrl = buildStoreUrl(slug)

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenMap = () => {
    setIsMapOpen(true)
  }

  const handleShare = async () => {
    if (!storeUrl) return

    const title = store.custom_name || store.slug
    const text = `Mira mi tienda en Pidoo: ${title}`

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: storeUrl })
        return
      } catch {
        // User cancelled or share failed; fall through to clipboard
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(storeUrl)
        // Basic feedback; replace with toast system if added later
        alert('Enlace de la tienda copiado al portapapeles')
        return
      } catch {
        // Ignore and fall back to prompt
      }
    }

    // Fallback prompt
    // eslint-disable-next-line no-alert
    window.prompt('Copia este enlace para compartir tu tienda:', storeUrl)
  }

  return (
	<div className="store-container store-fade-in relative min-h-screen bg-[#0f172a] pb-24 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl bg-[#1e293b] shadow-lg shadow-slate-900/40 ring-1 ring-slate-800">
            {store.banner_url && (
          <div className="w-full overflow-hidden bg-slate-900">
          <img
            src={store.banner_url}
            alt={store.custom_name || store.slug}
            className="store-banner object-cover"
          />
          </div>
            )}
            <div className="relative px-4 pb-5 pt-10 sm:px-6">
              {store.logo_url && (
                <div className="absolute -top-10 left-1/2 h-20 w-20 -translate-x-1/2 overflow-hidden rounded-3xl border-2 border-slate-900 bg-slate-900 shadow-lg ring-2 ring-slate-700">
                  <img
                    src={store.logo_url}
                    alt={store.custom_name || store.slug}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="pt-8 text-center">
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {store.custom_name || store.slug}
                </h1>
                {store.delivery_fee != null && (
                  <p className="mt-1 text-sm text-slate-300">
                    Tarifa de envío desde {store.delivery_fee} €
                  </p>
                )}
              </div>
            </div>
          </div>

          {featuredRestaurants.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-50">
                Restaurantes destacados
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Una selección especial de esta tienda.
              </p>
              <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                {featuredRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="min-w-[260px] max-w-[280px] flex-shrink-0"
                  >
                    <RestaurantCard
                      restaurant={restaurant}
                      categories={restaurantCategories[restaurant.id] || []}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-slate-50">Restaurantes</h2>
            <p className="mt-1 text-sm text-slate-300">
              Explora los restaurantes disponibles en esta tienda.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  categories={restaurantCategories[restaurant.id] || []}
                />
              ))}
              {restaurants.length === 0 && (
                <p className="text-sm text-slate-300">
                  Aún no hay restaurantes asociados a esta tienda.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom navigation bar */}
      <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 sm:bottom-5">
        <div className="flex w-full max-w-md items-center justify-between rounded-full bg-[#020617]/95 px-4 py-2 shadow-lg ring-1 ring-slate-800 backdrop-blur">
          <button
            type="button"
            onClick={handleScrollTop}
            className="flex flex-1 flex-col items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800/60 active:scale-95"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-4 w-4"
              >
                <path
                  d="M3 11.5 12 4l9 7.5M5 10.5V20h5v-5h4v5h5v-9.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>Inicio</span>
          </button>

          <button
            type="button"
            onClick={handleOpenMap}
            className="flex flex-1 flex-col items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800/60 active:scale-95"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f97316] text-slate-900 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-4 w-4"
              >
                <path
                  d="M9 3 5 21m14-12-4 18m-6-6 8-12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </span>
            <span>Mapa</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex flex-1 flex-col items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800/60 active:scale-95"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-4 w-4"
              >
                <path
                  d="M8.5 13 15 9.5M9 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm9 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm-9 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>Compartir</span>
          </button>
        </div>
      </div>

      <MapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        restaurants={restaurants}
        userLocation={userLocation}
        slug={slug}
      />
    </div>
  )
}

export default StorePage
