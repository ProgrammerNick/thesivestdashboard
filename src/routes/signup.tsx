import { createFileRoute, redirect } from "@tanstack/react-router";
import { checkAuth } from '../server/features/auth'
import { SignUp } from '../components/auth/sign-up'
import { motion } from 'motion/react'

export const Route = createFileRoute('/signup')({
    loader: async () => {
        const session = await checkAuth();
        if (session) {
            throw redirect({ to: "/dashboard" });
        }
    },
    component: SignUpPage,
})

function SignUpPage() {
    return (
        <div className="min-h-screen w-full flex bg-background text-foreground">
            {/* Left Column - Visuals */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden bg-zinc-900 p-12 text-white">
                {/* Abstract Background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background/0 to-background/0 opacity-40 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/20 backdrop-blur">
                            <div className="w-3 h-3 rounded-full bg-primary shadow-sm shadow-primary" />
                        </div>
                        Thesivest
                    </div>
                </div>

                <div className="relative z-10 space-y-6 max-w-lg">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl font-extrabold tracking-tight leading-tight"
                    >
                        Join the community of deep-value hunters.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg text-zinc-400"
                    >
                        Find the asymmetry the market is missing. Start your journey with Thesivest today.
                    </motion.p>
                </div>

                <div className="relative z-10 flex items-center gap-4 text-xs font-medium text-zinc-500">
                    <span>© 2024 Thesivest Inc.</span>
                </div>
            </div>

            {/* Right Column - Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none lg:hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[100px]" />
                </div>

                <div className="w-full max-w-md relative z-10">
                    <SignUp />
                </div>
            </div>
        </div>
    )
}
