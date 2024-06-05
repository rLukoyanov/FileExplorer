import React from "react";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Header from "./Components/Header";
import { FileExplorer } from "./Components/FileExplorer";
import { Terminal } from "./Components/Terminal";
import { CreateProcessForm } from "./Components/CreateProcessForm";

function App() {
    navigator.usb.getDevices().then((devices) => {
        console.log(`Total devices: ${devices.length}`);
        devices.forEach((device) => {
            console.log(
                `Product name: ${device.productName}, serial number ${device.serialNumber}`
            );
        });
    });


    return (
        <Router>

            <Routes>
                <Route path="/" element={<div>Информация об процессе</div>} />
                <Route path="/main_window" element={  <>
                    <Header />
                    <FileExplorer />
                    <Terminal />
                    <CreateProcessForm />
                </>}/>
            </Routes>

        </Router>
    );
}

export default App;
