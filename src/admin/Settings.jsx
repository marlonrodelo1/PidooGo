import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'

function Settings() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    slug: '',
    custom_name: '',
    logo_url: '',
    banner_url: '',
    primary_color: '',
    delivery_fee: '',
  })
  const [storeId, setStoreId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadStore = async () => {
      if (!user) return
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('driver_stores')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        console.error(fetchError)
        setError('No se pudo cargar la configuración de la tienda.')
      } else if (data) {
        setStoreId(data.id)
        setForm({
          slug: data.slug ?? '',
          custom_name: data.custom_name ?? '',
          logo_url: data.logo_url ?? '',
          banner_url: data.banner_url ?? '',
          primary_color: data.primary_color ?? '',
          delivery_fee: data.delivery_fee ?? '',
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
      ...form,
      delivery_fee: form.delivery_fee === '' ? null : Number(form.delivery_fee),
    }

    let response

    if (storeId) {
      response = await supabase
        .from('driver_stores')
        .update(payload)
        .eq('user_id', user.id)
        .select()
        .maybeSingle()
    } else {
      response = await supabase
        .from('driver_stores')
        .insert({ ...payload, user_id: user.id })
        .select()
        .maybeSingle()
    }

    const { data, error: saveError } = response

    if (saveError) {
      console.error(saveError)
      setError('No se pudo guardar la configuración.')
    } else if (data) {
      setStoreId(data.id)
      setMessage('Configuración guardada correctamente.')
    }

    setSaving(false)
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Cargando configuración...</p>
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Configuración de la tienda
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Define cómo se ve tu tienda pública y parámetros clave.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-2 grid gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Slug</label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
            <p className="mt-1 text-xs text-slate-400">
              URL pública, por ejemplo: /mi-tienda.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Nombre personalizado
            </label>
            <input
              name="custom_name"
              value={form.custom_name}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Color primario
            </label>
            <input
              name="primary_color"
              value={form.primary_color}
              onChange={handleChange}
              placeholder="#3b82f6"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Logo URL
            </label>
            <input
              name="logo_url"
              value={form.logo_url}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Banner URL
            </label>
            <input
              name="banner_url"
              value={form.banner_url}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
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
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
        </div>

        <div className="md:col-span-2 flex items-center justify-between pt-2">
          <div className="space-y-1 text-sm">
            {message && <p className="text-green-600">{message}</p>}
            {error && <p className="text-red-600">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Settings
