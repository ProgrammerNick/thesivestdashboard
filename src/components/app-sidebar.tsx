import { TrendingUp } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client";
import { Link, useRouterState } from "@tanstack/react-router";

interface NavItem {
    label: string;
    href: string;
    employerOnly?: boolean; // Only show to employers/companies
}

interface NavGroup {
    label: string;
    items: NavItem[];
}

export function AppSidebar() {
    const router = useRouterState();
    const currentPath = router.location.pathname;
    const { data: session } = authClient.useSession();

    // Check if user is an employer (isCompany flag) - cast to any to access custom field
    const isEmployer = (session?.user as any)?.isCompany ?? false;

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

    // Grouped navigation items
    const navGroups: NavGroup[] = [
        {
            label: "Overview",
            items: [
                { label: "Dashboard", href: "/dashboard" },
            ],
        },
        {
            label: "AI Research",
            items: [
                { label: "Stock Research", href: "/stocks" },
                { label: "Fund Research", href: "/funds" },
                { label: "Fund Intelligence", href: "/fund-intelligence" },
            ],
        },
        {
            label: "Community",
            items: [
                { label: "Feed", href: "/community" },
                { label: "Write", href: "/research" },
                { label: "Profile", href: "/profile" },
            ],
        },
        {
            label: "Career",
            items: [
                { label: "Talent Search", href: "/talent", employerOnly: true },
                { label: "Job Board", href: "/jobs" },
                { label: "Tournaments", href: "/tournaments" },
            ],
        },
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
                {navGroups.map((group) => {
                    // Filter items based on employer status
                    const visibleItems = group.items.filter(
                        (item) => !item.employerOnly || isEmployer
                    );

                    // Skip group if no visible items
                    if (visibleItems.length === 0) return null;

                    return (
                        <SidebarGroup key={group.label}>
                            <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 px-3 py-2">
                                {group.label}
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {visibleItems.map((item) => (
                                        <SidebarMenuItem key={item.label}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive(item.href)}
                                                className="h-10 transition-all font-medium"
                                            >
                                                <Link to={item.href}>
                                                    <span>{item.label}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    );
                })}
            </SidebarContent>
            <SidebarFooter className="border-t border-border/50 p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleSignOut}
                            className="h-10 text-muted-foreground hover:text-foreground"
                        >
                            <span>Sign Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
