import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Link } from "@tanstack/react-router";
import { Check, Plus } from "lucide-react";

// Mock suggestions (ideally this comes from DB)
const SUGGESTIONS = [
    { id: "1", name: "Sarah Chen", handle: "@schen_cap", role: "Macro Analyst", avatar: null, initial: "S" },
    { id: "2", name: "David Kim", handle: "@dkim_value", role: "Value Investor", avatar: null, initial: "D" },
    { id: "3", name: "Quant Club", handle: "@mit_quant", role: "MIT Club", avatar: null, initial: "Q" },
];

export function WhoToFollow() {
    return (
        <Card className="bg-card/40 backdrop-blur-sm border-border/60">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Who to Follow
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {SUGGESTIONS.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link to={`/profiles/${user.id}`} className="block">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20">
                                    {user.initial}
                                </div>
                            </Link>
                            <div className="flex flex-col">
                                <Link to={`/profiles/${user.id}`} className="text-sm font-semibold hover:underline">
                                    {user.name}
                                </Link>
                                <span className="text-[10px] text-muted-foreground">{user.role}</span>
                            </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
                <Button variant="outline" className="w-full text-xs" size="sm">
                    View More
                </Button>
            </CardContent>
        </Card>
    );
}
