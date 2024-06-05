import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SoundCardInfo = () => {
    const [soundCardData, setSoundCardData] = useState('');

    useEffect(() => {
        fetchSoundCardData();
    }, []);

    const fetchSoundCardData = async () => {
        try {
            const response = await axios.get('http://localhost:4000/soundcard');
            setSoundCardData(response.data);
        } catch (error) {
            console.error('Error fetching sound card data:', error);
        }
    };

    return (
        <div>
            <h1>Sound Card Information</h1>
            <pre>{soundCardData}</pre>
        </div>
    );
};

export default SoundCardInfo;
