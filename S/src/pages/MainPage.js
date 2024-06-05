import React from 'react';
import Header from "../Components/Header";
import {FileExplorer} from "../Components/FileExplorer";
import {Terminal} from "@mui/icons-material";
import {ProcessList} from "../Components/ProcessList";
import {CreateProcessForm} from "../Components/CreateProcessForm";

export const MainPage = () => {
    return (
        <div>
            <Header />
            <FileExplorer />
            <Terminal />
            <ProcessList />
           <CreateProcessForm />
        </div>
    );
};
