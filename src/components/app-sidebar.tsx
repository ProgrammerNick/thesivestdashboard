import {
    TrendingUp,
    Users,
    User,
    LogOut,
    LayoutDashboard,
    PieChart,
    Briefcase,
    Settings,
    BrainCircuit,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client";
import { Link, useRouterState } from "@tanstack/react-router";

export function AppSidebar() {
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
        { label: "Stock Research", href: "/stocks", icon: TrendingUp },
        { label: "Fund Research", href: "/funds", icon: PieChart },
        { label: "Fund Intelligence", href: "/fund-intelligence", icon: BrainCircuit },
        { label: "Community", href: "/community", icon: Users },
        { label: "Profile", href: "/profile", icon: User },
        { label: "Talent Search", href: "/talent", icon: Briefcase },
        { label: "Job Board", href: "/jobs", icon: Briefcase },
    ];

    return (
        <Sidebar>
            <SidebarHeader className="border-b border-border/50 p-4">
                <Link to="/dashboard" className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
                        <TrendingUp className="text-primary-foreground w-5 h-5" />
                    </div>
                    <span className="text-xl font-heading font-bold tracking-tight text-foreground">
                        Thesivest
                    </span>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.label}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.href)}
                                        className="h-10 transition-all font-medium"
                                    >
                                        <Link to={item.href}>
                                            <item.icon className={isActive(item.href) ? "text-primary" : "text-muted-foreground"} />
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-border/50 p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleSignOut}
                            className="h-10 text-muted-foreground hover:text-foreground"
                        >
                            <LogOut />
                            <span>Sign Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
