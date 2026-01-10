import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Mock data generator since we don't have a real price API yet
function generateMockPriceHistory(days: number, startPrice: number) {
    const data = [];
    let price = startPrice;
    const now = new Date();

    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Random walk
        const change = (Math.random() - 0.5) * (price * 0.05);
        price += change;

        data.push({
            date: date.toISOString().split('T')[0], // YYYY-MM-DD
            price: Number(price.toFixed(2)),
            fullDate: date
        });
    }
    return data;
}

interface ResearchChartProps {
    symbol: string;
    posts: any[]; // Using any for speed, but should be PostWithDetails[]
}

export function ResearchChart({ symbol, posts }: ResearchChartProps) {
    // Generate mock data based on recent posts or default
    const chartData = useMemo(() => {
        // Try to find a logical start price from posts or default to 100
        const startPrice = posts.find(p => p.buyPrice)?.buyPrice || 150;
        return generateMockPriceHistory(30, Number(startPrice));
    }, [symbol, posts]);

    // Filter posts to only shows ones that map to our mock timeframe (last 30 days)
    // In a real app, we'd overlap real price data with real post dates.
    // For this demo, we'll map recent posts to the chart.
    const chartPosts = posts.filter(p => {
        const postDate = new Date(p.publishedAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return postDate > thirtyDaysAgo;
    });

    return (
        <Card className="w-full h-[400px] flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                    <span>{symbol} Analysis</span>
                    <Badge variant="outline">Last 30 Days</Badge>
                </CardTitle>
                <CardDescription>
                    Overlaying community research on price action.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.4} />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                            tickFormatter={(value) => format(new Date(value), 'MMM d')}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            width={40}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)' }}
                            labelStyle={{ color: 'var(--color-muted-foreground)', marginBottom: '4px' }}
                            formatter={(value: any) => [`$${value}`, 'Price']}
                            labelFormatter={(label) => format(new Date(label), 'PPP')}
                        />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="var(--color-primary)"
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                            strokeWidth={2}
                        />

                        {/* Stamped Posts */}
                        {chartPosts.map((post) => {
                            // Find closest data point date for x-axis positioning if not exact match
                            const dateStr = new Date(post.publishedAt).toISOString().split('T')[0];
                            // In this mock, we might not hit exact date, so let's rely on Recharts matching 'date' key

                            return (
                                <ReferenceDot
                                    key={post.id}
                                    x={dateStr}
                                    y={post.buyPrice || chartData.find(d => d.date === dateStr)?.price || 0}
                                    r={6}
                                    fill={post.type === 'trade' ? (Number(post.buyPrice) ? '#22c55e' : '#ef4444') : '#3b82f6'}
                                    stroke="var(--color-background)"
                                    strokeWidth={2}
                                >
                                </ReferenceDot>
                            );
                        })}
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
