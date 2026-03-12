import { useEffect, useMemo, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { Link } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'
import { buildStoreUrl } from '../lib/storeUrls'

function Panel() {
  const { user } = useAuth()
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(false)
  const [activeRestaurants, setActiveRestaurants] = useState(0)
  const [featuredRestaurants, setFeaturedRestaurants] = useState(0)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const isNative = Capacitor?.isNativePlatform?.() ?? false

  const publicUrl = useMemo(() => buildStoreUrl(store?.slug), [store?.slug])

  useEffect(() => {
    const loadStoreAndStats = async () => {
      if (!user) return
      setLoading(true)
      setError('')

      const { data: storeData, error: storeError } = await supabase
        .from('driver_stores')
        .select('*')
        .eq('socio_id', user.id)
        .single()

      if (storeError || !storeData) {
        console.error(storeError)
        setError('No se pudo cargar la tienda asociada a este usuario.')
        setStore(null)
        setLoading(false)
        return
      }

      setStore(storeData)
      setLoading(false)

      setStatsLoading(true)
      const [{ count: totalCount }, { count: featuredCount }] = await Promise.all([
        supabase
          .from('driver_restaurants')
          .select('id', { count: 'exact', head: true })
          .eq('driver_store_id', storeData.id),
        supabase
          .from('driver_restaurants')
          .select('id', { count: 'exact', head: true })
          .eq('driver_store_id', storeData.id)
          .eq('featured', true),
      ])

      setActiveRestaurants(totalCount ?? 0)
      setFeaturedRestaurants(featuredCount ?? 0)
      setStatsLoading(false)
    }

    loadStoreAndStats()
  }, [user])

  const handleCopyUrl = async () => {
    if (!publicUrl) return
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copying URL', err)
    }
  }

  const handleOpenStore = () => {
    if (!publicUrl) return
    window.open(publicUrl, '_blank', 'noopener,noreferrer')
  }

  const handleDownloadQr = () => {
    if (!publicUrl) return
    const canvas = document.querySelector('#store-qr canvas')
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `store-${store?.slug || 'qr'}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  const storeName = store?.custom_name || store?.slug || 'Mi tienda'
  const storeStatus = store?.is_active ? 'Activa' : 'Inactiva'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Panel de control
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Estás gestionando:{' '}
          <span className="font-medium text-slate-900">{storeName}</span>
        </p>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Restaurantes activos
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {statsLoading ? '—' : activeRestaurants}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Asociados a esta tienda.
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <span className="text-sm font-semibold">R</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Restaurantes destacados
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {statsLoading ? '—' : featuredRestaurants}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Marcados como destacados en tu tienda.
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <span className="text-sm font-semibold">★</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Estado de la tienda
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {storeStatus}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Controla si tu tienda está visible públicamente.
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              store?.is_active
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {store?.is_active ? 'Activa' : 'Inactiva'}
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Tienda pública</h2>
          <p className="mt-1 text-xs text-slate-500">
            Comparte y prueba cómo ven tus socios la tienda.
          </p>

          <div className="mt-4 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                readOnly
                value={publicUrl || ''}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleOpenStore}
                  disabled={!publicUrl}
                  className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  Open Store
                </button>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  disabled={!publicUrl}
                  className="inline-flex items-center rounded-lg bg-orange-500 px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
                >
                  {copied ? 'Copiado' : 'Copy URL'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {!isNative && (
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">QR de la tienda</h2>
            <p className="mt-1 text-xs text-slate-500">
              Genera un código QR para imprimir o compartir.
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div className="rounded-xl bg-slate-50 p-3">
                {publicUrl ? (
                  <div id="store-qr">
                    <QRCodeCanvas
                      value={publicUrl}
                      size={144}
                      bgColor="#ffffff"
                      fgColor="#0F172A"
                      level="M"
                      includeMargin
                    />
                  </div>
                ) : (
                  <div className="flex h-36 w-36 items-center justify-center text-xs text-slate-400">
                    Define un slug para generar el QR.
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleDownloadQr}
                disabled={!publicUrl}
                className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Download QR
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">Acciones rápidas</h2>
        <p className="mt-1 text-xs text-slate-500">
          Accede rápidamente a las secciones más usadas.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Link
            to="/admin/settings"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 shadow-sm transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700"
          >
            Configurar tienda
          </Link>
          <Link
            to="/admin/restaurants"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 shadow-sm transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700"
          >
            Gestionar restaurantes
          </Link>
          <Link
            to={store?.slug ? `/${store.slug}` : '#'}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 shadow-sm transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700 disabled:cursor-not-allowed"
          >
            Ver tienda pública
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Panel
