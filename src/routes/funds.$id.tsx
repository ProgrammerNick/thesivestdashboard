import { createFileRoute } from "@tanstack/react-router";
import { useLoaderData } from "@tanstack/react-router";
import { searchFund } from "@/server/features/funds";
import { Card } from "@/components/ui/card";
import { FundChat } from "@/components/FundChat";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Wallet, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

export const Route = createFileRoute("/funds/$id")({
    loader: async ({ params }) => {
        // If ID looks like a fund name, we search for it.
        // If we had a DB of funds, we'd lookup by ID.
        // Logic: Treat $id as a search query if it's not a UUID?
        // For now, let's assume we pass the fund name as ID or search query.
        // Simplification: We'll just pass the param as the query.
        try {
            // Debugging 500 error: mocking data to check if page loads

            const fundData = await searchFund({ data: params.id });
            return { fundData, query: params.id };

        } catch (e) {
            console.error(e);
            return { fundData: null, query: params.id };
        }
    },
    component: FundPage,
});

function FundPage() {
    const { fundData, query } = useLoaderData({ from: "/funds/$id" });

    if (!fundData) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Analysis Not Found</h1>
                <p className="text-muted-foreground mb-8">
                    We couldn't generate an analysis for "{query}".
                </p>
                <Link to="/funds">
                    <Button>Back to Research</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Navbar Placeholder / Back Button */}
            <div className="border-b border-border/40 bg-card/30 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center gap-4">
                    <Link to="/funds">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="w-4 h-4" /> Back to Funds
                        </Button>
                    </Link>
                    <div className="h-6 w-px bg-border/50" />
                    <h1 className="text-lg font-heading font-bold truncate">
                        {fundData.fundName}
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="grid lg:grid-cols-3 gap-8"
                >
                    {/* Main Analysis Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header Card */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-primary mb-1">
                                <BrainCircuit className="w-6 h-6" />
                                <span className="font-bold tracking-wider text-sm uppercase">
                                    AI Deep Dive
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-heading font-bold leading-tight">
                                {fundData.fundName}
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                {fundData.strategy}
                            </p>
                        </div>

                        {/* Analysis Blocks */}
                        <Card className="p-8 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/0 to-transparent relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <h3 className="text-xl font-heading font-bold mb-4 relative z-10">Conviction Thesis</h3>
                            <p className="text-lg text-foreground/90 leading-relaxed relative z-10 italic border-l-4 border-primary/30 pl-6">
                                "{fundData.convictionThesis}"
                            </p>
                        </Card>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="p-6 bg-card/50 border-border/60">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-3">Recent Activity</h4>
                                <p className="text-muted-foreground text-sm leading-relaxed">{fundData.recentActivity}</p>
                            </Card>

                            <Card className="p-6 bg-card/50 border-border/60">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-3">Performance Outlook</h4>
                                <p className="text-muted-foreground text-sm leading-relaxed">{fundData.performanceOutlook}</p>
                            </Card>
                        </div>
                    </div>

                    {/* Sidebar / Holdings */}
                    <div className="space-y-6">
                        <Card className="p-0 overflow-hidden border-border/50 bg-card/50 sticky top-24">
                            <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-muted-foreground" />
                                    <h3 className="font-semibold">Top Holdings Detected</h3>
                                </div>
                            </div>
                            <div className="divide-y divide-border/50">
                                {fundData.holdings.map((holding) => (
                                    <div key={holding.symbol} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center font-bold text-sm">
                                                {holding.symbol}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-semibold text-foreground truncate max-w-[120px]">{holding.name}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium tabular-nums font-heading">{holding.percent}%</div>
                                            <div className="text-xs text-muted-foreground">Portfolio</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-muted/20 text-center">
                                <div className="text-xs text-muted-foreground">
                                    Holdings based on latest 13F & news analysis
                                </div>
                            </div>
                        </Card>

                        {/* Chat Interface */}
                        <FundChat fundData={fundData} fundName={fundData.fundName} />
                    </div>
                </motion.div>
            </div >
        </div >
    );
}
