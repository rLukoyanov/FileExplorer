// src/CreateProcessForm.js
import React, { useState } from 'react';
import axios from "axios";

export const CreateProcessForm = () => {
    const [pid, setPid] = useState('');
    const [response, setResponse] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        window.open('http://localhost:9000', '_blank', );
        try {
            const result = await axios.post(`http://localhost:4000/create-process`, {pid});
            setResponse(result);
        } catch (error) {
            console.error('Error creating process:', error);
            setResponse({ error: 'Failed to create process' });
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>
                    PID:
                    <input
                        type="text"
                        value={pid}
                        onChange={(e) => setPid(e.target.value)}
                    />
                </label>
                <button type="submit">Create Process</button>
            </form>
            {response && (
                <div>
                    <h3>Response:</h3>
                    <pre>{JSON.stringify(response, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};
