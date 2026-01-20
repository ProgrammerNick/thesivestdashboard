import { useState, useEffect } from "react";
import { History, MessageSquare, Trash2, Edit2, X, Check, Clock, ChevronDown, ChevronUp, RefreshCw, Sparkles, BookOpen } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { getChatSessions, deleteChatSession, updateChatSessionTitle, getChatSession } from "@/server/fn/chat-history";
import { authClient } from "@/lib/auth-client";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { ScrollArea } from "./ui/scroll-area";

interface ChatSession {
    id: string;
    type: string;
    contextId: string;
    title: string;
    preview: string | null;
    createdAt: Date;
    updatedAt: Date;
}

interface SavedChatsProps {
    type: "fund" | "stock" | "fund-intelligence";
    contextId: string; // Current stock symbol or fund name/id
    onLoadSession: (sessionId: string) => void;
    currentSessionId?: string;
    onRefresh?: () => void;
}

export function SavedChats({ type, contextId, onLoadSession, currentSessionId, onRefresh }: SavedChatsProps) {
    const { data: session } = authClient.useSession();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(true); // Expanded by default
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([]);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        if (session?.user?.id) {
            loadSessions();
        }
    }, [session?.user?.id, type, contextId]);

    // Filter sessions to only show those matching the current context
    useEffect(() => {
        if (showAll) {
            setFilteredSessions(sessions);
        } else {
            const filtered = sessions.filter(s => s.contextId === contextId);
            setFilteredSessions(filtered);
        }
    }, [sessions, contextId, showAll]);

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
            if (sessionId === currentSessionId && onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error("Failed to delete session:", error);
        }
    };

    const handleEditStart = (session: ChatSession) => {
        setEditingId(session.id);
        setEditTitle(session.title);
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditTitle("");
    };

    const handleEditSave = async (sessionId: string) => {
        if (!editTitle.trim()) {
            handleEditCancel();
            return;
        }
        try {
            await updateChatSessionTitle({ data: { sessionId, title: editTitle.trim() } });
            setSessions((prev) =>
                prev.map((s) => (s.id === sessionId ? { ...s, title: editTitle.trim() } : s))
            );
            setEditingId(null);
            setEditTitle("");
        } catch (error) {
            console.error("Failed to update session title:", error);
        }
    };

    const handleLoadSession = async (sessionId: string) => {
        try {
            const sessionData = await getChatSession({ data: { sessionId } });
            if (sessionData) {
                onLoadSession(sessionId);
            }
        } catch (error) {
            console.error("Failed to load session:", error);
        }
    };

    const contextSessions = sessions.filter(s => s.contextId === contextId);
    const otherSessions = sessions.filter(s => s.contextId !== contextId);
    const hasContextSessions = contextSessions.length > 0;
    const hasOtherSessions = otherSessions.length > 0;

    return (
        <Card className="mt-6 border-primary/20 bg-gradient-to-br from-card to-card/50 shadow-lg">
            <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-bold text-base flex items-center gap-2">
                                Chat History
                                {filteredSessions.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                        {filteredSessions.length}
                                    </Badge>
                                )}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {hasContextSessions 
                                    ? `${contextSessions.length} conversation${contextSessions.length !== 1 ? 's' : ''} for this ${type === 'stock' ? 'stock' : 'fund'}`
                                    : 'No conversations yet for this ' + (type === 'stock' ? 'stock' : 'fund')
                                }
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={loadSessions}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            {isLoading ? (
                                <div className="text-center py-8">
                                    <RefreshCw className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">Loading conversations...</p>
                                </div>
                            ) : filteredSessions.length === 0 ? (
                                <div className="text-center py-8 px-4">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                        <Sparkles className="w-8 h-8 text-primary" />
                                    </div>
                                    <h5 className="font-semibold mb-1">No conversations yet</h5>
                                    <p className="text-sm text-muted-foreground">
                                        Start chatting with the AI to save your conversations here
                                    </p>
                                </div>
                            ) : (
                                <ScrollArea className="max-h-96">
                                    <div className="space-y-2 pr-2">
                                        {/* Current Context Sessions */}
                                        {hasContextSessions && (
                                            <>
                                                {contextSessions.map((chatSession) => (
                                                    <ChatSessionCard
                                                        key={chatSession.id}
                                                        chatSession={chatSession}
                                                        currentSessionId={currentSessionId}
                                                        editingId={editingId}
                                                        editTitle={editTitle}
                                                        onEditStart={handleEditStart}
                                                        onEditCancel={handleEditCancel}
                                                        onEditSave={handleEditSave}
                                                        onLoadSession={handleLoadSession}
                                                        onDelete={handleDelete}
                                                        setEditTitle={setEditTitle}
                                                    />
                                                ))}
                                            </>
                                        )}

                                        {/* Other Sessions Toggle */}
                                        {hasOtherSessions && (
                                            <>
                                                <div className="pt-2 border-t border-border/50 mt-3">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="w-full justify-between text-xs text-muted-foreground hover:text-foreground"
                                                        onClick={() => setShowAll(!showAll)}
                                                    >
                                                        <span>
                                                            {showAll ? 'Hide' : 'Show'} {otherSessions.length} other conversation{otherSessions.length !== 1 ? 's' : ''}
                                                        </span>
                                                        {showAll ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                    </Button>
                                                </div>

                                                {showAll && (
                                                    <div className="space-y-2 pt-2">
                                                        {otherSessions.map((chatSession) => (
                                                            <ChatSessionCard
                                                                key={chatSession.id}
                                                                chatSession={chatSession}
                                                                currentSessionId={currentSessionId}
                                                                editingId={editingId}
                                                                editTitle={editTitle}
                                                                onEditStart={handleEditStart}
                                                                onEditCancel={handleEditCancel}
                                                                onEditSave={handleEditSave}
                                                                onLoadSession={handleLoadSession}
                                                                onDelete={handleDelete}
                                                                setEditTitle={setEditTitle}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </ScrollArea>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Card>
    );
}

interface ChatSessionCardProps {
    chatSession: ChatSession;
    currentSessionId?: string;
    editingId: string | null;
    editTitle: string;
    onEditStart: (session: ChatSession) => void;
    onEditCancel: () => void;
    onEditSave: (sessionId: string) => void;
    onLoadSession: (sessionId: string) => void;
    onDelete: (sessionId: string, e: React.MouseEvent) => void;
    setEditTitle: (title: string) => void;
}

function ChatSessionCard({
    chatSession,
    currentSessionId,
    editingId,
    editTitle,
    onEditStart,
    onEditCancel,
    onEditSave,
    onLoadSession,
    onDelete,
    setEditTitle,
}: ChatSessionCardProps) {
    const isActive = currentSessionId === chatSession.id;
    const isEditing = editingId === chatSession.id;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`group relative p-3 rounded-lg border transition-all cursor-pointer ${
                isActive
                    ? "bg-primary/10 border-primary/40 shadow-md"
                    : "bg-muted/30 border-border/50 hover:bg-muted/50 hover:border-border hover:shadow-sm"
            }`}
            onClick={() => !isEditing && onLoadSession(chatSession.id)}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        onEditSave(chatSession.id);
                                    } else if (e.key === "Escape") {
                                        onEditCancel();
                                    }
                                }}
                                className="h-8 text-sm"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditSave(chatSession.id);
                                }}
                            >
                                <Check className="w-4 h-4" />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditCancel();
                                }}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 mb-1.5">
                                <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className={`font-medium text-sm truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
                                    {chatSession.title}
                                </span>
                                {isActive && (
                                    <Badge variant="default" className="text-[10px] px-1.5 py-0">
                                        Active
                                    </Badge>
                                )}
                            </div>
                            {chatSession.preview && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5 ml-6">
                                    {chatSession.preview}
                                </p>
                            )}
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground ml-6">
                                <Clock className="w-3 h-3" />
                                {format(new Date(chatSession.updatedAt), "MMM d, h:mm a")}
                            </div>
                        </>
                    )}
                </div>

                {!isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditStart(chatSession);
                            }}
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-red-500"
                            onClick={(e) => onDelete(chatSession.id, e)}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
