import { useState, useMemo } from "react";
import { Search, TrendingUp, TrendingDown, Building2, Sparkles } from "lucide-react";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
    InstitutionalFund,
    institutionalFunds,
    searchFunds
} from "@/server/data/fund-data";

interface FundSearchPanelProps {
    onSelectFund: (fund: InstitutionalFund) => void;
    selectedFundId?: string;
}

export function FundSearchPanel({ onSelectFund, selectedFundId }: FundSearchPanelProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredFunds = useMemo(() => {
        return searchFunds(searchQuery);
    }, [searchQuery]);

    return (
        <div className="space-y-4">
            {/* Search Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        Institutional Funds
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Search and analyze major fund positions
                    </p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search funds, managers, or holdings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-background/50"
                    />
                </div>
            </div>

            {/* Fund Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFunds.map((fund) => (
                    <Card
                        key={fund.id}
                        className={`
              cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]
              ${selectedFundId === fund.id
                                ? "ring-2 ring-primary bg-primary/5 border-primary/30"
                                : "bg-card/50 hover:bg-card/80"
                            }
            `}
                        onClick={() => onSelectFund(fund)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-base truncate">{fund.name}</h3>
                                    <p className="text-xs text-muted-foreground truncate">{fund.manager}</p>
                                </div>
                                <Badge variant="secondary" className="text-xs ml-2 shrink-0">
                                    {fund.aum}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="text-xs">
                                    {fund.strategy}
                                </Badge>
                            </div>

                            {/* Performance */}
                            <div className="flex items-center gap-4 text-sm">
                                {fund.quarterlyReturn !== undefined && (
                                    <div className="flex items-center gap-1">
                                        {fund.quarterlyReturn >= 0 ? (
                                            <TrendingUp className="w-3 h-3 text-green-500" />
                                        ) : (
                                            <TrendingDown className="w-3 h-3 text-red-500" />
                                        )}
                                        <span className={fund.quarterlyReturn >= 0 ? "text-green-500" : "text-red-500"}>
                                            {fund.quarterlyReturn >= 0 ? "+" : ""}{fund.quarterlyReturn}%
                                        </span>
                                        <span className="text-muted-foreground text-xs">QTD</span>
                                    </div>
                                )}
                                {fund.ytdReturn !== undefined && (
                                    <div className="flex items-center gap-1">
                                        <span className={fund.ytdReturn >= 0 ? "text-green-500" : "text-red-500"}>
                                            {fund.ytdReturn >= 0 ? "+" : ""}{fund.ytdReturn}%
                                        </span>
                                        <span className="text-muted-foreground text-xs">YTD</span>
                                    </div>
                                )}
                            </div>

                            {/* Top Holdings Preview */}
                            <div className="mt-3 pt-3 border-t border-border/50">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {fund.topHoldings.slice(0, 4).map((holding) => (
                                        <Badge
                                            key={holding.symbol}
                                            variant="outline"
                                            className="font-mono text-[10px] px-1.5 py-0"
                                        >
                                            {holding.symbol}
                                        </Badge>
                                    ))}
                                    {fund.topHoldings.length > 4 && (
                                        <span className="text-xs text-muted-foreground">
                                            +{fund.topHoldings.length - 4} more
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Recent Activity Indicator */}
                            {fund.recentMoves.length > 0 && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                                    <Sparkles className="w-3 h-3" />
                                    <span>{fund.recentMoves.length} recent move{fund.recentMoves.length > 1 ? "s" : ""}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* No Results */}
            {filteredFunds.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No funds found matching "{searchQuery}"</p>
                    <Button
                        variant="link"
                        className="mt-2"
                        onClick={() => setSearchQuery("")}
                    >
                        Clear search
                    </Button>
                </div>
            )}
        </div>
    );
}
