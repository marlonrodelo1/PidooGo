import { useEffect, useMemo, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { QRCodeCanvas } from 'qrcode.react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'
import { PUBLIC_STORE_BASE_URL, buildStoreUrl } from '../lib/storeUrls'

function AdminSettings() {
  const { user } = useAuth()
  const [storeId, setStoreId] = useState(null)
  const [form, setForm] = useState({
    custom_name: '',
    slug: '',
    logo_url: '',
    banner_url: '',
    primary_color: '',
    delivery_fee: '',
    commission_percentage: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState('')
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const isNative = Capacitor?.isNativePlatform?.() ?? false

  const publicUrl = useMemo(() => buildStoreUrl(form.slug), [form.slug])

  const shareUrl = useMemo(() => {
    if (!form.slug) return ''
    return `${PUBLIC_STORE_BASE_URL}/${form.slug}`
  }, [form.slug])

  useEffect(() => {
    const loadStore = async () => {
      if (!user) return
      setLoading(true)
      setMessage('')
      setError('')

      const { data, error: fetchError } = await supabase
        .from('driver_stores')
        .select('*')
        .eq('socio_id', user.id)
        .single()

      if (fetchError) {
        console.error(fetchError)
        setError('No se pudo cargar la configuración de la tienda.')
      } else if (data) {
        setStoreId(data.id)
        setForm({
          custom_name: data.custom_name ?? '',
          slug: data.slug ?? '',
          logo_url: data.logo_url ?? '',
          banner_url: data.banner_url ?? '',
          primary_color: data.primary_color ?? '',
          delivery_fee: data.delivery_fee ?? '',
          commission_percentage: data.commission_percentage ?? '',
        })
      }

      setLoading(false)
    }

    loadStore()
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setMessage('')
    setError('')

    const payload = {
      custom_name: form.custom_name,
      slug: form.slug,
      logo_url: form.logo_url,
      banner_url: form.banner_url,
      primary_color: form.primary_color,
      delivery_fee:
        form.delivery_fee === '' ? null : Number(form.delivery_fee),
      commission_percentage:
        form.commission_percentage === ''
          ? null
          : Number(form.commission_percentage),
    }

    const { error: updateError } = await supabase
      .from('driver_stores')
      .update(payload)
      .eq('socio_id', user.id)

    if (updateError) {
      console.error(updateError)
      setError('No se pudo guardar la configuración.')
    } else {
      setMessage('Configuración guardada correctamente.')
    }

    setSaving(false)
  }

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

  const handleDownloadQr = () => {
    if (!publicUrl) return
    const canvas = document.querySelector('#store-qr canvas')
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `store-${form.slug || 'qr'}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  const handleShareWhatsApp = () => {
    if (!shareUrl) return
    const url = `https://wa.me/?text=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleShareTelegram = () => {
    if (!shareUrl) return
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleShareFacebook = () => {
    if (!shareUrl) return
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleShareInstagram = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
    } catch (err) {
      console.error('Error preparing Instagram share', err)
    }
  }

  const uploadToStorage = async (type, file) => {
    if (!storeId || !file) {
      console.error('Upload aborted: missing store id or file')
      return null
    }

    const path = type === 'logo'
      ? `logos/${storeId}.png`
      : `banners/${storeId}.png`

    const { error: uploadError } = await supabase.storage
      .from('store-assets')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      console.error('Upload error', uploadError)
      setError('No se pudo subir la imagen.')
      return null
    }

    const { data } = supabase.storage
      .from('store-assets')
      .getPublicUrl(path)

    return data?.publicUrl ?? null
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    setError('')

    try {
      const previewUrl = URL.createObjectURL(file)
      setLogoPreviewUrl(previewUrl)
    } catch (previewError) {
      console.error('Error generating logo preview', previewError)
    }

    const publicLogoUrl = await uploadToStorage('logo', file)

    if (publicLogoUrl) {
      setForm((prev) => ({ ...prev, logo_url: publicLogoUrl }))
      await supabase
        .from('driver_stores')
        .update({ logo_url: publicLogoUrl })
        .eq('id', storeId)
    }

    setUploadingLogo(false)
  }

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBanner(true)
    setError('')

    try {
      const previewUrl = URL.createObjectURL(file)
      setBannerPreviewUrl(previewUrl)
    } catch (previewError) {
      console.error('Error generating banner preview', previewError)
    }

    const publicBannerUrl = await uploadToStorage('banner', file)

    if (publicBannerUrl) {
      setForm((prev) => ({ ...prev, banner_url: publicBannerUrl }))
      await supabase
        .from('driver_stores')
        .update({ banner_url: publicBannerUrl })
        .eq('id', storeId)
    }

    setUploadingBanner(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-5">
      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Store Info</h2>
          <p className="mt-1 text-xs text-slate-500">
            Nombre y slug público de tu tienda.
          </p>
          {loading ? (
            <p className="mt-4 text-sm text-slate-500">
              Cargando configuración...
            </p>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Nombre personalizado
                </label>
                <input
                  name="custom_name"
                  value={form.custom_name}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Slug
                </label>
                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                />
                <p className="mt-1 text-xs text-slate-400">
                  URL pública de la tienda, por ejemplo: /juanfood.
                </p>
              </div>
            </div>
          )}
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">Branding</h2>
        <p className="mt-1 text-xs text-slate-500">
          Colores e imágenes que representan tu marca.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Color primario
            </label>
            <input
              name="primary_color"
              value={form.primary_color}
              onChange={handleChange}
              placeholder="#F97316"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Logo
              </label>
              {(logoPreviewUrl || form.logo_url) && (
                <img
                  src={logoPreviewUrl || form.logo_url}
                  alt="Logo"
                  className="h-14 w-14 rounded-xl border border-slate-200 object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-orange-500 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-orange-600"
              />
              <p className="text-xs text-slate-400">
                PNG o JPG recomendado 512x512.
              </p>
              {uploadingLogo && (
                <p className="text-xs text-slate-500">Subiendo logo...</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Banner
              </label>
              {(bannerPreviewUrl || form.banner_url) && (
                <div className="h-20 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <img
                    src={bannerPreviewUrl || form.banner_url}
                    alt="Banner"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-orange-500 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-orange-600"
              />
              <p className="text-xs text-slate-400">
                Imagen apaisada recomendada 1200x400.
              </p>
              {uploadingBanner && (
                <p className="text-xs text-slate-500">Subiendo banner...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">Public URL</h2>
        <p className="mt-1 text-xs text-slate-500">
          Comparte el enlace de tu tienda con tus socios.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <input
            readOnly
            value={publicUrl || ''}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
          />
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

      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">Compartir tienda</h2>
        <p className="mt-1 text-xs text-slate-500">
          Envía el enlace de tu tienda por tus redes favoritas.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            disabled={!shareUrl}
            className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            WhatsApp
          </button>
          <button
            type="button"
            onClick={handleShareInstagram}
            disabled={!shareUrl}
            className="inline-flex items-center rounded-full bg-pink-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:bg-pink-300"
          >
            Instagram
          </button>
          <button
            type="button"
            onClick={handleShareTelegram}
            disabled={!shareUrl}
            className="inline-flex items-center rounded-full bg-sky-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-300"
          >
            Telegram
          </button>
          <button
            type="button"
            onClick={handleShareFacebook}
            disabled={!shareUrl}
            className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            Facebook
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Enlace que se comparte: {shareUrl || 'Define un slug para generar el enlace.'}
        </p>
      </div>

      {!isNative && (
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">QR Code</h2>
          <p className="mt-1 text-xs text-slate-500">
            Descarga un QR para imprimir o compartir.
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

      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Pricing</h2>
          <p className="mt-1 text-xs text-slate-500">
            Define tus tarifas de envío y comisión.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Tarifa de envío
              </label>
              <input
                name="delivery_fee"
                type="number"
                min="0"
                step="0.01"
                value={form.delivery_fee}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Comisión (%)
              </label>
              <input
                name="commission_percentage"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.commission_percentage}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-2 text-sm">
            <div className="space-y-1">
              {message && <p className="text-emerald-600">{message}</p>}
              {error && <p className="text-red-600">{error}</p>}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
    </form>
  )
}

export default AdminSettings
