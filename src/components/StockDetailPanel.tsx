import { MessageSquareText, X, Scale, TrendingUp, AlertTriangle, Users, Calendar, BarChart3, LineChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { StockData } from "@/server/fn/stocks";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";

interface StockDetailPanelProps {
    stock: StockData;
    onAskAI: () => void;
    onClose: () => void;
}

export function StockDetailPanel({ stock, onAskAI, onClose }: StockDetailPanelProps) {
    return (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-300">
            <Card className="border-primary/20 bg-card">
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                {stock.companyName}
                                <Badge variant="secondary" className="text-xs font-mono">
                                    {stock.symbol}
                                </Badge>
                            </CardTitle>
                            <CardDescription className="mt-1">
                                {stock.financialHealth}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button className="gap-2" onClick={onAskAI}>
                                <MessageSquareText className="w-4 h-4" />
                                Ask AI
                            </Button>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Business Summary */}
                    <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                        <h4 className="text-sm font-semibold mb-2">Business Model</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {stock.businessSummary}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Moat Analysis */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-blue-500">
                                <Scale className="w-4 h-4" />
                                <h4 className="font-bold uppercase tracking-wider text-xs">Economic Moat</h4>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed bg-card p-3 rounded border border-border/50">
                                {stock.moatAnalysis}
                            </p>
                        </div>

                        {/* Growth Catalysts */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-green-500">
                                <TrendingUp className="w-4 h-4" />
                                <h4 className="font-bold uppercase tracking-wider text-xs">Growth Catalysts</h4>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed bg-card p-3 rounded border border-border/50">
                                {stock.growthCatalysts}
                            </p>
                        </div>
                    </div>

                    {/* Key Risks & Short Interest */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-red-500 mb-3">
                                <AlertTriangle className="w-4 h-4" />
                                <h4 className="font-bold uppercase tracking-wider text-xs">Key Risks</h4>
                            </div>
                            <ul className="space-y-2">
                                {Array.isArray(stock.keyRisks) ? stock.keyRisks.map((risk, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <span className="text-red-500 mt-1">•</span>
                                        <span>{risk}</span>
                                    </li>
                                )) : <li className="text-sm text-muted-foreground">{stock.keyRisks}</li>}
                            </ul>
                        </div>

                        {stock.shortInterest && (
                            <div className="bg-orange-500/5 border border-orange-500/10 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-orange-500 mb-3">
                                    <LineChart className="w-4 h-4" />
                                    <h4 className="font-bold uppercase tracking-wider text-xs">Short Interest Alert</h4>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {stock.shortInterest}
                                </p>
                            </div>
                        )}
                    </div>



                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                        {/* Quality & Management */}
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-emerald-600">
                                <Users className="w-4 h-4" />
                                <h4 className="font-bold uppercase tracking-wider text-xs">Management & Quality</h4>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-card p-3 rounded border border-border/50">
                                    <div className="text-xs font-semibold mb-1 text-muted-foreground uppercase">Capital Allocation</div>
                                    <p className="text-sm text-muted-foreground">{stock.capitalAllocation}</p>
                                </div>
                                <div className="bg-card p-3 rounded border border-border/50">
                                    <div className="text-xs font-semibold mb-1 text-muted-foreground uppercase">Earnings Quality</div>
                                    <p className="text-sm text-muted-foreground">{stock.earningsQuality}</p>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Catalysts */}
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-blue-600">
                                <Calendar className="w-4 h-4" />
                                <h4 className="font-bold uppercase tracking-wider text-xs">Upcoming Catalysts</h4>
                            </div>
                            <div className="space-y-3">
                                {stock.upcomingCatalysts?.map((cat, i) => (
                                    <div key={i} className="flex gap-3 bg-card p-3 rounded border border-border/50">
                                        <div className="flex flex-col items-center justify-center w-12 h-12 bg-muted rounded shrink-0">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                {cat.date.split(' ')[0]}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">{cat.event}</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Impact: <span className={cat.impact.toLowerCase().includes('bullish') ? 'text-green-500 font-medium' : cat.impact.toLowerCase().includes('bearish') ? 'text-red-500 font-medium' : 'text-blue-500'}>{cat.impact}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
