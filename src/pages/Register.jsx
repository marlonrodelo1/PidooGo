import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'
import AuthLayout from '../components/AuthLayout.jsx'

function Register() {
  const [nombre, setNombre] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
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

    if (!acceptedTerms) {
      setLoading(false)
      const message =
        'Debes aceptar los términos y la política de privacidad para registrarte.'
      setError(message)
      // Simple blocking alert for all platforms (web, Android, iOS WebView)
      // eslint-disable-next-line no-alert
      alert(message)
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          apellidos,
          telefono,
        },
      },
    })

    if (signUpError) {
      setLoading(false)
      setError(signUpError.message)
      return
    }
    setLoading(false)
    navigate('/admin/panel', { replace: true })
  }

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Regístrate para empezar tu negocio como socio repartidor."
      footer={
        <span>
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#f97316] hover:text-[#ea580c]"
          >
            Inicia sesión
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="register-card space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-200">Nombre</label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/40"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">Apellidos</label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/40"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-200">Teléfono</label>
          <input
            type="tel"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/40"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
          />
        </div>
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

        <div className="terms-checkbox">
          <label>
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
            He leído y acepto los <strong>Términos y Condiciones</strong> y la{' '}
            <a
              href="https://pidoo.es/privacidad-pidoogo"
              target="_blank"
              rel="noopener noreferrer"
            >
              Política de Privacidad
            </a>
            .
          </label>
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
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Register
