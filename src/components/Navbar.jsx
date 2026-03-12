import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'

function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const pathname = location.pathname
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isAdminRoute = pathname.startsWith('/admin')
  const isLanding = pathname === '/'
  const isStorePage = !isAdminRoute && !isAuthPage && !isLanding

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
    setMobileOpen(false)
  }

  const closeMobile = () => setMobileOpen(false)

  const guestLinks = (
    <>
      <NavLink
        to="/login"
        onClick={closeMobile}
        className={({ isActive }) =>
          [
            'rounded-full px-3 py-1.5 text-sm font-medium transition',
            isActive
              ? 'bg-[#f97316] text-slate-900'
              : 'text-slate-200 hover:bg-slate-800/70',
          ].join(' ')
        }
      >
        Login
      </NavLink>
      <NavLink
        to="/register"
        onClick={closeMobile}
        className={({ isActive }) =>
          [
            'rounded-full px-3 py-1.5 text-sm font-semibold transition',
            isActive
              ? 'bg-[#f97316] text-slate-900'
              : 'bg-[#f97316] text-slate-900 hover:bg-[#ea580c]',
          ].join(' ')
        }
      >
        Crear cuenta
      </NavLink>
    </>
  )

  const authLinks = (
    <>
      <NavLink
        to="/admin/panel"
        onClick={closeMobile}
        className={({ isActive }) =>
          [
            'rounded-full px-3 py-1.5 text-sm font-medium transition',
            isActive
              ? 'bg-slate-800 text-slate-50'
              : 'text-slate-200 hover:bg-slate-800/70',
          ].join(' ')
        }
      >
        Admin
      </NavLink>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-full border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-800/80"
      >
        Cerrar sesión
      </button>
    </>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0b1220]/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#f97316] text-sm font-bold text-slate-900">
              P
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-50 sm:text-base">
              Pidoo Socio
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-3 md:flex">
            {isStorePage
              ? null
              : isAdminRoute
                ? user && authLinks
                : guestLinks}
          </nav>

          {/* Mobile menu button */}
          {!isStorePage && (
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-full p-2 text-slate-200 hover:bg-slate-800/80 md:hidden"
              aria-label="Toggle navigation menu"
            >
              <span className="h-4 w-4">
                {mobileOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-4 w-4"
                  >
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-4 w-4"
                  >
                    <path
                      d="M4 7h16M4 12h16M4 17h16"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
            </button>
          )}
        </div>

        {/* Mobile menu */}
        {mobileOpen && !isStorePage && (
          <div className="pb-3 md:hidden">
            <div className="space-y-2 rounded-2xl border border-slate-800 bg-[#020617] p-4 text-sm shadow-lg">
              <div className="flex flex-col gap-2">
                {isAdminRoute ? (user && authLinks) : guestLinks}
              </div>
              {isAdminRoute && user && (
                <NavLink
                  to="/"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    [
                      'mt-2 rounded-full px-3 py-1.5 text-xs font-medium transition',
                      isActive
                        ? 'bg-slate-800 text-slate-50'
                        : 'text-slate-300 hover:bg-slate-800/70',
                    ].join(' ')
                  }
                >
                  Ir a inicio
                </NavLink>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
