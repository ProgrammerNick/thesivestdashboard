import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    History,
    MessageSquare,
    Trash2,
    Clock,
    TrendingUp,
    Building2,
    Plus,
    Home
} from "lucide-react";
import { getChatSessions, deleteChatSession } from "@/server/fn/chat-history";
import { authClient } from "@/lib/auth-client";

interface ChatSession {
    id: string;
    type: string;
    contextId: string;
    title: string;
    preview: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export function ResearchSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { data: session } = authClient.useSession();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Determine if we're on a stock or fund research page
    const isStockResearch = location.pathname.includes("/stock-research");
    const currentType = isStockResearch ? "stock" : "fund-intelligence";

    // Get current session ID from URL
    const pathParts = location.pathname.split("/");
    const currentSessionId = pathParts[pathParts.length - 1];

    useEffect(() => {
        loadSessions();
    }, [session?.user?.id, currentType]);

    const loadSessions = async () => {
        if (!session?.user?.id) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const data = await getChatSessions({
                data: {
                    userId: session.user.id,
                    type: currentType,
                },
            });
            setSessions(data as ChatSession[]);
        } catch (error) {
            console.error("Failed to load chat sessions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await deleteChatSession({ data: { sessionId } });
            setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        } catch (error) {
            console.error("Failed to delete session:", error);
        }
    };

    const handleSelectSession = (sessionId: string) => {
        if (isStockResearch) {
            navigate({ to: "/stock-research/$sessionId", params: { sessionId } });
        } else {
            navigate({ to: "/chat/$sessionId", params: { sessionId } });
        }
    };

    const handleBackToDashboard = () => {
        if (isStockResearch) {
            navigate({ to: "/stocks" });
        } else {
            navigate({ to: "/fund-intelligence" });
        }
    };

    const handleNewResearch = () => {
        if (isStockResearch) {
            navigate({ to: "/stocks" });
        } else {
            navigate({ to: "/fund-intelligence" });
        }
    };

    // Group by date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todaySessions = sessions.filter(s => new Date(s.updatedAt) >= today);
    const yesterdaySessions = sessions.filter(s => {
        const d = new Date(s.updatedAt);
        return d >= yesterday && d < today;
    });
    const olderSessions = sessions.filter(s => new Date(s.updatedAt) < yesterday);

    return (
        <Sidebar>
            <SidebarHeader className="border-b border-sidebar-border">
                <div className="flex items-center justify-between px-2 py-2">
                    <div className="flex items-center gap-2">
                        {isStockResearch ? (
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        ) : (
                            <Building2 className="w-5 h-5 text-blue-500" />
                        )}
                        <span className="font-semibold text-sm">
                            {isStockResearch ? "Stock Research" : "Fund Research"}
                        </span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                {/* Back to Dashboard */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton onClick={handleBackToDashboard} className="text-muted-foreground hover:text-foreground">
                                    <Home className="w-4 h-4" />
                                    <span>Back to Dashboard</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton onClick={handleNewResearch} className="text-primary">
                                    <Plus className="w-4 h-4" />
                                    <span>New Research</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Chat History */}
                <SidebarGroup>
                    <SidebarGroupLabel className="flex items-center gap-2">
                        <History className="w-4 h-4" />
                        History
                        <Badge variant="secondary" className="ml-auto text-xs">
                            {sessions.length}
                        </Badge>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <ScrollArea className="h-[calc(100vh-250px)]">
                            {isLoading ? (
                                <div className="px-2 py-4 text-center text-muted-foreground text-sm">
                                    Loading...
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="px-2 py-8 text-center">
                                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                                    <p className="text-sm text-muted-foreground">No conversations yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4 px-2">
                                    {todaySessions.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                                Today
                                            </p>
                                            <div className="space-y-1">
                                                {todaySessions.map((chatSession) => (
                                                    <SessionItem
                                                        key={chatSession.id}
                                                        session={chatSession}
                                                        isActive={currentSessionId === chatSession.id}
                                                        onSelect={handleSelectSession}
                                                        onDelete={handleDelete}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {yesterdaySessions.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                                Yesterday
                                            </p>
                                            <div className="space-y-1">
                                                {yesterdaySessions.map((chatSession) => (
                                                    <SessionItem
                                                        key={chatSession.id}
                                                        session={chatSession}
                                                        isActive={currentSessionId === chatSession.id}
                                                        onSelect={handleSelectSession}
                                                        onDelete={handleDelete}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {olderSessions.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                                Older
                                            </p>
                                            <div className="space-y-1">
                                                {olderSessions.map((chatSession) => (
                                                    <SessionItem
                                                        key={chatSession.id}
                                                        session={chatSession}
                                                        isActive={currentSessionId === chatSession.id}
                                                        onSelect={handleSelectSession}
                                                        onDelete={handleDelete}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ScrollArea>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border p-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBackToDashboard}
                    className="w-full gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Return to Dashboard
                </Button>
            </SidebarFooter>
        </Sidebar>
    );
}

function SessionItem({
    session,
    isActive,
    onSelect,
    onDelete
}: {
    session: ChatSession;
    isActive: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
}) {
    return (
        <div
            onClick={() => onSelect(session.id)}
            className={`
                group cursor-pointer rounded-lg p-2 transition-all duration-200
                hover:bg-sidebar-accent
                ${isActive ? "bg-sidebar-accent border border-primary/30" : "border border-transparent"}
            `}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <MessageSquare className="w-3 h-3 text-primary shrink-0" />
                        <span className="font-medium text-xs truncate">
                            {session.title}
                        </span>
                    </div>
                    {session.preview && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                            {session.preview}
                        </p>
                    )}
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(session.updatedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </div>
                </div>

                {/* Delete Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                    onClick={(e) => onDelete(session.id, e)}
                >
                    <Trash2 className="w-3 h-3" />
                </Button>
            </div>
        </div>
    );
}
