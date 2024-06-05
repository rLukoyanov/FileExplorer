import React, { useState, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import axios from "axios";
import {
  Folder as FolderIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  ListItemButton,
  Box,
  Typography,
} from "@mui/material";
import { ContextMenu, MenuItem as ContextMenuItem, ContextMenuTrigger } from "react-contextmenu";

export const FileExplorer = () => {
  const [currentPath, setCurrentPath] = useState("../");
  const [directories, setDirectories] = useState([]);
  const [active, setActive] = useState(null);
  const [regularFiles, setRegularFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState("folder");
  const [ws, setWs] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [showFileContentModal, setShowFileContentModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFileContent, setSelectedFileContent] = useState("");
  const [contextMenuTarget, setContextMenuTarget] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [copiedItem, setCopiedItem] = useState(null);
  const [cutItem, setCutItem] = useState(null);


  useEffect(() => {
    fetchFiles(currentPath);
    setupWebSocket();
  }, [currentPath]);

  const fetchFiles = async (path) => {
    try {
      const response = await axios.get(
          `http://localhost:4000/files?path=${path}`
      );
      setDirectories(response.data.directories);
      setRegularFiles(response.data.regularFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleFolderClick = (folderName) => {
    setActive(folderName);
    setNewItemName(folderName);
  };

  const handleFolderDoubleClick = (folderName) => {
    setCurrentPath(`${currentPath}/${folderName}`);
  };

  const handleFolderFocus = (folderName) => {
    setActive(folderName);
  };

  const handleGoBack = () => {
    const newPath = currentPath.split("/").slice(0, -1).join("/");
    setCurrentPath(newPath || "../");
  };

  const setupWebSocket = () => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("WebSocket connected");
      setWs(ws);
    };

    ws.onmessage = (event) => {
      const message = JSON.stringify(event.data);
      console.log("Received message:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };
  };

  const handleCreateButtonClick = () => {
    setShowCreateModal(true);
  };

  const handleRenameButtonClick = () => {
    setShowRenameModal(true);
  };

  const handleCreate = async () => {
    try {
      await axios.post(`http://localhost:4000/create`, {
        path: currentPath,
        name: newItemName,
        type: newItemType,
      });
      fetchFiles(currentPath);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating item:", error);
    }
  };

  const handleRename = async () => {
    try {
      await axios.put(`http://localhost:4000/rename`, {
        path: `${currentPath}/${active}`,
        newName: newItemName,
      });
      fetchFiles(currentPath);
      setShowRenameModal(false);
    } catch (error) {
      console.error("Error renaming item:", error);
    }
  };

  const handleDelete = async (target) => {
    try {
      await axios.delete(`http://localhost:4000/delete`, {
        data: { path: target },
      });
      fetchFiles(currentPath);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handlePaste = async () => {
    try {
      if (copiedItem) {
        // Обработка вставки скопированного элемента
        await axios.post(`http://localhost:4000/copy`, {
          source: copiedItem,
          destination: currentPath,
        });
        fetchFiles(currentPath);
        setCopiedItem(null); // Сбрасываем скопированный элемент
      } else if (cutItem) {
        // Обработка вставки вырезанного элемента
        await axios.post(`http://localhost:4000/move`, {
          source: cutItem,
          destination: currentPath,
        });
        fetchFiles(currentPath);
        setCutItem(null); // Сбрасываем вырезанный элемент
      }
    } catch (error) {
      console.error("Error pasting item:", error);
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    console.log("Dropped files:", files);

    const formData = new FormData();
    formData.append("path", currentPath);
    files.forEach((file) => formData.append("files", file));

    try {
      await axios.post("http://localhost:4000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      fetchFiles(currentPath);
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const fetchFileContent = async (filePath) => {
    try {
      const response = await axios.get('http://localhost:4000/file', {
        params: {
          path: filePath,
        },
      });
      const fileContent = response.data;
      console.log('File content:', fileContent);
      return fileContent;
    } catch (error) {
      console.error('Error fetching file content:', error);
      return null;
    }
  };

  const handleFileDoubleClick = async (fileName) => {
    const filePath = `${currentPath}/${fileName}`;
    handleOpenFile(filePath);
  };

  const handleOpenFile = async (filePath) => {
    try {
      const response = await axios.get('http://localhost:4000/open-file', {
        params: { path: filePath },
      });
      setSelectedFileContent(response.data);
      setShowFileContentModal(true);
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

  const extractFileName = (filePath) => {
    const parts = filePath.split("/");
    return parts[parts.length - 1];
  };

  const handleCloseFileContentModal = () => {
    setShowFileContentModal(false);
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/search?query=${searchQuery}`);
      setSearchResults(response.data.searchResults);
    } catch (error) {
      console.error("Error searching files:", error);
    }
  };

  const fetchFileInfo = async (filePath) => {
    try {
      const response = await axios.get('http://localhost:4000/info', {
        params: {
          path: filePath,
        },
      });
      setFileInfo(response.data);
    } catch (error) {
      console.error('Error fetching file info:', error);
      setFileInfo(null);
    }
  };

  const handleCopy = (target) => {
    setCopiedItem(target);
  };

// Функция для вырезания элемента
  const handleCut = (target) => {
    setCutItem(target);
  };

  const handleContextMenu = (event, data) => {
    const { action, target } = data;
    setContextMenuTarget(target);
    if (action === 'open') {
      handleOpenFile(target);
    } else if (action === 'info') {
      fetchFileInfo(target); // Вызов функции для получения информации о файле
    } else if (action === 'delete') {
      handleDelete(target);
    } else if (action === 'copy') {
      handleCopy(target); // Вызываем функцию копирования
    } else if (action === 'cut') {
      handleCut(target); // Вызываем функцию вырезания
    } else if (action === 'paste') {
      handlePaste(); // Вызываем функцию вставки
    }
  };


  useHotkeys("ctrl+n", handleCreateButtonClick); // Ctrl + N для создания
  useHotkeys("ctrl+d", handleDelete); // Ctrl + D для удаления
  useHotkeys("ctrl+r", handleRenameButtonClick); // Ctrl + R для переименования
  useHotkeys("ctrl+shift+r", () => fetchFiles(currentPath)); // Ctrl + Shift + R для обновления

  return (
      <Box sx={{ padding: "16px" }}>
        <Button onClick={handleGoBack}>
          <ArrowBackIcon /> Back
        </Button>
        <Button onClick={handleCreateButtonClick}>
          Create
        </Button>
        <Button onClick={() => handleDelete(`${currentPath}/${active}`)}>
          <DeleteIcon /> Delete
        </Button>
        <Button onClick={handleRenameButtonClick}>
          <EditIcon /> Rename
        </Button>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <TextField
              label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ marginRight: "8px" }}
          />
          <Button onClick={handleSearch}>
            <SearchIcon /> Search
          </Button>
        </Box>
        {searchResults.length > 0 && (
            <Box>
              <h2>Search Results:</h2>
              <ul>
                {searchResults.map((result, index) => (
                    <li key={index}>
                      <Button
                          onClick={() => handleOpenFile(result)}
                      >
                        {extractFileName(result)}
                      </Button>
                    </li>
                ))}
              </ul>
            </Box>
        )}
        <Box sx={{ display: "flex", gap: "48px" }}>
          <Box>
            <h2>Directories:</h2>
            <ul>
              {directories?.map((directory, index) => (
                  <ContextMenuTrigger id={`contextmenu-directory-${index}`} key={index}>
                    <ListItemButton
                        sx={{
                          border: active === directory ? "1px solid black" : "",
                        }}
                        onClick={() => handleFolderClick(directory)}
                        onDoubleClick={() => handleFolderDoubleClick(directory)}
                        onFocus={() => handleFolderFocus(directory)}
                    >
                      <FolderIcon /> {directory}
                    </ListItemButton>
                  </ContextMenuTrigger>
              ))}
            </ul>
          </Box>
          <Box>
            <h2>Files:</h2>
            <ul onDragOver={handleDragOver} onDrop={handleDrop}>
              {regularFiles?.map((file, index) => (
                  <ContextMenuTrigger id={`contextmenu-file-${index}`} key={index}>
                    <ListItemButton
                        onDoubleClick={() => handleFileDoubleClick(file)}
                    >
                      {file}
                    </ListItemButton>
                  </ContextMenuTrigger>
              ))}
            </ul>
          </Box>
        </Box>

        <h2>Messages:</h2>
        <ul>
          {messages?.map((message, index) => (
              <li key={index}>{JSON.stringify(message)}</li>
          ))}
        </ul>

        <Dialog
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
        >
          <DialogTitle>Create New Item</DialogTitle>
          <DialogContent>
            <TextField
                label="Name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
            />
            <Select
                value={newItemType}
                onChange={(e) => setNewItemType(e.target.value)}
            >
              <MenuItem value="folder">Folder</MenuItem>
              <MenuItem value="file">File</MenuItem>
            </Select>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCreate}>Create</Button>
            <Button onClick={() => setShowCreateModal(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
        <Dialog
            open={showRenameModal}
            onClose={() => setShowRenameModal(false)}
        >
          <DialogTitle>Rename Item</DialogTitle>
          <DialogContent>
            <TextField
                label="New Name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleRename}>Rename</Button>
            <Button onClick={() => setShowRenameModal(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
        <Dialog
            open={showFileContentModal}
            onClose={handleCloseFileContentModal}
        >
          <DialogTitle>File Content</DialogTitle>
          <DialogContent>
            <pre>{typeof selectedFileContent === 'object' ? JSON.stringify(selectedFileContent, null, 2) : selectedFileContent}</pre>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseFileContentModal}>Close</Button>
          </DialogActions>
        </Dialog>

        {directories.map((directory, index) => (
            <ContextMenu id={`contextmenu-directory-${index}`} key={`contextmenu-directory-${index}`}>
              <ContextMenuItem onClick={(e) => handleContextMenu(e, { action: 'open', target: `${currentPath}/${directory}` })}>Open</ContextMenuItem>
              <ContextMenuItem onClick={(e) => handleContextMenu(e, { action: 'info', target: `${currentPath}/${directory}` })}>Info</ContextMenuItem>
              <ContextMenuItem onClick={(e) => handleContextMenu(e, { action: 'copy', target: `${currentPath}/${directory}` })}>Copy</ContextMenuItem>
              <ContextMenuItem onClick={(e) => handleContextMenu(e, { action: 'cut', target: `${currentPath}/${directory}` })}>Cut</ContextMenuItem>
              <ContextMenuItem onClick={(e) => handleContextMenu(e, { action: 'paste', target: `${currentPath}/${directory}` })}>Paste</ContextMenuItem>
              <ContextMenuItem onClick={(e) => handleContextMenu(e, { action: 'delete', target: `${currentPath}/${directory}` })}>Delete</ContextMenuItem>
            </ContextMenu>
        ))}

        {regularFiles.map((file, index) => (
            <ContextMenu id={`contextmenu-file-${index}`} key={`contextmenu-file-${index}`}>
              <ContextMenuItem onClick={(e) => handleContextMenu(e, { action: 'open', target: `${currentPath}/${file}` })}>Open</ContextMenuItem>
              <ContextMenuItem onClick={(e) => handleContextMenu(e, { action: 'info', target: `${currentPath}/${file}` })}>Info</ContextMenuItem>
              <ContextMenuItem onClick={(e) => handleContextMenu(e, { action: 'copy', target: `${currentPath}/${file}` })}>Copy</ContextMenuItem>
              <ContextMenuItem onClick={(e) => handleContextMenu(e, { action: 'cut', target: `${currentPath}/${file}` })}>Cut</ContextMenuItem>
              <ContextMenuItem onClick={(e) => handleContextMenu(e, { action: 'paste', target: `${currentPath}/${file}` })}>Paste</ContextMenuItem>
              <ContextMenuItem onClick={(e) => handleContextMenu(e, { action: 'delete', target: `${currentPath}/${file}` })}>Delete</ContextMenuItem>
            </ContextMenu>
        ))}
        <Dialog
            open={Boolean(fileInfo)}
            onClose={() => setFileInfo(null)}
        >
          <DialogTitle>File Information</DialogTitle>
          <DialogContent>
            {fileInfo && (
                <div>
                  <Typography variant="body1">createdAt: {fileInfo.createdAt}</Typography>
                  <Typography variant="body1">Size: {fileInfo.size}</Typography>
                  <Typography variant="body1">atime: {fileInfo.atime}</Typography>
                  <Typography variant="body1">Last Modified: {fileInfo.mtime}</Typography>
                  {/* Дополнительная информация о файле может быть добавлена здесь */}
                </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFileInfo(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};
