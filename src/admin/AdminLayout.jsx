import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { supabase } from '../lib/supabaseClient'

const navLinkClasses = ({ isActive }) =>
  [
    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-[#0f172a] text-slate-50 shadow-sm'
      : 'text-slate-200 hover:bg-slate-700/60 hover:text-slate-50',
  ].join(' ')

function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const isNativeApp = Capacitor?.isNativePlatform?.() ?? false

  const closeMobile = () => setMobileOpen(false)

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      // ignore silent error; we'll still navigate away
      console.error('Error during logout', e)
    } finally {
      setMobileOpen(false)
      navigate('/login')
    }
  }

  return (
	<div className="admin-container relative mt-4 text-slate-50 lg:mt-6">
      {/* Mobile menu trigger */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <h1 className="text-base font-semibold tracking-tight">Panel de administración</h1>
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex items-center rounded-full bg-[#1e293b] px-3 py-1.5 text-xs font-medium text-slate-100 shadow-sm ring-1 ring-slate-700/80"
        >
          {mobileOpen ? 'Cerrar menú' : 'Menú'}
        </button>
      </div>

      {/* Desktop sidebar */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="hidden w-64 shrink-0 rounded-2xl bg-[#1e293b] p-4 shadow-xl shadow-slate-900/40 ring-1 ring-slate-800 lg:block">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Administración
          </h2>
          <nav className="mt-3 space-y-1">
            <NavLink to="/admin/panel" className={navLinkClasses} end>
              <span>Panel</span>
            </NavLink>
            <NavLink to="/admin/restaurants" className={navLinkClasses}>
              <span>Restaurantes</span>
            </NavLink>
            <NavLink to="/admin/settings" className={navLinkClasses}>
              <span>Configuración</span>
            </NavLink>
          </nav>
        </aside>

        {/* Content */}
        <section className="flex-1">
          <Outlet />
        </section>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 flex lg:hidden"
          style={isNativeApp ? { top: 'env(safe-area-inset-top)' } : undefined}
        >
          <button
            type="button"
            className="h-full flex-1 bg-black/50"
            onClick={closeMobile}
            aria-label="Cerrar menú de administración"
          />
          <aside className="h-full w-64 shrink-0 bg-[#020817] px-4 py-5 shadow-xl ring-1 ring-slate-800">
            <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Administración
            </h2>
            <nav className="mt-3 space-y-1">
              <NavLink to="/admin/panel" className={navLinkClasses} end onClick={closeMobile}>
                <span>Panel</span>
              </NavLink>
              <NavLink
                to="/admin/restaurants"
                className={navLinkClasses}
                onClick={closeMobile}
              >
                <span>Restaurantes</span>
              </NavLink>
              <NavLink
                to="/admin/settings"
                className={navLinkClasses}
                onClick={closeMobile}
              >
                <span>Configuración</span>
              </NavLink>
            </nav>
            {isNativeApp && (
              <div className="mt-6 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center rounded-xl bg-[#ef4444] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#dc2626]"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}

export default AdminLayout
