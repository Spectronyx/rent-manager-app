// File: frontend/src/components/DocumentList.jsx

import React, { useState, useEffect } from 'react';
import { getMyDocuments, getDocumentsForUser } from '../api/documentApi';

// This component is "smart":
// If 'userId' prop is provided, it fetches for that user (Admin).
// If 'userId' is NOT provided, it fetches for the logged-in user (Student).
const DocumentList = ({ userId }) => {
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                let data;
                if (userId) {
                    // Admin mode: Fetch for a specific student
                    data = await getDocumentsForUser(userId);
                } else {
                    // Student mode: Fetch for "me"
                    data = await getMyDocuments();
                }
                setDocuments(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocs();
    }, [userId]); // Re-fetch if the userId prop ever changes

    if (isLoading) return <p>Loading documents...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    return (
        <div style={listStyle}>
            <h5>Documents:</h5>
            {documents.length === 0 ? (
                <p>No documents found.</p>
            ) : (
                <ul>
                    {documents.map((doc) => (
                        <li key={doc._id}>
                            {/* This opens the file in a new tab */}
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                {doc.documentType} ({doc.status})
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const listStyle = {
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px solid #eee',
};

export default DocumentList;