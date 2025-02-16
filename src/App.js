import React, { useState, useEffect } from "react";
import Papa from "papaparse";

const csvFile = "/sensor_data_2025-02-16_13.csv";


function App() {
  const [latestData, setLatestData] = useState(null);
  const [tempHigh, setTempHigh] = useState(null);
  const [tempLow, setTempLow] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(csvFile)
      .then((response) => response.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const data = result.data;

            if (data.length === 0) {
              setError("CSV file is empty or not formatted correctly.");
              return;
            }

            // Get latest data row (last item in CSV)
            const latest = data[data.length - 1];
            setLatestData(latest);

            // Calculate 24hr high & low temperature
            const temps = data.map(row => parseFloat(row["Temperature (°C)"])).filter(t => !isNaN(t));
            if (temps.length > 0) {
              setTempHigh(Math.max(...temps));
              setTempLow(Math.min(...temps));
            }
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
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
          {/* Temperature Tile */}
          <div style={tileStyle}>
            <h2>🌡️ Temperature</h2>
            <p style={valueStyle}>{latestData["Temperature (°C)"]}°C</p>
          </div>

          {/* Humidity Tile */}
          <div style={tileStyle}>
            <h2>💧 Humidity</h2>
            <p style={valueStyle}>{latestData["Relative Humidity (%)"]}%</p>
          </div>

          {/* Pressure Tile */}
          <div style={tileStyle}>
            <h2>🌬️ Pressure</h2>
            <p style={valueStyle}>{latestData["Barometric Pressure (Pa)"]} Pa</p>
          </div>

          {/* Battery Voltage Tile */}
          <div style={tileStyle}>
            <h2>🔋 Battery</h2>
            <p style={valueStyle}>{latestData["Battery Voltage (mV)"]} V</p>
          </div>

          {/* 24hr High Tile */}
          <div style={tileStyle}>
            <h2>📈 24hr High</h2>
            <p style={valueStyle}>{tempHigh}°C</p>
          </div>

          {/* 24hr Low Tile */}
          <div style={tileStyle}>
            <h2>📉 24hr Low</h2>
            <p style={valueStyle}>{tempLow}°C</p>
          </div>
        </div>
      ) : (
        <p style={{ textAlign: "center" }}>Loading data...</p>
      )}
    </div>
  );
}

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
