import { motion } from 'framer-motion';
import { Building2, Home, DoorOpen, DoorClosed } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useAnimationVariants } from '@/hooks/useAnimationVariants';

const StatCard = ({ icon: Icon, label, value, color = 'cyan', delay = 0 }) => {
    const { slideUp } = useAnimationVariants();

    const colorClasses = {
        cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30',
        purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
        green: 'from-green-500/20 to-green-600/20 border-green-500/30',
        orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    };

    const iconColors = {
        cyan: 'text-cyan-400',
        purple: 'text-purple-400',
        green: 'text-green-400',
        orange: 'text-orange-400',
    };

    return (
        <motion.div
            variants={slideUp}
            initial="initial"
            animate="animate"
            transition={{ delay }}
        >
            <GlassCard className={`relative overflow-hidden bg-gradient-to-br ${colorClasses[color]} border-2`}>
                <div className="flex items-center justify-between p-6">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{label}</p>
                        <motion.p
                            className="text-4xl font-bold text-foreground"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
                        >
                            {value}
                        </motion.p>
                    </div>
                    <motion.div
                        className={`${iconColors[color]}`}
                        animate={{
                            y: [0, -10, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay,
                        }}
                    >
                        <Icon className="h-12 w-12" />
                    </motion.div>
                </div>

                {/* Animated glow effect */}
                <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${colorClasses[color]} opacity-0`}
                    animate={{
                        opacity: [0, 0.3, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay,
                    }}
                />
            </GlassCard>
        </motion.div>
    );
};

export const StatsRibbon = ({ stats }) => {
    const { staggerContainer } = useAnimationVariants();

    const statCards = [
        {
            icon: Building2,
            label: 'Total Buildings',
            value: stats?.totalBuildings || 0,
            color: 'cyan',
        },
        {
            icon: Home,
            label: 'Total Rooms',
            value: stats?.totalRooms || 0,
            color: 'purple',
        },
        {
            icon: DoorOpen,
            label: 'Filled Rooms',
            value: stats?.occupiedRooms || 0,
            color: 'green',
        },
        {
            icon: DoorClosed,
            label: 'Vacant Rooms',
            value: stats?.vacantRooms || 0,
            color: 'orange',
        },
    ];

    return (
        <motion.div
            className="container mx-auto px-4 sm:px-6 lg:px-8 py-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <StatCard
                        key={card.label}
                        {...card}
                        delay={index * 0.1}
                    />
                ))}
            </div>
        </motion.div>
    );
};
