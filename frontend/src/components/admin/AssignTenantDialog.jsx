import React, { useState, useEffect } from 'react';
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
import { getAllTenants, createTenant, updateTenant } from '@/api/tenantApi';
import { useToastActions } from '@/hooks/useToastActions';

export const AssignTenantDialog = ({ open, onClose, room, buildingId, onSuccess }) => {
    const [tenants, setTenants] = useState([]);
    const [selectedTenant, setSelectedTenant] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCreateNew, setShowCreateNew] = useState(false);
    const [newTenantData, setNewTenantData] = useState({
        name: '',
        phone: '',
        email: '',
        aadharNo: '',
        collegeId: '',
    });

    const { showSuccess, showError } = useToastActions();

    useEffect(() => {
        if (open) {
            loadTenants();
        }
    }, [open]);

    const loadTenants = async () => {
        try {
            const data = await getAllTenants();
            // Filter only unassigned tenants
            const unassigned = data.filter(t => !t.roomId);
            setTenants(unassigned);
        } catch (error) {
            showError('Failed to load tenants', error.message);
        }
    };

    const handleAssign = async () => {
        if (!selectedTenant) {
            showError('Select a tenant', 'Please select a tenant to assign');
            return;
        }

        setLoading(true);
        try {
            // Update the tenant with roomId and buildingId
            await updateTenant(selectedTenant, {
                roomId: room._id,
                buildingId: buildingId
            });
            showSuccess('Tenant assigned', `Tenant has been assigned to Room ${room.roomNumber}`);
            onSuccess?.();
            onClose();
        } catch (error) {
            showError('Assignment failed', error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAndAssign = async () => {
        if (!newTenantData.name || !newTenantData.phone || !newTenantData.email ||
            !newTenantData.aadharNo || !newTenantData.collegeId) {
            showError('Validation Error', 'Please fill in all fields');
            return;
        }

        if (newTenantData.aadharNo.replace(/\\s/g, '').length !== 12) {
            showError('Invalid Aadhar', 'Aadhar number must be 12 digits');
            return;
        }

        setLoading(true);
        try {
            // Create tenant WITHOUT assigning to a room/building
            const newTenant = await createTenant({
                ...newTenantData,
            });

            // Refresh tenant list and pre‑select the newly created tenant
            await loadTenants();
            setSelectedTenant(newTenant._id);
            setShowCreateNew(false);
            setNewTenantData({ name: '', phone: '', email: '', aadharNo: '', collegeId: '' });
            showSuccess('Tenant created', `${newTenant.name} has been added. You can now assign it to a room.`);
        } catch (error) {
            showError('Failed to create tenant', error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="glass-card border-cyan-500/30 max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-cyan-400">
                        <UserPlus className="h-5 w-5" />
                        Assign Tenant to Room {room?.roomNumber}
                    </DialogTitle>
                    <DialogDescription>
                        Select an existing tenant or create a new one
                    </DialogDescription>
                </DialogHeader>

                {!showCreateNew ? (
                    <>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Select Tenant</Label>
                                <select
                                    className="w-full glass rounded-lg px-4 py-2 border border-cyan-500/30 bg-transparent text-foreground"
                                    value={selectedTenant}
                                    onChange={(e) => setSelectedTenant(e.target.value)}
                                >
                                    <option value="" className="bg-background">-- Select a tenant --</option>
                                    {tenants.map(tenant => (
                                        <option key={tenant._id} value={tenant._id} className="bg-background">
                                            {tenant.name} - {tenant.phone}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {tenants.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No unassigned tenants available
                                </p>
                            )}

                            <Button
                                variant="outline"
                                className="w-full glass border-purple-500/30 hover:bg-purple-500/20"
                                onClick={() => setShowCreateNew(true)}
                            >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Create New Tenant
                            </Button>
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
                                onClick={handleAssign}
                                disabled={!selectedTenant || loading}
                                className="bg-gradient-to-r from-cyan-500 to-purple-600"
                            >
                                {loading ? 'Assigning...' : 'Assign Tenant'}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter tenant name"
                                    value={newTenantData.name}
                                    onChange={(e) => setNewTenantData({ ...newTenantData, name: e.target.value })}
                                    className="glass border-white/10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="10-digit number"
                                    value={newTenantData.phone}
                                    onChange={(e) => setNewTenantData({ ...newTenantData, phone: e.target.value })}
                                    className="glass border-white/10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="email@example.com"
                                    value={newTenantData.email}
                                    onChange={(e) => setNewTenantData({ ...newTenantData, email: e.target.value })}
                                    className="glass border-white/10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="aadhar">Aadhar Number *</Label>
                                <Input
                                    id="aadhar"
                                    placeholder="12-digit Aadhar number"
                                    maxLength={12}
                                    value={newTenantData.aadharNo}
                                    onChange={(e) => setNewTenantData({ ...newTenantData, aadharNo: e.target.value })}
                                    className="glass border-white/10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="collegeId">College ID *</Label>
                                <Input
                                    id="collegeId"
                                    placeholder="Student ID or Roll Number"
                                    value={newTenantData.collegeId}
                                    onChange={(e) => setNewTenantData({ ...newTenantData, collegeId: e.target.value })}
                                    className="glass border-white/10"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowCreateNew(false);
                                    setNewTenantData({ name: '', phone: '', email: '', aadharNo: '', collegeId: '' });
                                }}
                                className="glass border-white/10"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleCreateAndAssign}
                                disabled={loading}
                                className="bg-gradient-to-r from-cyan-500 to-purple-600"
                            >
                                {loading ? 'Creating...' : 'Create & Assign'}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};
