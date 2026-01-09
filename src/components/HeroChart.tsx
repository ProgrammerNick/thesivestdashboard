import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, ReferenceArea } from 'recharts'
import { Card } from './ui/card'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { motion, AnimatePresence } from 'motion/react'
import { Check, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useMemo } from 'react'
import { ALL_DATA_SETS, PORTFOLIOS, SERIES, TIME_RANGES, type TimeRange } from '../lib/chartData'
import { useMediaQuery } from '../hooks/useMediaQuery'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

const getAxisTicks = (min: number, max: number) => {
    const ticks: number[] = []
    const diff = max - min
    if (diff <= 0) return [min]

    const ONE_DAY = 24 * 60 * 60 * 1000
    // Target roughly 6-8 ticks
    const targetCount = 6

    // Define candidate intervals in ms (approx)
    const candidates = [
        { label: 'day', ms: ONE_DAY },
        { label: 'week', ms: ONE_DAY * 7 },
        { label: '2weeks', ms: ONE_DAY * 14 },
        { label: 'month', ms: ONE_DAY * 30 },
        { label: '2months', ms: ONE_DAY * 60 },
        { label: 'quarter', ms: ONE_DAY * 90 },
        { label: '6months', ms: ONE_DAY * 180 },
        { label: 'year', ms: ONE_DAY * 365 },
        { label: '2years', ms: ONE_DAY * 365 * 2 },
    ]

    // Find closest interval
    const rawInterval = diff / targetCount
    let bestInterval = candidates[0]
    for (const cand of candidates) {
        if (rawInterval > cand.ms) bestInterval = cand
    }

    // Generate ticks based on bestInterval type
    let d = new Date(min)
    const end = new Date(max)

    // Normalize start date based on interval type
    if (bestInterval.label.includes('year')) {
        d.setMonth(0, 1)
        d.setHours(0, 0, 0, 0)
        while (d.getTime() < min) d.setFullYear(d.getFullYear() + 1)
    } else if (bestInterval.label.includes('month') || bestInterval.label === 'quarter' || bestInterval.label === '6months') {
        d.setDate(1)
        d.setHours(0, 0, 0, 0)
        // For quarters/6m, maybe align to Jan/Apr etc?
        // Let's stick to simple month boundaries for now, but skipping months
        while (d.getTime() < min) d.setMonth(d.getMonth() + 1)
    } else {
        d.setHours(0, 0, 0, 0)
        while (d.getTime() < min) d.setDate(d.getDate() + 1)
    }

    // Loop and push
    while (d.getTime() <= max) {
        if (d.getTime() >= min) ticks.push(d.getTime())

        // Increment
        switch (bestInterval.label) {
            case 'day': d.setDate(d.getDate() + 1); break;
            case 'week': d.setDate(d.getDate() + 7); break;
            case '2weeks': d.setDate(d.getDate() + 14); break;
            case 'month': d.setMonth(d.getMonth() + 1); break;
            case '2months': d.setMonth(d.getMonth() + 2); break;
            case 'quarter': d.setMonth(d.getMonth() + 3); break;
            case '6months': d.setMonth(d.getMonth() + 6); break;
            case 'year': d.setFullYear(d.getFullYear() + 1); break;
            case '2years': d.setFullYear(d.getFullYear() + 2); break;
            default: d.setDate(d.getDate() + 1);
        }
    }

    // If we have too few ticks (e.g. alignment skipped them all), just give min/max
    if (ticks.length < 2) return [min, max]

    return ticks
}




export interface HeroChartProps {
    portfolioId?: string
    minimal?: boolean
    className?: string
    onClick?: () => void
    forcedActiveSeries?: string[] // IDs of series that MUST be shown
    data?: any[] // Explicit data passed from parent
}

