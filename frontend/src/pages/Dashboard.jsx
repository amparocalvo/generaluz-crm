function formatMoney(value) {
  const amount = Number(value || 0).toLocaleString("es-ES");
  return amount + " EUR";
}

function Dashboard({
  quotes = [],
  clients = [],
  errorMessage,
  isLoading,
  onNewQuote,
  onNewClient,
  onShowClients,
}) {
  const recentClients = clients.slice(0, 3);
  const recentQuotes = quotes.slice(0, 3);

  const activeInstallations = clients.filter((client) => {
    return client.status === "Instalacion" || client.status === "Instalación";
  }).length;

  const pendingQuotes = quotes.filter((quote) => {
    return quote.status === "Borrador" || quote.status === "Enviado";
  }).length;

  const acceptedQuotes = quotes.filter((quote) => {
    return quote.status === "Aceptado";
  });

  const estimatedRevenue = acceptedQuotes.reduce((total, quote) => {
    return total + Number(quote.total || 0);
  }, 0);

  const stats = [
    {
      title: "Clientes",
      value: clients.length,
      detail: "Contactos registrados",
    },
    {
      title: "Instalaciones",
      value: activeInstallations,
      detail: "Proyectos activos",
    },
    {
      title: "Presupuestos",
      value: pendingQuotes,
      detail: "Pendientes de seguimiento",
    },
  ];

  return (
    <>
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">CRM Comercial</span>
          <h1>Generaluz</h1>
          <p>Panel de control para clientes, instalaciones y presupuestos.</p>
        </div>

        <div className="detail-actions">
          <button className="secondary-button" onClick={onNewQuote} type="button">
            Nuevo presupuesto
          </button>
          <button className="primary-button" onClick={onNewClient} type="button">
            Nuevo cliente
          </button>
        </div>
      </header>

      {errorMessage ? <p className="error-message">{errorMessage}</p> : null}

      <section className="stats-grid">
        {stats.map((item) => (
          <article className="stat-card" key={item.title}>
            <div>
              <h2>{item.title}</h2>
              <p>{item.detail}</p>
            </div>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Resumen comercial</h2>
          <p>Estado general de la actividad del CRM.</p>
        </div>

        <div className="detail-grid">
          <div>
            <span>Presupuestos aceptados</span>
            <strong>{acceptedQuotes.length}</strong>
          </div>
          <div>
            <span>Facturacion estimada</span>
            <strong>{formatMoney(estimatedRevenue)}</strong>
          </div>
          <div>
            <span>Presupuestos pendientes</span>
            <strong>{pendingQuotes}</strong>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header panel-header-actions">
          <div>
            <h2>Clientes recientes</h2>
            <p>Ultimos contactos registrados en el sistema.</p>
          </div>

          <button className="secondary-button" onClick={onShowClients} type="button">
            Ver clientes
          </button>
        </div>

        <div className="table">
          {isLoading ? <p className="empty-message">Cargando clientes...</p> : null}

          {!isLoading && clients.length === 0 ? (
            <p className="empty-message">Todavia no hay clientes.</p>
          ) : null}

          {recentClients.map((client) => (
            <div className="table-row" key={client.id}>
              <div>
                <strong>{client.name}</strong>
                <span>{client.phone}</span>
                {client.email ? <span>{client.email}</span> : null}
              </div>
              <span className="status">{client.status}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header panel-header-actions">
          <div>
            <h2>Presupuestos recientes</h2>
            <p>Ultimas propuestas comerciales creadas.</p>
          </div>

          <button className="secondary-button" onClick={onNewQuote} type="button">
            Crear presupuesto
          </button>
        </div>

        <div className="table">
          {isLoading ? <p className="empty-message">Cargando presupuestos...</p> : null}

          {!isLoading && quotes.length === 0 ? (
            <p className="empty-message">Todavia no hay presupuestos.</p>
          ) : null}

          {recentQuotes.map((quote) => (
            <div className="table-row" key={quote.id}>
              <div>
                <strong>{quote.concept}</strong>
                <span>{formatMoney(quote.total)}</span>
              </div>
              <span className="status">{quote.status}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Dashboard;
