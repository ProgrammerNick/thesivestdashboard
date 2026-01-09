import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { ALL_DATA_SETS, PORTFOLIOS } from '../lib/chartData' // Importing data and config
import { useMemo } from 'react'
import { useMobile } from '../hooks/use-mobile'

interface MiniChartProps {
    portfolioId: string
}

export function MiniChart({ portfolioId }: MiniChartProps) {
    const isMobile = useMobile()
    
    const data = useMemo(() => {
        // Default to a safe fallback if ID not found, though it should be
        const sets = ALL_DATA_SETS[portfolioId] || ALL_DATA_SETS['thesivest']
        // Use 1Y data for the preview
        return sets['1Y'] || []
    }, [portfolioId])

    const portfolioConfig = PORTFOLIOS.find(p => p.id === portfolioId)
    const color = portfolioConfig?.color || 'var(--color-primary)'

    // Determine secondary color for "Your Portfolio" to match the card styling request if needed
    // The user asked for "Pink" ring/title for Your Portfolio. 
    // Usually chart lines should be consistent. Let's stick to the defined config color for now.
    // If 'thesivest' is configured as primary (teal), the line will be teal.
    // If we want the line to be pink for "Your Portfolio", we would override it here.
    // However, the user asked for "pink ring to start", implying the "Your Portfolio" IDENTITY is still Teal (primary), just the card decoration is pink.
    // We'll stick to the config color but maybe add a special check if the user insists on the chart matching the ring.
    // For now, let's use the config color.

    return (
        <div className="w-full h-full select-none pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    {/* Hidden Axes for Scaling */}
                    <XAxis dataKey="date" hide />
                    <YAxis domain={['auto', 'auto']} hide />

                    {/* S&P 500 Benchmark - Subtle, Gray-ish */}
                    <Line
                        type="monotone"
                        dataKey="sp500"
                        stroke="var(--color-muted-foreground)"
                        strokeWidth={1.5}
                        strokeOpacity={0.3}
                        dot={false}
                        isAnimationActive={false} // Disable animation for instant render
                    />

                    {/* Portfolio Line - Vibrant, Colored */}
                    <Line
                        type="monotone"
                        dataKey="portfolio" // The data structure has 'portfolio' key for the main series
                        stroke={color}
                        strokeWidth={isMobile ? 2 : 2.5}
                        dot={false}
                        isAnimationActive={!isMobile}
                        animationDuration={isMobile ? 0 : 1500}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
