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
import { Textarea } from '@/components/ui/textarea';
import { Building2 } from 'lucide-react';
import { createBuilding } from '@/api/buildingApi';
import { useToastActions } from '@/hooks/useToastActions';

export const CreateBuildingDialog = ({ open, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [buildingData, setBuildingData] = useState({
        name: '',
        address: '',
        totalFloors: '',
    });

    const { showSuccess, showError } = useToastActions();

    const handleSubmit = async () => {
        if (!buildingData.name || !buildingData.address || !buildingData.totalFloors) {
            showError('Validation Error', 'Please fill in all required fields');
            return;
        }

        if (parseInt(buildingData.totalFloors) < 1) {
            showError('Validation Error', 'Total floors must be at least 1');
            return;
        }

        setLoading(true);
        try {
            await createBuilding({
                name: buildingData.name,
                address: buildingData.address,
                totalFloors: parseInt(buildingData.totalFloors),
            });
            showSuccess('Building created', `${buildingData.name} has been added successfully`);
            setBuildingData({ name: '', address: '', totalFloors: '' });
            onSuccess?.();
        } catch (error) {
            showError('Failed to create building', error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setBuildingData({ name: '', address: '', totalFloors: '' });
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="glass-card border-cyan-500/30 max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-cyan-400">
                        <Building2 className="h-5 w-5" />
                        Create New Building
                    </DialogTitle>
                    <DialogDescription>
                        Add a new building to your property portfolio
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Building Name *</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Sunrise Apartments"
                            value={buildingData.name}
                            onChange={(e) => setBuildingData({ ...buildingData, name: e.target.value })}
                            className="glass border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address *</Label>
                        <Textarea
                            id="address"
                            placeholder="Enter complete address"
                            value={buildingData.address}
                            onChange={(e) => setBuildingData({ ...buildingData, address: e.target.value })}
                            className="glass border-white/10"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="totalFloors">Total Floors *</Label>
                        <Input
                            id="totalFloors"
                            type="number"
                            min="1"
                            placeholder="e.g., 5"
                            value={buildingData.totalFloors}
                            onChange={(e) => setBuildingData({ ...buildingData, totalFloors: e.target.value })}
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
                        className="bg-gradient-to-r from-cyan-500 to-purple-600"
                    >
                        {loading ? 'Creating...' : 'Create Building'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
