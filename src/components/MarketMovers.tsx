import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export function MarketMovers() {
    const gainers = [
        { symbol: "NVDA", change: "+4.2%", name: "NVIDIA Corp" },
        { symbol: "ARM", change: "+3.8%", name: "Arm Holdings" },
        { symbol: "PLTR", change: "+2.9%", name: "Palantir Tech" },
    ];

    const losers = [
        { symbol: "TSLA", change: "-2.1%", name: "Tesla Inc" },
        { symbol: "AMD", change: "-1.8%", name: "Adv Micro Dev" },
        { symbol: "INTC", change: "-1.5%", name: "Intel Corp" },
    ];

    return (
        <Card className="bg-card/40 backdrop-blur-sm border-border/60">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Market Movers
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-semibold text-green-500">Top Gainers</span>
                    </div>
                    <div className="space-y-3">
                        {gainers.map((stock) => (
                            <div key={stock.symbol} className="flex items-center justify-between text-sm group cursor-pointer hover:bg-muted/50 p-1 rounded-md -mx-1 transition-colors">
                                <div>
                                    <div className="font-bold group-hover:text-primary transition-colors">{stock.symbol}</div>
                                    <div className="text-[10px] text-muted-foreground">{stock.name}</div>
                                </div>
                                <div className="font-medium tabular-nums text-green-600">{stock.change}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingDown className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-semibold text-red-500">Top Losers</span>
                    </div>
                    <div className="space-y-3">
                        {losers.map((stock) => (
                            <div key={stock.symbol} className="flex items-center justify-between text-sm group cursor-pointer hover:bg-muted/50 p-1 rounded-md -mx-1 transition-colors">
                                <div>
                                    <div className="font-bold group-hover:text-primary transition-colors">{stock.symbol}</div>
                                    <div className="text-[10px] text-muted-foreground">{stock.name}</div>
                                </div>
                                <div className="font-medium tabular-nums text-red-600">{stock.change}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
