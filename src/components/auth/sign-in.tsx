import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowRight } from "lucide-react"
import { motion } from "motion/react"
import { Link } from "@tanstack/react-router"

export function SignIn() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        await authClient.signIn.email({
            email,
            password,
        }, {
            onRequest: () => {
                setLoading(true)
            },
            onSuccess: () => {
                window.location.href = "/" // Redirect to dashboard
            },
            onError: (ctx) => {
                setError(ctx.error.message)
                setLoading(false)
            }
        })
    }


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="w-full bg-card/50 backdrop-blur-xl border-border shadow-2xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-center">Welcome back</CardTitle>
                    <CardDescription className="text-center text-muted-foreground">
                        Enter your credentials to access your thesis
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-background/50 border-input transition-all focus:ring-2 focus:ring-primary/20"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    to="/login"
                                    className="text-xs text-primary hover:text-primary/80 font-medium"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                showPasswordToggle
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-background/50 border-input transition-all focus:ring-2 focus:ring-primary/20"
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded-md font-medium">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In
                            {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="bg-background/50 hover:bg-muted" disabled={loading}>
                            {/* Using text for now as icons need importing */}
                            Google
                        </Button>
                        <Button variant="outline" className="bg-background/50 hover:bg-muted" disabled={loading}>
                            Github
                        </Button>
                    </div>

                </CardContent>
                <CardFooter className="flex justify-center text-sm text-muted-foreground gap-1">
                    Don't have an account?
                    <Link
                        to="/signup"
                        className="text-primary hover:text-primary/80 font-semibold transition-colors hover:underline"
                    >
                        Sign Up
                    </Link>
                </CardFooter>
            </Card>
        </motion.div>
    )
}
