// src/ProcessTable.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
} from '@mui/material';

export const ProcessList = () => {
    const [processes, setProcesses] = useState([]);
    const [processesMask, setProcessesMask] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProcesses = async () => {
            try {
                const response = await axios.get('http://localhost:4000/processes');
                const responseMask = await axios.get('http://localhost:4000/processesMask');
                setProcesses(response.data);
                setProcessesMask(responseMask.data);
            } catch (error) {
                console.error('Error fetching processes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProcesses();
    }, []);

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>PID</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {processes.map((process) => (
                        <TableRow key={process.pid}>
                            <TableCell>{process}</TableCell>
                        </TableRow>
                    ))}
                    {processesMask.map((process) => (
                        <TableRow key={process.pid}>
                            <TableCell>{process}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
