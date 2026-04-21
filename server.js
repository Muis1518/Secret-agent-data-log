const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const port = process.env.PORT || 3000;

const dataDir = path.join(__dirname, "data");
const uploadsDir = path.join(__dirname, "uploads");
const dbPath = path.join(dataDir, "leaks.db");

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

let db;
const sseClients = new Set();

function notifyDataChanged() {
  sseClients.forEach(client => {
    client.write("event: data-changed\n");
    client.write("data: update\n\n");
  });
}

async function initDatabase() {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS leaks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slachtoffer TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      image_path TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function removeUploadedFiles() {
  const fileNames = await fsp.readdir(uploadsDir);
  await Promise.all(
    fileNames.map(fileName => fsp.rm(path.join(uploadsDir, fileName), { force: true }))
  );
}

app.use("/uploads", express.static(uploadsDir));
app.use(express.static(__dirname));

app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  res.write("retry: 5000\n\n");
  sseClients.add(res);

  const heartbeat = setInterval(() => {
    res.write(": keep-alive\n\n");
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

app.get("/api/leaks", async (_req, res) => {
  try {
    const rows = await db.all(
      "SELECT id, slachtoffer, description, date, image_path FROM leaks ORDER BY date DESC, id DESC"
    );

    const leaks = rows.map(row => ({
      id: row.id,
      slachtoffer: row.slachtoffer,
      description: row.description,
      date: row.date,
      image_url: `/uploads/${row.image_path}`
    }));

    res.json({ leaks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Kon leaks niet ophalen." });
  }
});

app.post("/api/leaks", upload.single("photo"), async (req, res) => {
  try {
    const { slachtoffer, description, date } = req.body;

    if (!slachtoffer || !description || !date) {
      if (req.file) {
        await fsp.rm(req.file.path, { force: true });
      }
      return res.status(400).json({ error: "Alle velden zijn verplicht." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Foto is verplicht." });
    }

    const result = await db.run(
      "INSERT INTO leaks (slachtoffer, description, date, image_path) VALUES (?, ?, ?, ?)",
      [slachtoffer.trim(), description.trim(), date, req.file.filename]
    );

    notifyDataChanged();
    res.status(201).json({ id: result.lastID });
  } catch (error) {
    console.error(error);
    if (req.file) {
      await fsp.rm(req.file.path, { force: true }).catch(() => {});
    }
    res.status(500).json({ error: "Kon leak niet opslaan." });
  }
});

app.delete("/api/leaks", async (_req, res) => {
  try {
    await db.run("DELETE FROM leaks");
    await removeUploadedFiles();
    notifyDataChanged();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Kon data niet resetten." });
  }
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

initDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Secret-agent-data-log draait op poort ${port}`);
    });
  })
  .catch(error => {
    console.error("Fout bij starten van de server", error);
    process.exit(1);
  });
