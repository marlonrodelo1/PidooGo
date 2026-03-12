import { Link } from 'react-router-dom'

function Landing() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-50">
      {/* Main content */}
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:pb-24">
        {/* HERO */}
        <section className="flex flex-col items-center text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <p className="inline-flex items-center rounded-full bg-slate-800/80 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-slate-700/80">
              Plataforma para riders • Lanza tu propia tienda
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
              Empieza tu negocio como Rider con tu propia tienda
            </h1>
            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
              Pidoo Socio te permite crear tu propia tienda online, vender productos de
              restaurantes asociados y ganar dinero con cada pedido.
            </p>
            <div className="mt-4 flex flex-col items-center gap-3 sm:mt-6 sm:flex-row sm:justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full bg-[#f97316] px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-orange-500/30 transition hover:bg-[#ea580c]"
              >
                Crear cuenta
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/40 px-6 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800/80"
              >
                Ser socio
              </Link>
            </div>

            <div className="mt-6 grid w-full gap-3 text-left text-xs text-slate-200 sm:grid-cols-3 sm:text-sm">
              <div className="rounded-2xl bg-slate-900/40 px-4 py-3 ring-1 ring-slate-800">
                <p className="font-semibold">Gana 10% de cada pedido</p>
                <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
                  Comisión automática por cada venta generada desde tu tienda.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-900/40 px-4 py-3 ring-1 ring-slate-800">
                <p className="font-semibold">Gana 100% del envío</p>
                <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
                  Todo el coste del envío es para ti, en cada pedido.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-900/40 px-4 py-3 ring-1 ring-slate-800">
                <p className="font-semibold">Recibe propinas directamente</p>
                <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
                  Los clientes pueden dejarte propinas desde la app.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mt-16 space-y-8 sm:mt-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-50 sm:text-3xl">Cómo funciona</h2>
            <p className="mt-2 text-sm text-slate-300 sm:text-base">
              Lanza tu tienda en minutos y empieza a recibir pedidos.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#1e293b] p-5 shadow-sm ring-1 ring-slate-800/80">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Paso 1
              </p>
              <h3 className="mt-2 text-base font-semibold text-slate-50">Regístrate</h3>
              <p className="mt-2 text-sm text-slate-300">
                Crea tu cuenta y activa tu tienda en minutos.
              </p>
            </div>
            <div className="rounded-2xl bg-[#1e293b] p-5 shadow-sm ring-1 ring-slate-800/80">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Paso 2
              </p>
              <h3 className="mt-2 text-base font-semibold text-slate-50">Activa restaurantes</h3>
              <p className="mt-2 text-sm text-slate-300">
                Selecciona los restaurantes disponibles que quieres mostrar en tu tienda.
              </p>
            </div>
            <div className="rounded-2xl bg-[#1e293b] p-5 shadow-sm ring-1 ring-slate-800/80">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Paso 3
              </p>
              <h3 className="mt-2 text-base font-semibold text-slate-50">Comparte tu tienda</h3>
              <p className="mt-2 text-sm text-slate-300">
                Envía tu enlace a clientes y empieza a recibir pedidos.
              </p>
            </div>
          </div>
        </section>

        {/* YOUR OWN STORE */}
        <section className="mt-16 grid gap-8 sm:mt-20 sm:grid-cols-[1.3fr,1fr] sm:items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-50 sm:text-3xl">
              Tu propia tienda online
            </h2>
            <p className="text-sm text-slate-300 sm:text-base">
              Cada socio tiene su propia tienda pública personalizada donde puede mostrar
              restaurantes disponibles y compartir su enlace con clientes.
            </p>
            <div className="rounded-2xl bg-slate-900/60 px-4 py-3 text-left text-sm text-slate-200 ring-1 ring-slate-800">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Ejemplo de tienda
              </span>
              <div className="mt-1 font-mono text-sm text-[#f97316]">pidoo.es/juanfood</div>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              <li>• Logo personalizado</li>
              <li>• Banner de tu tienda</li>
              <li>• Restaurantes asociados</li>
              <li>• Mapa con ubicaciones</li>
              <li>• Enlace para compartir</li>
            </ul>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800/80 p-5 ring-1 ring-slate-700/80">
            <div className="rounded-2xl bg-slate-900/80 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-2xl bg-slate-700" />
                  <div>
                    <p className="text-sm font-semibold text-slate-50">Juan Food</p>
                    <p className="text-xs text-slate-400">Tienda de rider</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#f97316]/10 px-3 py-1 text-[11px] font-medium text-[#f97316]">
                  En línea
                </span>
              </div>
              <div className="mt-4 h-32 rounded-xl bg-slate-800" />
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-200">
                <div className="rounded-xl bg-slate-800/80 p-3">
                  <p className="font-semibold">Restaurantes</p>
                  <p className="mt-1 text-[11px] text-slate-400">Conectados a tu tienda.</p>
                </div>
                <div className="rounded-xl bg-slate-800/80 p-3">
                  <p className="font-semibold">Mapa</p>
                  <p className="mt-1 text-[11px] text-slate-400">Ubicaciones visibles para clientes.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW YOU EARN */}
        <section className="mt-16 space-y-8 sm:mt-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-50 sm:text-3xl">
              Cómo ganas dinero
            </h2>
            <p className="mt-2 text-sm text-slate-300 sm:text-base">
              Monetiza cada parte del pedido que pasa por tu tienda.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#1e293b] p-5 ring-1 ring-slate-800/80">
              <h3 className="text-base font-semibold text-slate-50">10% de cada pedido</h3>
              <p className="mt-2 text-sm text-slate-300">
                Recibes una comisión por cada venta realizada.
              </p>
            </div>
            <div className="rounded-2xl bg-[#1e293b] p-5 ring-1 ring-slate-800/80">
              <h3 className="text-base font-semibold text-slate-50">100% del envío</h3>
              <p className="mt-2 text-sm text-slate-300">
                Todo el coste del envío es para ti.
              </p>
            </div>
            <div className="rounded-2xl bg-[#1e293b] p-5 ring-1 ring-slate-800/80">
              <h3 className="text-base font-semibold text-slate-50">Propinas</h3>
              <p className="mt-2 text-sm text-slate-300">
                Los clientes pueden darte propinas directamente.
              </p>
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="mt-16 space-y-6 sm:mt-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-50 sm:text-3xl">
              Por qué unirte a Pidoo
            </h2>
          </div>
          <div className="mx-auto max-w-2xl rounded-2xl bg-slate-900/60 p-6 text-sm text-slate-200 ring-1 ring-slate-800">
            <ul className="space-y-2">
              <li>• No necesitas restaurante propio</li>
              <li>• Empiezas en minutos</li>
              <li>• Tu propia tienda online</li>
              <li>• Restaurantes ya integrados</li>
              <li>• Gestión desde la app</li>
              <li>• Comparte tu tienda en redes sociales</li>
            </ul>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mt-16 sm:mt-20">
          <div className="rounded-3xl bg-[#f97316] px-6 py-8 text-center text-slate-900 shadow-lg shadow-orange-500/30 sm:px-10 sm:py-10">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Empieza hoy tu negocio como socio
            </h2>
            <p className="mt-3 text-sm sm:text-base">
              Crea tu cuenta y empieza a generar ingresos con tu propia tienda.
            </p>
            <div className="mt-6">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-slate-50 shadow-sm transition hover:bg-slate-950"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#020617] py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-xs text-slate-500 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs">
            <span className="font-semibold text-slate-300">Pidoo Socio</span>
            <span>© 2026</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px] sm:text-xs">
            <button type="button" className="text-slate-400 hover:text-slate-200">
              Privacidad
            </button>
            <button type="button" className="text-slate-400 hover:text-slate-200">
              Términos
            </button>
            <button type="button" className="text-slate-400 hover:text-slate-200">
              Contacto
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
