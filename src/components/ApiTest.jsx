import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ApiTest() {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Test API connection
        axios.get('http://localhost:8080/api/test')
            .then(response => {
                setMessage('Backend connected successfully!');
            })
            .catch(err => {
                setError('Backend connection failed: ' + err.message);
            });
    }, []);

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>API Connection Test</h2>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default ApiTest;
