import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createPortfolio, addHolding, deletePortfolio } from "@/server/fn/portfolios";
import { Plus, Trash2, TrendingUp } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

interface PortfolioManagerProps {
    portfolios: any[]; // using any for speed, ideally typed from DB schema
}

export function PortfolioManager({ portfolios }: PortfolioManagerProps) {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);

    // Create Form State
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");

    // Add Holding Form State
    const [holdingSymbol, setHoldingSymbol] = useState("");
    const [holdingShares, setHoldingShares] = useState("");
    const [holdingCost, setHoldingCost] = useState("");

    const handleCreate = async () => {
        try {
            await createPortfolio({
                data: {
                    name: newName,
                    description: newDesc,
                    isPublic: false
                }
            });
            setIsCreating(false);
            setNewName("");
            setNewDesc("");
            router.invalidate();
        } catch (error) {
            console.error("Failed to create portfolio", error);
        }
    };

    const handleAddHolding = async (portfolioId: string) => {
        try {
            await addHolding({
                data: {
                    portfolioId,
                    symbol: holdingSymbol,
                    shares: holdingShares,
                    averageCost: holdingCost
                }
            });
            setHoldingSymbol("");
            setHoldingShares("");
            setHoldingCost("");
            router.invalidate();
        } catch (error) {
            console.error("Failed to add holding", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this portfolio?")) return;
        try {
            await deletePortfolio({ data: { id } });
            router.invalidate();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Your Portfolios</h2>
                <Dialog open={isCreating} onOpenChange={setIsCreating}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" /> New Portfolio
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Portfolio</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Portfolio Name</Label>
                                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="My Tech Bets" />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Long term holds..." />
                            </div>
                            <Button onClick={handleCreate} className="w-full">Create Portfolio</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {portfolios.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl bg-muted/20">
                    <p className="text-muted-foreground mb-4">No portfolios created yet.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {portfolios.map(p => (
                        <Card key={p.id} className="overflow-hidden">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {p.name}
                                            {p.isPublic && <span className="text-xs font-normal px-2 py-0.5 bg-primary/10 text-primary rounded-full">Public</span>}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-6">
                                    {/* Holdings List */}
                                    <div>
                                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" /> Current Holdings
                                        </h4>
                                        {p.holdings.length === 0 ? (
                                            <p className="text-sm text-muted-foreground italic">No holdings added.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {p.holdings.map((h: any) => (
                                                    <div key={h.id} className="flex justify-between items-center p-3 bg-muted/20 rounded-lg text-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 flex items-center justify-center bg-background rounded-md font-bold text-xs border">
                                                                {h.symbol}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">{h.shares} shares</span>
                                                                <span className="text-muted-foreground ml-2">@ ${h.averageCost}</span>
                                                            </div>
                                                        </div>
                                                        <div className="font-mono text-right">
                                                            ${(Number(h.shares) * Number(h.averageCost)).toLocaleString()}
                                                            <div className="text-xs text-muted-foreground">Est. Cost Basis</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Add Holding Form */}
                                    <div className="pt-4 border-t border-border/50">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Add Transaction</h4>
                                        <div className="grid grid-cols-[1fr,1fr,1fr,auto] gap-3 items-end">
                                            <div className="space-y-1">
                                                <Label className="text-xs">Symbol</Label>
                                                <Input
                                                    value={holdingSymbol}
                                                    onChange={e => setHoldingSymbol(e.target.value.toUpperCase())}
                                                    placeholder="AAPL"
                                                    className="h-9"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Shares</Label>
                                                <Input
                                                    type="number"
                                                    value={holdingShares}
                                                    onChange={e => setHoldingShares(e.target.value)}
                                                    placeholder="10"
                                                    className="h-9"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Avg Cost</Label>
                                                <Input
                                                    type="number"
                                                    value={holdingCost}
                                                    onChange={e => setHoldingCost(e.target.value)}
                                                    placeholder="150.00"
                                                    className="h-9"
                                                />
                                            </div>
                                            <Button size="sm" onClick={() => handleAddHolding(p.id)} className="h-9">Add</Button>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button variant="outline" className="w-full text-muted-foreground" disabled>
                                            Connect Brokerage (Coming Soon)
                                        </Button>
                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
