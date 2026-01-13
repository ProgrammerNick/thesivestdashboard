import { Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { authClient } from "@/lib/auth-client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Link } from "@tanstack/react-router";

export function DashboardHeader() {
    const { data: session } = authClient.useSession();

    return (
        <header className="h-16 border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-10 px-6 flex items-center justify-between">
            {/* Left side - Sidebar trigger */}
            <div className="flex items-center">
                <SidebarTrigger />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 pl-6">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
                </Button>

                <div className="h-6 w-px bg-border/50" />

                {session?.user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={session.user.image || undefined} alt={session.user.name} />
                                    <AvatarFallback>{session.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{session.user.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link to="/profile">Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500">Sign out</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>
    );
}
