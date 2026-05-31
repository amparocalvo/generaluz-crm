import { useEffect, useState } from "react";
import { AUTH_API_URL, AUTH_TOKEN_KEY, getAuthHeaders } from "./api/auth";
import { QUOTES_API_URL, emptyQuote } from "./api/quotes";
import { CLIENTS_API_URL, emptyClient } from "./api/clients";
import { INSTALLATIONS_API_URL, emptyInstallation } from "./api/installations";
import Quotes from "./pages/Quotes";
import Clients from "./pages/Clients";
import Dashboard from "./pages/Dashboard";
import Installations from "./pages/Installations";
import Login from "./pages/Login";
import Chat from "./pages/Chat";

function getBatteryCapacity(brand, model) {
  if (brand === "Deye") {
    return "5.12";
  }

  if (brand === "Pylontech") {
    return "4.8";
  }

  if (brand === "Huawei") {
    const modelCapacity = model.match(/LUNA2000-(\d+)/);
    return modelCapacity ? modelCapacity[1] : "";
  }

  return "";
}

function getBatteryTotalCapacity(brand, model, units) {
  const unitCapacity = Number(getBatteryCapacity(brand, model));
  const unitCount = Number(units);

  if (!unitCapacity || !unitCount) {
    return "";
  }

  return String(Number((unitCapacity * unitCount).toFixed(2)));
}

function getPanelPower(panelModel) {
  const powerMatch = panelModel.match(/(\d+)W/);
  return powerMatch ? Number(powerMatch[1]) : 0;
}

function calculateSolarSizing(annualConsumption, panelModel, maxPanels) {
  const consumption = Number(annualConsumption);
  const panelPower = getPanelPower(panelModel);
  const panelLimit = Number(maxPanels);
  const estimatedProductionPerKwp = 1400;
  const targetCoverage = 1.4;

  if (!consumption || !panelPower) {
    return {
      annualProduction: "",
      coverage: "",
      installPower: "",
      panelCount: "",
    };
  }

  const targetProduction = consumption * targetCoverage;
  const neededKwp = targetProduction / estimatedProductionPerKwp;
  const idealPanelCount = Math.ceil((neededKwp * 1000) / panelPower);
  const panelCount =
    panelLimit && panelLimit > 0
      ? Math.min(idealPanelCount, panelLimit)
      : idealPanelCount;
  const installPower = Number(((panelCount * panelPower) / 1000).toFixed(2));
  const annualProduction = Number(
    (installPower * estimatedProductionPerKwp).toFixed(0),
  );
  const coverage = Number(((annualProduction / consumption) * 100).toFixed(2));

  return {
    annualProduction: String(annualProduction),
    coverage: String(coverage),
    installPower: String(installPower),
    panelCount: String(panelCount),
  };
}

function sumMonthlyConsumption(monthlyConsumption) {
  return monthlyConsumption.reduce(
    (sum, value) => sum + (Number(value) || 0),
    0,
  );
}

function isValidEmail(email) {
  return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[0-9+]{9,15}$/.test(String(phone || "").replace(/\s/g, ""));
}

function validateClientForm(client) {
  if (!client.name.trim() || !client.phone.trim() || !client.status) {
    return "Nombre, teléfono y estado son obligatorios.";
  }

  if (client.name.trim().length < 3) {
    return "El nombre debe tener al menos 3 caracteres.";
  }

  if (!isValidPhone(client.phone)) {
    return "Introduce un teléfono válido.";
  }

  if (!isValidEmail(client.email)) {
    return "Introduce un email válido.";
  }

  return "";
}

function validateQuoteForm(quote) {
  if (!quote.clientId) {
    return "Selecciona un cliente.";
  }

  if (!quote.concept) {
    return "Selecciona un concepto.";
  }

  if (Number(quote.annualConsumption) <= 0) {
    return "El consumo anual debe ser mayor que 0.";
  }

  if (!quote.panelModel || Number(quote.panelCount) <= 0) {
    return "Selecciona paneles y calcula el número de unidades.";
  }

  if (!quote.inverterBrand || !quote.inverterModel) {
    return "Selecciona marca y modelo de inversor.";
  }

  if (Number(quote.installPower) <= 0) {
    return "La potencia a instalar debe ser mayor que 0.";
  }

  if (quote.batteryBrand !== "Sin batería") {
    if (!quote.batteryModel) {
      return "Selecciona el modelo de batería.";
    }

    if (Number(quote.batteryUnits) <= 0) {
      return "Indica las unidades de batería.";
    }
  }

  if (Number(quote.total) <= 0) {
    return "El total del presupuesto debe ser mayor que 0.";
  }

  return "";
}

