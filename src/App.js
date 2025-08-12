import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";

function App() {
  const [latestData, setLatestData] = useState(null);
  const [tempHigh, setTempHigh] = useState(null);
  const [tempLow, setTempLow] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("sensor_data")
      .select("*")
      .order("timestamp", { ascending: true });

  console.log("Supabase fetch result:", { data, error });

  if (error) {
    console.error("Error fetching data:", error);
    setError("Failed to fetch data from Supabase.");
    return;
  }

  console.log("Column names in Supabase data:", Object.keys(data[0]));

const formattedData = data.map((row, index) => {
  console.log(`Row ${index} raw:`, row); // 🔍 Log raw row from Supabase

  const formattedRow = {
    // Converts timestamp to a human-readable local time string
    Timestamp: new Date(row.timestamp).toLocaleString(),

    // Temperature in °C from the 'temperature_c' column
    Temperature: Number(row.temperature_c?.toFixed(1)),

    // Humidity in % from the 'humidity_percent' column
    Humidity: Number(row.humidity_percent?.toFixed(1)),

    // Pressure from 'pressure_pa' column (Pa → hPa)
    Pressure: row.pressure_pa != null 
      ? Number((row.pressure_pa / 1000).toFixed(1)) 
      : null,

    // Battery voltage from 'battery_voltage_mv' column
    Battery: row.battery_voltage_mv != null
      ? Number(row.battery_voltage_mv.toFixed(3))
      : null
  };

  console.log(`Row ${index} formatted:`, formattedRow); // ✅ Log formatted row

  return formattedRow;
});


    console.log("Formatted data:", formattedData);

    if (formattedData.length === 0) {
      setError("No data found.");
      return;
    }

    setLatestData(formattedData[formattedData.length - 1]);

    const temps = formattedData
      .map((d) => d.Temperature)
      .filter((t) => !isNaN(t));

    if (temps.length > 0) {
      setTempHigh(Math.max(...temps));
      setTempLow(Math.min(...temps));
    }

    setChartData(formattedData);
  };

  // Fetch latest row on app mount
  fetchData();

  // Fetch the latest row every five seconds
  const interValid = setInterval(fetchData, 5000);

  // Cleanup on unmount
  return () => clearInterval(interValid);
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
            <Tile title="🌬️ Pressure" value={`${latestData.Pressure} hPa`} />
            <Tile title="🔋 Battery" value={`${latestData.Battery} V`} />
            <Tile title="📈 Record High" value={`${tempHigh}°C`} />
            <Tile title="📉 Record Low" value={`${tempLow}°C`} />
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
                <YAxis label={{ value: "Pressure (hPa)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Pressure" stroke="green" name="Pressure (hPa)" />
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
