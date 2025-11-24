import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useAnimationVariants } from '@/hooks/useAnimationVariants';

const StatCard = ({ icon: Icon, label, value, color = 'cyan', delay = 0, subtext }) => {
    const { slideUp } = useAnimationVariants();

    const colorClasses = {
        cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30',
        purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
        green: 'from-green-500/20 to-green-600/20 border-green-500/30',
        orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
        red: 'from-red-500/20 to-red-600/20 border-red-500/30',
    };

    const iconColors = {
        cyan: 'text-cyan-400',
        purple: 'text-purple-400',
        green: 'text-green-400',
        orange: 'text-orange-400',
        red: 'text-red-400',
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
                            className="text-3xl font-bold text-foreground"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
                        >
                            {value}
                        </motion.p>
                        {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
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
                        <Icon className="h-10 w-10" />
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

export const FinancialStatsRibbon = ({ stats }) => {
    const { staggerContainer } = useAnimationVariants();

    const totalDues = stats ? (stats.totalMonthlyRent - stats.totalCollections) : 0;
    const profitMargin = stats && stats.totalCollections > 0
        ? (((stats.totalCollections - stats.totalExpenses) / stats.totalCollections) * 100).toFixed(1)
        : 0;

    const statCards = [
        {
            icon: DollarSign,
            label: 'Total Collections',
            value: `₹${stats?.totalCollections?.toLocaleString() || 0}`,
            color: 'green',
            subtext: `${stats?.collectionRate || 0}% of expected rent`
        },
        {
            icon: TrendingDown,
            label: 'Total Expenses',
            value: `₹${stats?.totalExpenses?.toLocaleString() || 0}`,
            color: 'red',
            subtext: `${stats?.totalExpenses > 0 ? 'Recorded this month' : 'No expenses recorded'}`
        },
        {
            icon: TrendingUp,
            label: 'Net Profit',
            value: `₹${stats?.netProfit?.toLocaleString() || 0}`,
            color: stats?.netProfit >= 0 ? 'green' : 'red',
            subtext: `${profitMargin}% profit margin`
        },
        {
            icon: AlertCircle,
            label: 'Total Dues',
            value: `₹${totalDues.toLocaleString()}`,
            color: 'orange',
            subtext: 'Pending collections'
        },
    ];

    return (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
        >
            {statCards.map((card, index) => (
                <StatCard
                    key={card.label}
                    {...card}
                    delay={index * 0.1}
                />
            ))}
        </motion.div>
    );
};
