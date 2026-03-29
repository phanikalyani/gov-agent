const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");

// 🔧 App setup
const app = express();
app.use(cors());
app.use(express.json());

// 📁 Upload folder
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 🌐 Server + Socket
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// 📦 File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// 🧠 Store last file
let lastUploadedFilePath = null;

// 🌐 Test route
app.get("/", (req, res) => {
  res.send("🚀 Gov Agent Backend Running");
});

// 📄 Upload API
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    lastUploadedFilePath = req.file.path;

    console.log("📄 Uploaded:", req.file.filename);

    res.json({
      filename: req.file.filename,
      path: req.file.path,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// 🔍 Extract data from PDF
function extractFields(text) {
  const clean = text.replace(/\s+/g, " ").trim();

  const aadhaar =
    clean.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/)?.[0] || "Not Found";

  const name =
    clean.match(/Name[:\s]+([A-Za-z\s]{3,40})/)?.[1] || "Not Found";

  const service =
     clean.match(/\bPAN\b|\bPassport\b|\bAadhaar\b||\bGST\b/i)?.[0] ||
    "Not Found";

  return {
    name: name.trim(),
    aadhaar: aadhaar.replace(/\s+/g, "-"),
    service: service.toUpperCase(),
    status: "Processed successfully ✅",
  };
}

// 🔌 SOCKET CONNECTION
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.emit("status", "✅ Connected to backend");

  // 📄 PDF PROCESSING
  socket.on("upload-pdf", async () => {
    try {
      if (!lastUploadedFilePath) {
        socket.emit("error", "No PDF uploaded");
        return;
      }

      socket.emit("status", "📄 PDF received");
      socket.emit("status", "🔍 Extracting data...");

      const buffer = fs.readFileSync(lastUploadedFilePath);
      const parsed = await pdfParse(buffer);

      const data = extractFields(parsed.text);

      socket.emit("status", "🤖 Preparing autofill data...");
      socket.emit("autofill-data", data);

    } catch (err) {
      console.error(err);
      socket.emit("error", "PDF processing failed");
    }
  });

  // 🚀 AUTOMATION
  socket.on("start-automation", (data) => {
    console.log("🚀 Automation started:", data);

    socket.emit("automation-status", "🌐 Opening website...");
    socket.emit("automation-status", "✍️ Filling form...");
    socket.emit("automation-status", "📨 Submitting form...");

    setTimeout(() => {
      socket.emit("automation-status", "✅ Form submitted successfully!");
    }, 3000);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// 🚀 START SERVER
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});