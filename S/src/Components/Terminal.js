import React, { useState } from "react";
import axios from "axios";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const TerminalContainer = styled(Paper)({
    width: "100%",
    height: "300px",
    padding: "10px",
    overflowY: "scroll",
    backgroundColor: "#212121",
    color: "#fff",
    fontFamily: "monospace",
    position: "relative",
});

const WhiteTextField = styled(TextField)({
    position: "absolute",
    bottom: 0,
    left: 0,
    "& .MuiInputBase-input": {
        color: "#fff", // Белый цвет текста внутри текстового поля
    },
    "& label": {
        color: "#fff",
    }
});

export const Terminal = () => {
    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");

    const executeCommand = async () => {
        try {
            const response = await axios.post("http://localhost:4000/execute", {
                command: command,
            });
            setOutput(response.data.stdout);
        } catch (error) {
            console.error("Error executing command:", error);
            setOutput("Failed to execute command");
        }
        setCommand("");
    };

    return (
        <div>
            <h2>Терминал</h2>
            <TerminalContainer>
                {output}
                <WhiteTextField
                    fullWidth
                    variant="standard"
                    label="Напишите команду"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            executeCommand();
                        }
                    }}
                />
            </TerminalContainer>
        </div>
    );
};
