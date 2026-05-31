import { useState } from "react";
import EnergyChart from "../components/EnergyChart";

const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const batteryModels = {
  "Sin batería": [],
  Huawei: [
    "LUNA2000-5-S0",
    "LUNA2000-10-S0",
    "LUNA2000-15-S0",
    "LUNA2000-7-S1",
    "LUNA2000-14-S1",
    "LUNA2000-21-S1",
  ],
  Deye: ["SE-G PRO-B"],
  Pylontech: ["US5000"],
};

const inverterModels = {
  Huawei: [
    "SUN2000-3KTL-L1",
    "SUN2000-4KTL-L1",
    "SUN2000-5KTL-L1",
    "SUN2000-6KTL-L1",
    "SUN2000-8KTL-M1",
    "SUN2000-10KTL-M1",
  ],
  Deye: [
    "Deye 3.6 kW",
    "Deye 5 kW",
    "Deye 6 kW",
    "Deye 8 kW",
    "Deye 10 kW",
    "Deye 12 kW",
  ],
  Victron: [
    "MultiPlus 3 kW",
    "MultiPlus 5 kW",
    "MultiPlus 8 kW",
    "MultiPlus 12 kW",
    "MultiPlus 15 kW",
  ],
};

function Quotes({
  quotes,
  clients,
  editingQuoteId,
  errorMessage,
  isQuoteFormOpen,
  isLoading,
  newQuote,
  onQuoteInputChange,
  onCancel,
  onDeleteQuote,
  onEditQuote,
  onMonthlyConsumptionChange,
  onNewQuote,
  onSubmit,
}) {
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [quoteSearch, setQuoteSearch] = useState("");
  const [quoteStatusFilter, setQuoteStatusFilter] = useState("Todos");

  function getClientName(clientId) {
    const client = clients.find((item) => item.id === String(clientId));
    return client ? client.name : "Cliente no encontrado";
  }

  function handleExportPdf() {
    window.print();
  }

  const selectedBatteryModels = batteryModels[newQuote.batteryBrand] || [];
  const selectedInverterModels = inverterModels[newQuote.inverterBrand] || [];
  const selectedQuote = quotes.find((quote) => quote.id === selectedQuoteId);
  const hasBattery = newQuote.batteryBrand !== "Sin batería";
  const filteredQuotes = quotes.filter((quote) => {
    const clientName = getClientName(quote.clientId);
    const normalizedSearch = quoteSearch.trim().toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      [
        quote.concept,
        clientName,
        quote.panelModel,
        quote.inverterModel,
        quote.status,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch));
    const matchesStatus =
      quoteStatusFilter === "Todos" || quote.status === quoteStatusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Gestión comercial</span>
          <h1>Presupuestos</h1>
          <p>Crea y controla propuestas asociadas a tus clientes.</p>
        </div>

        <button className="primary-button" onClick={onNewQuote}>
          Nuevo presupuesto
        </button>
      </header>

      {isQuoteFormOpen && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>{editingQuoteId ? "Editar presupuesto" : "Nuevo presupuesto"}</h2>
              <p>
                {editingQuoteId
                  ? "Actualiza los datos de la propuesta."
                  : "Asocia una propuesta a un cliente."}
              </p>
            </div>
          </div>

          <form className="quote-form" onSubmit={onSubmit}>
            <section className="quote-section">
              <div className="quote-section-header">
                <span>1</span>
                <div>
                  <h3>Cliente y consumo</h3>
                  <p>Datos de partida para dimensionar la instalación.</p>
                </div>
              </div>

              <div className="quote-fields">
                <label>
                  Cliente
                  <select
                    name="clientId"
                    value={newQuote.clientId}
                    onChange={onQuoteInputChange}
                    required
                  >
                    <option value="">Selecciona cliente</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Tipo de instalación
                  <select
                    name="concept"
                    value={newQuote.concept}
                    onChange={onQuoteInputChange}
                    required
                  >
                    <option value="">Selecciona concepto</option>
                    <option>Instalación residencial</option>
                    <option>Instalación empresa</option>
                  </select>
                </label>

                <label>
                  Modo consumo
                  <select
                    name="consumptionMode"
                    value={newQuote.consumptionMode}
                    onChange={onQuoteInputChange}
                  >
                    <option value="annual">Consumo anual</option>
                    <option value="monthly">Consumo mensual</option>
                  </select>
                </label>

                <label>
                  Consumo anual
                  <input
                    name="annualConsumption"
                    type="number"
                    min="0"
                    step="1"
                    value={newQuote.annualConsumption}
                    onChange={onQuoteInputChange}
                    placeholder="6500 kWh"
                    disabled={newQuote.consumptionMode === "monthly"}
                    required
                  />
                </label>
              </div>

              {newQuote.consumptionMode === "monthly" && (
                <div className="monthly-consumption-card">
                  <div className="monthly-consumption-header">
                    <div>
                      <h4>Consumo mensual</h4>
                      <p>Introduce los kWh de cada mes para calcular el consumo anual.</p>
                    </div>

                    <strong>{newQuote.annualConsumption || 0} kWh/año</strong>
                  </div>

                  <div className="monthly-grid quote-monthly-grid">
                    {months.map((month, index) => (
                      <label key={month}>
                        <span>{month}</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={newQuote.monthlyConsumption[index]}
                          onChange={(event) =>
                            onMonthlyConsumptionChange(index, event.target.value)
                          }
                          placeholder="0"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="quote-section">
              <div className="quote-section-header">
                <span>2</span>
                <div>
                  <h3>Dimensionamiento solar</h3>
                  <p>Paneles, potencia, producción anual y cobertura estimada.</p>
                </div>
              </div>

              <div className="quote-fields">
                <label className="form-field-wide">
                  Modelo paneles
                  <select
                    name="panelModel"
                    value={newQuote.panelModel}
                    onChange={onQuoteInputChange}
                    required
                  >
                    <option value="">Selecciona modelo</option>
                    <option>JA Solar 530W bifacial</option>
                    <option>JA Solar 600W bifacial</option>
                    <option>AIKO 600W</option>
                  </select>
                </label>

                <label>
                  Máximo paneles
                  <input
                    name="maxPanels"
                    type="number"
                    min="1"
                    step="1"
                    value={newQuote.maxPanels}
                    onChange={onQuoteInputChange}
                    placeholder="Opcional"
                  />
                </label>
              </div>

              <div className="quote-summary-grid">
                <div>
                  <span>Nº paneles</span>
                  <strong>{newQuote.panelCount || "-"}</strong>
                </div>
                <div>
                  <span>Potencia</span>
                  <strong>{newQuote.installPower || "-"} kW</strong>
                </div>
                <div>
                  <span>Producción anual</span>
                  <strong>{newQuote.annualProduction || "-"} kWh</strong>
                </div>
                <div>
                  <span>Cobertura</span>
                  <strong>{newQuote.coverage || "-"}%</strong>
                </div>
              </div>
            </section>

            <section className="quote-section">
              <div className="quote-section-header">
                <span>3</span>
                <div>
                  <h3>Equipos principales</h3>
                  <p>Selección de inversor y sistema de acumulación.</p>
                </div>
              </div>

              <div className="quote-fields">
                <label>
                  Marca inversor
                  <select
                    name="inverterBrand"
                    value={newQuote.inverterBrand}
                    onChange={onQuoteInputChange}
                    required
                  >
                    <option value="">Selecciona marca</option>
                    <option>Huawei</option>
                    <option>Deye</option>
                    <option>Victron</option>
                  </select>
                </label>

                <label>
                  Modelo inversor
                  <select
                    name="inverterModel"
                    value={newQuote.inverterModel}
                    onChange={onQuoteInputChange}
                    disabled={!newQuote.inverterBrand}
                    required
                  >
                    <option value="">Selecciona modelo</option>
                    {selectedInverterModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Batería
                  <select
                    name="batteryBrand"
                    value={newQuote.batteryBrand}
                    onChange={onQuoteInputChange}
                  >
                    <option>Sin batería</option>
                    <option>Huawei</option>
                    <option>Deye</option>
                    <option>Pylontech</option>
                  </select>
                </label>

                <label>
                  Modelo batería
                  <select
                    name="batteryModel"
                    value={newQuote.batteryModel}
                    onChange={onQuoteInputChange}
                    disabled={!hasBattery}
                    required={hasBattery}
                  >
                    <option value="">
                      {hasBattery ? "Selecciona modelo" : "Sin batería"}
                    </option>
                    {selectedBatteryModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Módulos batería
                  <input
                    name="batteryUnits"
                    type="number"
                    min="1"
                    step="1"
                    value={newQuote.batteryUnits}
                    onChange={onQuoteInputChange}
                    placeholder="2"
                    disabled={!hasBattery || !newQuote.batteryModel}
                    required={hasBattery}
                  />
                </label>

                <label>
                  Capacidad total
                  <input
                    name="batteryCapacity"
                    type="number"
                    min="0"
                    step="0.1"
                    value={newQuote.batteryCapacity}
                    onChange={onQuoteInputChange}
                    placeholder="Automática"
                    disabled
                    required={hasBattery}
                  />
                </label>
              </div>
            </section>

            <section className="quote-section quote-final-section">
              <div className="quote-section-header">
                <span>4</span>
                <div>
                  <h3>Resumen económico</h3>
                  <p>Importe estimado y estado comercial de la propuesta.</p>
                </div>
              </div>

              <div className="quote-fields">
                <label>
                  Total estimado
                  <input
                    name="total"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newQuote.total}
                    onChange={onQuoteInputChange}
                    placeholder="8500"
                    required
                  />
                </label>

                <label>
                  Estado
                  <select
                    name="status"
                    value={newQuote.status}
                    onChange={onQuoteInputChange}
                  >
                    <option>Borrador</option>
                    <option>Enviado</option>
                    <option>Aceptado</option>
                    <option>Rechazado</option>
                  </select>
                </label>

                <div className="quote-total-card">
                  <span>Total propuesta</span>
                  <strong>
                    {Number(newQuote.total || 0).toLocaleString("es-ES")} €
                  </strong>
                </div>
              </div>

              <div className="form-actions">
                <button className="secondary-button" type="button" onClick={onCancel}>
                  Cancelar
                </button>
                <button className="primary-button" type="submit">
                  {editingQuoteId ? "Guardar cambios" : "Guardar presupuesto"}
                </button>
              </div>
            </section>
          </form>

          <div className="quote-chart-panel">
            <div className="quote-section-header">
              <span>5</span>
              <div>
                <h3>Consumo y producción</h3>
                <p>Comparativa visual para acompañar la propuesta.</p>
              </div>
            </div>

            <EnergyChart
              annualConsumption={newQuote.annualConsumption}
              annualProduction={newQuote.annualProduction}
              monthlyConsumption={newQuote.monthlyConsumption}
            />
          </div>
        </section>
      )}

      {selectedQuote && (
        <section className="panel detail-panel">
          <div className="panel-header panel-header-actions">
            <div>
              <h2>Detalle del presupuesto</h2>
              <p>{getClientName(selectedQuote.clientId)}</p>
            </div>

            <div className="detail-actions">
              <button className="secondary-button" onClick={handleExportPdf}>
                Exportar PDF
              </button>
              <button className="secondary-button" onClick={() => setSelectedQuoteId(null)}>
                Cerrar detalle
              </button>
            </div>
          </div>

          <div className="pdf-header">
            <div>
              <span>Generaluz CRM</span>
              <h2>Propuesta solar</h2>
            </div>
            <strong>{getClientName(selectedQuote.clientId)}</strong>
          </div>

          <div className="detail-grid">
            <div>
              <span>Concepto</span>
              <strong>{selectedQuote.concept}</strong>
            </div>
            <div>
              <span>Consumo anual</span>
              <strong>{selectedQuote.annualConsumption} kWh</strong>
            </div>
            <div>
              <span>Producción anual</span>
              <strong>{selectedQuote.annualProduction} kWh</strong>
            </div>
            <div>
              <span>Cobertura</span>
              <strong>{selectedQuote.coverage}%</strong>
            </div>
            <div>
              <span>Paneles</span>
              <strong>{selectedQuote.panelCount} x {selectedQuote.panelModel}</strong>
            </div>
            <div>
              <span>Potencia</span>
              <strong>{selectedQuote.installPower} kWp</strong>
            </div>
            <div>
              <span>Inversor</span>
              <strong>{selectedQuote.inverterBrand} · {selectedQuote.inverterModel}</strong>
            </div>
            <div>
              <span>Batería</span>
              <strong>
                {selectedQuote.batteryBrand === "Sin batería"
                  ? "Sin batería"
                  : `${selectedQuote.batteryBrand} · ${selectedQuote.batteryModel} · ${selectedQuote.batteryUnits} módulos · ${selectedQuote.batteryCapacity} kWh`}
              </strong>
            </div>
            <div>
              <span>Total estimado</span>
              <strong>{Number(selectedQuote.total).toLocaleString("es-ES")} €</strong>
            </div>
          </div>

          <EnergyChart
            annualConsumption={selectedQuote.annualConsumption}
            annualProduction={selectedQuote.annualProduction}
            monthlyConsumption={selectedQuote.monthlyConsumption}
          />
        </section>
      )}

      <section className="panel">
        <div className="panel-header panel-header-actions">
          <div>
            <h2>Listado de presupuestos</h2>
            <p>
              Mostrando {filteredQuotes.length} de {quotes.length} propuestas.
            </p>
          </div>
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="quote-list-toolbar">
          <label>
            Buscar
            <input
              type="search"
              value={quoteSearch}
              onChange={(event) => setQuoteSearch(event.target.value)}
              placeholder="Cliente, concepto, panel, inversor o estado"
            />
          </label>

          <label>
            Estado
            <select
              value={quoteStatusFilter}
              onChange={(event) => setQuoteStatusFilter(event.target.value)}
            >
              <option>Todos</option>
              <option>Borrador</option>
              <option>Enviado</option>
              <option>Aceptado</option>
              <option>Rechazado</option>
            </select>
          </label>
        </div>

        <div className="table">
          {isLoading && <p className="empty-message">Cargando presupuestos...</p>}

          {!isLoading && quotes.length === 0 && (
            <p className="empty-message">Todavía no hay presupuestos.</p>
          )}

          {!isLoading && quotes.length > 0 && filteredQuotes.length === 0 && (
            <p className="empty-message">No hay presupuestos con esos filtros.</p>
          )}

          {filteredQuotes.map((quote) => (
            <div className="table-row" key={quote.id}>
              <div>
                <strong>{quote.concept}</strong>
                <span>{getClientName(quote.clientId)}</span>
                <span>
                  {quote.panelCount} paneles · {quote.installPower} kWp · {quote.coverage}% cobertura
                </span>
                <span>{Number(quote.total).toLocaleString("es-ES")} €</span>
              </div>

              <div className="row-actions">
                <span className="status">{quote.status}</span>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => setSelectedQuoteId(quote.id)}
                >
                  Ver detalle
                </button>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => onEditQuote(quote)}
                >
                  Editar
                </button>
                <button
                  className="danger-button"
                  type="button"
                  onClick={() => onDeleteQuote(quote.id)}
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

export default Quotes;
