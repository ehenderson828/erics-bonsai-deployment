import React, { useState, useEffect } from "react";
import Papa from "papaparse";

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";

const csvFile = "/sensor_data_2025-02-16_13.csv";

function App() {
  const [latestData, setLatestData] = useState(null);
  const [tempHigh, setTempHigh] = useState(null);
  const [tempLow, setTempLow] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(csvFile)
      .then((response) => response.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const data = result.data.map(row => ({
              Timestamp: row.Timestamp,
              Temperature: parseFloat(row["Temperature (°C)"]),
              Humidity: parseFloat(row["Relative Humidity (%)"]),
              Pressure: parseFloat(row["Barometric Pressure (Pa)"]),
              Battery: parseFloat(row["Battery Voltage (mV)"])
            }));

            if (data.length === 0) {
              setError("CSV file is empty or not formatted correctly.");
              return;
            }

            // Get latest data row
            setLatestData(data[data.length - 1]);

            // Calculate 24hr high & low temperature
            const temps = data.map(d => d.Temperature).filter(t => !isNaN(t));
            if (temps.length > 0) {
              setTempHigh(Math.max(...temps));
              setTempLow(Math.min(...temps));
            }

            // Set chart data
            setChartData(data);
          },
        });
      })
      .catch((fetchError) => {
        console.error("Error loading CSV file:", fetchError);
        setError("Failed to load CSV file. Check console for details.");
      });
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>🌱 Bonsai Sensor Dashboard</h1>

      {error ? (
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      ) : latestData ? (
        <>
          {/* Tile Section */}
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
            <Tile title="🌡️ Temperature" value={`${latestData.Temperature}°C`} />
            <Tile title="💧 Humidity" value={`${latestData.Humidity}%`} />
            <Tile title="🌬️ Pressure" value={`${latestData.Pressure} Pa`} />
            <Tile title="🔋 Battery" value={`${latestData.Battery} V`} />
            <Tile title="📈 24hr High" value={`${tempHigh}°C`} />
            <Tile title="📉 24hr Low" value={`${tempLow}°C`} />
          </div>

          {/* Chart Section */}
          <h2 style={{ textAlign: "center", marginTop: "40px" }}>📊 Sensor Data Over Time</h2>

          {/* Temperature & Humidity Chart */}
          <ChartContainer title="Temperature & Humidity">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Timestamp" hide={true} />
                <YAxis yAxisId="left" label={{ value: "Humidity (%)", angle: -90, position: "insideLeft" }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: "Temperature (°C)", angle: -90, position: "insideRight" }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="right" type="monotone" dataKey="Temperature" stroke="red" name="Temperature (°C)" />
                <Line yAxisId="left" type="monotone" dataKey="Humidity" stroke="blue" name="Humidity (%)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Pressure Chart */}
          <ChartContainer title="Pressure">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Timestamp" hide={true} />
                <YAxis label={{ value: "Pressure (Pa)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Pressure" stroke="green" name="Pressure (Pa)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Battery Chart */}
          <ChartContainer title="Battery Voltage">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Timestamp" hide={true} />
                <YAxis label={{ value: "Voltage (V)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Battery" stroke="purple" name="Battery (V)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </>
      ) : (
        <p style={{ textAlign: "center" }}>Loading data...</p>
      )}
    </div>
  );
}

// Tile Component
const Tile = ({ title, value }) => (
  <div style={tileStyle}>
    <h2>{title}</h2>
    <p style={valueStyle}>{value}</p>
  </div>
);

// Chart Container Component
const ChartContainer = ({ title, children }) => (
  <div style={{ width: "100%", height: "400px", margin: "40px auto", textAlign: "center" }}>
    <h3>{title}</h3>
    {children}
  </div>
);

// Simple tile styling
const tileStyle = {
  background: "#f4f4f4",
  padding: "20px",
  borderRadius: "10px",
  textAlign: "center",
  minWidth: "150px",
  boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
};

const valueStyle = {
  fontSize: "24px",
  fontWeight: "bold",
  margin: "10px 0 0 0",
};

export default App;
