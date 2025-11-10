// File: frontend/src/components/admin/UploadDocumentForm.jsx

import React, { useState } from 'react';
import { uploadDocument } from '../../api/documentApi';

// We receive the student's ID as a prop
const UploadDocumentForm = ({ userId }) => {
    const [file, setFile] = useState(null);
    const [documentType, setDocumentType] = useState('ID Card'); // Default value
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // 1. Special handler for file inputs
    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // Get the first file selected
    };

    // 2. On submit, build the FormData
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file to upload');
            return;
        }
        setError('');
        setMessage('');

        try {
            await uploadDocument(userId, documentType, file);
            setMessage('File uploaded successfully!');
            // Clear the form
            setFile(null);
            e.target.reset(); // Resets the file input
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={formStyle}>
            <label htmlFor="documentType" style={{ marginRight: '10px' }}>
                Doc Type:
            </label>
            <select
                id="documentType"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
            >
                <option value="ID Card">ID Card</option>
                <option value="Agreement">Agreement</option>
                <option value="Other">Other</option>
            </select>
            <input
                type="file"
                onChange={handleFileChange}
                accept=".jpg, .jpeg, .png, .pdf" // Restrict file types
                required
                style={{ margin: '0 10px' }}
            />
            <button type="submit">Upload</button>
            {message && <p style={{ color: 'green', margin: '5px 0 0' }}>{message}</p>}
            {error && <p style={{ color: 'red', margin: '5px 0 0' }}>{error}</p>}
        </form>
    );
};

const formStyle = {
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px solid #eee',
};

export default UploadDocumentForm;