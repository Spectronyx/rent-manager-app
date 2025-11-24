import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const GlassCard = ({ children, className, hover = true, ...props }) => {
    return (
        <motion.div
            className={cn(
                'glass-card p-6',
                hover && 'transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] hover:border-cyan-400/30',
                className
            )}
            whileHover={hover ? { y: -5 } : {}}
            transition={{ duration: 0.2 }}
            {...props}
        >
            {children}
        </motion.div>
    );
};
