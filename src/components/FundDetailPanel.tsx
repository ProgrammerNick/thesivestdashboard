import { ArrowUpRight, ArrowDownRight, MessageSquareText, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
import { InstitutionalFund } from "@/server/data/fund-data";
import { Link } from "@tanstack/react-router";

interface FundDetailPanelProps {
    fund: InstitutionalFund;
    onAskAI?: () => void; // Made optional - now navigates to chat page
    onClose: () => void;
}

export function FundDetailPanel({ fund, onAskAI, onClose }: FundDetailPanelProps) {
    return (
        <div
            className="animate-in slide-in-from-bottom-4 fade-in duration-300"
        >
            <Card className="border-primary/20 bg-card">
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                {fund.name}
                                <Badge variant="secondary" className="text-xs">
                                    {fund.aum}
                                </Badge>
                            </CardTitle>
                            <CardDescription className="mt-1">
                                {fund.manager} • {fund.strategy}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                to="/chat/$sessionId"
                                params={{ sessionId: "new" }}
                                search={{ type: "fund-intelligence", id: fund.id, name: fund.name }}
                            >
                                <Button className="gap-2">
                                    <MessageSquareText className="w-4 h-4" />
                                    Ask AI
                                </Button>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Philosophy */}
                    <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                        <h4 className="text-sm font-semibold mb-2">Investment Philosophy</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {fund.philosophy}
                        </p>
                    </div>

                    {/* Focus Areas */}
                    <div>
                        <h4 className="text-sm font-semibold mb-2">Focus Areas</h4>
                        <div className="flex flex-wrap gap-2">
                            {fund.focus.map((area) => (
                                <Badge key={area} variant="outline">
                                    {area}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Holdings */}
                        <div>
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                Top Holdings
                                <Badge variant="secondary" className="text-xs">
                                    {fund.topHoldings.length} positions
                                </Badge>
                            </h4>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Symbol</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="text-right">Weight</TableHead>
                                        <TableHead className="text-right">Change</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fund.topHoldings.map((holding) => (
                                        <TableRow key={holding.symbol}>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono">
                                                    {holding.symbol}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">{holding.name}</TableCell>
                                            <TableCell className="text-right font-mono text-sm">
                                                {holding.percent}%
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {holding.change && (
                                                    <Badge
                                                        variant={holding.change === "new" ? "default" : "secondary"}
                                                        className={`text-xs ${holding.change === "add" || holding.change === "new"
                                                            ? "text-green-600 bg-green-500/10"
                                                            : holding.change === "trim" || holding.change === "exit"
                                                                ? "text-red-600 bg-red-500/10"
                                                                : ""
                                                            }`}
                                                    >
                                                        {holding.change === "new" && "NEW"}
                                                        {holding.change === "add" && `+${holding.changePercent}%`}
                                                        {holding.change === "trim" && `${holding.changePercent}%`}
                                                        {holding.change === "exit" && "EXIT"}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Recent Moves */}
                        <div>
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                Recent Portfolio Changes
                                <Badge variant="secondary" className="text-xs">
                                    This Quarter
                                </Badge>
                            </h4>
                            <div className="space-y-3">
                                {fund.recentMoves.map((move, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${move.action === "Buy"
                                                ? "bg-green-500/10 text-green-500"
                                                : "bg-red-500/10 text-red-500"
                                                }`}>
                                                {move.action === "Buy" ? (
                                                    <ArrowUpRight className="w-4 h-4" />
                                                ) : (
                                                    <ArrowDownRight className="w-4 h-4" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-mono font-semibold">{move.ticker}</div>
                                                <div className="text-xs text-muted-foreground">{move.type}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-sm font-mono ${move.action === "Buy" ? "text-green-500" : "text-red-500"
                                                }`}>
                                                {move.shares}
                                            </div>
                                            <div className="text-xs text-muted-foreground">{move.value}</div>
                                        </div>
                                    </div>
                                ))}
                                {fund.recentMoves.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No significant changes this quarter
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Performance Summary */}
                    {(fund.quarterlyReturn !== undefined || fund.ytdReturn !== undefined) && (
                        <div className="flex items-center gap-6 pt-4 border-t border-border/50">
                            {fund.quarterlyReturn !== undefined && (
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Quarterly Return</div>
                                    <div className={`text-xl font-bold ${fund.quarterlyReturn >= 0 ? "text-green-500" : "text-red-500"
                                        }`}>
                                        {fund.quarterlyReturn >= 0 ? "+" : ""}{fund.quarterlyReturn}%
                                    </div>
                                </div>
                            )}
                            {fund.ytdReturn !== undefined && (
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Year to Date</div>
                                    <div className={`text-xl font-bold ${fund.ytdReturn >= 0 ? "text-green-500" : "text-red-500"
                                        }`}>
                                        {fund.ytdReturn >= 0 ? "+" : ""}{fund.ytdReturn}%
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
