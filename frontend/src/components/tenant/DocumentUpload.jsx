import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, X, FileText, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import documentApi from '@/api/documentApi';

const DocumentUpload = ({ tenantId, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm({
        defaultValues: {
            type: 'Identity',
            name: ''
        }
    });

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            validateAndSetFile(selectedFile);
        }
    };

    const validateAndSetFile = (selectedFile) => {
        setError(null);
        setSuccess(false);

        // Check size (5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        // Check type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(selectedFile.type)) {
            setError('Only PDF, JPG, and PNG files are allowed');
            return;
        }

        setFile(selectedFile);
        setValue('name', selectedFile.name.split('.')[0]); // Default name to filename

        // Create preview for images
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            validateAndSetFile(droppedFile);
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        setError(null);
        setSuccess(false);
        setProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        reset();
    };

    const onSubmit = async (data) => {
        if (!file) {
            setError('Please select a file');
            return;
        }

        setUploading(true);
        setProgress(0);
        setError(null);

        const formData = new FormData();
        formData.append('document', file);
        formData.append('name', data.name);
        formData.append('type', data.type);

        try {
            await documentApi.uploadDocument(tenantId, formData, (percent) => {
                setProgress(percent);
            });
            setSuccess(true);
            setTimeout(() => {
                clearFile();
                if (onUploadSuccess) onUploadSuccess();
            }, 1500);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="glass-card p-6 space-y-6">
            <h3 className="text-xl font-semibold text-neon-cyan">Upload Document</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* File Drop Zone */}
                <div
                    className={cn(
                        "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer relative overflow-hidden group",
                        file ? "border-neon-cyan/50 bg-neon-cyan/5" : "border-white/20 hover:border-neon-cyan/50 hover:bg-white/5",
                        error && "border-red-500/50 bg-red-500/5"
                    )}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => !file && fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                    />

                    <AnimatePresence mode="wait">
                        {!file ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-3"
                            >
                                <div className="p-4 rounded-full bg-white/5 group-hover:bg-neon-cyan/10 transition-colors">
                                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-neon-cyan transition-colors" />
                                </div>
                                <div>
                                    <p className="text-lg font-medium">Click or drag file to upload</p>
                                    <p className="text-sm text-gray-400 mt-1">PDF, JPG, PNG (max 5MB)</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="selected"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-center gap-4 text-left w-full max-w-md mx-auto bg-black/20 p-4 rounded-lg relative z-10"
                            >
                                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <FileText className="w-6 h-6 text-neon-cyan" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-400 hover:text-red-400"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        clearFile();
                                    }}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Form Fields */}
                <AnimatePresence>
                    {file && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-4 overflow-hidden"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Document Type</Label>
                                    <Select
                                        onValueChange={(val) => setValue('type', val)}
                                        defaultValue="Identity"
                                    >
                                        <SelectTrigger className="bg-black/20 border-white/10">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Identity">Identity Proof</SelectItem>
                                            <SelectItem value="Agreement">Rental Agreement</SelectItem>
                                            <SelectItem value="Photo">Photo</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Document Name</Label>
                                    <Input
                                        {...register('name', { required: 'Name is required' })}
                                        className="bg-black/20 border-white/10"
                                        placeholder="e.g., Aadhar Card"
                                    />
                                    {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
                                </div>
                            </div>

                            {uploading && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span>Uploading...</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-neon-cyan text-black hover:bg-cyan-400 font-semibold"
                                disabled={uploading}
                            >
                                {uploading ? 'Uploading...' : 'Upload Document'}
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Status Messages */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg text-sm"
                        >
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </motion.div>
                    )}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 text-green-400 bg-green-500/10 p-3 rounded-lg text-sm"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Upload successful!
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </div>
    );
};

export default DocumentUpload;
