export const useAnimationVariants = () => {
    const fadeIn = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    };

    const slideUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };

    const slideInFromLeft = {
        initial: { opacity: 0, x: -50 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 50 },
    };

    const slideInFromRight = {
        initial: { opacity: 0, x: 50 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 },
    };

    const scaleIn = {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const staggerItem = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
    };

    return {
        fadeIn,
        slideUp,
        slideInFromLeft,
        slideInFromRight,
        scaleIn,
        staggerContainer,
        staggerItem,
    };
};
