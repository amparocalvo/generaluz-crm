import { useMemo, useState } from "react";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("es-ES") + " EUR";
}

function Clients({
  quotes = [],
  clients,
  errorMessage,
  editingClientId,
  isFormOpen,
  isLoading,
  newClient,
  onCancel,
  onDeleteClient,
  onEditClient,
  onInputChange,
  onNewQuote,
  onNewClient,
  onSubmit,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Todos");

  const selectedClient = clients.find((client) => client.id === selectedClientId);
  const selectedClientQuotes = quotes.filter((quote) => {
    return String(quote.clientId) === String(selectedClientId);
  });
  const selectedClientTotal = selectedClientQuotes.reduce((total, quote) => {
    return total + Number(quote.total || 0);
  }, 0);
  const selectedAcceptedQuote = selectedClientQuotes.find((quote) => {
    return quote.status === "Aceptado";
  });

  const filteredClients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesStatus =
        statusFilter === "Todos" || client.status === statusFilter;
      const searchableText = [
        client.name,
        client.phone,
        client.email,
        client.address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && searchableText.includes(normalizedSearch);
    });
  }, [clients, searchTerm, statusFilter]);

  return (
    <>
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Gestión de clientes</span>
          <h1>Clientes</h1>
          <p>Consulta, crea y actualiza los contactos comerciales.</p>
        </div>

        <button className="primary-button" onClick={onNewClient}>
          Nuevo cliente
        </button>
      </header>

      {isFormOpen && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>{editingClientId ? "Editar cliente" : "Nuevo cliente"}</h2>
              <p>
                {editingClientId
                  ? "Actualiza los datos del contacto."
                  : "Añade un contacto al CRM."}
              </p>
            </div>
          </div>

          <form className="client-form" onSubmit={onSubmit}>
            <label>
              Nombre
              <input
                name="name"
                type="text"
                value={newClient.name}
                onChange={onInputChange}
                placeholder="Nombre del cliente"
                required
              />
            </label>

            <label>
              Teléfono
              <input
                name="phone"
                type="tel"
                value={newClient.phone}
                onChange={onInputChange}
                placeholder="600 123 456"
                required
              />
            </label>

            <label>
              Email
              <input
                name="email"
                type="email"
                value={newClient.email}
                onChange={onInputChange}
                placeholder="cliente@email.com"
              />
            </label>

            <label className="form-field-wide">
              Dirección
              <input
                name="address"
                type="text"
                value={newClient.address}
                onChange={onInputChange}
                placeholder="Dirección de la instalación"
              />
            </label>

            <label>
              Estado
              <select
                name="status"
                value={newClient.status}
                onChange={onInputChange}
              >
                <option>Nuevo</option>
                <option>Contactado</option>
                <option>Presupuesto</option>
                <option>Instalación</option>
              </select>
            </label>

            <div className="form-actions">
              <button className="secondary-button" type="button" onClick={onCancel}>
                Cancelar
              </button>
              <button className="primary-button" type="submit">
                {editingClientId ? "Guardar cambios" : "Guardar cliente"}
              </button>
            </div>
          </form>
        </section>
      )}

      {selectedClient ? (
        <section className="panel detail-panel">
          <div className="panel-header panel-header-actions">
            <div>
              <span className="eyebrow">Ficha de cliente</span>
              <h2>{selectedClient.name}</h2>
              <p>
                {selectedClient.phone}
                {selectedClient.email ? " · " + selectedClient.email : ""}
              </p>
            </div>

            <div className="detail-actions">
              <button
                className="secondary-button"
                onClick={() => onNewQuote(selectedClient.id)}
                type="button"
              >
                Crear presupuesto
              </button>
              <button
                className="secondary-button"
                onClick={() => setSelectedClientId(null)}
                type="button"
              >
                Cerrar
              </button>
            </div>
          </div>

          <div className="detail-grid">
            <div>
              <span>Estado comercial</span>
              <strong>{selectedClient.status}</strong>
            </div>
            <div>
              <span>Presupuestos asociados</span>
              <strong>{selectedClientQuotes.length}</strong>
            </div>
            <div>
              <span>Total presupuestado</span>
              <strong>{formatMoney(selectedClientTotal)}</strong>
            </div>
          </div>

          <div className="client-detail-address">
            <span>Dirección</span>
            <strong>{selectedClient.address || "Sin dirección registrada"}</strong>
          </div>

          <div className="panel-header client-detail-section">
            <h2>Presupuestos del cliente</h2>
            <p>
              {selectedAcceptedQuote
                ? "Este cliente tiene un presupuesto aceptado."
                : "Propuestas comerciales asociadas al contacto."}
            </p>
          </div>

          <div className="table">
            {selectedClientQuotes.length === 0 ? (
              <p className="empty-message">
                Este cliente todavía no tiene presupuestos.
              </p>
            ) : null}

            {selectedClientQuotes.map((quote) => (
              <div className="table-row" key={quote.id}>
                <div>
                  <strong>{quote.concept}</strong>
                  <span>
                    {quote.panelCount} paneles · {quote.installPower} kW ·{" "}
                    {formatMoney(quote.total)}
                  </span>
                </div>

                <span className="status">{quote.status}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="panel">
        <div className="panel-header panel-header-actions">
          <div>
            <h2>Listado de clientes</h2>
            <p>
              Mostrando {filteredClients.length} de {clients.length} clientes.
            </p>
          </div>
        </div>

        <div className="client-toolbar">
          <label>
            Buscar
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Nombre, teléfono, email o dirección"
            />
          </label>

          <label>
            Estado
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>Todos</option>
              <option>Nuevo</option>
              <option>Contactado</option>
              <option>Presupuesto</option>
              <option>Instalación</option>
            </select>
          </label>
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="table">
          {isLoading && <p className="empty-message">Cargando clientes...</p>}

          {!isLoading && clients.length === 0 && (
            <p className="empty-message">Todavía no hay clientes.</p>
          )}

          {!isLoading && clients.length > 0 && filteredClients.length === 0 && (
            <p className="empty-message">No hay clientes con esos filtros.</p>
          )}

          {filteredClients.map((client) => (
            <div className="table-row" key={client.id}>
              <div>
                <strong>{client.name}</strong>
                <span>{client.phone}</span>
                {(client.email || client.address) && (
                  <span>
                    {[client.email, client.address].filter(Boolean).join(" · ")}
                  </span>
                )}
              </div>

              <div className="row-actions">
                <span className="status">{client.status}</span>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => setSelectedClientId(client.id)}
                >
                  Ver detalle
                </button>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => onEditClient(client)}
                >
                  Editar
                </button>
                <button
                  className="danger-button"
                  type="button"
                  onClick={() => onDeleteClient(client.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Clients;
