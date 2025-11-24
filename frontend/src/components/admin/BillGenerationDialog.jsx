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
import { FileText, Zap } from 'lucide-react';
import { getMyBuildings } from '@/api/buildingApi';
import { getRoomsInBuilding } from '@/api/roomApi';
import { generateMonthlyRecords } from '@/api/rentRecordApi';
import { useToastActions } from '@/hooks/useToastActions';

export const BillGenerationDialog = ({ open, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [buildings, setBuildings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [billData, setBillData] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        buildingId: '',
        electricityRatePerUnit: 8,
    });
    const [roomElectricity, setRoomElectricity] = useState({});
    const [showPreview, setShowPreview] = useState(false);

    const { showSuccess, showError } = useToastActions();

    useEffect(() => {
        if (open) {
            loadBuildings();
        }
    }, [open]);

    useEffect(() => {
        if (billData.buildingId) {
            loadRooms();
        } else {
            setRooms([]);
            setRoomElectricity({});
        }
    }, [billData.buildingId]);

    const loadBuildings = async () => {
        try {
            const data = await getMyBuildings();
            setBuildings(data);
        } catch (error) {
            showError('Failed to load buildings', error.message);
        }
    };

    const loadRooms = async () => {
        try {
            const data = await getRoomsInBuilding(billData.buildingId);
            // Filter only occupied rooms
            const occupiedRooms = data.filter(r => r.status === 'Occupied' && r.tenantId);
            setRooms(occupiedRooms);

            // Initialize electricity units to 0 for all rooms
            const initialElectricity = {};
            occupiedRooms.forEach(room => {
                initialElectricity[room._id] = 0;
            });
            setRoomElectricity(initialElectricity);
        } catch (error) {
            showError('Failed to load rooms', error.message);
        }
    };

    const handleElectricityChange = (roomId, value) => {
        setRoomElectricity({
            ...roomElectricity,
            [roomId]: parseFloat(value) || 0
        });
    };

    const calculatePreview = () => {
        return rooms.map(room => {
            const units = roomElectricity[room._id] || 0;
            const electricityBill = units * billData.electricityRatePerUnit;
            const totalAmount = room.monthlyRent + electricityBill;
            return {
                room,
                units,
                electricityBill,
                totalAmount
            };
        });
    };

    const handleGenerateBills = async () => {
        if (!billData.buildingId) {
            showError('Validation Error', 'Please select a building');
            return;
        }

        if (rooms.length === 0) {
            showError('No Rooms', 'No occupied rooms found in selected building');
            return;
        }

        setLoading(true);
        try {
            const result = await generateMonthlyRecords(
                billData.month,
                billData.year,
                billData.buildingId,
                billData.electricityRatePerUnit,
                roomElectricity
            );

            showSuccess('Bills generated', `${result.recordsCreated} bill(s) generated successfully`);

            if (result.errors && result.errors.length > 0) {
                console.warn('Some bills had errors:', result.errors);
            }

            handleClose();
            onSuccess?.();
        } catch (error) {
            showError('Failed to generate bills', error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setBillData({
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            buildingId: '',
            electricityRatePerUnit: 13,
        });
        setRoomElectricity({});
        setShowPreview(false);
        onClose();
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const preview = calculatePreview();
    const totalBills = preview.length;
    const totalAmount = preview.reduce((sum, item) => sum + item.totalAmount, 0);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="glass-card border-cyan-500/30 max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-cyan-400">
                        <FileText className="h-5 w-5" />
                        Generate Monthly Bills
                    </DialogTitle>
                    <DialogDescription>
                        Generate rent + electricity bills for {monthNames[billData.month - 1]} {billData.year}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4 py-4">
                    {/* Month and Year */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="month">Month *</Label>
                            <select
                                id="month"
                                value={billData.month}
                                onChange={(e) => setBillData({ ...billData, month: parseInt(e.target.value) })}
                                className="w-full glass rounded-lg px-4 py-2 border border-cyan-500/30 bg-transparent text-foreground"
                            >
                                {monthNames.map((name, idx) => (
                                    <option key={idx} value={idx + 1} className="bg-background">
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="year">Year *</Label>
                            <Input
                                id="year"
                                type="number"
                                value={billData.year}
                                onChange={(e) => setBillData({ ...billData, year: parseInt(e.target.value) })}
                                className="glass border-white/10"
                            />
                        </div>
                    </div>

                    {/* Building Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="building">Building *</Label>
                        <select
                            id="building"
                            value={billData.buildingId}
                            onChange={(e) => setBillData({ ...billData, buildingId: e.target.value })}
                            className="w-full glass rounded-lg px-4 py-2 border border-cyan-500/30 bg-transparent text-foreground"
                        >
                            <option value="" className="bg-background">-- Select a building --</option>
                            {buildings.map(building => (
                                <option key={building._id} value={building._id} className="bg-background">
                                    {building.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Electricity Rate */}
                    <div className="space-y-2">
                        <Label htmlFor="electricityRate">Electricity Rate (₹ per unit) *</Label>
                        <div className="relative">
                            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-400" />
                            <Input
                                id="electricityRate"
                                type="number"
                                step="0.01"
                                value={billData.electricityRatePerUnit}
                                onChange={(e) => setBillData({ ...billData, electricityRatePerUnit: parseFloat(e.target.value) || 0 })}
                                className="glass border-white/10 pl-10"
                            />
                        </div>
                    </div>

                    {/* Electricity Units for Each Room */}
                    {billData.buildingId && rooms.length > 0 && (
                        <div className="space-y-3">
                            <Label>Electricity Units per Room</Label>
                            <div className="glass rounded-lg p-4 border border-cyan-500/20 space-y-2 max-h-60 overflow-y-auto">
                                {rooms.map(room => (
                                    <div key={room._id} className="flex items-center gap-4 p-2 rounded bg-white/5">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Room {room.roomNumber}</p>
                                            <p className="text-xs text-muted-foreground">{room.tenantId?.name}</p>
                                        </div>
                                        <div className="w-32">
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                value={roomElectricity[room._id] || 0}
                                                onChange={(e) => handleElectricityChange(room._id, e.target.value)}
                                                className="glass border-white/10 text-sm"
                                                placeholder="Units"
                                            />
                                        </div>
                                        <p className="text-sm text-green-400 w-24 text-right">
                                            ₹{((roomElectricity[room._id] || 0) * billData.electricityRatePerUnit).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Preview Summary */}
                    {billData.buildingId && rooms.length > 0 && (
                        <div className="glass rounded-lg p-4 border-2 border-cyan-500/30 bg-cyan-500/5">
                            <h3 className="text-sm font-semibold mb-3 text-cyan-400">Preview</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Total Bills:</p>
                                    <p className="text-xl font-bold">{totalBills}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Total Amount:</p>
                                    <p className="text-xl font-bold text-green-400">₹{totalAmount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {billData.buildingId && rooms.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground">
                            <p>No occupied rooms found in the selected building</p>
                        </div>
                    )}
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
                        onClick={handleGenerateBills}
                        disabled={loading || !billData.buildingId || rooms.length === 0}
                        className="bg-gradient-to-r from-cyan-500 to-purple-600"
                    >
                        {loading ? 'Generating...' : `Generate ${totalBills} Bill(s)`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
