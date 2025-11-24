import React, { useEffect, useState } from 'react';
import { FileText, Image as ImageIcon, Download, Trash2, ExternalLink, Calendar, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import documentApi from '@/api/documentApi';
import { format } from 'date-fns';

const DocumentList = ({ tenantId, refreshTrigger }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const data = await documentApi.getDocuments(tenantId);
            console.log('Fetched documents:', data);
            setDocuments(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [tenantId, refreshTrigger]);

    const handleDelete = async (documentId) => {
        try {
            setDeletingId(documentId);
            await documentApi.deleteDocument(tenantId, documentId);
            setDocuments(documents.filter(doc => doc._id !== documentId));
        } catch (err) {
            console.error(err);
            // Show error toast or message
        } finally {
            setDeletingId(null);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'Photo':
            case 'Image':
                return <ImageIcon className="w-6 h-6 text-neon-purple" />;
            default:
                return <FileText className="w-6 h-6 text-neon-cyan" />;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-cyan"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8 text-red-400 bg-red-500/5 rounded-lg">
                {error}
                <Button variant="link" onClick={fetchDocuments} className="text-neon-cyan ml-2">Retry</Button>
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <div className="text-center p-12 border border-dashed border-white/10 rounded-xl bg-white/5">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400">No documents yet</h3>
                <p className="text-sm text-gray-500 mt-1">Upload documents to see them here</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
                {documents.map((doc) => (
                    <motion.div
                        key={doc._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="glass-card p-4 flex items-start gap-4 group hover:border-neon-cyan/30 transition-colors"
                    >
                        <div className="p-3 rounded-lg bg-white/5 group-hover:bg-neon-cyan/10 transition-colors">
                            {getIcon(doc.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-medium truncate max-w-[180px] sm:max-w-[250px]" title={doc.name}>{doc.name}</h4>
                                    <p className="text-xs text-neon-purple bg-neon-purple/10 px-2 py-0.5 rounded-full inline-block mt-1">
                                        {doc.type}
                                    </p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-400 hover:text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
                                        title="View/Download"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-400 hover:text-red-400"
                                                disabled={deletingId === doc._id}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="glass-card border-red-500/20">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the document.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5">Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(doc._id)}
                                                    className="bg-red-500 hover:bg-red-600 text-white"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                                </div>
                                {/* If uploadedBy is populated, we could show user name, but usually it's just ID unless populated */}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default DocumentList;
