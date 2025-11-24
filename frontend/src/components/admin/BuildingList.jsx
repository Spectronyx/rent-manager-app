import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AssignTenantDialog } from './AssignTenantDialog';
import { RoomDetailsDialog } from './RoomDetailsDialog';
import {
    Building2,
    Trash2,
    Plus,
    DollarSign,
    Home,
    AlertTriangle,
    UserPlus
} from 'lucide-react';
import { useAnimationVariants } from '@/hooks/useAnimationVariants';
import { useToastActions } from '@/hooks/useToastActions';
import { getRoomsInBuilding, createRoom } from '@/api/roomApi';
import { deleteBuilding } from '@/api/buildingApi';

export const BuildingCard = ({ building, onRefresh }) => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showCreateRoomDialog, setShowCreateRoomDialog] = useState(false);
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [showRoomDetails, setShowRoomDetails] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [creatingRoom, setCreatingRoom] = useState(false);
    const [roomData, setRoomData] = useState({
        roomNumber: '',
        monthlyRent: '',
    });

    const { slideUp } = useAnimationVariants();
    const { showSuccess, showError } = useToastActions();

    useEffect(() => {
        loadRooms();
    }, [building._id]);

    const loadRooms = async () => {
        setLoading(true);
        try {
            const data = await getRoomsInBuilding(building._id);
            setRooms(data);
        } catch (error) {
            console.error('Failed to load rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteBuilding(building._id);
            showSuccess('Building deleted', 'Building and all its rooms have been removed');
            setShowDeleteDialog(false);
            onRefresh?.();
        } catch (error) {
            showError('Delete failed', error.response?.data?.message || 'Failed to delete building');
        } finally {
            setDeleting(false);
        }
    };

    const handleCreateRoom = async () => {
        if (!roomData.roomNumber || !roomData.monthlyRent) {
            showError('Validation Error', 'Please fill in all fields');
            return;
        }

        setCreatingRoom(true);
        try {
            await createRoom({
                roomNumber: roomData.roomNumber,
                monthlyRent: parseFloat(roomData.monthlyRent),
                buildingId: building._id,
                status: 'Vacant'
            });
            showSuccess('Room created', `Room ${roomData.roomNumber} has been added`);
            setShowCreateRoomDialog(false);
            setRoomData({ roomNumber: '', monthlyRent: '' });
            loadRooms();
        } catch (error) {
            showError('Failed to create room', error.response?.data?.message || 'Something went wrong');
        } finally {
            setCreatingRoom(false);
        }
    };

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
    const vacantRooms = totalRooms - occupiedRooms;

    return (
        <>
            <motion.div
                variants={slideUp}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="group"
            >
                <GlassCard className="overflow-hidden h-full border-2 border-cyan-500/20 hover:border-cyan-400/50 transition-all">
                    {/* Header with Delete Button */}
                    <div className="relative p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowDeleteDialog(true)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pink-500/20 hover:text-pink-400"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-lg bg-cyan-500/20">
                                <Building2 className="h-6 w-6 text-cyan-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-foreground">{building.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-1">{building.address}</p>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="glass rounded p-2 border border-white/10 text-center">
                                <div className="text-xs text-muted-foreground">Total</div>
                                <div className="text-lg font-bold text-foreground">{totalRooms}</div>
                            </div>
                            <div className="glass rounded p-2 border border-green-500/30 bg-green-500/10 text-center">
                                <div className="text-xs text-muted-foreground">Filled</div>
                                <div className="text-lg font-bold text-green-400">{occupiedRooms}</div>
                            </div>
                            <div className="glass rounded p-2 border border-orange-500/30 bg-orange-500/10 text-center">
                                <div className="text-xs text-muted-foreground">Vacant</div>
                                <div className="text-lg font-bold text-orange-400">{vacantRooms}</div>
                            </div>
                        </div>
                    </div>

                    {/* Rooms List */}
                    <div className="p-6 space-y-3">
                        {loading ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Loading rooms...
                            </div>
                        ) : rooms.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No rooms yet
                            </div>
                        ) : (
                            rooms.map((room) => {
                                // Get tenant count for this room
                                const tenantCount = room.tenantId ? 1 : 0; // currently supports single tenant
                                const canAssignMore = tenantCount < 3;

                                return (
                                    <div
                                        key={room._id}
                                        className="relative glass-card rounded-lg p-4 border-2 border-white/10 hover:border-cyan-400/40 transition-all group"
                                    >
                                        {/* Room Header */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2 flex-1">
                                                <h4
                                                    className="text-xl font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer underline decoration-dotted decoration-cyan-400/30 hover:decoration-cyan-300 transition-colors"
                                                    onClick={() => {
                                                        setSelectedRoom(room);
                                                        setShowRoomDetails(true);
                                                    }}
                                                >
                                                    Room {room.roomNumber}
                                                </h4>
                                                <Badge
                                                    className={
                                                        room.status === 'Occupied'
                                                            ? 'bg-green-500/20 text-green-400 border-green-500/50 text-xs'
                                                            : 'bg-orange-500/20 text-orange-400 border-orange-500/50 text-xs'
                                                    }
                                                >
                                                    {room.status === 'Occupied' ? `Occupied (${tenantCount}/3)` : 'Vacant'}
                                                </Badge>
                                            </div>

                                            {/* Assign Button */}
                                            {canAssignMore && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedRoom(room);
                                                        setShowAssignDialog(true);
                                                    }}
                                                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-xs h-8 px-3"
                                                >
                                                    <UserPlus className="h-3 w-3 mr-1" />
                                                    Assign
                                                </Button>
                                            )}
                                        </div>

                                        {/* Tenants List */}
                                        {room.tenantId && (
                                            <div className="mt-3 pt-3 border-t border-white/10">
                                                <p className="text-xs text-muted-foreground mb-1.5">Tenant:</p>
                                                <div
                                                    className="flex items-center gap-2 p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 cursor-pointer hover:bg-cyan-500/20 transition-colors"
                                                    onClick={() => {
                                                        setSelectedRoom(room);
                                                        setShowRoomDetails(true);
                                                    }}
                                                >
                                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                                        {room.tenantId.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-foreground font-medium block text-sm truncate">{room.tenantId.name}</span>
                                                        <span className="text-xs text-muted-foreground">Roll: {room.tenantId.collegeId || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {!room.tenantId && (
                                            <div className="mt-3 pt-3 border-t border-white/10">
                                                <p className="text-xs text-muted-foreground text-center">
                                                    No tenant assigned yet
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Create Room Button */}
                    <div className="p-4 border-t border-cyan-500/20">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full glass border-cyan-500/30 hover:bg-cyan-500/20"
                            onClick={() => setShowCreateRoomDialog(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Room
                        </Button>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="glass-card border-pink-500/30">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-pink-400">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Building?
                        </DialogTitle>
                        <DialogDescription>
                            This will permanently delete <strong>{building.name}</strong> and all {totalRooms} room(s).
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            className="glass border-white/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-gradient-to-r from-pink-500 to-red-600"
                        >
                            {deleting ? 'Deleting...' : 'Delete Building'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Room Dialog */}
            <Dialog open={showCreateRoomDialog} onOpenChange={setShowCreateRoomDialog}>
                <DialogContent className="glass-card border-cyan-500/30">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-cyan-400">
                            <Plus className="h-5 w-5" />
                            Add New Room
                        </DialogTitle>
                        <DialogDescription>
                            Add a new room to {building.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="roomNumber">Room Number</Label>
                            <Input
                                id="roomNumber"
                                placeholder="e.g., 101, A-1, etc."
                                value={roomData.roomNumber}
                                onChange={(e) => setRoomData({ ...roomData, roomNumber: e.target.value })}
                                className="glass border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="monthlyRent">Monthly Rent (₹)</Label>
                            <Input
                                id="monthlyRent"
                                type="number"
                                placeholder="e.g., 5000"
                                value={roomData.monthlyRent}
                                onChange={(e) => setRoomData({ ...roomData, monthlyRent: e.target.value })}
                                className="glass border-white/10"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowCreateRoomDialog(false)}
                            className="glass border-white/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateRoom}
                            disabled={creatingRoom}
                            className="bg-gradient-to-r from-cyan-500 to-purple-600"
                        >
                            {creatingRoom ? 'Creating...' : 'Create Room'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assign Tenant Dialog */}
            {selectedRoom && (
                <AssignTenantDialog
                    open={showAssignDialog}
                    onClose={() => {
                        setShowAssignDialog(false);
                        setSelectedRoom(null);
                    }}
                    room={selectedRoom}
                    buildingId={building._id}
                    onSuccess={() => {
                        loadRooms();
                        onRefresh?.();
                    }}
                />
            )}

            {/* Room Details Dialog */}
            {selectedRoom && (
                <RoomDetailsDialog
                    open={showRoomDetails}
                    onClose={() => {
                        setShowRoomDetails(false);
                        setSelectedRoom(null);
                    }}
                    room={selectedRoom}
                    buildingId={building._id}
                    onUpdate={() => {
                        loadRooms();
                        onRefresh?.();
                    }}
                />
            )}
        </>
    );
};

const BuildingList = ({ buildings, isLoading, error, onRefresh }) => {
    const { staggerContainer } = useAnimationVariants();

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block"
                >
                    <Building2 className="h-12 w-12 text-cyan-400" />
                </motion.div>
                <p className="mt-4 text-muted-foreground">Loading buildings...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive">Error: {error}</p>
            </div>
        );
    }

    if (buildings.length === 0) {
        return (
            <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg">No buildings yet</p>
                <p className="text-sm text-muted-foreground mt-2">Create your first building to get started</p>
            </div>
        );
    }

    return (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
        >
            {buildings.map((building) => (
                <BuildingCard
                    key={building._id}
                    building={building}
                    onRefresh={onRefresh}
                />
            ))}
        </motion.div>
    );
};

export default BuildingList;