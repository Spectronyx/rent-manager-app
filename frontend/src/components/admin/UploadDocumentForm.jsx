// File: frontend/src/components/admin/UploadDocumentForm.jsx

import React, { useState } from 'react';
import { uploadDocument } from '../../api/documentApi';

// 1. Import all our Shadcn components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const UploadDocumentForm = ({ userId }) => {
    // All this logic is 100% unchanged
    const [file, setFile] = useState(null);
    const [documentType, setDocumentType] = useState('ID Card');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

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
            setFile(null);
            e.target.reset();
        } catch (err) {
            setError(err.message);
        }
    };

    // 2. This is the new, styled JSX
    return (
        // Replaced the style object with Tailwind classes
        <form
            onSubmit={handleSubmit}
            className="mt-4 pt-4 border-t space-y-4"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Document Type Select */}
                <div className="space-y-2">
                    <Label htmlFor="documentType">Document Type</Label>
                    {/* 3. Replaced <select> with Shadcn <Select> */}
                    <Select value={documentType} onValueChange={setDocumentType}>
                        <SelectTrigger id="documentType">
                            <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ID Card">ID Card</SelectItem>
                            <SelectItem value="Agreement">Agreement</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* File Input */}
                <div className="space-y-2">
                    <Label htmlFor="fileUpload">File</Label>
                    <Input
                        id="fileUpload"
                        type="file"
                        onChange={handleFileChange}
                        accept=".jpg, .jpeg, .png, .pdf"
                        required
                        className="pt-1.5" // Minor padding tweak for file inputs
                    />
                </div>
            </div>

            {/* Messages */}
            {message && (
                <p className="text-sm font-medium text-green-600">{message}</p>
            )}
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

            <Button type="submit" size="sm">Upload Document</Button>
        </form>
    );
};

// 4. We can now delete the old 'formStyle' object
// const formStyle = { ... };

export default UploadDocumentForm;