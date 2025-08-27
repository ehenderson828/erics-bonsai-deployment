import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";

// Mount app and initialize state
function App() {
  const [latestData, setLatestData] = useState(null);
  const [tempHigh, setTempHigh] = useState(null);
  const [tempLow, setTempLow] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the raw data from the sensor_data table
    const fetchData = async () => {
      const { data, error } = await supabase.rpc("sensor_data_with_localtime");

      // Handle errors
      if (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data from Supabase.");
        return;
      }

      // Get current date in Eastern Time (YYYY-MM-DD):
      const todayEST = new Date().toLocaleDateString("en-CA", {
        timeZone: "America/New_York",
      });

      // Filter raw data for today's date
      const filtered = data.filter((row) => {
        const rowDateEST = new Date(row.timestamp_est).toLocaleDateString("en-CA", {
          timeZone: "America/New_York",
        });
        return rowDateEST === todayEST;
      });

      // Log confirmed header keys
      if (!filtered || filtered.length === 0) {
        console.warn("No data returned from Supabase");
        setError("No data found.");
        return;
      }

      // Format the raw data for rendering in the UI
      const formattedData = filtered.map((row, index) => {
        console.log(`Row ${index} raw:`, row); // Log raw row from Supabase

        const formattedRow = {
          // Converts timestamp to a human-readable local time string
          Timestamp: new Date(row.timestamp_est).toLocaleString("en-US"),

          // Temperature in °C from the 'temperature_c' column
          Temperature: Number(row.temperature_c?.toFixed(1)),

          // Humidity in % from the 'humidity_percent' column
          Humidity: Number(row.humidity_percent?.toFixed(2)),

          // Pressure from 'pressure_pa' column (Pa → hPa)
          Pressure: row.pressure_pa != null 
            ? Number((row.pressure_pa / 1000).toFixed(1)) 
            : null,

          // Battery voltage from 'battery_voltage_mv' column
          Battery: row.battery_voltage_mv != null
            ? Number((row.battery_voltage_mv / 1000).toFixed(3))
            : null
        };
        return formattedRow;
      });

      // If no data formatted, log in the console
      if (formattedData.length === 0) {
        setError("No data found.");
        return;
      }

      // Assign latest formatted row to setLatestData variable
      setLatestData(formattedData[formattedData.length - 1]);

      // Make a new list containing only the Temperature values from formattedData, then filter out any temperatures that aren’t valid numbers
      const temps = formattedData
        .map((d) => d.Temperature)
        .filter((t) => !isNaN(t));

      // If we have at least one temperature reading, record the highest temperature seen so far as TempHigh and the lowest as TempLow
      if (temps.length > 0) {
        setTempHigh(Math.max(...temps));
        setTempLow(Math.min(...temps));
      }

      // Assign formattedData to setChartData
      setChartData(formattedData);
    };

  // Initial fetch
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
            <Tile title="🕜 Time (EST)" value={`${latestData.Timestamp}`} />
            <Tile title="🌡️ Temperature" value={`${latestData.Temperature}°C`} />
            <Tile title="💧 Humidity" value={`${latestData.Humidity}%`} />
            <Tile title="🌬️ Pressure" value={`${latestData.Pressure} hPa (millibars)`} />
            <Tile title="🔋 Battery" value={`${latestData.Battery} V`} />
            <Tile title="📈 Daily High" value={`${tempHigh}°C`} />
            <Tile title="📉 Daily Low" value={`${tempLow}°C`} />
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
