import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import { useToastActions } from '../hooks/useToastActions';
import { useAnimationVariants } from '../hooks/useAnimationVariants';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/glass-card';
import { NeonBorder } from '@/components/ui/neon-border';
import { GradientBackground } from '@/components/backgrounds/GradientBackground';
import { ParticleBackground } from '@/components/backgrounds/ParticleBackground';
import { Mail, Lock, LogIn, Eye, EyeOff, Sparkles } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const { showSuccess, showError } = useToastActions();
    const { slideUp, fadeIn } = useAnimationVariants();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const success = await login(email, password);

            if (success) {
                showSuccess('Welcome back!', 'Successfully logged in to your account');
                setTimeout(() => navigate('/dashboard'), 500);
            } else {
                showError('Login failed', 'Invalid email or password. Please try again.');
            }
        } catch (err) {
            showError('Error', 'An unexpected error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
            {/* Animated Backgrounds */}
            <GradientBackground />
            <ParticleBackground particleCount={30} />

            {/* Cyberpunk Grid */}
            <div className="absolute inset-0 cyber-grid opacity-20" />

            {/* Main Content */}
            <motion.div
                className="relative z-10 w-full max-w-md"
                variants={slideUp}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.6 }}
            >
                <NeonBorder color="cyan" animated>
                    <GlassCard className="p-8" hover={false}>
                        {/* Header */}
                        <motion.div
                            className="text-center mb-8"
                            variants={fadeIn}
                            initial="initial"
                            animate="animate"
                            transition={{ delay: 0.2 }}
                        >
                            <motion.div
                                className="flex justify-center mb-4"
                                animate={{
                                    rotate: [0, 10, -10, 0],
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                <Sparkles className="h-12 w-12 text-cyan-400" />
                            </motion.div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                                Welcome Back
                            </h1>
                            <p className="text-muted-foreground">
                                Enter your credentials to access your account
                            </p>
                        </motion.div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <motion.div
                                className="space-y-2"
                                variants={slideUp}
                                initial="initial"
                                animate="animate"
                                transition={{ delay: 0.3 }}
                            >
                                <Label htmlFor="email" className="text-foreground/80">
                                    Email Address
                                </Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-cyan-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-10 glass border-white/10 focus:border-cyan-400/50 transition-all"
                                    />
                                </div>
                            </motion.div>

                            {/* Password Field */}
                            <motion.div
                                className="space-y-2"
                                variants={slideUp}
                                initial="initial"
                                animate="animate"
                                transition={{ delay: 0.4 }}
                            >
                                <Label htmlFor="password" className="text-foreground/80">
                                    Password
                                </Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-cyan-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pl-10 pr-10 glass border-white/10 focus:border-cyan-400/50 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-cyan-400 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </motion.div>

                            {/* Submit Button */}
                            <motion.div
                                variants={slideUp}
                                initial="initial"
                                animate="animate"
                                transition={{ delay: 0.5 }}
                            >
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full relative group overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold py-6 transition-all"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {isLoading ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                >
                                                    <Sparkles className="h-5 w-5" />
                                                </motion.div>
                                                Logging in...
                                            </>
                                        ) : (
                                            <>
                                                <LogIn className="h-5 w-5" />
                                                Login
                                            </>
                                        )}
                                    </span>
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-600/20"
                                        animate={{
                                            x: ['-100%', '100%'],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: 'linear',
                                        }}
                                    />
                                </Button>
                            </motion.div>

                            {/* Register Link */}
                            <motion.div
                                className="text-center text-sm"
                                variants={fadeIn}
                                initial="initial"
                                animate="animate"
                                transition={{ delay: 0.6 }}
                            >
                                <span className="text-muted-foreground">Don't have an account? </span>
                                <Link
                                    to="/register"
                                    className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                                >
                                    Register now
                                </Link>
                            </motion.div>
                        </form>
                    </GlassCard>
                </NeonBorder>

                {/* Floating Orbs */}
                <motion.div
                    className="absolute -top-20 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.6, 0.3, 0.6],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            </motion.div>
        </div>
    );
};

export default LoginPage;