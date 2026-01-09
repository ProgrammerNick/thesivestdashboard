
// --- Data Generation & Config ---

export const TIME_RANGES = ['1M', '3M', '6M', 'YTD', '1Y', '3Y'] as const
export type TimeRange = typeof TIME_RANGES[number]

export type SeriesConfig = {
    id: string
    label: string
    color: string
    type: 'area' | 'line' | 'dashed'
    isBenchmark?: boolean
}

export const SERIES: SeriesConfig[] = [
    { id: 'portfolio', label: 'Thesivest', color: 'var(--color-primary)', type: 'area' },
    { id: 'sp500', label: 'S&P 500', color: 'var(--color-foreground)', type: 'line', isBenchmark: true },
    { id: 'nasdaq', label: 'NASDAQ', color: '#a855f7', type: 'dashed', isBenchmark: true }, // Purple-500
    { id: 'russell', label: 'Russell 2000', color: '#eab308', type: 'dashed', isBenchmark: true }, // Yellow-500
    { id: 'nvda', label: 'NVDA', color: '#22c55e', type: 'line' }, // Green-500
    { id: 'tsla', label: 'TSLA', color: '#ef4444', type: 'line' }, // Red-500
    { id: 'pltr', label: 'PLTR', color: '#3b82f6', type: 'line' }, // Blue-500
]

// Portfolios Config
export const PORTFOLIOS = [
    { id: 'thesivest', name: 'Your Investing Portfolio', color: 'var(--color-primary)', acronym: 'YP', stats: { beta: 1.12, alpha: '+5.4%', return: '+24.8%' } },
    { id: 'berkshire', name: 'Berkshire Hathaway', color: '#3b82f6', acronym: 'BRK', stats: { beta: 0.88, alpha: '+2.1%', return: '+15.2%' } }, // blue-500
    { id: 'pershing', name: 'Pershing Square', color: '#64748b', acronym: 'PS', stats: { beta: 1.05, alpha: '+1.8%', return: '+12.4%' } }, // slate-500
    // { id: 'bridgewater', name: 'Bridgewater', color: '#ef4444', acronym: 'BW' }, // red-500
    { id: 'thirdpoint', name: 'Third Point', color: '#14b8a6', acronym: 'TP', stats: { beta: 0.95, alpha: '+0.5%', return: '+9.8%' } },
    { id: 'ark', name: 'ARK Invest', color: '#d946ef', acronym: 'AR', stats: { beta: 1.55, alpha: '-4.2%', return: '-12.5%' } }, // fuchsia-500
    { id: 'renaissance', name: 'Renaissance', color: '#8b5cf6', acronym: 'RT', stats: { beta: 0.92, alpha: '+8.4%', return: '+28.1%' } },
] as const

// --- Global Benchmark Generation ---
const GENERATE_BENCHMARKS = (points: number, intervalMinutes: number = 1440) => {
    let sp500 = 100
    let nasdaq = 100
    let russell = 100
    let nvda = 100
    let tsla = 100
    let pltr = 100

    const now = new Date()
    const result: any[] = []

    // Volatility for Benchmarks
    // Daily Vol: SPY ~1%, NSDQ ~1.2%, Stocks ~2-3%
    // Reduced SPY positive drift to make it beatable
    const volScale = Math.sqrt(intervalMinutes / 1440)

    for (let i = 0; i < points; i++) {
        const date = new Date(now)
        const minutesOffset = (i - points) * intervalMinutes
        date.setMinutes(date.getMinutes() + minutesOffset)

        // Random Walks
        // Bias: 0.0003 ~ 7-8% annual
        sp500 *= 1 + (Math.random() * 0.02 - 0.0097) * volScale
        nasdaq *= 1 + (Math.random() * 0.024 - 0.011) * volScale
        russell *= 1 + (Math.random() * 0.028 - 0.014) * volScale

        // Individual Stocks (Higher Vol)
        nvda *= 1 + (Math.random() * 0.05 - 0.023) * volScale
        tsla *= 1 + (Math.random() * 0.06 - 0.029) * volScale
        pltr *= 1 + (Math.random() * 0.05 - 0.024) * volScale

        result.push({
            date: date.getTime(),
            sp500: Number(sp500.toFixed(2)),
            nasdaq: Number(nasdaq.toFixed(2)),
            russell: Number(russell.toFixed(2)),
            nvda: Number(nvda.toFixed(2)),
            tsla: Number(tsla.toFixed(2)),
            pltr: Number(pltr.toFixed(2)),
        })
    }
    return result
}

// Generate one master timeline of benchmarks to be shared by ALL portfolios
const MASTER_BENCHMARKS = GENERATE_BENCHMARKS(1095, 1440) // 3 Years

// --- Portfolio Data Generation ---
const GENERATE_PORTFOLIO_DATA = (benchmarks: any[], bias: number = 0.0005, volMultiplier: number = 1.0) => {
    let portfolio = 100
    // Volatility Scaling
    const volScale = 1.0 * volMultiplier

    return benchmarks.map(point => {
        const open = portfolio
        // Random walk for portfolio
        // Bias 0.0005 ~ 12-13% annual (beats SPY 0.0003)
        const drift = bias * volScale
        const shock = (Math.random() - 0.5) * 0.035 * volScale
        const close = open * (1 + drift + shock)

        // High/Low derived from Open/Close
        const high = Math.max(open, close) * (1 + Math.random() * 0.01 * volScale)
        const low = Math.min(open, close) * (1 - Math.random() * 0.01 * volScale)

        portfolio = close

        return {
            ...point, // Include shared benchmark data
            open: Number(open.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            close: Number(close.toFixed(2)),
            portfolio: Math.round(close) // Legacy field
        }
    })
}

// Prefetch/Generate data for ranges
const generateDataForPortfolio = (id: string) => {
    // Default: Slight outperform
    let bias = 0.0004
    let vol = 1.0

    // Adjust params per portfolio to create variety
    if (id === 'thesivest') { bias = 0.0006; vol = 0.9 } // Steady outperform
    if (id === 'berkshire') { bias = 0.00035; vol = 0.6 } // Low vol, matches SPY
    if (id === 'pershing') { bias = 0.00045; vol = 0.8 }
    if (id === 'bridgewater') { bias = 0.0002; vol = 0.5 } // Underperform/Flat
    if (id === 'ark') { bias = 0.0001; vol = 2.2 } // High vol, erratic
    if (id === 'renaissance') { bias = 0.0007; vol = 1.1 } // High alpha

    // Generate Master Dataset (~3 Years) merging benchmarks
    const masterData = GENERATE_PORTFOLIO_DATA(MASTER_BENCHMARKS, bias, vol)

    // Helper to slice data based on time range
    const sliceData = (days: number) => {
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - days)
        const time = cutoff.getTime()
        return masterData.filter(d => d.date >= time)
    }

    return {
        '1M': sliceData(30),
        '3M': sliceData(90),
        '6M': sliceData(180),
        'YTD': masterData.filter(d => new Date(d.date).getFullYear() === new Date().getFullYear()),
        '1Y': sliceData(365),
        '3Y': masterData, // Full dataset
    }
}

export const ALL_DATA_SETS: Record<string, Record<TimeRange, any[]>> = {}
PORTFOLIOS.forEach(p => {
    ALL_DATA_SETS[p.id as string] = generateDataForPortfolio(p.id)
})
