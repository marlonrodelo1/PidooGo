import { useEffect, useMemo } from 'react'
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Utility: build a pulsing DivIcon for a restaurant
function createRestaurantIcon(restaurant) {
	const logoUrl = restaurant?.logo_image_url
	const name = restaurant?.name ?? ''

	const html = `
		<div class="relative flex items-center -translate-y-2">
			<div class="relative">
				<span class="absolute inset-0 rounded-full bg-orange-400/40 animate-ping"></span>
				<span class="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white shadow-md ring-1 ring-slate-200">
					${logoUrl ? `<img src="${logoUrl}" alt="${name}" class="h-9 w-9 rounded-full object-cover" />` : '<span class="h-3 w-3 rounded-full bg-orange-500"></span>'}
				</span>
			</div>
			<span class="ml-2 max-w-[140px] truncate rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-sm">
				${name}
			</span>
		</div>
	`

	return L.divIcon({
		html,
		className: '',
		iconSize: [0, 0],
		iconAnchor: [0, 0],
	})
}

// Utility: custom icon for the user position
function createUserIcon() {
	const html = `
		<div class="user-marker relative flex -translate-y-1 items-center justify-center">
			<span class="absolute h-10 w-10 rounded-full bg-sky-400/30 animate-ping"></span>
			<span class="relative flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-[10px] font-semibold text-white ring-2 ring-white shadow-md">
				👤
			</span>
		</div>
	`

	return L.divIcon({
		html,
		className: '',
		iconSize: [0, 0],
		iconAnchor: [0, 0],
	})
}

// Auto-center map between user and restaurants
function AutoCenterMap({ userLocation, restaurants }) {
	const map = useMap()

	const points = useMemo(() => {
		const pts = []

		if (Array.isArray(restaurants)) {
			for (const r of restaurants) {
				const lat = Number(r?.latitude)
				const lng = Number(r?.longitude)
				if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
					pts.push([lat, lng])
				}
			}
		}

		if (userLocation && userLocation.lat != null && userLocation.lng != null) {
			pts.push([userLocation.lat, userLocation.lng])
		}

		return pts
	}, [restaurants, userLocation])

	useEffect(() => {
		if (!map || points.length === 0) return

		if (points.length === 1) {
			map.setView(points[0], 15)
		} else {
			const bounds = L.latLngBounds(points)
			map.fitBounds(bounds, { padding: [40, 40] })
		}
	}, [map, points])

	return null
}

import { buildStoreUrl } from '../lib/storeUrls'

function MapModal({ isOpen, onClose, restaurants, userLocation, slug }) {
	if (!isOpen) return null

	const hasRestaurants = Array.isArray(restaurants) && restaurants.length > 0
	const storeUrl = buildStoreUrl(slug)

	const handleScrollTop = () => {
		onClose()
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	const handleShare = async () => {
		if (!storeUrl) return

		const title = document?.title || 'Mi tienda en Pidoo'
		const text = `Mira mi tienda en Pidoo: ${title}`

		if (navigator.share) {
			try {
				await navigator.share({ title, text, url: storeUrl })
				return
			} catch {
				// ignore, fall through
			}
		}

		if (navigator.clipboard && navigator.clipboard.writeText) {
			try {
				await navigator.clipboard.writeText(storeUrl)
				// eslint-disable-next-line no-alert
				alert('Enlace de la tienda copiado al portapapeles')
				return
			} catch {
				// ignore, fall through
			}
		}

		// eslint-disable-next-line no-alert
		window.prompt('Copia este enlace para compartir tu tienda:', storeUrl)
	}

	// Fallback center: first restaurant with coordinates or a default
	let initialCenter = [40.4168, -3.7038] // Madrid as neutral fallback
	if (hasRestaurants) {
		const r = restaurants.find((item) => item.latitude && item.longitude)
		if (r) {
			initialCenter = [Number(r.latitude), Number(r.longitude)]
		}
	} else if (userLocation) {
		initialCenter = [userLocation.lat, userLocation.lng]
	}

	return (
		<div className="pointer-events-none fixed inset-0 z-20 flex items-end justify-center md:items-center">
			{/* Desktop backdrop */}
			<button
				type="button"
				onClick={onClose}
				className="hidden md:block absolute inset-0 bg-black/40 backdrop-blur-sm"
				aria-label="Cerrar mapa"
			/>

			{/* Popup panel (mobile: small bottom sheet, desktop: centered modal) */}
			<div className="pointer-events-auto flex w-full justify-center px-4 pb-24 md:pb-10">
				<div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
					{/* Header with close button */}
					<div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
						<div className="h-1.5 w-12 rounded-full bg-slate-200 md:mx-0" />
						<button
							type="button"
							onClick={onClose}
							className="ml-auto inline-flex rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
							aria-label="Cerrar"
						>
							<span className="text-lg">×</span>
						</button>
					</div>

					{/* Map container: slightly taller on both mobile and desktop */}
					<div className="relative h-[360px] overflow-hidden md:h-[540px]">
						<MapContainer
							center={initialCenter}
							zoom={14}
							className="h-full w-full"
							scrollWheelZoom
						>
							<TileLayer
								url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
								attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
							/>

							<AutoCenterMap userLocation={userLocation} restaurants={restaurants} />

							{hasRestaurants &&
								restaurants.map((restaurant) => {
									const { latitude, longitude } = restaurant || {}
									if (latitude == null || longitude == null) return null

									return (
										<Marker
											key={restaurant.id}
											position={[restaurant.latitude, restaurant.longitude]}
											icon={createRestaurantIcon(restaurant)}
										>
											<Popup>
												<div className="space-y-1 text-sm">
													<div className="font-semibold">{restaurant.name}</div>
													{restaurant.distance_km !== undefined && (
														<div className="text-xs text-slate-600">
															{Number(restaurant.distance_km).toFixed(1)} km
														</div>
													)}
													{restaurant.menu_url && (
														<a
															href={restaurant.menu_url}
															target="_blank"
															rel="noreferrer"
															className="text-xs text-sky-600 hover:underline"
														>
															Ver menú
															</a>
														)}
												</div>
											</Popup>
										</Marker>
									)
								})}

							{userLocation && (
								<Marker
									position={[userLocation.lat, userLocation.lng]}
									icon={createUserIcon()}
								>
									<Popup>Tu ubicación</Popup>
								</Marker>
							)}

							{userLocation && (
								<Circle
									center={[userLocation.lat, userLocation.lng]}
									radius={15000}
									pathOptions={{
										color: '#0ea5e9',
										fillColor: '#0ea5e9',
										fillOpacity: 0.08,
									}}
								/>
							)}
						</MapContainer>
					</div>
				</div>
			</div>
		</div>
	)
}

export default MapModal

