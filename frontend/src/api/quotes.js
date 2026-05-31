export const QUOTES_API_URL = "http://localhost:3000/api/quotes";

export const emptyQuote = {
  clientId: "",
  concept: "",
  consumptionMode: "annual",
  annualConsumption: "",
  monthlyConsumption: Array(12).fill(""),
  annualProduction: "",
  coverage: "",
  maxPanels: "",
  panelCount: "",
  panelModel: "",
  inverterBrand: "",
  inverterModel: "",
  installPower: "",
  batteryBrand: "Sin batería",
  batteryModel: "",
  batteryUnits: "",
  batteryCapacity: "",
  total: "",
  status: "Borrador",
};
