const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const cors = require("cors");
const WebSocket = require("ws");
const multer = require("multer");
const { exec } = require("child_process");
const usbDetect = require("usb-detection");

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(cors());

const TRASH_DIRECTORY = path.join(__dirname, "../trash");

// Создаем директорию "trash", если она не существует
if (!fs.existsSync(TRASH_DIRECTORY)) {
  fs.mkdirSync(TRASH_DIRECTORY);
}

const upload = multer({
  dest: "uploads/", // Specify the destination directory for uploaded files
});

// Генерация имени файла для сохранения сообщений WebSocket
const messagesFileName = path.join(__dirname, `messages_${Date.now()}.txt`);

// Создание нового файла для записи сообщений
fs.writeFileSync(messagesFileName, "WebSocket Messages Log\n\n");

usbDetect.on("add", async (device) => {
  console.log("USB device connected:", device);

  // Проверяем, является ли устройство USB накопителем
  if (device.deviceName.includes("USB")) {
    // Получаем список файлов и папок на USB накопителе
    const usbPath = device.mountpoints[0].path;
    const files = await getFiles(usbPath);
    console.log("Files on USB device:", files);
    // Далее вы можете отправить полученный список куда-либо или использовать по своему усмотрению
  }
});

// Обработчик отключения USB устройства
usbDetect.on("remove", (device) => {
  console.log("USB device removed:", device);
});

// Функция для получения списка файлов и папок на указанном пути
const getFiles = async (filePath) => {
  try {
    return await fs.promises.readdir(filePath);
  } catch (error) {
    console.error("Error reading directory:", error);
    return [];
  }
};

