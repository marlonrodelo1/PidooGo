import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'

function RestaurantCard({ restaurant, categories = [] }) {
  if (!restaurant) return null

  const {
    name,
    banner_image_url: bannerUrl,
    logo_image_url: logoUrl,
    menu_url: menuUrl,
    is_open: isOpen,
    accepts_delivery: acceptsDelivery,
    accepts_takeaway: acceptsTakeaway,
  } = restaurant

  const hasDistance =
    restaurant.distance_km !== undefined && restaurant.distance_km !== null

  const statusLabel = isOpen ? 'Abierto' : 'Cerrado'
  const statusClasses = isOpen
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-red-100 text-red-700'

  const handleClick = () => {
    if (!menuUrl) return
    const isNative = Capacitor?.isNativePlatform?.() ?? false
    if (isNative && Browser?.open) {
      Browser.open({ url: menuUrl })
    } else {
      window.open(menuUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!menuUrl}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed"
    >
      <div className="relative">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt={name}
            className="h-32 w-full object-cover sm:h-36"
          />
        ) : (
          <div className="flex h-32 w-full items-center justify-center bg-slate-100 text-xs text-slate-400 sm:h-36">
            Sin banner
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2 text-[11px] font-medium">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 ${statusClasses}`}
          >
            {statusLabel}
          </span>
          {acceptsDelivery && (
            <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-1 text-sky-700">
              Delivery
            </span>
          )}
          {acceptsTakeaway && (
            <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-1 text-orange-700">
              Takeaway
            </span>
          )}
        </div>
      </div>

      <div className="relative px-4 pb-4 pt-7">
        {logoUrl && (
          <div className="absolute -top-7 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white bg-white shadow-sm">
            <img
              src={logoUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className={logoUrl ? 'pl-16' : ''}>
          <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">
            {name}
          </h3>
          {categories.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-slate-500">
              {categories.map((category) => (
                <span
                  key={`${category.name}-${category.icon || 'icon'}`}
                  className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5"
                >
                  {category.icon && (
                    <span className="mr-1" aria-hidden="true">
                      {category.icon}
                    </span>
                  )}
                  <span>{category.name}</span>
                </span>
              ))}
            </div>
          )}
          {hasDistance && (
            <p className="mt-1 flex items-center text-xs text-slate-500">
              <span className="mr-1" aria-hidden="true">
                📍
              </span>
              {Number(restaurant.distance_km).toFixed(1)} km
            </p>
          )}
          {menuUrl && (
            <p className="mt-1 text-xs text-slate-500">
              Toca para abrir el menú.
            </p>
          )}
        </div>
      </div>
    </button>
  )
}

export default RestaurantCard
