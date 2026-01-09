import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Link } from "@tanstack/react-router";
import { Trophy, TrendingUp } from "lucide-react";

// Mock Data for Leaderboard
const TOP_USERS = [
    { id: "u1", name: "Alex Hormozi", return: "+12.4%", rank: 1, avatar: null, initial: "A" },
    { id: "u2", name: "Nancy P.", return: "+8.2%", rank: 2, avatar: null, initial: "N" },
    { id: "u3", name: "RoaringKitty", return: "+6.9%", rank: 3, avatar: null, initial: "R" },
    { id: "u4", name: "Warren B.", return: "+4.1%", rank: 4, avatar: null, initial: "W" },
    { id: "u5", name: "Cathie Wood", return: "+3.8%", rank: 5, avatar: null, initial: "C" },
];

export function UserLeaderboard() {
    return (
        <Card className="bg-card/40 backdrop-blur-sm border-border/60">
            <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        Daily Top Performers
                    </CardTitle>
                    <span className="text-[10px] text-green-500 font-bold animate-pulse">LIVE</span>
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                {TOP_USERS.map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border
                    ${index === 0 ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' :
                                    index === 1 ? 'bg-gray-400/20 text-gray-400 border-gray-400/50' :
                                        index === 2 ? 'bg-amber-700/20 text-amber-700 border-amber-700/50' :
                                            'bg-muted text-muted-foreground border-border'}
                 `}>
                                {user.rank}
                            </div>
                            <Link to={`/profiles/${user.id}`} className="text-sm font-semibold hover:text-primary transition-colors">
                                {user.name}
                            </Link>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="font-bold text-sm text-green-600 dark:text-green-400 tabular-nums">
                                {user.return}
                            </span>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
