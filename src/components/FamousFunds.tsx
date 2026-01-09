
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowRight, PieChart, TrendingUp, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "motion/react";

const FUNDS = [
    {
        id: "berkshire",
        name: "Berkshire Hathaway",
        manager: "Warren Buffett",
        strategy: "Long-Term Value",
        holdings: ["AAPL", "AXP", "BAC", "KO", "CVX"],
        color: "from-blue-900 to-slate-900",
        icon: Building2,
        return: "+15.8% YTD",
        description: "The gold standard of value investing. Focuses on businesses with strong moats and consistent cash flows.",
        longDescription: "Berkshire Hathaway's portfolio reflects Warren Buffett's philosophy of buying great businesses at fair prices. Recent moves include reducing the massive Apple stake while maintaining high conviction in American Express and Coca-Cola.",
        topPicks: [
            { symbol: "AAPL", return: "26.2%", reason: "Ecosystem Dominance" },
            { symbol: "AXP", return: "15.4%", reason: "Network Economy" },
            { symbol: "BAC", return: "11.9%", reason: "Interest Rate Play" }
        ],
        sectors: [
            { name: "Tech", value: 30 },
            { name: "Financials", value: 33 },
            { name: "Consumer", value: 12 }
        ]
    },
    {
        id: "ark",
        name: "ARK Invest",
        manager: "Cathie Wood",
        strategy: "Disruptive Innovation",
        holdings: ["TSLA", "ROKU", "CRSP", "SHOP", "COIN"],
        color: "from-purple-900 to-indigo-900",
        icon: TrendingUp,
        return: "-5.1% YTD",
        description: "High-conviction investment in disruptive innovation, centering on AI, DNA sequencing, and blockchain.",
        longDescription: "ARK targets 'disruptive innovation' - offering products and services that potentially change the way the world works. The portfolio is heavily weighted towards Tesla and Roku.",
        topPicks: [
            { symbol: "TSLA", return: "11.6%", reason: "Autonomous Robotaxi" },
            { symbol: "ROKU", return: "7.7%", reason: "CTV Operating System" },
            { symbol: "CRSP", return: "5.4%", reason: "Gene Editing" }
        ],
        sectors: [
            { name: "Health Care", value: 25 },
            { name: "Tech", value: 24 },
            { name: "Cons. Cyclical", value: 17 }
        ]
    },
    {
        id: "sequoia",
        name: "Sequoia Fund",
        manager: "Ruane, Cunniff",
        strategy: "Concentrated Value",
        holdings: ["RYCEF", "ICE", "CNSWF", "GOOGL", "UNH"],
        color: "from-emerald-900 to-teal-900",
        icon: PieChart,
        return: "+18.4% YTD",
        description: "A focused portfolio of quality companies. Recently made a massive bet on the turnaround of Rolls-Royce.",
        longDescription: "Sequoia Fund maintains a highly concentrated portfolio. Their largest recent conviction is Rolls-Royce Holdings, betting on the recovery of wide-body engine flying hours.",
        topPicks: [
            { symbol: "RYCEF", return: "9.7%", reason: "Aerospace Recovery" },
            { symbol: "ICE", return: "7.8%", reason: "Market Infrastructure" },
            { symbol: "CNSWF", return: "7.5%", reason: "VMS Serial Acquirer" }
        ],
        sectors: [
            { name: "Industrials", value: 25 },
            { name: "Financials", value: 20 },
            { name: "Tech", value: 18 }
        ]
    },
    {
        id: "oakmark",
        name: "Oakmark Select",
        manager: "Bill Nygren",
        strategy: "Value / Contrarian",
        holdings: ["IQV", "FCNCA", "WBD", "KDP", "CRM"],
        color: "from-amber-900 to-orange-900",
        icon: TrendingUp,
        return: "+8.1% YTD",
        description: "High-conviction value investing, often taking contrarian positions in undervalued large-caps.",
        longDescription: "Oakmark Select seeks out value by identifying companies trading at a significant discount. Top holdings now include substantial stakes in IQVIA and First Citizens Bancshares.",
        topPicks: [
            { symbol: "IQV", return: "6.6%", reason: "Clinical Trial Data" },
            { symbol: "FCNCA", return: "6.4%", reason: "Undervalued Bank" },
            { symbol: "WBD", return: "6.3%", reason: "Media Consolidation" }
        ],
        sectors: [
            { name: "Financials", value: 35 },
            { name: "Comm Services", value: 25 },
            { name: "Health Care", value: 15 }
        ]
    },
    {
        id: "pershing",
        name: "Pershing Square",
        manager: "Bill Ackman",
        strategy: "Activist",
        holdings: ["GOOGL", "BN", "HLT", "CMG", "QSR"],
        color: "from-slate-800 to-gray-900",
        icon: Building2,
        return: "+12.7% YTD",
        description: "Activist strategy with a very concentrated portfolio of high-quality, predictable businesses.",
        longDescription: "Pershing Square runs an extremely concentrated portfolio using an activist approach. Major recent moves include a large position in Brookfield and maintaining high conviction in Alphabet/Google.",
        topPicks: [
            { symbol: "GOOGL", return: "18.0%", reason: "AI & Search Moat" },
            { symbol: "BN", return: "15.0%", reason: "Alternative Assets" },
            { symbol: "HLT", return: "12.0%", reason: "Asset-Light Hotel" }
        ],
        sectors: [
            { name: "Cons. Discret.", value: 50 },
            { name: "Comm Services", value: 25 },
            { name: "Real Estate", value: 15 }
        ]
    }
];

