import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { ArrowUpRight, TrendingUp, Activity, BarChart3 } from "lucide-react";

const DATA = [
    { date: "Jan", value: 10000 },
    { date: "Feb", value: 11200 },
    { date: "Mar", value: 10800 },
    { date: "Apr", value: 12400 },
    { date: "May", value: 11900 },
    { date: "Jun", value: 13500 },
    { date: "Jul", value: 14200 },
    { date: "Aug", value: 15800 },
    { date: "Sep", value: 15100 },
    { date: "Oct", value: 16900 },
    { date: "Nov", value: 17500 },
    { date: "Dec", value: 19200 },
];

export function HeroDashboard() {
    return (
        <Card className="w-full bg-card border-border shadow-2xl overflow-hidden relative">
            {/* Top Bar / Header */}
            <div className="border-b border-border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/30">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Live Portfolio</span>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Aggressive Growth Fund</h3>
                    <p className="text-sm text-muted-foreground">Updated 14 mins ago • Long Only Strategy</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-sm text-muted-foreground">Total Return</div>
                        <div className="text-xl font-bold text-green-600 flex items-center justify-end">
                            +92.4% <ArrowUpRight className="w-4 h-4 ml-1" />
                        </div>
                    </div>
                </div>
            </div>

            <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border">
                    {/* Main Chart Area */}
                    <div className="lg:col-span-3 p-6 min-h-[300px]">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex gap-2">
                                {['1M', '3M', '6M', '1Y', 'ALL'].map((period) => (
                                    <button
                                        key={period}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${period === '1Y' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={DATA}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                                        dy={10}
                                    />
                                    <YAxis
                                        hide={true}
                                        domain={['dataMin - 1000', 'dataMax + 1000']}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "var(--popover)",
                                            borderColor: "var(--border)",
                                            borderRadius: "0.5rem",
                                            boxShadow: "var(--shadow-lg)"
                                        }}
                                        itemStyle={{ color: "var(--foreground)" }}
                                        formatter={(value: number) => [`$${value.toLocaleString()}`, "Value"]}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="var(--primary)"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Side Stats */}
                    <div className="bg-muted/10 p-6 flex flex-col justify-center gap-8">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <TrendingUp className="w-4 h-4" /> Profit Factor
                            </div>
                            <div className="text-2xl font-bold tabular-nums">2.45</div>
                            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                                <div className="bg-primary w-[75%] h-full rounded-full" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Activity className="w-4 h-4" /> Win Rate
                            </div>
                            <div className="text-2xl font-bold tabular-nums">68%</div>
                            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                                <div className="bg-primary w-[68%] h-full rounded-full" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <BarChart3 className="w-4 h-4" /> Open Trades
                            </div>
                            <div className="text-2xl font-bold tabular-nums">12</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
