import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [logs, setLogs] = useState([]);
  const [file, setFile] = useState(null);
  const [autofillData, setAutofillData] = useState(null);

  const [name, setName] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [service, setService] = useState("");

  const log = (msg) => {
    setLogs((prev) => [...prev, msg]);
  };

  useEffect(() => {
    socket.on("connect", () => log("🔌 Connected"));

    socket.on("status", (msg) => log(msg));

    socket.on("autofill-data", (data) => {
      log("🤖 Data received");
      setAutofillData(data);

      // autofill form
      setName(data.name || "");
      setAadhaar(data.aadhaar || "");
      setService(data.service || "");
    });

    socket.on("automation-status", (msg) => {
      log("🌐 " + msg);
    });

    socket.on("error", (msg) => {
      log("❌ " + msg);
    });

    return () => {
      socket.off();
    };
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      log("📄 File selected: " + f.name);
    }
  };

  const startAgent = async () => {
    if (!file) {
      log("❌ Upload file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    log("🚀 Uploading...");

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      log("📄 Uploaded: " + result.filename);

      socket.emit("upload-pdf");
    } catch (err) {
      log("❌ Upload failed");
    }
  };

  const startAutomation = () => {
    log("🚀 Starting automation...");

    socket.emit("start-automation", {
      name,
      aadhaar,
      service,
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>🤖 Gov Agent</h2>

        {/* File Upload */}
        <input type="file" onChange={handleFileChange} style={styles.input} />

        <button onClick={startAgent} style={styles.button}>
          Upload & Extract
        </button>

        {/* Logs */}
        <div style={styles.logs}>
          <h4>Logs</h4>
          {logs.length === 0 ? (
            <p>No activity...</p>
          ) : (
            logs.map((l, i) => <div key={i}>{l}</div>)
          )}
        </div>

        {/* Parsed Data */}
        {autofillData && (
          <div style={styles.section}>
            <h4>Parsed Data</h4>
            <p><b>Name:</b> {autofillData.name}</p>
            <p><b>Aadhaar:</b> {autofillData.aadhaar}</p>
            <p><b>Service:</b> {autofillData.service}</p>
          </div>
        )}

        {/* Auto Fill Form */}
        <div style={styles.section}>
          <h4>Auto Fill Form</h4>

          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />

          <input
            placeholder="Aadhaar"
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value)}
            style={styles.input}
          />

          <input
            placeholder="Service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            style={styles.input}
          />

          <button onClick={startAutomation} style={styles.button}>
            🚀 Auto Fill Website
          </button>
        </div>
      </div>
    </div>
  );
}

/* 🎨 Styles */
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
  },
  card: {
    width: "420px",
    padding: "25px",
    borderRadius: "15px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    color: "#fff",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "none",
  },
  button: {
    width: "100%",
    padding: "12px",
    marginTop: "15px",
    borderRadius: "8px",
    border: "none",
    background: "#00c6ff",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  logs: {
    marginTop: "20px",
    background: "rgba(0,0,0,0.3)",
    padding: "10px",
    borderRadius: "8px",
    maxHeight: "150px",
    overflowY: "auto",
    fontSize: "12px",
  },
  section: {
    marginTop: "20px",
    padding: "10px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "8px",
  },
};

export default App;


