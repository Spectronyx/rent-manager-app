import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit } from 'lucide-react';
import { updateTenant } from '@/api/tenantApi';
import { useToastActions } from '@/hooks/useToastActions';

export const EditTenantDialog = ({ open, onClose, tenant, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: tenant?.name || '',
        phone: tenant?.phone || '',
        email: tenant?.email || '',
        aadharNo: tenant?.aadharNo || '',
        collegeId: tenant?.collegeId || '',
    });

    const { showSuccess, showError } = useToastActions();

    const handleSubmit = async () => {
        if (!formData.name || !formData.phone || !formData.email || !formData.aadharNo || !formData.collegeId) {
            showError('Validation Error', 'Please fill in all fields');
            return;
        }

        if (formData.aadharNo.length !== 12) {
            showError('Invalid Aadhar', 'Aadhar number must be 12 digits');
            return;
        }

        setLoading(true);
        try {
            await updateTenant(tenant._id, formData);
            showSuccess('Tenant updated', 'Tenant details have been updated successfully');
            onSuccess?.();
        } catch (error) {
            showError('Update failed', error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="glass-card border-cyan-500/30 max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-cyan-400">
                        <Edit className="h-5 w-5" />
                        Edit Tenant Details
                    </DialogTitle>
                    <DialogDescription>
                        Update information for {tenant?.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Full Name *</Label>
                        <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="glass border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-phone">Phone Number *</Label>
                        <Input
                            id="edit-phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="glass border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-email">Email *</Label>
                        <Input
                            id="edit-email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="glass border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-aadhar">Aadhar Number *</Label>
                        <Input
                            id="edit-aadhar"
                            maxLength={12}
                            value={formData.aadharNo}
                            onChange={(e) => setFormData({ ...formData, aadharNo: e.target.value })}
                            className="glass border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-collegeId">College ID / Roll Number *</Label>
                        <Input
                            id="edit-collegeId"
                            value={formData.collegeId}
                            onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
                            className="glass border-white/10"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="glass border-white/10"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-gradient-to-r from-cyan-500 to-purple-600"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
