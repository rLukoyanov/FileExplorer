import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import axios from "axios";
import {About} from "./About";
import {useHotkeys} from "react-hotkeys-hook";
import {ProcessList} from "./ProcessList";

function Header() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openProcess, setOpenProcess] = useState(false);
    const [selectedTool, setSelectedTool] = useState(null);

    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
        handleClose(); // Close menu when opening dialog
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };


    const handleCloseProcess = () => {
        setOpenProcess(false);
    };

    const handleToolClick = async (tool) => {
        setSelectedTool(tool);
        handleClose();
        // Здесь вызываем API функцию execute, передавая выбранную утилиту
        try {
            const response = await axios.post("http://localhost:4000/execute", {
                command: tool,
            });
        } catch (error) {
            console.error("Error executing tool:", error);
        }
    };

    useHotkeys("ctrl+H", () => handleOpenDialog()); // Ctrl + Shift + R для обновления

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Button
                        id="basic-button"
                        aria-controls={open ? "basic-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? "true" : undefined}
                        onClick={handleClick}
                        sx={{ color: "#fff" }}
                    >
                        Утилиты
                    </Button>
                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                            "aria-labelledby": "basic-button",
                        }}
                    >
                        <MenuItem onClick={() => handleToolClick("terminal")}>Терминал</MenuItem>
                        <MenuItem onClick={() => handleToolClick("system_monitor")}>Мониторинг системы</MenuItem>
                        <MenuItem onClick={() => handleToolClick("calendar")}>Календарь</MenuItem>
                        <MenuItem onClick={() => setOpenProcess(true)}>Процессы</MenuItem>
                    </Menu>
                    <Button onClick={handleOpenDialog} sx={{ color: "#fff" }}>
                        О приложении
                    </Button>
                </Toolbar>
            </AppBar>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>О приложении</DialogTitle>
                <DialogContent>
                </DialogContent>
                    <About />
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Закрыть</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openProcess} onClose={handleCloseProcess} >
                <ProcessList />
                <DialogActions>
                    <Button onClick={handleCloseProcess}>Закрыть</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Header;
