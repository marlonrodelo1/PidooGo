import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
const Landing = lazy(() => import('./pages/Landing.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const StorePage = lazy(() => import('./pages/StorePage.jsx'))
const AdminLayout = lazy(() => import('./admin/AdminLayout.jsx'))
const Panel = lazy(() => import('./admin/Panel.jsx'))
const Restaurants = lazy(() => import('./admin/Restaurants.jsx'))
const AdminSettings = lazy(() => import('./admin/AdminSettings.jsx'))
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname
  const isStorePage =
    !pathname.startsWith('/admin') &&
    pathname !== '/' &&
    pathname !== '/login' &&
    pathname !== '/register'

  // Detect if running inside a Capacitor native app
  const isNativeApp = Capacitor?.isNativePlatform?.() ?? false

  // In the native app, start on /login instead of landing when at root
  useEffect(() => {
    if (isNativeApp && pathname === '/') {
      navigate('/login', { replace: true })
    }
  }, [isNativeApp, pathname, navigate])

  // Help iOS correctly calculate viewport on first load
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  return (
	<div className="app-container min-h-screen bg-[#0f172a] text-slate-50">
      {!isStorePage && !isNativeApp && <Navbar />}
      <main
        className={
          isStorePage
            ? 'flex-1'
            : 'mx-auto flex max-w-6xl flex-1 flex-col px-4 pb-10 pt-4 sm:px-6 sm:pt-6'
        }
      >
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Panel />} />
                <Route path="panel" element={<Panel />} />
                <Route path="restaurants" element={<Restaurants />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>

            <Route path="/:slug" element={<StorePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}

export default App