app.get('/file', async (req, res) => {
  try {
    const filePath = req.query.path; // Получаем путь к файлу из запроса

    exec(`cd ${__dirname} && cd ../ && xdg-open "${filePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error("Error executing command:", error);
        res.status(500).json({ error: "Failed to execute command" });
      } else {
        console.log("Command executed successfully");
        res.json({ stdout, stderr });
      }
    });

  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).send('Error reading file');
  }
});

// Создание очереди сообщений
const messageQueue = [];

// Создание WebSocket сервера
const wsServer = new WebSocket.Server({ port: 8080 });

// Функция для записи сообщений в файл
const logMessageToFile = (message) => {
  fs.appendFile(messagesFileName, `${new Date().toISOString()} - ${message}\n`, (err) => {
    if (err) {
      console.error("Error writing message to file:", err);
    }
  });
};

// Обработчик подключения к WebSocket серверу
wsServer.on("connection", (ws) => {
  console.log("Client connected to WebSocket");

  // Отправка сообщений из очереди WebSocket клиенту
  while (messageQueue.length > 0) {
    const message = messageQueue.shift();
    ws.send(message);
  }
});

// Добавление сообщения в очередь
const addMessageToQueue = (message) => {
  messageQueue.push(message);

  // Запись сообщения в файл
  logMessageToFile(message);

  // Отправка сообщения через WebSocket клиентам
  wsServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

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

app.put("/rename", (req, res) => {
  const { path: targetPath, newName } = req.body;
  const itemPath = path.join(__dirname, targetPath);
  const newPath = path.join(__dirname, path.dirname(targetPath), newName);

  // Проверка, не пытаемся ли изменить элемент в папке "system"
  if (itemPath.toLowerCase().includes("system")) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    fs.renameSync(itemPath, newPath);
    res.sendStatus(200);

    // Добавление сообщения об успешном изменении имени элемента в очередь
    const message = `Папка '${targetPath}' изменина на '${newName}' успешно`;
    addMessageToQueue(message);
    res.json({ message });
  } catch (error) {
    console.error("Ошибка при переименовании", error);
    res.status(500).json({ error: "Failed to rename item" });
  }
});

// Обработчик POST запроса для создания файла или директории
app.post("/create", (req, res) => {
  const { path: targetPath, name, type } = req.body;
  const itemPath = path.join(__dirname, targetPath, name);

  // Проверка, не пытаемся ли создать или изменить файл в папке "system"
  if (itemPath.toLowerCase().includes("system")) {
    return res.status(403).json({ error: "Отказано в доступе" });
  }

  try {
    if (type === "folder") {
      fs.mkdirSync(itemPath);
    } else {
      fs.writeFileSync(itemPath, "");
    }
    res.sendStatus(201);

    // Добавление сообщения об успешном создании элемента в очередь
    const message = `'${name}' Создан`;
    addMessageToQueue(message);
    res.json({ message });
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ error: "Failed to create item" });
  }
});

app.get("/search", (req, res) => {
  const { query } = req.query;

  // Функция для рекурсивного поиска файлов
  const searchFiles = (dir, query, fileList = []) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        // Проверяем, не является ли текущая директория папкой "system"
        if (file.toLowerCase() !== "system") {
          searchFiles(filePath, query, fileList);
        }
      } else {
        if (file.toLowerCase().includes(query.toLowerCase())) {
          fileList.push(filePath);
        }
      }
    });
    return fileList;
  };

  // Начинаем поиск с корневого каталога
  const searchResults = searchFiles("../", query);
  res.json({ searchResults });
});

app.post('/execute', (req, res) => {
  const { command, args } = req.body;

  let shellCommand;
  switch (command) {
    case 'setCpuAffinity':
      if (!args || !args.pid || !args.cores) {
        return res.status(400).json({ error: 'Missing pid or cores' });
      }
      shellCommand = `taskset -cp ${args.cores.join(',')} ${args.pid}`;
      exec(shellCommand, (error, stdout, stderr) => {
        handleExecResponse(res, error, stdout, stderr);
      });
      break;
    case 'getCpuAffinity':
      if (!args || !args.pid) {
        return res.status(400).json({ error: 'Missing pid' });
      }
      shellCommand = `taskset -cp ${args.pid}`;
      exec(shellCommand, (error, stdout, stderr) => {
        handleExecResponse(res, error, stdout, stderr);
      });
      break;
    case 'listFiles':
      shellCommand = 'ls';
      exec(shellCommand, (error, stdout, stderr) => {
        handleExecResponse(res, error, stdout, stderr);
      });
      break;
    case 'currentDirectory':
      shellCommand = 'pwd';
      exec(shellCommand, (error, stdout, stderr) => {
        handleExecResponse(res, error, stdout, stderr);
      });
      break;
    case 'systemUptime':
      shellCommand = 'uptime';
      exec(shellCommand, (error, stdout, stderr) => {
        handleExecResponse(res, error, stdout, stderr);
      });
      break;
    case 'createFile':
      if (!args || !args.filename) {
        return res.status(400).json({ error: 'Missing filename' });
      }
      fs.writeFile(args.filename, args.content || '', (err) => {
        if (err) {
          console.error('Error creating file:', err);
          return res.status(500).json({ error: 'Failed to create file' });
        }
        res.json({ message: 'File created successfully' });
      });
      break;
    case 'deleteFile':
      if (!args || !args.filename) {
        return res.status(400).json({ error: 'Missing filename' });
      }
      fs.unlink(args.filename, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
          return res.status(500).json({ error: 'Failed to delete file' });
        }
        res.json({ message: 'File deleted successfully' });
      });
      break;
    case 'readFile':
      if (!args || !args.filename) {
        return res.status(400).json({ error: 'Missing filename' });
      }
      fs.readFile(args.filename, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          return res.status(500).json({ error: 'Failed to read file' });
        }
        res.json({ content: data });
      });
      break;
    case 'writeFile':
      if (!args || !args.filename || !args.content) {
        return res.status(400).json({ error: 'Missing filename or content' });
      }
      fs.writeFile(args.filename, args.content, (err) => {
        if (err) {
          console.error('Error writing to file:', err);
          return res.status(500).json({ error: 'Failed to write to file' });
        }
        res.json({ message: 'File written successfully' });
      });
      break;
    default:
      res.status(400).json({ error: 'Unknown command' });
  }
});

function handleExecResponse(res, error, stdout, stderr) {
  if (error) {
    console.error('Error executing command:', error);
    res.status(500).json({ error: 'Failed to execute command' });
  } else {
    res.json({ stdout, stderr });
  }
}
//
// app.post("/execute", (req, res) => {
//   const { command } = req.body;
//
//   exec(command, (error, stdout, stderr) => {
//     if (error) {
//       console.error("Error executing command:", error);
//       res.status(500).json({ error: "Failed to execute command" });
//     } else {
//       console.log("Command executed successfully");
//       res.json({ stdout, stderr });
//     }
//   });
// });

app.post("/upload", upload.array("files"), (req, res) => {
  const { path: targetPath } = req.body;
  const files = req.files;

  try {
    // Move uploaded files to the target directory
    files.forEach((file) => {
      const filePath = path.join(targetPath, file.originalname);
      fs.renameSync(file.path, filePath);
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ error: "Failed to upload files" });
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
      // Проверяем, является ли элемент файлом или директорией
      const isDirectory = fs.statSync(itemPath).isDirectory();

      // Если элемент удаляется из папки "trash", удаляем его окончательно с компьютера
      if (itemPath.includes("/trash/")) {
        fs.removeSync(itemPath); // Используем метод removeSync из пакета fs-extra для удаления
      } else {
        // Создаем уникальное имя файла для перемещения в "trash"
        const fileName = isDirectory ? path.basename(targetPath) : path.parse(targetPath).name;
        const ext = isDirectory ? "" : path.parse(targetPath).ext;
        let trashFilePath = path.join(TRASH_DIRECTORY, fileName + ext);

        // Проверяем, существует ли файл с таким именем в "trash"
        let count = 1;
        while (fs.existsSync(trashFilePath)) {
          trashFilePath = path.join(TRASH_DIRECTORY, `${fileName} (${count})${ext}`);
          count++;
        }

        // Перемещаем элемент в "trash"
        fs.renameSync(itemPath, trashFilePath);
      }
    }
    res.sendStatus(204);

    // Добавление сообщения об успешном удалении элемента в очередь
    const message = `'${targetPath}' Удален`;
    addMessageToQueue(message);
    res.json({ message });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

const getProcessInfo = (pid) => {
  return new Promise((resolve, reject) => {
    const command = `ps -p ${pid} -o pid,ppid,comm,etime,%cpu,%mem`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
};
function randomInteger(min, max) {
  // случайное число от min до (max+1)
  let rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}

app.get("/processes", async (req, res) => {
  const psListModule = await import('ps-list');
  const processes = await psListModule.default();

  // Замените "node" на имя вашего исполняемого файла или путь к нему
  const filteredProcesses = processes.filter(process => process.name === "node");

  try {
    const processDetailsPromises = filteredProcesses.map(async (process) => {
        return `${process.pid} ${randomInteger(1,5)}`
    })

    const processDetails = await Promise.all(processDetailsPromises);

    res.json(processDetails);
  } catch (error) {
    console.error("Error fetching processes:", error);
    res.status(500).json({ error: "Failed to fetch processes" });
  }
});

app.get("/processesMask", async (req, res) => {
  const psListModule = await import('ps-list');
  const processes = await psListModule.default();

  // Замените "node" на имя вашего исполняемого файла или путь к нему
  const filteredProcesses = processes.filter(process => process.name === "node");

  try {
    const processDetailsPromises = filteredProcesses.map(async (process) => {
      return `${process.pid} 0x${randomInteger(0,9)}${randomInteger(0,9)}${randomInteger(0,9)}`
    })

    const processDetails = await Promise.all(processDetailsPromises);

    res.json(processDetails);
  } catch (error) {
    console.error("Error fetching processes:", error);
    res.status(500).json({ error: "Failed to fetch processes" });
  }
});

app.post('/create-process', (req, res) => {
  const { pid } = req.body;

  if (!pid) {
    return res.status(400).json({ error: 'PID is required' });
  }

  res.json({ message: `Process created with PID: ${pid}`, stdout, stderr });
});

app.get('/soundcard', (req, res) => {
  exec('aplay -l', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).send('Internal Server Error');
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).send('Internal Server Error');
    }
    res.send(stdout);
  });
});

app.get('/set-affinity/:pid', (req, res) => {
  const pid = req.params.pid;
  const command = `taskset -p ${pid}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${command}`, error);
      res.status(500).send('Error: Unable to execute command');
      return;
    }

    // Extracting affinity information
    const affinityInfo = stdout.split(':')[1].trim();

    // Get number of CPUs/threads
    const numThreads = 1;

    const response = {
      affinityInfo,
      numThreads,
    };

    res.json(response);
  });
});

// Новая ручка для открытия любого файла
app.get('/open-file', async (req, res) => {
  const filePath = req.query.path;

  // Проверка наличия файла
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  try {
    const open = (await import('open')).default;
    await open(filePath);
    res.json({ message: "File opened successfully" });
  } catch (error) {
    console.error("Error opening file:", error);
    res.status(500).json({ error: "Failed to open file" });
  }
});

app.get("/info", (req, res) => {
  const filePath = req.query.path;

  // Проверка наличия файла
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  try {
    const stats = fs.statSync(filePath);
    const fileInfo = {
      name: stats.name,
      size: stats.size, // размер файла в байтах
      createdAt: stats.birthtime, // дата создания файла
      atime: stats.atime, // время последнего доступа к файлу
      mtime: stats.mtime, // время последнего изменения файла
    };
    res.json(fileInfo);
  } catch (error) {
    console.error("Error getting file info:", error);
    res.status(500).json({ error: "Failed to get file info" });
  }
});

app.post("/copy", (req, res) => {
  const { source, destination } = req.body;

  try {
    const sourceStat = fs.statSync(source);
    let destinationPath = path.join(destination, path.basename(source));

    // Проверяем, существует ли файл или папка с таким же именем в папке назначения
    if (fs.existsSync(destinationPath)) {
      // Если файл или папка с таким именем уже существует, генерируем уникальное имя
      const baseName = path.basename(source, path.extname(source));
      const extName = path.extname(source);
      let uniqueName = baseName;
      let count = 1;
      while (fs.existsSync(path.join(destination, uniqueName + extName))) {
        uniqueName = `${baseName} (${count})`;
        count++;
      }
      destinationPath = path.join(destination, uniqueName + extName);
    }

    // Копируем или перемещаем файл или папку
    if (sourceStat.isDirectory()) {
      // Если исходный элемент - папка, копируем ее со всем содержимым
      fs.copySync(source, destinationPath);
    } else {
      // Если исходный элемент - файл, копируем его
      fs.copyFileSync(source, destinationPath);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error pasting item:", error);
    res.status(500).json({ error: "Failed to paste item" });
  }
});

// Обработчик вырезания файла или папки
app.post("/cut", (req, res) => {
  const { source, destination } = req.body;

  try {
    // Перемещаем файл или папку
    fs.renameSync(source, path.join(destination, path.basename(source)));
    res.sendStatus(200);
  } catch (error) {
    console.error("Error moving item:", error);
    res.status(500).json({ error: "Failed to move item" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
