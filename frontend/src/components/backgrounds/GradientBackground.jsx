import { motion } from 'framer-motion';

export const GradientBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* Animated Gradient Mesh */}
            <motion.div
                className="absolute inset-0"
                style={{
                    background: `
            radial-gradient(ellipse 80% 80% at 50% -20%, rgba(0, 240, 255, 0.3), transparent),
            radial-gradient(ellipse 60% 60% at 80% 70%, rgba(178, 0, 255, 0.3), transparent),
            radial-gradient(ellipse 50% 50% at 10% 80%, rgba(255, 0, 255, 0.2), transparent),
            linear-gradient(180deg, #0a0e27 0%, #05070f 100%)
          `,
                }}
                animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                }}
                transition={{
                    duration: 20,
                    ease: 'linear',
                    repeat: Infinity,
                }}
            />

            {/* Animated Orbs */}
            <motion.div
                className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
                style={{
                    background: 'radial-gradient(circle, #00f0ff, transparent)',
                }}
                animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 15,
                    ease: 'easeInOut',
                    repeat: Infinity,
                }}
            />

            <motion.div
                className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
                style={{
                    background: 'radial-gradient(circle, #b200ff, transparent)',
                }}
                animate={{
                    x: [0, -100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{
                    duration: 18,
                    ease: 'easeInOut',
                    repeat: Infinity,
                }}
            />
        </div>
    );
};
