
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
    MessageSquare,
    Plus,
    LayoutDashboard,
    MoreHorizontal,
    Trash2,
    Pencil,
    ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { getChatSessions, deleteChatSession, updateChatSessionTitle } from "@/server/fn/chat-history";
import { cn } from "@/lib/utils";

interface StockHistorySidebarProps {
    className?: string;
}

export function StockHistorySidebar({ className }: StockHistorySidebarProps) {
    const navigate = useNavigate();
    const params = useParams({ strict: false });
    const currentSessionId = (params as any).sessionId;
    const { data: session } = authClient.useSession();

    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.id) {
            loadHistory();
        }
    }, [session?.user?.id]);

    const loadHistory = async () => {
        if (!session?.user?.id) return;
        try {
            const data = await getChatSessions({
                data: {
                    userId: session.user.id,
                    type: "stock",
                    limit: 50
                }
            });
            setHistory(data);
        } catch (error) {
            console.error("Failed to load history:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this chat?")) {
            await deleteChatSession({ data: { sessionId } });
            setHistory(prev => prev.filter(h => h.id !== sessionId));
            if (currentSessionId === sessionId) {
                navigate({ to: "/stocks" });
            }
        }
    };

    const handleNewChat = () => {
        navigate({ to: "/stocks" });
    };

    return (
        <Sidebar className={className}>
            <SidebarHeader className="p-4 border-b border-border/50">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2 mb-2"
                    onClick={() => navigate({ to: "/dashboard" })}
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Dashboard
                </Button>
                <Button
                    onClick={handleNewChat}
                    className="w-full justify-start gap-2"
                    variant="secondary"
                >
                    <Plus className="w-4 h-4" />
                    New Analysis
                </Button>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Recent Research</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {isLoading ? (
                                <div className="p-4 text-sm text-muted-foreground text-center">
                                    Loading history...
                                </div>
                            ) : history.length === 0 ? (
                                <div className="p-4 text-sm text-muted-foreground text-center">
                                    No research history yet.
                                </div>
                            ) : (
                                history.map((item) => (
                                    <SidebarMenuItem key={item.id}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={currentSessionId === item.id}
                                            className="group relative pr-8"
                                        >
                                            <Link
                                                to="/stock-research/$sessionId"
                                                params={{ sessionId: item.id }}
                                                search={{ symbol: item.contextId }}
                                                className="flex items-center gap-2 overflow-hidden"
                                            >
                                                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                                                <span className="truncate">{item.title}</span>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={(e) => e.preventDefault()}
                                                        >
                                                            <MoreHorizontal className="w-3 h-3" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={(e) => handleDeleteSession(e, item.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4 border-t border-border/50">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {session?.user?.name?.[0] || "U"}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate">{session?.user?.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{session?.user?.email}</span>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
