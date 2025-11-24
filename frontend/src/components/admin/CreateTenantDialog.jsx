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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UserPlus } from 'lucide-react';
import { createTenant } from '@/api/tenantApi';
import { useToastActions } from '@/hooks/useToastActions';

export const CreateTenantDialog = ({ open, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [tenantData, setTenantData] = useState({
        name: '',
        phone: '',
        email: '',
        aadharNo: '',
        collegeId: '',
    });

    const { showSuccess, showError } = useToastActions();

    const handleSubmit = async () => {
        if (!tenantData.name || !tenantData.phone || !tenantData.email ||
            !tenantData.aadharNo || !tenantData.collegeId) {
            showError('Validation Error', 'Please fill in all required fields');
            return;
        }

        // Validate Aadhar number (12 digits)
        const cleanedAadhar = tenantData.aadharNo.replace(/\s/g, '');
        if (cleanedAadhar.length !== 12 || !/^\d+$/.test(cleanedAadhar)) {
            showError('Invalid Aadhar', 'Aadhar number must be exactly 12 digits');
            return;
        }

        // Validate phone number (10 digits)
        const cleanedPhone = tenantData.phone.replace(/\s/g, '');
        if (cleanedPhone.length !== 10 || !/^\d+$/.test(cleanedPhone)) {
            showError('Invalid Phone', 'Phone number must be exactly 10 digits');
            return;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(tenantData.email)) {
            showError('Invalid Email', 'Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            await createTenant({
                ...tenantData,
                aadharNo: cleanedAadhar,
                phone: cleanedPhone,
            });
            showSuccess('Tenant created', `${tenantData.name} has been added successfully`);
            setTenantData({ name: '', phone: '', email: '', aadharNo: '', collegeId: '' });
            onSuccess?.();
        } catch (error) {
            showError('Failed to create tenant', error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setTenantData({ name: '', phone: '', email: '', aadharNo: '', collegeId: '' });
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="glass-card border-purple-500/30 max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-purple-400">
                        <UserPlus className="h-5 w-5" />
                        Create New Tenant
                    </DialogTitle>
                    <DialogDescription>
                        Add a new tenant to the system
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                            id="name"
                            placeholder="Enter tenant name"
                            value={tenantData.name}
                            onChange={(e) => setTenantData({ ...tenantData, name: e.target.value })}
                            className="glass border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="10-digit number"
                            maxLength={10}
                            value={tenantData.phone}
                            onChange={(e) => setTenantData({ ...tenantData, phone: e.target.value.replace(/\D/g, '') })}
                            className="glass border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="email@example.com"
                            value={tenantData.email}
                            onChange={(e) => setTenantData({ ...tenantData, email: e.target.value })}
                            className="glass border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="aadhar">Aadhar Number *</Label>
                        <Input
                            id="aadhar"
                            placeholder="12-digit Aadhar number"
                            maxLength={12}
                            value={tenantData.aadharNo}
                            onChange={(e) => setTenantData({ ...tenantData, aadharNo: e.target.value.replace(/\D/g, '') })}
                            className="glass border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="collegeId">College ID *</Label>
                        <Input
                            id="collegeId"
                            placeholder="Student ID or Roll Number"
                            value={tenantData.collegeId}
                            onChange={(e) => setTenantData({ ...tenantData, collegeId: e.target.value })}
                            className="glass border-white/10"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="glass border-white/10"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-gradient-to-r from-purple-500 to-pink-600"
                    >
                        {loading ? 'Creating...' : 'Create Tenant'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