export function FamousFunds() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'overview' | 'picks' | 'sectors'>('overview');

    const nextFund = () => {
        setCurrentIndex((prev) => (prev + 1) % FUNDS.length);
        setActiveTab('overview');
    };

    const prevFund = () => {
        setCurrentIndex((prev) => (prev - 1 + FUNDS.length) % FUNDS.length);
        setActiveTab('overview');
    };

    const currentFund = FUNDS[currentIndex];

    return (
        <section className="py-32 relative overflow-hidden bg-muted/10">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-primary/5 -skew-y-3 transform origin-top-left scale-110 z-0 opacity-20" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                    <div className="max-w-2xl">
                        <span className="text-primary font-bold tracking-widest text-xs uppercase mb-4 block">Market Intelligence</span>
                        <h2 className="text-3xl md:text-5xl font-heading text-foreground leading-tight">
                            Track the Giants.
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Deep dive into the portfolios of legends. Analyze their strategy, top convictions, and sector bets.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={prevFund} className="rounded-full w-12 h-12 border-primary/20 hover:bg-primary/10 hover:text-primary transition-all hover:scale-105 active:scale-95">
                                <ChevronLeft className="w-6 h-6" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={nextFund} className="rounded-full w-12 h-12 border-primary/20 hover:bg-primary/10 hover:text-primary transition-all hover:scale-105 active:scale-95">
                                <ChevronRight className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="relative max-w-6xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentFund.id}
                            initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, x: -50, filter: "blur(10px)" }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="w-full"
                        >
                            <Card className="overflow-hidden border-none shadow-2xl bg-card/80 backdrop-blur-3xl ring-1 ring-white/10 dark:ring-white/5">
                                <div className="grid md:grid-cols-12 min-h-[500px]">
                                    {/* Left Panel: Brand & High Level */}
                                    <div className={`md:col-span-4 p-8 md:p-12 bg-gradient-to-br ${currentFund.color} text-white relative overflow-hidden flex flex-col justify-between`}>
                                        <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-1/2 -translate-y-1/2">
                                            <currentFund.icon className="w-64 h-64" />
                                        </div>

                                        <div className="relative z-10">
                                            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-8 shadow-inner border border-white/20">
                                                <currentFund.icon className="w-8 h-8 text-white" />
                                            </div>
                                            <h3 className="text-3xl font-bold mb-2 font-heading tracking-tight">{currentFund.name}</h3>
                                            <p className="text-white/70 font-medium uppercase tracking-wider text-sm">{currentFund.manager}</p>
                                        </div>

                                        <div className="relative z-10 mt-12">
                                            <div className="inline-block px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 mb-6">
                                                <span className="text-xs text-white/60 block mb-1">YTD Performance</span>
                                                <span className="text-2xl font-bold text-white">{currentFund.return}</span>
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                {currentFund.holdings.slice(0, 3).map(h => (
                                                    <Badge key={h} variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-transparent">
                                                        {h}
                                                    </Badge>
                                                ))}
                                                <span className="text-white/50 text-xs flex items-center">+ {currentFund.holdings.length - 3} more</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Panel: Deep Dive Content */}
                                    <div className="md:col-span-8 p-8 md:p-12 bg-card/50">
                                        {/* Tabs Navigation */}
                                        <div className="flex gap-8 border-b border-border/50 mb-8 pb-4">
                                            <button
                                                onClick={() => setActiveTab('overview')}
                                                className={`text-sm font-semibold tracking-wide transition-colors relative pb-4 -mb-4 ${activeTab === 'overview' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                            >
                                                Strategy Overview
                                                {activeTab === 'overview' && <motion.div layoutId="tab-pill" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('picks')}
                                                className={`text-sm font-semibold tracking-wide transition-colors relative pb-4 -mb-4 ${activeTab === 'picks' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                            >
                                                Top Convictions
                                                {activeTab === 'picks' && <motion.div layoutId="tab-pill" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('sectors')}
                                                className={`text-sm font-semibold tracking-wide transition-colors relative pb-4 -mb-4 ${activeTab === 'sectors' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                            >
                                                Sector Allocation
                                                {activeTab === 'sectors' && <motion.div layoutId="tab-pill" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                                            </button>
                                        </div>

                                        {/* Tab Content */}
                                        <div className="min-h-[250px]">
                                            <AnimatePresence mode="wait">
                                                {activeTab === 'overview' && (
                                                    <motion.div
                                                        key="overview"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <h4 className="text-xl font-semibold mb-4 text-foreground">Invsetment Strategy</h4>
                                                        <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                                                            {currentFund.longDescription}
                                                        </p>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                                                                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Style</div>
                                                                <div className="font-medium text-foreground">{currentFund.strategy}</div>
                                                            </div>
                                                            <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                                                                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2"> turnover</div>
                                                                <div className="font-medium text-foreground">Low - Moderate</div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {activeTab === 'picks' && (
                                                    <motion.div
                                                        key="picks"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="space-y-4"
                                                    >
                                                        {currentFund.topPicks.map((pick, i) => (
                                                            <div key={pick.symbol} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                                                                        {pick.symbol}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-foreground">{pick.symbol}</div>
                                                                        <div className="text-xs text-muted-foreground">{pick.reason}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-green-500 font-medium tabular-nums">{pick.return}</div>
                                                                    <div className="text-[10px] text-muted-foreground">Portfolio Wgt</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}

                                                {activeTab === 'sectors' && (
                                                    <motion.div
                                                        key="sectors"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <div className="space-y-6 pt-4">
                                                            {currentFund.sectors.map((sector, i) => (
                                                                <div key={sector.name}>
                                                                    <div className="flex justify-between text-sm mb-2">
                                                                        <span className="font-medium text-foreground">{sector.name}</span>
                                                                        <span className="text-muted-foreground">{sector.value}%</span>
                                                                    </div>
                                                                    <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                                                                        <motion.div
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${sector.value}%` }}
                                                                            transition={{ duration: 1, delay: i * 0.1 }}
                                                                            className="h-full bg-primary/80"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-border/50 flex justify-end">
                                            <Link to="/funds" className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-2 group">
                                                View Complete Holdings
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center mt-8 gap-2">
                    {FUNDS.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setCurrentIndex(idx);
                                setActiveTab('overview');
                            }}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-primary' : 'bg-primary/20 hover:bg-primary/50'}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
