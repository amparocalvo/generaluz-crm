function Login({
  authMode,
  errorMessage,
  isSubmitting,
  onAuthModeChange,
  onSubmit,
}) {
  const isRegisterMode = authMode === "register";

  return (
    <main className="login-page">
      <section className="login-panel">
        <div>
          <span className="eyebrow">Acceso privado</span>
          <h1>{isRegisterMode ? "Crear cuenta" : "Generaluz CRM"}</h1>
          <p>
            {isRegisterMode
              ? "Registra tu usuario para empezar a trabajar con el CRM."
              : "Inicia sesión para gestionar clientes, instalaciones y presupuestos."}
          </p>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          {isRegisterMode ? (
            <label>
              Nombre
              <input
                autoComplete="name"
                name="name"
                placeholder="Tu nombre"
                required
                type="text"
              />
            </label>
          ) : null}

          <label>
            Email
            <input
              autoComplete="email"
              name="email"
              placeholder="admin@generaluz.es"
              required
              type="email"
            />
          </label>

          <label>
            Contraseña
            <input
              autoComplete="current-password"
              name="password"
              placeholder="Introduce tu contraseña"
              required
              type="password"
            />
          </label>

          {errorMessage ? <p className="error-message">{errorMessage}</p> : null}

          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting
              ? "Procesando..."
              : isRegisterMode
                ? "Crear cuenta"
                : "Entrar"}
          </button>

          <button
            className="secondary-button login-mode-button"
            onClick={() => onAuthModeChange(isRegisterMode ? "login" : "register")}
            type="button"
          >
            {isRegisterMode
              ? "Ya tengo cuenta"
              : "No tengo cuenta, ¡registrate!"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;
