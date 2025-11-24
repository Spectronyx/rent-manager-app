import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Users,
    DollarSign,
    Edit,
    UserPlus,
    Mail,
    Phone,
    CreditCard,
    GraduationCap,
    Calendar
} from 'lucide-react';
import { AssignTenantDialog } from './AssignTenantDialog';
import { EditTenantDialog } from './EditTenantDialog';
import { TenantFinancialHistory } from './TenantFinancialHistory';

export const RoomDetailsDialog = ({ open, onClose, room, buildingId, onUpdate }) => {
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showFinancialHistory, setShowFinancialHistory] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState(null);

    if (!room) return null;

    // Get actual tenant data from populated tenantId
    const tenants = room.tenantId ? [room.tenantId] : [];
    const canAssignMore = tenants.length < 3;

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="glass-card border-cyan-500/30 max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                            Room {room.roomNumber} - Details
                        </DialogTitle>
                        <DialogDescription>
                            Manage tenants and view room information
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="tenants" className="w-full">
                        <TabsList className="glass border-b border-cyan-500/20 w-full justify-start rounded-none p-0">
                            <TabsTrigger value="tenants" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                                <Users className="h-4 w-4 mr-2" />
                                Tenants ({tenants.length}/3)
                            </TabsTrigger>
                            <TabsTrigger value="info" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                                <DollarSign className="h-4 w-4 mr-2" />
                                Room Info
                            </TabsTrigger>
                        </TabsList>

                        {/* Tenants Tab */}
                        <TabsContent value="tenants" className="space-y-4 py-4">
                            {tenants.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                    <p className="text-muted-foreground text-lg mb-4">No tenants in this room</p>
                                    <Button
                                        onClick={() => setShowAssignDialog(true)}
                                        className="bg-gradient-to-r from-purple-500 to-pink-600"
                                    >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Assign First Tenant
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        {tenants.map((tenant) => (
                                            <div
                                                key={tenant._id}
                                                className="glass-card rounded-xl p-5 border-2 border-white/10 hover:border-cyan-400/30 transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                                                            {tenant.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-bold text-foreground mb-1">
                                                                {tenant.name}
                                                            </h3>
                                                            <div className="flex items-center gap-2">
                                                                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                                                                    <GraduationCap className="h-3 w-3 mr-1" />
                                                                    {tenant.collegeId}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setSelectedTenant(tenant);
                                                                setShowEditDialog(true);
                                                            }}
                                                            className="glass border-white/10 hover:bg-cyan-500/20"
                                                        >
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedTenant(tenant);
                                                                setShowFinancialHistory(true);
                                                            }}
                                                            className="bg-gradient-to-r from-green-500 to-emerald-600"
                                                        >
                                                            <DollarSign className="h-4 w-4 mr-2" />
                                                            Financial History
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Mail className="h-4 w-4 text-cyan-400" />
                                                        <span className="text-muted-foreground">{tenant.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Phone className="h-4 w-4 text-green-400" />
                                                        <span className="text-muted-foreground">{tenant.phone}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <CreditCard className="h-4 w-4 text-purple-400" />
                                                        <span className="text-muted-foreground">{tenant.aadharNo}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {canAssignMore && (
                                        <Button
                                            onClick={() => setShowAssignDialog(true)}
                                            className="w-full bg-gradient-to-r from-purple-500 to-pink-600"
                                        >
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Assign Another Tenant ({tenants.length}/3)
                                        </Button>
                                    )}
                                </>
                            )}
                        </TabsContent>

                        {/* Room Info Tab */}
                        <TabsContent value="info" className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="glass-card rounded-lg p-4 border border-cyan-500/30">
                                    <p className="text-sm text-muted-foreground mb-1">Monthly Rent</p>
                                    <p className="text-3xl font-bold text-green-400">₹{room.monthlyRent || 0}</p>
                                </div>
                                <div className="glass-card rounded-lg p-4 border border-purple-500/30">
                                    <p className="text-sm text-muted-foreground mb-1">Occupancy</p>
                                    <p className="text-3xl font-bold text-purple-400">{tenants.length}/3</p>
                                </div>
                                <div className="glass-card rounded-lg p-4 border border-orange-500/30">
                                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                                    <Badge className={
                                        room.status === 'Occupied'
                                            ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                            : 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                                    }>
                                        {room.status === 'Occupied' ? 'Occupied' : 'Vacant'}
                                    </Badge>
                                </div>
                                <div className="glass-card rounded-lg p-4 border border-cyan-500/30">
                                    <p className="text-sm text-muted-foreground mb-1">Expected Monthly</p>
                                    <p className="text-2xl font-bold text-cyan-400">
                                        ₹{(room.monthlyRent || 0) * tenants.length}
                                    </p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* Assign Tenant Dialog */}
            <AssignTenantDialog
                open={showAssignDialog}
                onClose={() => setShowAssignDialog(false)}
                room={room}
                buildingId={buildingId}
                onSuccess={() => {
                    setShowAssignDialog(false);
                    onUpdate?.();
                }}
            />

            {/* Edit Tenant Dialog */}
            {selectedTenant && (
                <EditTenantDialog
                    open={showEditDialog}
                    onClose={() => {
                        setShowEditDialog(false);
                        setSelectedTenant(null);
                    }}
                    tenant={selectedTenant}
                    onSuccess={() => {
                        setShowEditDialog(false);
                        setSelectedTenant(null);
                        onUpdate?.();
                    }}
                />
            )}

            {/* Financial History Dialog */}
            {selectedTenant && (
                <TenantFinancialHistory
                    open={showFinancialHistory}
                    onClose={() => {
                        setShowFinancialHistory(false);
                        setSelectedTenant(null);
                    }}
                    tenant={selectedTenant}
                />
            )}
        </>
    );
};