function validateInstallationForm(installation, isEditing) {
  if (!isEditing && !installation.quoteId) {
    return "Selecciona un presupuesto aceptado.";
  }

  if (!installation.status) {
    return "Selecciona el estado de la instalación.";
  }

  return "";
}

function getInverterBrand(quote) {
  if (quote.inverterBrand) {
    return quote.inverterBrand;
  }

  if (quote.inverterModel?.startsWith("SUN2000")) {
    return "Huawei";
  }

  if (
    quote.inverterModel?.startsWith("SUN-") ||
    quote.inverterModel?.startsWith("Deye")
  ) {
    return "Deye";
  }

  if (quote.inverterModel?.startsWith("MultiPlus")) {
    return "Victron";
  }

  return "";
}

function App() {
  const [authToken, setAuthToken] = useState(() =>
    localStorage.getItem(AUTH_TOKEN_KEY),
  );
  const [authMode, setAuthMode] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [quotes, setQuotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isInstallationFormOpen, setIsInstallationFormOpen] = useState(false);
  const [newQuote, setNewQuote] = useState(emptyQuote);
  const [newClient, setNewClient] = useState(emptyClient);
  const [newInstallation, setNewInstallation] = useState(emptyInstallation);
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  const [editingClientId, setEditingClientId] = useState(null);
  const [editingInstallationId, setEditingInstallationId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function closeSession() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setAuthToken(null);
    setCurrentUser(null);
    setClients([]);
    setQuotes([]);
    setInstallations([]);
    setIsSessionChecked(true);
    setErrorMessage("");
  }

  useEffect(() => {
    async function loadInitialData() {
      if (!authToken) {
        setIsLoading(false);
        setIsSessionChecked(true);
        return;
      }

      setIsLoading(true);
      setIsSessionChecked(false);

      try {
        const headers = getAuthHeaders(authToken);
        const [
          sessionResponse,
          clientsResponse,
          quotesResponse,
          installationsResponse,
        ] = await Promise.all([
          fetch(`${AUTH_API_URL}/me`, { headers }),
          fetch(CLIENTS_API_URL, { headers }),
          fetch(QUOTES_API_URL, { headers }),
          fetch(INSTALLATIONS_API_URL, { headers }),
        ]);

        if (sessionResponse.status === 401) {
          closeSession();
          return;
        }

        if (!sessionResponse.ok) {
          throw new Error("No se pudo comprobar la sesión.");
        }

        if (!clientsResponse.ok) {
          throw new Error("No se pudieron cargar los clientes.");
        }

        if (!quotesResponse.ok) {
          throw new Error("No se pudieron cargar los presupuestos.");
        }

        if (!installationsResponse.ok) {
          throw new Error("No se pudieron cargar las instalaciones.");
        }

        const sessionData = await sessionResponse.json();
        const clientsData = await clientsResponse.json();
        const quotesData = await quotesResponse.json();
        const installationsData = await installationsResponse.json();

        setCurrentUser(sessionData.user);
        setClients(clientsData);
        setQuotes(quotesData);
        setInstallations(installationsData);
        setErrorMessage("");
        setIsSessionChecked(true);
      } catch (error) {
        setErrorMessage(error.message);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setAuthToken(null);
        setCurrentUser(null);
        setIsSessionChecked(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, [authToken]);

  async function handleLogin(event) {
    event.preventDefault();
    setIsLoginSubmitting(true);
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(`${AUTH_API_URL}/${authMode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.get("email"),
          name: formData.get("name"),
          password: formData.get("password"),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "No se pudo acceder.");
      }

      const data = await response.json();
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      setAuthToken(data.token);
      setCurrentUser(data.user);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoginSubmitting(false);
    }
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setNewClient({
      ...newClient,
      [name]: value,
    });
  }

  function handleQuoteInputChange(event) {
    const { name, value } = event.target;

    if (name === "consumptionMode") {
      const nextQuote = {
        ...newQuote,
        consumptionMode: value,
      };
      const annualConsumption =
        value === "monthly"
          ? sumMonthlyConsumption(nextQuote.monthlyConsumption)
          : nextQuote.annualConsumption;
      const sizing = calculateSolarSizing(
        annualConsumption,
        nextQuote.panelModel,
        nextQuote.maxPanels,
      );

      setNewQuote({
        ...nextQuote,
        annualConsumption: String(annualConsumption || ""),
        ...sizing,
      });
      return;
    }

    if (name === "batteryBrand") {
      setNewQuote({
        ...newQuote,
        batteryBrand: value,
        batteryModel: "",
        batteryUnits: "",
        batteryCapacity: "",
      });
      return;
    }

    if (name === "inverterBrand") {
      setNewQuote({
        ...newQuote,
        inverterBrand: value,
        inverterModel: "",
      });
      return;
    }

    if (name === "batteryModel") {
      setNewQuote({
        ...newQuote,
        batteryModel: value,
        batteryCapacity: getBatteryTotalCapacity(
          newQuote.batteryBrand,
          value,
          newQuote.batteryUnits,
        ),
      });
      return;
    }

    if (name === "batteryUnits") {
      setNewQuote({
        ...newQuote,
        batteryUnits: value,
        batteryCapacity: getBatteryTotalCapacity(
          newQuote.batteryBrand,
          newQuote.batteryModel,
          value,
        ),
      });
      return;
    }

    if (
      name === "annualConsumption" ||
      name === "panelModel" ||
      name === "maxPanels"
    ) {
      const nextQuote = {
        ...newQuote,
        [name]: value,
      };
      const annualConsumption =
        nextQuote.consumptionMode === "monthly"
          ? sumMonthlyConsumption(nextQuote.monthlyConsumption)
          : nextQuote.annualConsumption;
      const sizing = calculateSolarSizing(
        annualConsumption,
        nextQuote.panelModel,
        nextQuote.maxPanels,
      );

      setNewQuote({
        ...nextQuote,
        annualConsumption: String(annualConsumption || ""),
        ...sizing,
      });
      return;
    }

    setNewQuote({
      ...newQuote,
      [name]: value,
    });
  }

  function handleInstallationInputChange(event) {
    const { name, value } = event.target;

    setNewInstallation({
      ...newInstallation,
      [name]: value,
    });
  }

  function handleMonthlyConsumptionChange(index, value) {
    const monthlyConsumption = [...newQuote.monthlyConsumption];
    monthlyConsumption[index] = value;
    const annualConsumption = sumMonthlyConsumption(monthlyConsumption);
    const nextQuote = {
      ...newQuote,
      annualConsumption: String(annualConsumption || ""),
      monthlyConsumption,
    };
    const sizing = calculateSolarSizing(
      annualConsumption,
      nextQuote.panelModel,
      nextQuote.maxPanels,
    );

    setNewQuote({
      ...nextQuote,
      ...sizing,
    });
  }


  function handleNewClientClick() {
    setNewClient(emptyClient);
    setEditingClientId(null);
    setIsFormOpen(true);
    setActivePage("clients");
  }

  function handleNewQuoteClick(clientId = "") {
    const selectedClientId = typeof clientId === "string" ? clientId : "";

    setNewQuote({
      ...emptyQuote,
      clientId: selectedClientId,
    });
    setEditingQuoteId(null);
    setIsQuoteFormOpen(true);
    setActivePage("quotes");
  }

  function handleNewInstallationClick() {
    setNewInstallation(emptyInstallation);
    setEditingInstallationId(null);
    setIsInstallationFormOpen(true);
    setActivePage("installations");
  }

  function handleCancel() {
    setNewClient(emptyClient);
    setEditingClientId(null);
    setIsFormOpen(false);
  }

  function handleQuoteCancel() {
    setNewQuote(emptyQuote);
    setEditingQuoteId(null);
    setIsQuoteFormOpen(false);
  }

  function handleInstallationCancel() {
    setNewInstallation(emptyInstallation);
    setEditingInstallationId(null);
    setIsInstallationFormOpen(false);
  }

  function handleEditClient(client) {
    setNewClient({
      name: client.name,
      phone: client.phone,
      email: client.email || "",
      address: client.address || "",
      status: client.status,
    });
    setEditingClientId(client.id);
    setIsFormOpen(true);
    setActivePage("clients");
  }

  function handleEditQuote(quote) {
    setNewQuote({
      clientId: String(quote.clientId),
      concept: quote.concept,
      consumptionMode: quote.consumptionMode || "annual",
      annualConsumption: quote.annualConsumption
        ? String(quote.annualConsumption)
        : "",
      monthlyConsumption: quote.monthlyConsumption || Array(12).fill(""),
      annualProduction: quote.annualProduction
        ? String(quote.annualProduction)
        : "",
      coverage: quote.coverage ? String(quote.coverage) : "",
      maxPanels: quote.maxPanels ? String(quote.maxPanels) : "",
      panelCount: quote.panelCount ? String(quote.panelCount) : "",
      panelModel: quote.panelModel || "",
      inverterBrand: getInverterBrand(quote),
      inverterModel: quote.inverterModel || "",
      installPower: quote.installPower ? String(quote.installPower) : "",
      batteryBrand: quote.batteryBrand || "Sin batería",
      batteryModel: quote.batteryModel || "",
      batteryUnits: quote.batteryUnits ? String(quote.batteryUnits) : "",
      batteryCapacity: quote.batteryCapacity
        ? String(quote.batteryCapacity)
        : "",
      total: String(quote.total),
      status: quote.status,
    });
    setEditingQuoteId(quote.id);
    setIsQuoteFormOpen(true);
    setActivePage("quotes");
  }

  function handleEditInstallation(installation) {
    setNewInstallation({
      address: installation.address || "",
      quoteId: String(installation.quoteId),
      notes: installation.notes || "",
      scheduledDate: installation.scheduledDate || "",
      status: installation.status || "Pendiente",
    });
    setEditingInstallationId(installation.id);
    setIsInstallationFormOpen(true);
    setActivePage("installations");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const validationMessage = validateClientForm(newClient);

      if (validationMessage) {
        setErrorMessage(validationMessage);
        return;
      }

      const isEditing = editingClientId !== null;
      const url = isEditing
        ? `${CLIENTS_API_URL}/${editingClientId}`
        : CLIENTS_API_URL;
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: getAuthHeaders(authToken),
        body: JSON.stringify(newClient),
      });

      if (response.status === 401) {
        closeSession();
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "No se pudo guardar el cliente.");
      }

      const client = await response.json();

      if (isEditing) {
        setClients(
          clients.map((currentClient) =>
            currentClient.id === client.id ? client : currentClient,
          ),
        );
      } else {
        setClients([client, ...clients]);
      }

      setNewClient(emptyClient);
      setEditingClientId(null);
      setIsFormOpen(false);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleQuoteSubmit(event) {
    event.preventDefault();

    try {
      const validationMessage = validateQuoteForm(newQuote);

      if (validationMessage) {
        setErrorMessage(validationMessage);
        return;
      }

      const isEditing = editingQuoteId !== null;
      const url = isEditing
        ? `${QUOTES_API_URL}/${editingQuoteId}`
        : QUOTES_API_URL;
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: getAuthHeaders(authToken),
        body: JSON.stringify(newQuote),
      });

      if (response.status === 401) {
        closeSession();
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "No se pudo guardar el presupuesto.");
      }

      const quote = await response.json();

      if (isEditing) {
        setQuotes(
          quotes.map((currentQuote) =>
            currentQuote.id === quote.id ? quote : currentQuote,
          ),
        );
      } else {
        setQuotes([quote, ...quotes]);
      }

      setNewQuote(emptyQuote);
      setEditingQuoteId(null);
      setIsQuoteFormOpen(false);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleInstallationSubmit(event) {
    event.preventDefault();

    try {
      const isEditing = editingInstallationId !== null;
      const validationMessage = validateInstallationForm(newInstallation, isEditing);

      if (validationMessage) {
        setErrorMessage(validationMessage);
        return;
      }

      const url = isEditing
        ? `${INSTALLATIONS_API_URL}/${editingInstallationId}`
        : INSTALLATIONS_API_URL;
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: getAuthHeaders(authToken),
        body: JSON.stringify(newInstallation),
      });

      if (response.status === 401) {
        closeSession();
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "No se pudo guardar la instalación.");
      }

      const installation = await response.json();

      if (isEditing) {
        setInstallations(
          installations.map((currentInstallation) =>
            currentInstallation.id === installation.id
              ? installation
              : currentInstallation,
          ),
        );
      } else {
        setInstallations([installation, ...installations]);
      }

      setNewInstallation(emptyInstallation);
      setEditingInstallationId(null);
      setIsInstallationFormOpen(false);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleDeleteClient(clientId) {
    try {
      const response = await fetch(`${CLIENTS_API_URL}/${clientId}`, {
        method: "DELETE",
        headers: getAuthHeaders(authToken),
      });

      if (response.status === 401) {
        closeSession();
        return;
      }

      if (!response.ok) {
        throw new Error("No se pudo eliminar el cliente.");
      }

      setClients(clients.filter((client) => client.id !== clientId));

      if (editingClientId === clientId) {
        handleCancel();
      }

      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleDeleteQuote(quoteId) {
    try {
      const response = await fetch(`${QUOTES_API_URL}/${quoteId}`, {
        method: "DELETE",
        headers: getAuthHeaders(authToken),
      });

      if (response.status === 401) {
        closeSession();
        return;
      }

      if (!response.ok) {
        throw new Error("No se pudo eliminar el presupuesto.");
      }

      setQuotes(quotes.filter((quote) => quote.id !== quoteId));

      if (editingQuoteId === quoteId) {
        handleQuoteCancel();
      }

      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleDeleteInstallation(installationId) {
    try {
      const response = await fetch(`${INSTALLATIONS_API_URL}/${installationId}`, {
        method: "DELETE",
        headers: getAuthHeaders(authToken),
      });

      if (response.status === 401) {
        closeSession();
        return;
      }

      if (!response.ok) {
        throw new Error("No se pudo eliminar la instalación.");
      }

      setInstallations(
        installations.filter((installation) => installation.id !== installationId),
      );

      if (editingInstallationId === installationId) {
        handleInstallationCancel();
      }

      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  if (!authToken || (isSessionChecked && !currentUser)) {
    return (
      <Login
        authMode={authMode}
        errorMessage={errorMessage}
        isSubmitting={isLoginSubmitting}
        onAuthModeChange={setAuthMode}
        onSubmit={handleLogin}
      />
    );
  }

  if (!isSessionChecked || !currentUser) {
    return (
      <main className="login-page">
        <section className="login-panel">
          <span className="eyebrow">Acceso privado</span>
          <h1>Comprobando sesión</h1>
          <p>Validando el acceso al CRM.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <nav className="app-nav">
        <div className="nav-links">
          <button
            className={activePage === "dashboard" ? "nav-button active" : "nav-button"}
            onClick={() => setActivePage("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={activePage === "clients" ? "nav-button active" : "nav-button"}
            onClick={() => setActivePage("clients")}
          >
            Clientes
          </button>
          <button
            className={activePage === "quotes" ? "nav-button active" : "nav-button"}
            onClick={() => setActivePage("quotes")}
          >
            Presupuestos
          </button>
          <button
            className={activePage === "installations" ? "nav-button active" : "nav-button"}
            onClick={() => setActivePage("installations")}
          >
            Instalaciones
          </button>
          <button
            className={activePage === "help" ? "nav-button active" : "nav-button"}
            onClick={() => setActivePage("help")}
          >
            Ayuda
          </button>
        </div>

        <div className="session-box">
          <span>{currentUser?.name || "Usuario"}</span>
          <button className="text-button" onClick={closeSession} type="button">
            Cerrar sesión
          </button>
        </div>
      </nav>

      {activePage === "dashboard" ? (
        <Dashboard
          quotes={quotes}
          clients={clients}
          errorMessage={errorMessage}
          isLoading={isLoading}
          onNewClient={handleNewClientClick}
          onNewQuote={handleNewQuoteClick}
          onShowClients={() => setActivePage("clients")}
        />
      ) : activePage === "clients" ? (
        <Clients
          quotes={quotes}
          clients={clients}
          editingClientId={editingClientId}
          errorMessage={errorMessage}
          isFormOpen={isFormOpen}
          isLoading={isLoading}
          newClient={newClient}
          onCancel={handleCancel}
          onDeleteClient={handleDeleteClient}
          onEditClient={handleEditClient}
          onInputChange={handleInputChange}
          onNewQuote={handleNewQuoteClick}
          onNewClient={handleNewClientClick}
          onSubmit={handleSubmit}
        />
      ) : activePage === "quotes" ? (
        <Quotes
          quotes={quotes}
          clients={clients}
          editingQuoteId={editingQuoteId}
          errorMessage={errorMessage}
          isQuoteFormOpen={isQuoteFormOpen}
          isLoading={isLoading}
          newQuote={newQuote}
          onQuoteInputChange={handleQuoteInputChange}
          onCancel={handleQuoteCancel}
          onDeleteQuote={handleDeleteQuote}
          onEditQuote={handleEditQuote}
          onMonthlyConsumptionChange={handleMonthlyConsumptionChange}
          onNewQuote={handleNewQuoteClick}
          onSubmit={handleQuoteSubmit}
        />
      ) : activePage === "installations" ? (
        <Installations
          acceptedQuotes={quotes.filter((quote) => quote.status === "Aceptado")}
          clients={clients}
          editingInstallationId={editingInstallationId}
          errorMessage={errorMessage}
          installations={installations}
          isInstallationFormOpen={isInstallationFormOpen}
          isLoading={isLoading}
          newInstallation={newInstallation}
          onCancel={handleInstallationCancel}
          onDeleteInstallation={handleDeleteInstallation}
          onEditInstallation={handleEditInstallation}
          onInstallationInputChange={handleInstallationInputChange}
          onNewInstallation={handleNewInstallationClick}
          onSubmit={handleInstallationSubmit}
        />
      ) : (
        <Chat currentUser={currentUser} />
      )}
    </main>
  );
}

export default App;
