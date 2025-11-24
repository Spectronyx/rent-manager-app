import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, UserPlus, DollarSign } from 'lucide-react';
import { useAnimationVariants } from '@/hooks/useAnimationVariants';

export const RoomListInline = ({ rooms, onEdit, onDelete, onAssignTenant }) => {
    const { staggerContainer, staggerItem } = useAnimationVariants();

    if (!rooms || rooms.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No rooms in this building yet
            </div>
        );
    }

    return (
        <motion.div
            className="space-y-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
        >
            {rooms.map((room) => (
                <motion.div
                    key={room._id}
                    variants={staggerItem}
                    className="glass rounded-lg p-4 border border-white/10 hover:border-cyan-400/30 transition-all group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                            {/* Room Number */}
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-cyan-400">
                                    {room.roomNumber}
                                </span>
                                <Badge
                                    variant={room.status === 'Occupied' ? 'default' : 'outline'}
                                    className={
                                        room.status === 'Occupied'
                                            ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                            : 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                                    }
                                >
                                    {room.status === 'Occupied' ? 'Occupied' : 'Vacant'}
                                </Badge>
                            </div>

                            {/* Tenant Info */}
                            <div className="flex-1">
                                {room.tenantId ? (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Tenant: </span>
                                        <span className="text-foreground font-medium">{room.tenantId.name || 'Unknown'}</span>
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground">
                                        No tenant assigned
                                    </div>
                                )}
                            </div>

                            {/* Monthly Rent */}
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-400" />
                                <span className="text-lg font-semibold text-green-400">
                                    ₹{room.monthlyRent || 0}
                                </span>
                                <span className="text-xs text-muted-foreground">/month</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {room.status !== 'Occupied' && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onAssignTenant?.(room)}
                                    className="hover:bg-cyan-500/20 hover:text-cyan-400"
                                >
                                    <UserPlus className="h-4 w-4" />
                                </Button>
                            )}
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onEdit?.(room)}
                                className="hover:bg-purple-500/20 hover:text-purple-400"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onDelete?.(room)}
                                className="hover:bg-pink-500/20 hover:text-pink-400"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
};
