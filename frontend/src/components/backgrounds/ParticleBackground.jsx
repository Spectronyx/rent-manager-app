import { motion } from 'framer-motion';
import { useMemo } from 'react';

export const ParticleBackground = ({ particleCount = 50 }) => {
    const particles = useMemo(() => {
        return Array.from({ length: particleCount }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 5,
        }));
    }, [particleCount]);

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-cyan-400/30"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                    }}
                    animate={{
                        y: [0, -100, 0],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: particle.duration,
                        delay: particle.delay,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
};
