import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'
import AuthLayout from '../components/AuthLayout.jsx'
import logo from '../../assets/splash.png'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      navigate('/admin/panel', { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    navigate('/admin/panel', { replace: true })
  }

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Accede a tu panel para gestionar tu tienda."
      logoSrc={logo}
      footer={
        <span>
          ¿No tienes cuenta?{' '}
          <Link
            to="/register"
            className="font-semibold text-[#f97316] hover:text-[#ea580c]"
          >
            Regístrate
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="login-card space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-200">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/40"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-200">Contraseña</label>
          <input
            type="password"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/40"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center rounded-full bg-[#f97316] px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-orange-500/30 transition hover:bg-[#ea580c] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Entrando...' : 'Iniciar sesión'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Login
