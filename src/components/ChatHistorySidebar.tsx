import { useState, useEffect } from "react";
import { History, MessageSquare, Trash2, Clock, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
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

interface ChatHistorySidebarProps {
    type: "fund" | "stock" | "fund-intelligence";
    onSelectSession: (sessionId: string) => void;
    currentSessionId?: string;
}

// Helper to group sessions by date
function groupByDate(sessions: ChatSession[]): Record<string, ChatSession[]> {
    const groups: Record<string, ChatSession[]> = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    sessions.forEach((session) => {
        const sessionDate = new Date(session.updatedAt);
        let groupKey: string;

        if (sessionDate >= today) {
            groupKey = "Today";
        } else if (sessionDate >= yesterday) {
            groupKey = "Yesterday";
        } else if (sessionDate >= lastWeek) {
            groupKey = "Last 7 Days";
        } else {
            groupKey = "Older";
        }

        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(session);
    });

    return groups;
}

export function ChatHistorySidebar({ type, onSelectSession, currentSessionId }: ChatHistorySidebarProps) {
    const { data: session } = authClient.useSession();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        Today: true,
        Yesterday: true,
        "Last 7 Days": false,
        Older: false,
    });

    useEffect(() => {
        loadSessions();
    }, [session?.user?.id, type]);

    const loadSessions = async () => {
        if (!session?.user?.id) return;
        setIsLoading(true);
        try {
            const data = await getChatSessions({
                data: { userId: session.user.id, type },
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

    const toggleGroup = (group: string) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [group]: !prev[group],
        }));
    };

    const groupedSessions = groupByDate(sessions);
    const groupOrder = ["Today", "Yesterday", "Last 7 Days", "Older"];

    if (sessions.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">No Conversations Yet</h3>
                <p className="text-sm text-muted-foreground">
                    Start chatting to build your research history
                </p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
                <History className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Chat History</h3>
                <Badge variant="secondary" className="ml-auto text-xs">
                    {sessions.length}
                </Badge>
            </div>

            {/* Timeline */}
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    {groupOrder.map((group) => {
                        const groupSessions = groupedSessions[group];
                        if (!groupSessions || groupSessions.length === 0) return null;

                        const isExpanded = expandedGroups[group];

                        return (
                            <div key={group} className="relative">
                                {/* Group Header */}
                                <button
                                    onClick={() => toggleGroup(group)}
                                    className="flex items-center gap-2 w-full text-left py-2 hover:text-primary transition-colors"
                                >
                                    {isExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    )}
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        {group}
                                    </span>
                                    <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0">
                                        {groupSessions.length}
                                    </Badge>
                                </button>

                                {/* Sessions with Timeline */}
                                {isExpanded && (
                                    <div className="relative ml-2 pl-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                        {/* Vertical timeline line */}
                                        <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />

                                        {groupSessions.map((chatSession, index) => (
                                            <div
                                                key={chatSession.id}
                                                className="relative"
                                                style={{
                                                    animationDelay: `${index * 50}ms`,
                                                }}
                                            >
                                                {/* Timeline dot */}
                                                <div
                                                    className={`absolute -left-4 top-3 w-2 h-2 rounded-full border-2 transition-colors ${currentSessionId === chatSession.id
                                                            ? "bg-primary border-primary"
                                                            : "bg-background border-border"
                                                        }`}
                                                />

                                                {/* Session Card */}
                                                <div
                                                    onClick={() => onSelectSession(chatSession.id)}
                                                    className={`
                            group cursor-pointer rounded-lg p-3 transition-all duration-200
                            hover:bg-muted/50 hover:shadow-sm hover:translate-x-1
                            ${currentSessionId === chatSession.id
                                                            ? "bg-primary/10 border border-primary/30"
                                                            : "bg-card/50 border border-transparent"
                                                        }
                          `}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <MessageSquare className="w-3 h-3 text-primary shrink-0" />
                                                                <span className="font-medium text-sm truncate">
                                                                    {chatSession.title}
                                                                </span>
                                                            </div>
                                                            {chatSession.preview && (
                                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                                    {chatSession.preview}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                                                                <Clock className="w-3 h-3" />
                                                                {new Date(chatSession.updatedAt).toLocaleTimeString([], {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* Delete Button */}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                                                            onClick={(e) => handleDelete(chatSession.id, e)}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}
