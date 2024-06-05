const express = require("express");
const fs = require("fs");
const WebSocket = require("ws");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 4000;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
app.use(express.json());
app.use(cors());

// Обработчик GET запроса для получения файлов и директорий
app.get("/files", (req, res) => {
  const { path: targetPath } = req.query;
  const directoryPath = path.join(__dirname, targetPath);

  try {
    const files = fs.readdirSync(directoryPath);
    const directories = files.filter((file) =>
      fs.statSync(path.join(directoryPath, file)).isDirectory()
    );
    const regularFiles = files.filter((file) => !directories.includes(file));
    res.json({ directories, regularFiles });
  } catch (error) {
    console.error("Error reading directory:", error);
    res.status(500).json({ error: "Failed to read directory" });
  }
});

// Обработчик POST запроса для создания файла или директории
app.post("/create", (req, res) => {
  const { path: targetPath, name, type } = req.body;
  const itemPath = path.join(__dirname, targetPath, name);

  // Проверка, не пытаемся ли создать или изменить файл в папке "system"
  if (itemPath.toLowerCase().includes("system")) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    if (type === "folder") {
      fs.mkdirSync(itemPath);
    } else {
      fs.writeFileSync(itemPath, "");
    }
    res.sendStatus(201);
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ error: "Failed to create item" });
  }
});

// Обработчик DELETE запроса для удаления файла или директории
app.delete("/delete", (req, res) => {
  const { path: targetPath } = req.body;
  const itemPath = path.join(__dirname, targetPath);

  // Проверка, не пытаемся ли удалить файл или папку из папки "system"
  if (itemPath.toLowerCase().includes("system")) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    if (fs.existsSync(itemPath)) {
      if (fs.statSync(itemPath).isDirectory()) {
        fs.rmdirSync(itemPath, { recursive: true });
      } else {
        fs.unlinkSync(itemPath);
      }
    }
    res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Failed to delete item" });
  }
});


const sendMessageToClients = (message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

// WebSocket для обмена сообщениями
wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log("Received message from client:", message);
    sendMessageToClients({ text: `Получено сообщение ${message}` });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
