import { Link, useRouterState } from "@tanstack/react-router";
import {
    LayoutDashboard,
    PieChart,
    TrendingUp,
    Settings,
    Trophy,
    LogOut,
    Users
} from "lucide-react";
import { Button } from "./ui/button";
import { authClient } from "@/lib/auth-client";

interface SidebarProps {
    className?: string;
}

export function DashboardSidebar({ className }: SidebarProps) {
    const router = useRouterState();
    const currentPath = router.location.pathname;

    const isActive = (path: string) => currentPath.startsWith(path);

    const handleSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    window.location.href = "/"
                }
            }
        });
    };

    const navItems = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Fund Intelligence", href: "/funds", icon: PieChart },
        { label: "Tournaments", href: "/dashboard/tournaments", icon: Trophy },
        { label: "Community", href: "/contributors", icon: Users },
        { label: "Settings", href: "/settings", icon: Settings },
    ];

    return (
        <div className={`h-screen w-64 bg-card border-r border-border flex flex-col ${className}`}>
            {/* Logo Area */}
            <div className="p-6 border-b border-border/50">
                <Link to="/dashboard" className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
                        <TrendingUp className="text-primary-foreground w-5 h-5" />
                    </div>
                    <span className="text-xl font-heading font-bold tracking-tight text-foreground">
                        Thesivest
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        to={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${isActive(item.href)
                            ? "bg-primary/10 text-primary hover:bg-primary/15"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                    >
                        <item.icon className={`w-5 h-5 ${isActive(item.href) ? "text-primary" : "text-muted-foreground"}`} />
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-border/50 space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground" onClick={handleSignOut}>
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
