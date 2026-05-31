const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const consumptionCurve = [1.18, 1.08, 1.02, 0.9, 0.78, 0.72, 0.82, 0.76, 0.72, 0.78, 0.86, 1.18];
const productionCurve = [0.55, 0.64, 0.86, 1.04, 1.2, 1.24, 1.28, 1.18, 0.92, 0.72, 0.52, 0.45];

function distributeAnnualValue(total, curve) {
  const curveTotal = curve.reduce((sum, value) => sum + value, 0);

  return curve.map((value) => (total * value) / curveTotal);
}

function getPolylinePoints(values, maxValue, width, height, padding) {
  return values
    .map((value, index) => {
      const x = padding + (index * (width - padding * 2)) / (values.length - 1);
      const y = height - padding - (value / maxValue) * (height - padding * 2);

      return `${x},${y}`;
    })
    .join(" ");
}

function EnergyChart({ annualConsumption, annualProduction, monthlyConsumption }) {
  const consumption = Number(annualConsumption);
  const production = Number(annualProduction);
  const realMonthlyConsumption =
    monthlyConsumption?.map((value) => Number(value) || 0) || [];
  const hasRealMonthlyConsumption = realMonthlyConsumption.some(
    (value) => value > 0,
  );

  if (!consumption || !production) {
    return null;
  }

  const width = 720;
  const height = 260;
  const padding = 36;
  const consumptionValues = hasRealMonthlyConsumption
    ? realMonthlyConsumption
    : distributeAnnualValue(consumption, consumptionCurve);
  const productionValues = distributeAnnualValue(production, productionCurve);
  const maxValue = Math.max(...consumptionValues, ...productionValues) * 1.15;
  const consumptionPoints = getPolylinePoints(
    consumptionValues,
    maxValue,
    width,
    height,
    padding,
  );
  const productionPoints = getPolylinePoints(
    productionValues,
    maxValue,
    width,
    height,
    padding,
  );

  return (
    <div className="energy-chart">
      <div className="chart-legend">
        <span><b className="legend-dot consumption-dot" />Consumo</span>
        <span><b className="legend-dot production-dot" />Producción</span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Consumo y producción mensual estimados">
        {[0.25, 0.5, 0.75, 1].map((line) => {
          const y = height - padding - line * (height - padding * 2);
          return <line key={line} x1={padding} x2={width - padding} y1={y} y2={y} className="chart-grid" />;
        })}

        {months.map((month, index) => {
          const x = padding + (index * (width - padding * 2)) / (months.length - 1);
          return (
            <text key={month} x={x} y={height - 10} textAnchor="middle" className="chart-label">
              {month}
            </text>
          );
        })}

        <polyline points={consumptionPoints} className="chart-line chart-consumption" />
        <polyline points={productionPoints} className="chart-line chart-production" />
      </svg>
    </div>
  );
}

export default EnergyChart;