export function HeroChart({ portfolioId = 'thesivest', minimal = false, className, onClick, forcedActiveSeries, data }: HeroChartProps) {
    // Get current portfolio config
    const activePortfolio = PORTFOLIOS.find(p => p.id === portfolioId)
    const portfolioLabel = activePortfolio?.name || 'Your Portfolio'
    const portfolioColor = activePortfolio?.color || 'var(--color-primary)'
    const isMobile = useMediaQuery('(max-width: 768px)')

    const [timeRange, setTimeRange] = useState<TimeRange | null>('3Y')
    const [activeSeries, setActiveSeries] = useState<Set<string>>(() => {
        if (forcedActiveSeries) return new Set(forcedActiveSeries)
        return new Set(['portfolio', 'sp500'])
    })

    // Update active series if forcedActiveSeries changes (e.g. for mini charts)
    useMemo(() => {
        if (forcedActiveSeries) {
            setActiveSeries(new Set(forcedActiveSeries))
        }
    }, [forcedActiveSeries])

    // Master Data Source
    // If explicit data provided, use it. Otherwise lookup.
    const DATA_SETS = ALL_DATA_SETS[portfolioId] || ALL_DATA_SETS['thesivest']
    const currentData = data || DATA_SETS['3Y'] // Fallback to 3Y master if no data passed

    // Helper to calculate start date for ranges
    const getStartDateForRange = (range: TimeRange, endDate: number) => {
        const end = new Date(endDate)
        const start = new Date(endDate)
        switch (range) {
            case '1M': start.setMonth(end.getMonth() - 1); break;
            case '3M': start.setMonth(end.getMonth() - 3); break;
            case '6M': start.setMonth(end.getMonth() - 6); break;
            case 'YTD': start.setMonth(0, 1); break; // Jan 1 of current year
            case '1Y': start.setFullYear(end.getFullYear() - 1); break;
            case '3Y': start.setFullYear(end.getFullYear() - 3); break;
        }
        return start.getTime()
    }

    // Zoom State - Initialize to 3Y view
    const [left, setLeft] = useState<string | number>(() => {
        if (currentData.length === 0) return 'dataMin'
        const lastDate = currentData[currentData.length - 1].date
        return getStartDateForRange('3Y', lastDate)
    })
    const [right, setRight] = useState<string | number>('dataMax') // Always pin to right initially


    // ... refs ...
    const [refAreaLeft, setRefAreaLeft] = useState<string | number | null>(null)
    const [refAreaRight, setRefAreaRight] = useState<string | number | null>(null)
    const [preZoomState, setPreZoomState] = useState<{ left: string | number, right: string | number, timeRange: TimeRange | null } | null>(null)

    // Calculate current return for the main portfolio
    // If zoomed, use data from the visible range
    const percentageReturn = useMemo(() => {
        if (!currentData.length) return 0

        let startVal = currentData[0].portfolio
        let endVal = currentData[currentData.length - 1].portfolio

        const minTime = left === 'dataMin' ? currentData[0].date : (left as number)
        const maxTime = right === 'dataMax' ? currentData[currentData.length - 1].date : (right as number)

        // Find data points closest to the visible window
        const startItem = currentData.find(d => d.date >= minTime)

        let endItem = currentData[currentData.length - 1]
        if (right !== 'dataMax') {
            for (let i = currentData.length - 1; i >= 0; i--) {
                if (currentData[i].date <= maxTime) {
                    endItem = currentData[i]
                    break
                }
            }
        }

        if (startItem) startVal = startItem.portfolio
        if (endItem) endVal = endItem.portfolio

        if (startVal === 0) return 0

        return ((endVal - startVal) / startVal) * 100
    }, [currentData, left, right])

    // Dynamic Y-Axis Scale
    const yDomain = useMemo(() => {
        let visibleData = currentData
        if (left !== 'dataMin' && right !== 'dataMax') {
            visibleData = currentData.filter(d => d.date >= (left as number) && d.date <= (right as number))
        }

        if (visibleData.length === 0) return ['auto', 'auto']

        let min = Infinity
        let max = -Infinity

        visibleData.forEach((d: any) => {
            activeSeries.forEach(seriesId => {
                const val = d[seriesId]
                if (typeof val === 'number') {
                    if (val < min) min = val
                    if (val > max) max = val
                }
            })
        })

        if (min === Infinity || max === -Infinity) return ['auto', 'auto']

        const padding = (max - min) * 0.05
        return [Math.round(min - padding), Math.round(max + padding)]
    }, [currentData, left, right, activeSeries])

    const customTicks = useMemo(() => {
        const min = left === 'dataMin' ? (currentData[0]?.date ?? 0) : left as number
        const max = right === 'dataMax' ? (currentData[currentData.length - 1]?.date ?? 0) : right as number
        if (!min || !max) return []
        return getAxisTicks(min, max)
    }, [left, right, currentData])

    // Navigation logic
    const moveTimePeriod = (direction: 'back' | 'forward') => {
        const currentRight = right === 'dataMax' ? currentData[currentData.length - 1].date : right as number
        const currentLeft = left === 'dataMin' ? currentData[0].date : left as number
        const duration = currentRight - currentLeft

        const shift = direction === 'back' ? -duration : duration
        let newLeft = currentLeft + shift
        let newRight = currentRight + shift

        // Constraint check
        const minDate = currentData[0].date
        const maxDate = currentData[currentData.length - 1].date

        if (newRight > maxDate) {
            const diff = newRight - maxDate
            newRight = maxDate
            newLeft -= diff // Keep duration consistent? Or just clamp?
            // Actually if we hit right edge, just go to max
            newLeft = maxDate - duration
        }
        if (newLeft < minDate) {
            newLeft = minDate
            newRight = minDate + duration
        }

        setLeft(newLeft)
        setRight(newRight)
    }

    const toggleSeries = (id: string) => {
        const newSet = new Set(activeSeries)
        if (newSet.has(id)) {
            // Don't allow turning off the last series
            if (newSet.size > 1) newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setActiveSeries(newSet)
    }

    const zoom = () => {
        if (refAreaLeft === refAreaRight || refAreaRight === null) {
            setRefAreaLeft(null)
            setRefAreaRight(null)
            return
        }

        // Ensure left is smaller than right
        let start = refAreaLeft
        let end = refAreaRight

        if (typeof start === 'number' && typeof end === 'number') {
            if (start > end) [start, end] = [end, start]

            setRefAreaLeft(null)
            setRefAreaRight(null)

            // Save state before zooming if we aren't already in deep zoom
            if (timeRange !== null) {
                setPreZoomState({ left, right, timeRange })
            }

            setLeft(start)
            setRight(end)
            setTimeRange(null)
        }
    }

    const zoomOut = () => {
        setRefAreaLeft(null)
        setRefAreaRight(null)

        if (preZoomState) {
            setLeft(preZoomState.left)
            setRight(preZoomState.right)
            setTimeRange(preZoomState.timeRange)
            setPreZoomState(null)
        } else {
            setLeft('dataMin')
            setRight('dataMax')
            setTimeRange('3Y')
        }
    }

    return (
        <Card
            className={cn(
                "w-full bg-card/50 backdrop-blur-sm border-primary/20 p-0 flex flex-col relative overflow-hidden group transition-all select-none [&_.recharts-wrapper]:!outline-none shadow-2xl shadow-primary/5",
                minimal ? "h-full border-0 bg-transparent shadow-none" : (isMobile ? "h-[500px]" : "h-[560px]"),
                onClick && "cursor-pointer hover:border-primary/50 hover:shadow-primary/10",
                className
            )}
            onClick={onClick}
        >
            {/* Background Gradient */}
            <div className={cn("absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none", minimal ? "opacity-0" : "opacity-50")} />

            {/* Header / Controls */}
            {!minimal && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:p-6 border-b border-border/50 bg-card/30 z-20 gap-3 md:gap-4">
                    <div>
                        <div className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-wider mb-0.5 md:mb-1">Portfolio Performance</div>
                        <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
                            <span className={cn("text-2xl md:text-4xl font-extrabold tracking-tight", percentageReturn >= 0 ? "text-primary" : "text-destructive")}>
                                {percentageReturn >= 0 ? '+' : ''}{percentageReturn.toFixed(1)}%
                            </span>
                            <span className="text-xs md:text-sm text-foreground/60 font-medium">
                                {timeRange === null ? 'Zoomed' : `${timeRange === '3Y' ? '3Y' : timeRange}`}
                            </span>
                            {timeRange === null && (
                                <button onClick={zoomOut} className="ml-0 md:ml-2 flex items-center gap-1 text-[10px] md:text-xs px-1.5 md:px-2 py-1 bg-secondary text-secondary-foreground rounded shadow-sm hover:bg-secondary/80 transition-colors">
                                    <ZoomOut className="w-3 h-3" />
                                    <span className="hidden md:inline">Reset</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Time Range Tabs */}
                    <div className="flex items-center gap-0.5 md:gap-1 bg-muted/50 p-0.5 md:p-1 rounded-lg border border-border/50">
                        {TIME_RANGES.map(range => (
                            <button
                                key={range}
                                onClick={() => {
                                    setTimeRange(range);
                                    setRefAreaLeft(null);
                                    setRefAreaRight(null);
                                    // Set window
                                    const lastDate = currentData[currentData.length - 1].date;
                                    setRight('dataMax'); // Pin to live
                                    setLeft(getStartDateForRange(range, lastDate));
                                }}
                                className={cn(
                                    "px-1.5 md:px-3 py-1 md:py-1.5 rounded-md text-[10px] md:text-xs font-semibold transition-all duration-200",
                                    timeRange === range
                                        ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                )}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Chart Area */}
            <div className="flex-1 w-full relative z-10 min-h-0 pb-2 md:pb-4 flex items-center gap-4 md:gap-6 px-2 md:px-4">

                {/* Left Navigation Button */}
                <AnimatePresence>
                    {!isMobile && timeRange !== '3Y' && left !== 'dataMin' && (typeof left !== 'number' || left > currentData[0].date) && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8, x: -10 }}
                            animate={{ opacity: 0.5, scale: 1, x: 0 }}
                            whileHover={{ opacity: 1, scale: 1.1 }}
                            exit={{ opacity: 0, scale: 0.8, x: -10 }}
                            onClick={() => moveTimePeriod('back')}
                            className="p-2 rounded-full hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors shrink-0 z-20 focus:outline-none focus:ring-1 focus:ring-ring"
                            aria-label="Previous Period"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </motion.button>
                    )}
                </AnimatePresence>

                <div className="flex-1 h-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={currentData}
                            margin={{ top: isMobile ? 10 : 20, right: 0, left: 0, bottom: 0 }}
                            onMouseDown={(e) => {
                                if (e && e.activeLabel) setRefAreaLeft(e.activeLabel)
                            }}
                            onMouseMove={(e) => {
                                if (refAreaLeft && e && e.activeLabel) setRefAreaRight(e.activeLabel)
                            }}
                            onMouseUp={zoom}
                        >
                            <defs>
                                <linearGradient id="color-portfolio" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={portfolioColor} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={portfolioColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="var(--color-border)" strokeOpacity={0.1} />
                            <XAxis
                                dataKey="date"
                                type="number"
                                domain={[left, right]}
                                padding={{ left: 0, right: 0 }}
                                allowDataOverflow
                                ticks={customTicks}
                                tickFormatter={(unixTime) => {
                                    // Determine the duration of the visible range
                                    let rangeStart = left === 'dataMin' ? currentData[0]?.date : left as number
                                    let rangeEnd = right === 'dataMax' ? currentData[currentData.length - 1]?.date : right as number

                                    // Fallback if data isn't ready
                                    if (!rangeStart || !rangeEnd) return ''

                                    const durationMs = rangeEnd - rangeStart
                                    const date = new Date(unixTime)

                                    // Dynamic formatting based on zoom level
                                    if (durationMs < 24 * 60 * 60 * 1000 * 5) { // < 5 days
                                        // Show time if highly zoomed, but data is currently daily-ish. 
                                        // Showing Day + Month is safest. 
                                        return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })
                                    } else if (durationMs < 24 * 60 * 60 * 1000 * 90) { // < 3 months
                                        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                                    } else {
                                        return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
                                    }
                                }}
                                minTickGap={40}
                                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                hide
                                domain={yDomain}
                                padding={{ top: 20, bottom: 20 }}
                                allowDataOverflow
                                type="number"
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (!active || !payload || !payload.length) return null
                                    const sortedPayload = [...payload].sort((a: any, b: any) => (b.value as number) - (a.value as number))
                                    return (
                                        <div className="bg-popover/95 backdrop-blur border border-border rounded-xl shadow-xl p-3 min-w-[180px]">
                                            <div className="text-xs text-muted-foreground mb-2 font-medium">
                                                {label ? new Date(label).toLocaleDateString(undefined, {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : ''}
                                            </div>
                                            {sortedPayload.map((entry: any) => {
                                                const val = (entry.value as number) - 100
                                                return (
                                                    <div key={entry.name} className="flex items-center justify-between gap-4 text-sm mb-1">
                                                        <span className="flex items-center gap-2 text-foreground/80">
                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                                            {entry.name}
                                                        </span>
                                                        <span className="font-bold tabular-nums" style={{ color: entry.color }}>
                                                            {val > 0 ? '+' : ''}{val.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )
                                }}
                            />

                            {/* Render Lines Based on Active Series */}
                            {SERIES.map(s => {
                                const isActive = activeSeries.has(s.id)
                                const isThesivest = s.id === 'portfolio'

                                // Override label for the main portfolio
                                const label = isThesivest ? portfolioLabel : s.label
                                const color = isThesivest ? portfolioColor : s.color

                                // Opacity Logic
                                let opacity = 0
                                if (isActive) {
                                    opacity = isThesivest ? 1 : (s.isBenchmark ? 0.7 : 0.8)
                                }

                                if (!isActive) return null

                                // Determine Component Type
                                if (s.type === 'area') {
                                    return (
                                        <Area
                                            key={s.id}
                                            type="monotone"
                                            dataKey={s.id}
                                            stroke={color}
                                            strokeWidth={isMobile ? 2 : 3}
                                            fillOpacity={1}
                                            fill={`url(#color-${s.id})`}
                                            name={label}
                                            strokeOpacity={opacity}
                                            style={{ opacity }}
                                            animationDuration={isMobile ? 500 : 1000}
                                        />
                                    )
                                }

                                return (
                                    <Line
                                        key={s.id}
                                        type="monotone"
                                        dataKey={s.id}
                                        stroke={color}
                                        strokeWidth={isMobile ? 1.5 : (s.isBenchmark ? 2 : 2)}
                                        strokeDasharray={s.type === 'dashed' ? '5 5' : ''}
                                        dot={false}
                                        name={label}
                                        strokeOpacity={opacity}
                                        style={{ transition: 'opacity 0.3s' }}
                                        animationDuration={isMobile ? 500 : 1000}
                                    />
                                )
                            })}

                            {/* Selection Box for Zooming using explicit primary color with opacity */}
                            {refAreaLeft && refAreaRight ? (
                                <ReferenceArea
                                    x1={refAreaLeft}
                                    x2={refAreaRight}
                                    strokeOpacity={0.3}
                                    fill="var(--color-primary)"
                                    fillOpacity={0.1}
                                />
                            ) : null}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Right Navigation Button */}
                <AnimatePresence>
                    {!isMobile && timeRange !== '3Y' && (right !== 'dataMax' && (typeof right !== 'number' || right < currentData[currentData.length - 1].date)) && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8, x: 10 }}
                            animate={{ opacity: 0.5, scale: 1, x: 0 }}
                            whileHover={{ opacity: 1, scale: 1.1 }}
                            exit={{ opacity: 0, scale: 0.8, x: 10 }}
                            onClick={() => moveTimePeriod('forward')}
                            className="p-2 rounded-full hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors shrink-0 z-20 focus:outline-none focus:ring-1 focus:ring-ring"
                            aria-label="Next Period"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Legend / Toggles */}
            <div className="p-2 md:p-4 bg-card/30 border-t border-border/50 z-20 overflow-x-auto">
                <div className="flex items-center gap-2 md:gap-3">
                    {SERIES.map(s => {
                        const isActive = activeSeries.has(s.id)
                        const isThesivest = s.id === 'portfolio'
                        const label = isThesivest ? portfolioLabel : s.label
                        const color = isThesivest ? portfolioColor : s.color

                        return (
                            <button
                                key={s.id}
                                onClick={() => toggleSeries(s.id)}
                                className={cn(
                                    "flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium border transition-all duration-200 whitespace-nowrap",
                                    isActive
                                        ? "bg-background shadow-sm border-border text-foreground"
                                        : "bg-muted/50 border-transparent text-muted-foreground opacity-60 hover:opacity-100"
                                )}
                            >
                                <div
                                    className={cn("w-1.5 md:w-2 h-1.5 md:h-2 rounded-full transition-transform duration-200", isActive ? "scale-100" : "scale-75")}
                                    style={{ backgroundColor: isActive ? color : 'var(--color-muted-foreground)' }}
                                />
                                <span className="hidden sm:inline">{label}</span>
                                <span className="inline sm:hidden">{label.split(' ')[0]}</span>
                                {isActive && <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-muted-foreground" />}
                            </button>
                        )
                    })}
                </div>
            </div>
        </Card>
    )
}
