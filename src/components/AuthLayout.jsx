function AuthLayout({ title, subtitle, children, footer, logoSrc }) {
  return (
    <div className="text-slate-50">
      <main className="mx-auto flex max-w-6xl items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
        <div className="w-full max-w-md rounded-2xl bg-[#1e293b] px-6 py-8 shadow-xl shadow-slate-900/40 ring-1 ring-slate-800 sm:px-8">
          <div className="space-y-2 text-center">
            {logoSrc && (
              <img src={logoSrc} alt="Pidoo Logo" className="login-logo" />
            )}
            <h1 className="text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-slate-300 sm:text-base">{subtitle}</p>
            )}
          </div>

          <div className="mt-6">{children}</div>

          {footer && <div className="mt-6 text-center text-sm text-slate-300">{footer}</div>}
        </div>
      </main>
    </div>
  )
}

export default AuthLayout
