import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const NeonBorder = ({ children, className, color = 'cyan', animated = true }) => {
    const colorMap = {
        cyan: 'border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.5)]',
        purple: 'border-purple-500/50 shadow-[0_0_10px_rgba(178,0,255,0.5)]',
        pink: 'border-pink-500/50 shadow-[0_0_10px_rgba(255,0,255,0.5)]',
    };

    const Component = animated ? motion.div : 'div';

    return (
        <Component
            className={cn(
                'rounded-xl border-2',
                colorMap[color],
                className
            )}
            {...(animated && {
                animate: {
                    boxShadow: [
                        `0 0 10px rgba(0,240,255,0.5)`,
                        `0 0 20px rgba(0,240,255,0.7)`,
                        `0 0 10px rgba(0,240,255,0.5)`,
                    ],
                },
                transition: {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                },
            })}
        >
            {children}
        </Component>
    );
};
