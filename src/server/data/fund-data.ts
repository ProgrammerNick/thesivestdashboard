/**
 * Fund Data Source
 * Static data for major institutional funds based on public 13F filings
 */

export interface FundHolding {
    symbol: string;
    name: string;
    shares: string;
    value: string;
    percent: number;
    change?: "new" | "add" | "trim" | "exit";
    changePercent?: number;
}

export interface FundMove {
    ticker: string;
    action: "Buy" | "Sell";
    type: "New Position" | "Add" | "Trim" | "Liquidate";
    shares: string;
    value: string;
}

export interface InstitutionalFund {
    id: string;
    name: string;
    manager: string;
    aum: string;
    strategy: string;
    focus: string[];
    philosophy: string;
    topHoldings: FundHolding[];
    recentMoves: FundMove[];
    quarterlyReturn?: number;
    ytdReturn?: number;
}

export const institutionalFunds: InstitutionalFund[] = [
    {
        id: "berkshire",
        name: "Berkshire Hathaway",
        manager: "Warren Buffett",
        aum: "$350B+",
        strategy: "Value Investing",
        focus: ["Financials", "Consumer", "Technology"],
        philosophy: "Buy wonderful companies at fair prices and hold forever. Focus on durable competitive advantages and quality management.",
        topHoldings: [
            { symbol: "AAPL", name: "Apple Inc.", shares: "915M", value: "$178B", percent: 45.2, change: "trim", changePercent: -1.2 },
            { symbol: "BAC", name: "Bank of America", shares: "1.03B", value: "$35B", percent: 9.8 },
            { symbol: "AXP", name: "American Express", shares: "151M", value: "$28B", percent: 7.9, change: "add", changePercent: 2.1 },
            { symbol: "KO", name: "Coca-Cola", shares: "400M", value: "$24B", percent: 6.8 },
            { symbol: "CVX", name: "Chevron", shares: "123M", value: "$18B", percent: 5.1 },
        ],
        recentMoves: [
            { ticker: "OXY", action: "Buy", type: "Add", shares: "+5.2M", value: "$320M" },
            { ticker: "AAPL", action: "Sell", type: "Trim", shares: "-10M", value: "$1.8B" },
        ],
        quarterlyReturn: 4.2,
        ytdReturn: 12.8,
    },
    {
        id: "ark",
        name: "ARK Invest",
        manager: "Cathie Wood",
        aum: "$14B",
        strategy: "Disruptive Innovation",
        focus: ["Technology", "Genomics", "Fintech", "Space"],
        philosophy: "Invest in companies driving innovation across sectors. Long-term horizon with 5+ year time frame focused on exponential growth.",
        topHoldings: [
            { symbol: "TSLA", name: "Tesla Inc.", shares: "3.8M", value: "$950M", percent: 11.2, change: "add", changePercent: 3.5 },
            { symbol: "COIN", name: "Coinbase", shares: "8.2M", value: "$680M", percent: 8.1, change: "new" },
            { symbol: "ROKU", name: "Roku Inc.", shares: "6.1M", value: "$420M", percent: 5.8 },
            { symbol: "SQ", name: "Block Inc.", shares: "5.4M", value: "$380M", percent: 5.2, change: "add", changePercent: 1.8 },
            { symbol: "PATH", name: "UiPath", shares: "12M", value: "$180M", percent: 2.4 },
        ],
        recentMoves: [
            { ticker: "COIN", action: "Buy", type: "New Position", shares: "+8.2M", value: "$680M" },
            { ticker: "TSLA", action: "Buy", type: "Add", shares: "+1.2M", value: "$290M" },
        ],
        quarterlyReturn: -2.8,
        ytdReturn: 18.5,
    },
    {
        id: "bridgewater",
        name: "Bridgewater Associates",
        manager: "Ray Dalio (Founder)",
        aum: "$125B",
        strategy: "Global Macro / All Weather",
        focus: ["ETFs", "Emerging Markets", "Commodities"],
        philosophy: "Risk parity approach with diversification across asset classes. Systematic, principles-based investing with emphasis on economic cycles.",
        topHoldings: [
            { symbol: "SPY", name: "S&P 500 ETF", shares: "8.5M", value: "$3.8B", percent: 12.1 },
            { symbol: "IEMG", name: "iShares EM ETF", shares: "42M", value: "$2.1B", percent: 6.8, change: "add", changePercent: 15.2 },
            { symbol: "VWO", name: "Vanguard EM ETF", shares: "38M", value: "$1.6B", percent: 5.2 },
            { symbol: "EEM", name: "iShares EM ETF", shares: "35M", value: "$1.4B", percent: 4.5 },
            { symbol: "GLD", name: "SPDR Gold", shares: "6.2M", value: "$1.2B", percent: 3.9 },
        ],
        recentMoves: [
            { ticker: "IEMG", action: "Buy", type: "Add", shares: "+12M", value: "$580M" },
            { ticker: "PG", action: "Sell", type: "Trim", shares: "-2.1M", value: "$320M" },
        ],
        quarterlyReturn: 2.1,
        ytdReturn: 8.4,
    },
    {
        id: "renaissance",
        name: "Renaissance Technologies",
        manager: "Jim Simons (Founder)",
        aum: "$130B",
        strategy: "Quantitative / Algorithmic",
        focus: ["All Sectors", "High Frequency", "Statistical Arbitrage"],
        philosophy: "Mathematical and statistical models to identify patterns. Medallion Fund is legendary for 66%+ annual returns. Heavily data-driven approach.",
        topHoldings: [
            { symbol: "NVDA", name: "NVIDIA Corp.", shares: "2.8M", value: "$1.4B", percent: 3.2, change: "add", changePercent: 8.5 },
            { symbol: "NOVO-B", name: "Novo Nordisk", shares: "12M", value: "$1.3B", percent: 3.0 },
            { symbol: "META", name: "Meta Platforms", shares: "2.1M", value: "$1.1B", percent: 2.5, change: "new" },
            { symbol: "PLTR", name: "Palantir", shares: "18M", value: "$480M", percent: 1.1, change: "new" },
            { symbol: "AAPL", name: "Apple Inc.", shares: "2.4M", value: "$450M", percent: 1.0 },
        ],
        recentMoves: [
            { ticker: "PLTR", action: "Buy", type: "New Position", shares: "+18M", value: "$480M" },
            { ticker: "META", action: "Buy", type: "New Position", shares: "+2.1M", value: "$1.1B" },
        ],
        quarterlyReturn: 8.9,
        ytdReturn: 24.2,
    },
    {
        id: "pershing",
        name: "Pershing Square",
        manager: "Bill Ackman",
        aum: "$18B",
        strategy: "Activist Value",
        focus: ["Large Cap", "Turnarounds", "Consumer"],
        philosophy: "Concentrated portfolio of 8-12 high-conviction positions. Activist approach to unlock shareholder value through operational improvements.",
        topHoldings: [
            { symbol: "CMG", name: "Chipotle", shares: "3.2M", value: "$6.8B", percent: 18.5 },
            { symbol: "HLT", name: "Hilton", shares: "8.1M", value: "$1.5B", percent: 12.2 },
            { symbol: "QSR", name: "Restaurant Brands", shares: "18M", value: "$1.2B", percent: 9.8 },
            { symbol: "LOW", name: "Lowe's", shares: "4.2M", value: "$920M", percent: 7.5 },
            { symbol: "GOOGL", name: "Alphabet", shares: "5.1M", value: "$880M", percent: 7.2, change: "new" },
        ],
        recentMoves: [
            { ticker: "GOOGL", action: "Buy", type: "New Position", shares: "+5.1M", value: "$880M" },
            { ticker: "CMG", action: "Sell", type: "Trim", shares: "-150K", value: "$450M" },
        ],
        quarterlyReturn: 5.6,
        ytdReturn: 15.3,
    },
    {
        id: "sequoia",
        name: "Sequoia Fund",
        manager: "Ruane, Cunniff & Goldfarb",
        aum: "$5B",
        strategy: "Long-term Value",
        focus: ["Quality Growth", "Technology", "Healthcare"],
        philosophy: "Patient, long-term approach inspired by Warren Buffett. Focus on companies with durable advantages and reinvestment opportunities.",
        topHoldings: [
            { symbol: "GOOGL", name: "Alphabet", shares: "1.8M", value: "$580M", percent: 14.2, change: "add", changePercent: 4.5 },
            { symbol: "META", name: "Meta Platforms", shares: "890K", value: "$480M", percent: 11.8 },
            { symbol: "UPS", name: "United Parcel", shares: "2.1M", value: "$320M", percent: 7.8 },
            { symbol: "BRK.B", name: "Berkshire", shares: "680K", value: "$280M", percent: 6.9 },
            { symbol: "TDG", name: "TransDigm", shares: "210K", value: "$240M", percent: 5.9 },
        ],
        recentMoves: [
            { ticker: "GOOGL", action: "Buy", type: "Add", shares: "+450K", value: "$78M" },
        ],
        quarterlyReturn: 3.2,
        ytdReturn: 11.7,
    },
    {
        id: "oakmark",
        name: "Oakmark Funds",
        manager: "Harris Associates",
        aum: "$90B",
        strategy: "Contrarian Value",
        focus: ["Financials", "Industrials", "Communication"],
        philosophy: "Buy businesses worth substantially more than their market price. Contrarian approach finding value where others see problems.",
        topHoldings: [
            { symbol: "ALLY", name: "Ally Financial", shares: "28M", value: "$980M", percent: 5.2 },
            { symbol: "GM", name: "General Motors", shares: "18M", value: "$780M", percent: 4.1 },
            { symbol: "GOOG", name: "Alphabet C", shares: "4.2M", value: "$720M", percent: 3.8 },
            { symbol: "WFC", name: "Wells Fargo", shares: "12M", value: "$620M", percent: 3.3, change: "add", changePercent: 5.2 },
            { symbol: "EOG", name: "EOG Resources", shares: "4.8M", value: "$580M", percent: 3.1 },
        ],
        recentMoves: [
            { ticker: "CRM", action: "Sell", type: "Liquidate", shares: "-1.2M", value: "$280M" },
            { ticker: "WFC", action: "Buy", type: "Add", shares: "+3.2M", value: "$165M" },
        ],
        quarterlyReturn: 2.8,
        ytdReturn: 9.4,
    },
    {
        id: "tiger",
        name: "Tiger Global",
        manager: "Chase Coleman",
        aum: "$35B",
        strategy: "Growth Equity",
        focus: ["Technology", "Internet", "Software"],
        philosophy: "Long-term investments in technology companies. Heavy exposure to both public and private markets with focus on market leaders.",
        topHoldings: [
            { symbol: "MSFT", name: "Microsoft", shares: "4.2M", value: "$1.8B", percent: 8.5 },
            { symbol: "META", name: "Meta Platforms", shares: "2.8M", value: "$1.5B", percent: 7.1, change: "add", changePercent: 12.5 },
            { symbol: "AMZN", name: "Amazon", shares: "6.5M", value: "$1.2B", percent: 5.7 },
            { symbol: "CRM", name: "Salesforce", shares: "3.2M", value: "$980M", percent: 4.6 },
            { symbol: "SNOW", name: "Snowflake", shares: "4.8M", value: "$820M", percent: 3.9, change: "new" },
        ],
        recentMoves: [
            { ticker: "SNOW", action: "Buy", type: "New Position", shares: "+4.8M", value: "$820M" },
            { ticker: "META", action: "Buy", type: "Add", shares: "+1.2M", value: "$650M" },
        ],
        quarterlyReturn: 6.2,
        ytdReturn: 19.8,
    },
    {
        id: "tci",
        name: "TCI Fund Management",
        manager: "Chris Hohn",
        aum: "$45B",
        strategy: "Activist / Concentrated",
        focus: ["Infrastructure", "Technology", "Transports"],
        philosophy: "Highly concentrated portfolio with activist engagement. Focus on capital allocation and returning cash to shareholders.",
        topHoldings: [
            { symbol: "GOOGL", name: "Alphabet", shares: "8.5M", value: "$2.8B", percent: 18.2 },
            { symbol: "MSFT", name: "Microsoft", shares: "3.8M", value: "$1.6B", percent: 10.4 },
            { symbol: "CNR", name: "Canadian National", shares: "8.2M", value: "$1.1B", percent: 7.2 },
            { symbol: "VISA", name: "Visa Inc.", shares: "3.5M", value: "$980M", percent: 6.4 },
            { symbol: "MA", name: "Mastercard", shares: "1.8M", value: "$820M", percent: 5.3, change: "add", changePercent: 3.8 },
        ],
        recentMoves: [
            { ticker: "MA", action: "Buy", type: "Add", shares: "+520K", value: "$240M" },
        ],
        quarterlyReturn: 4.8,
        ytdReturn: 14.2,
    },
    {
        id: "elliott",
        name: "Elliott Management",
        manager: "Paul Singer",
        aum: "$65B",
        strategy: "Activist / Event-Driven",
        focus: ["Technology", "Energy", "Special Situations"],
        philosophy: "Aggressive activist approach pushing for operational changes, spin-offs, and M&A. Known for taking on large, underperforming companies.",
        topHoldings: [
            { symbol: "PINS", name: "Pinterest", shares: "42M", value: "$1.6B", percent: 6.8, change: "new" },
            { symbol: "TXN", name: "Texas Instruments", shares: "5.2M", value: "$980M", percent: 4.1 },
            { symbol: "DELL", name: "Dell Technologies", shares: "8.1M", value: "$920M", percent: 3.9 },
            { symbol: "SLB", name: "Schlumberger", shares: "15M", value: "$780M", percent: 3.3 },
            { symbol: "COP", name: "ConocoPhillips", shares: "6.2M", value: "$720M", percent: 3.0, change: "add", changePercent: 8.2 },
        ],
        recentMoves: [
            { ticker: "PINS", action: "Buy", type: "New Position", shares: "+42M", value: "$1.6B" },
            { ticker: "COP", action: "Buy", type: "Add", shares: "+2.1M", value: "$245M" },
        ],
        quarterlyReturn: 3.5,
        ytdReturn: 10.9,
    },
];

// Helper function to search funds
export function searchFunds(query: string): InstitutionalFund[] {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return institutionalFunds;

    return institutionalFunds.filter(fund =>
        fund.name.toLowerCase().includes(lowerQuery) ||
        fund.manager.toLowerCase().includes(lowerQuery) ||
        fund.strategy.toLowerCase().includes(lowerQuery) ||
        fund.focus.some(f => f.toLowerCase().includes(lowerQuery)) ||
        fund.topHoldings.some(h =>
            h.symbol.toLowerCase().includes(lowerQuery) ||
            h.name.toLowerCase().includes(lowerQuery)
        )
    );
}

// Get fund by ID
export function getFundById(id: string): InstitutionalFund | undefined {
    return institutionalFunds.find(f => f.id === id);
}
