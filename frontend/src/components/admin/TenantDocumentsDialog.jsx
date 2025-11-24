import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload } from 'lucide-react';
import DocumentUpload from '../tenant/DocumentUpload';
import DocumentList from '../tenant/DocumentList';

export const TenantDocumentsDialog = ({ open, onClose, tenant }) => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    if (!tenant) return null;

    const handleUploadSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="glass-card border-cyan-500/30 max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                        {tenant.name}'s Documents
                    </DialogTitle>
                    <DialogDescription>
                        Manage identity proofs, agreements, and other documents
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="list" className="w-full mt-4">
                    <TabsList className="glass border-b border-cyan-500/20 w-full justify-start rounded-none p-0 mb-4">
                        <TabsTrigger value="list" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                            <FileText className="h-4 w-4 mr-2" />
                            View Documents
                        </TabsTrigger>
                        <TabsTrigger value="upload" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload New
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="list" className="space-y-4">
                        <DocumentList tenantId={tenant._id} refreshTrigger={refreshTrigger} />
                    </TabsContent>

                    <TabsContent value="upload" className="space-y-4">
                        <DocumentUpload tenantId={tenant._id} onUploadSuccess={handleUploadSuccess} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};
