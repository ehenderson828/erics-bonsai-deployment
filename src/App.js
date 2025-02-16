import React, { useState, useEffect } from "react";
import Papa from "papaparse";

const csvFilePath = "/sensor_data_2025-02-16_13.csv";

function App() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(csvFilePath, {"mode":"no-cors"})
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then((text) => {
        console.log("Raw CSV Data:", text); // Debugging log
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            console.log("Parsed CSV Data:", result.data); // Debugging log
            if (result.data.length === 0) {
              setError("CSV file is empty or not formatted correctly.");
            }
            setData(result.data);
          },
          error: (parseError) => {
            setError("Error parsing CSV: " + parseError.message);
          },
        });
      })
      .catch((fetchError) => {
        console.error("Error loading CSV file:", fetchError);
        setError("Failed to load CSV file. Check console for details.");
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Bonsai Sensor Monitor</h1>

      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : data.length === 0 ? (
        <p>Loading data or no data available...</p>
      ) : (
        <table border="1" cellPadding="5" cellSpacing="0">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Temperature (°C)</th>
              <th>Humidity (%)</th>
              <th>Pressure (Pa)</th>
              <th>Battery (V)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td>{row.Timestamp || "N/A"}</td>
                <td>{row["Temperature (°C)"] || "N/A"}</td>
                <td>{row["Relative Humidity (%)"] || "N/A"}</td>
                <td>{row["Barometric Pressure (Pa)"] || "N/A"}</td>
                <td>{row["Battery Voltage (mV)"] || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
