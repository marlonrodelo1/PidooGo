import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getUserLocation } from '../lib/geolocation'

const DEFAULT_CENTER = [40.4168, -3.7038]

const restaurantMarkerCss = `
.restaurant-marker {
	border-radius: 9999px;
	box-shadow: 0 0 0 0 rgba(248, 113, 22, 0.45);
	animation: restaurant-marker-pulse 1.4s ease-out infinite;
}

@keyframes restaurant-marker-pulse {
	0% {
		transform: scale(1);
		box-shadow: 0 0 0 0 rgba(248, 113, 22, 0.45);
	}
	70% {
		transform: scale(1.05);
		box-shadow: 0 0 0 8px rgba(248, 113, 22, 0);
	}
	100% {
		transform: scale(1);
		box-shadow: 0 0 0 0 rgba(248, 113, 22, 0);
	}
}
`

function restaurantIcon(logoUrl) {
	if (!logoUrl) return null
	return L.icon({
		iconUrl: logoUrl,
		iconSize: [40, 40],
		className: 'restaurant-marker',
	})
}

function createUserIcon() {
	// Use a div-based icon so it always renders even if an image is missing
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

function AutoCenter({ userLocation, restaurants }) {
	const map = useMap()

	useEffect(() => {
		const points = []

		if (userLocation) {
			points.push([userLocation[0], userLocation[1]])
		}

		restaurants.forEach((r) => {
			const lat = Number(r.latitude)
			const lng = Number(r.longitude)
			if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
				points.push([lat, lng])
			}
		})

		if (!points.length) {
			map.setView(DEFAULT_CENTER, 13)
			return
		}

		if (points.length === 1) {
			map.setView(points[0], 15)
		} else {
			const bounds = L.latLngBounds(points)
			map.fitBounds(bounds, { padding: [40, 40] })
		}
	}, [map, userLocation, restaurants])

	return null
}

function MapViewer({ restaurants }) {
	const [userLocation, setUserLocation] = useState(null)

	useEffect(() => {
		let isMounted = true

		const loadLocation = async () => {
			const location = await getUserLocation()
			if (!isMounted || !location) return
			setUserLocation([location.lat, location.lng])
		}

		loadLocation()

		return () => {
			isMounted = false
		}
	}, [])

	useEffect(() => {
		// Debug: log user location once it has been resolved
		console.log('User location:', userLocation)
	}, [userLocation])

	const safeRestaurants = Array.isArray(restaurants) ? restaurants : []

	return (
		<div className="w-full">
			{/* Local styles for pulsing restaurant marker */}
			<style>{restaurantMarkerCss}</style>

			<MapContainer
				center={DEFAULT_CENTER}
				zoom={13}
				className="h-[80vh] w-full"
				scrollWheelZoom
			>
				<TileLayer
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
				/>

				<AutoCenter userLocation={userLocation} restaurants={safeRestaurants} />

				{userLocation && (
					<Marker position={userLocation} icon={createUserIcon()}>
						<Popup>Tu ubicación</Popup>
					</Marker>
				)}

				{safeRestaurants
					.filter((r) => r && r.latitude && r.longitude)
					.map((r) => (
						<Marker
							key={r.id}
							position={[r.latitude, r.longitude]}
							icon={restaurantIcon(r.logo_image_url) || undefined}
						>
							<Popup>
								<b>{r.name}</b>
								<br />
								{r.menu_url && (
									<a href={r.menu_url} target="_blank" rel="noreferrer">
										Ver menú
									</a>
								)}
							</Popup>
						</Marker>
					))}
			</MapContainer>
		</div>
	)
}

export default MapViewer