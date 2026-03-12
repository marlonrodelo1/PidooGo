import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'

function Restaurants() {
  const { user } = useAuth()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [store, setStore] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [updatingId, setUpdatingId] = useState(null)
  const [featuredIds, setFeaturedIds] = useState(new Set())
  const [updatingFeaturedId, setUpdatingFeaturedId] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      setLoading(true)
      setError('')

      // Get current driver's store by socio_id
      const { data: storeData, error: storeError } = await supabase
        .from('driver_stores')
        .select('id')
        .eq('socio_id', user.id)
        .single()

      if (storeError || !storeData) {
        console.error(storeError)
        setError('No se pudo encontrar tu tienda. Configúrala primero en Ajustes.')
        setLoading(false)
        return
      }

      setStore(storeData)

      const [{ data: restaurantsData, error: restaurantsError }, { data: linksData, error: linksError }] =
        await Promise.all([
          supabase
            .from('restaurants')
            .select('id, name, logo_image_url')
            .order('name', { ascending: true }),
          supabase
            .from('driver_restaurants')
            .select('restaurant_id, featured')
            .eq('driver_store_id', storeData.id),
        ])

      if (restaurantsError) {
        console.error(restaurantsError)
        setError('No se pudieron cargar los restaurantes.')
        setLoading(false)
        return
      }

      if (linksError) {
        console.error(linksError)
      }

      setRestaurants(restaurantsData ?? [])

      const activeIds = new Set((linksData ?? []).map((row) => row.restaurant_id))
      const activeFeaturedIds = new Set(
        (linksData ?? [])
          .filter((row) => row.featured)
          .map((row) => row.restaurant_id),
      )
      setSelectedIds(activeIds)
      setFeaturedIds(activeFeaturedIds)

      setLoading(false)
    }

    fetchData()
  }, [user])

  const handleToggle = async (restaurantId, nextValue) => {
    if (!store || updatingId) return

    setUpdatingId(restaurantId)

    if (nextValue) {
      const { error: insertError } = await supabase.from('driver_restaurants').insert({
        driver_store_id: store.id,
        restaurant_id: restaurantId,
      })

      if (insertError) {
        console.error(insertError)
        setError('No se pudo activar el restaurante para tu tienda.')
      } else {
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.add(restaurantId)
          return next
        })
      }
    } else {
      const { error: deleteError } = await supabase
        .from('driver_restaurants')
        .delete()
        .eq('driver_store_id', store.id)
        .eq('restaurant_id', restaurantId)

      if (deleteError) {
        console.error(deleteError)
        setError('No se pudo desactivar el restaurante de tu tienda.')
      } else {
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.delete(restaurantId)
          return next
        })
      }
    }

    setUpdatingId(null)
  }

  const handleToggleFeatured = async (restaurantId, nextValue) => {
    if (!store || updatingFeaturedId) return

    // Only allow featuring restaurants that are already active in this store
    if (!selectedIds.has(restaurantId)) return

    setUpdatingFeaturedId(restaurantId)

    const { error: updateError } = await supabase
      .from('driver_restaurants')
      .update({ featured: nextValue })
      .eq('driver_store_id', store.id)
      .eq('restaurant_id', restaurantId)

    if (updateError) {
      console.error(updateError)
      setError('No se pudo actualizar el estado destacado del restaurante.')
    } else {
      setFeaturedIds((prev) => {
        const next = new Set(prev)
        if (nextValue) {
          next.add(restaurantId)
        } else {
          next.delete(restaurantId)
        }
        return next
      })
    }

    setUpdatingFeaturedId(null)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Restaurantes
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Controla qué restaurantes aparecen en tu tienda pública.
        </p>
      </div>

      {loading && <p className="text-sm text-slate-500">Cargando restaurantes...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white">
          {restaurants.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-500">
              Aún no hay restaurantes configurados.
            </p>
          ) : (
            <ul role="list" className="divide-y divide-slate-100">
              {restaurants.map((restaurant) => {
                const isActive = selectedIds.has(restaurant.id)
                const isFeatured = featuredIds.has(restaurant.id)
                const disabled = updatingId === restaurant.id

                return (
                  <li
                    key={restaurant.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      {restaurant.logo_image_url ? (
                        <img
                          src={restaurant.logo_image_url}
                          alt={restaurant.name}
                          className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                          {restaurant.name?.[0] ?? '?'}
                        </div>
                      )}
                      <span className="text-sm font-medium text-slate-900">
                        {restaurant.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggle(restaurant.id, !isActive)}
                        disabled={disabled}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                          isActive ? 'bg-emerald-500' : 'bg-slate-200'
                        } ${disabled ? 'cursor-wait opacity-60' : 'cursor-pointer'}`}
                        aria-pressed={isActive}
                        aria-label={
                          isActive
                            ? 'Quitar restaurante de tu tienda pública'
                            : 'Añadir restaurante a tu tienda pública'
                        }
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                            isActive ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(restaurant.id, !isFeatured)}
                        disabled={!isActive || updatingFeaturedId === restaurant.id}
                        className={`inline-flex items-center gap-1 text-xs font-medium ${
                          isFeatured ? 'text-amber-500' : 'text-slate-400'
                        } ${
                          !isActive || updatingFeaturedId === restaurant.id
                            ? 'cursor-not-allowed opacity-60'
                            : 'hover:text-amber-500'
                        }`}
                        aria-pressed={isFeatured}
                      >
                        <span aria-hidden="true">{isFeatured ? '⭐' : '☆'}</span>
                        <span>{isFeatured ? 'Destacado' : 'No destacado'}</span>
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default Restaurants
