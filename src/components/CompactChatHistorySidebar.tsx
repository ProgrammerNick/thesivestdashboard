import { useState, useEffect } from "react";
import { History, MessageSquare, Trash2, Clock, X } from "lucide-react";
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

interface CompactChatHistorySidebarProps {
    type?: "fund" | "stock" | "fund-intelligence";
    onSelectSession: (sessionId: string) => void;
    currentSessionId?: string;
    onClose?: () => void;
    showAllTypes?: boolean; // Show all chat types regardless of filter
    hideHeader?: boolean;
}

export function CompactChatHistorySidebar({
    type,
    onSelectSession,
    currentSessionId,
    onClose,
    showAllTypes = false,
    hideHeader = false
}: CompactChatHistorySidebarProps) {
    const { data: session } = authClient.useSession();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSessions();
    }, [session?.user?.id, type]);

    const loadSessions = async () => {
        if (!session?.user?.id) return;
        setIsLoading(true);
        try {
            const data = await getChatSessions({
                data: {
                    userId: session.user.id,
                    ...(showAllTypes ? {} : { type })
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

    if (sessions.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-sm">History</h3>
                    </div>
                    {onClose && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <MessageSquare className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No conversations yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col border-l border-border">
            {/* Header */}
            {!hideHeader && (
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/50">
                    <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-sm">History</h3>
                        <Badge variant="secondary" className="text-xs px-1.5">
                            {sessions.length}
                        </Badge>
                    </div>
                    {onClose && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            )}

            {/* Sessions */}
            <ScrollArea className="flex-1">
                <div className="p-3 space-y-4">
                    {todaySessions.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                                Today
                            </p>
                            <div className="space-y-1">
                                {todaySessions.map((chatSession) => (
                                    <SessionItem
                                        key={chatSession.id}
                                        session={chatSession}
                                        isActive={currentSessionId === chatSession.id}
                                        onSelect={onSelectSession}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {yesterdaySessions.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                                Yesterday
                            </p>
                            <div className="space-y-1">
                                {yesterdaySessions.map((chatSession) => (
                                    <SessionItem
                                        key={chatSession.id}
                                        session={chatSession}
                                        isActive={currentSessionId === chatSession.id}
                                        onSelect={onSelectSession}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {olderSessions.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                                Older
                            </p>
                            <div className="space-y-1">
                                {olderSessions.map((chatSession) => (
                                    <SessionItem
                                        key={chatSession.id}
                                        session={chatSession}
                                        isActive={currentSessionId === chatSession.id}
                                        onSelect={onSelectSession}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
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
                hover:bg-muted/50
                ${isActive ? "bg-primary/10 border border-primary/30" : "border border-transparent"}
            `}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <MessageSquare className="w-3 h-3 text-primary shrink-0" />
                        <span className="font-medium text-xs truncate">
                            {session.title}
                        </span>
                        {(session.type === "fund" || session.type === "fund-intelligence") ? (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 bg-blue-500/10 text-blue-500 border-blue-500/20 shrink-0">Fund</Badge>
                        ) : (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 bg-green-500/10 text-green-500 border-green-500/20 shrink-0">Stock</Badge>
                        )}
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
