import { useMemo, useState } from "react";

const installationStatuses = [
  "Pendiente",
  "Material pedido",
  "En instalación",
  "Finalizada",
  "Incidencia",
];

function getClientName(clients, clientId) {
  const client = clients.find((item) => item.id === String(clientId));
  return client ? client.name : "Cliente no encontrado";
}

function getQuoteLabel(clients, quote) {
  return `${getClientName(clients, quote.clientId)} · ${quote.panelCount} paneles · ${quote.installPower} kW`;
}

function Installations({
  acceptedQuotes,
  clients,
  editingInstallationId,
  errorMessage,
  installations,
  isInstallationFormOpen,
  isLoading,
  newInstallation,
  onCancel,
  onDeleteInstallation,
  onEditInstallation,
  onInstallationInputChange,
  onNewInstallation,
  onSubmit,
}) {
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selectedMapId, setSelectedMapId] = useState(null);

  const filteredInstallations = useMemo(() => {
    if (statusFilter === "Todos") {
      return installations;
    }

    return installations.filter((installation) => installation.status === statusFilter);
  }, [installations, statusFilter]);

  const availableQuotes = acceptedQuotes.filter((quote) => {
    return !installations.some((installation) => String(installation.quoteId) === String(quote.id));
  });

  function getMapQuery(address) {
    const cleanAddress = String(address || "").trim();

    if (!cleanAddress) {
      return "";
    }

    return cleanAddress.toLowerCase().includes("españa")
      ? cleanAddress
      : `${cleanAddress}, España`;
  }

  function getGoogleMapsUrl(address) {
    return `https://www.google.com/maps?q=${encodeURIComponent(getMapQuery(address))}`;
  }

  function getGoogleMapsEmbedUrl(address) {
    return `https://www.google.com/maps?q=${encodeURIComponent(getMapQuery(address))}&output=embed`;
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Ejecución técnica</span>
          <h1>Instalaciones</h1>
          <p>Planifica y controla proyectos aceptados por el cliente.</p>
        </div>

        <button className="primary-button" onClick={onNewInstallation} type="button">
          Nueva instalación
        </button>
      </header>

      {isInstallationFormOpen ? (
        <section className="panel">
          <div className="panel-header">
            <h2>{editingInstallationId ? "Editar instalación" : "Nueva instalación"}</h2>
            <p>
              {editingInstallationId
                ? "Actualiza el seguimiento de la instalación."
                : "Crea una instalación desde un presupuesto aceptado."}
            </p>
          </div>

          <form className="client-form" onSubmit={onSubmit}>
            {!editingInstallationId ? (
              <label className="form-field-wide">
                Presupuesto aceptado
                <select
                  name="quoteId"
                  value={newInstallation.quoteId}
                  onChange={onInstallationInputChange}
                  required
                >
                  <option value="">Selecciona presupuesto</option>
                  {availableQuotes.map((quote) => (
                    <option key={quote.id} value={quote.id}>
                      {getQuoteLabel(clients, quote)}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label>
              Fecha prevista
              <input
                name="scheduledDate"
                type="date"
                value={newInstallation.scheduledDate}
                onChange={onInstallationInputChange}
              />
            </label>

            <label>
              Estado
              <select
                name="status"
                value={newInstallation.status}
                onChange={onInstallationInputChange}
              >
                {installationStatuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>

            <label className="form-field-wide">
              Dirección
              <input
                name="address"
                type="text"
                value={newInstallation.address}
                onChange={onInstallationInputChange}
                placeholder="Dirección de la instalación"
              />
            </label>

            <label className="form-field-wide">
              Observaciones
              <input
                name="notes"
                type="text"
                value={newInstallation.notes}
                onChange={onInstallationInputChange}
                placeholder="Material pendiente, acceso, cubierta, incidencia..."
              />
            </label>

            <div className="form-actions">
              <button className="secondary-button" type="button" onClick={onCancel}>
                Cancelar
              </button>
              <button className="primary-button" type="submit">
                {editingInstallationId ? "Guardar cambios" : "Guardar instalación"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="panel">
        <div className="panel-header panel-header-actions">
          <div>
            <h2>Listado de instalaciones</h2>
            <p>{filteredInstallations.length} proyectos visibles.</p>
          </div>

          <label className="compact-filter">
            Estado
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>Todos</option>
              {installationStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>

        {errorMessage ? <p className="error-message">{errorMessage}</p> : null}

        <div className="table">
          {isLoading ? <p className="empty-message">Cargando instalaciones...</p> : null}

          {!isLoading && installations.length === 0 ? (
            <p className="empty-message">
              Todavía no hay instalaciones. Acepta un presupuesto y créala desde aquí.
            </p>
          ) : null}

          {!isLoading && installations.length > 0 && filteredInstallations.length === 0 ? (
            <p className="empty-message">No hay instalaciones con ese estado.</p>
          ) : null}

          {filteredInstallations.map((installation) => (
            <div className="table-row" key={installation.id}>
              <div>
                <strong>{getClientName(clients, installation.clientId)}</strong>
                <span>
                  {installation.panelCount} paneles · {installation.installPower} kW ·{" "}
                  {installation.inverterModel}
                </span>
                <span>{installation.address || "Sin dirección"}</span>
                {installation.scheduledDate ? (
                  <span>Fecha prevista: {installation.scheduledDate}</span>
                ) : null}
                {installation.notes ? <span>{installation.notes}</span> : null}
              </div>

              <div className="row-actions">
                <span className="status">{installation.status}</span>
                {installation.address ? (
                  <>
                    <button
                      className="text-button"
                      type="button"
                      onClick={() =>
                        setSelectedMapId(
                          selectedMapId === installation.id ? null : installation.id,
                        )
                      }
                    >
                      {selectedMapId === installation.id ? "Ocultar mapa" : "Ver mapa"}
                    </button>
                    <a
                      className="text-link"
                      href={getGoogleMapsUrl(installation.address)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir Google Maps
                    </a>
                  </>
                ) : null}
                <button
                  className="text-button"
                  type="button"
                  onClick={() => onEditInstallation(installation)}
                >
                  Editar
                </button>
                <button
                  className="danger-button"
                  type="button"
                  onClick={() => onDeleteInstallation(installation.id)}
                >
                  Eliminar
                </button>
              </div>

              {selectedMapId === installation.id && installation.address ? (
                <div className="installation-map">
                  <div className="installation-map-header">
                    <div>
                      <strong>Ubicación de la instalación</strong>
                      <span>{installation.address}</span>
                    </div>
                    <a
                      className="secondary-button"
                      href={getGoogleMapsUrl(installation.address)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir mapa
                    </a>
                  </div>
                  <iframe
                    title={`Mapa de ${getClientName(clients, installation.clientId)}`}
                    src={getGoogleMapsEmbedUrl(installation.address)}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Installations;
