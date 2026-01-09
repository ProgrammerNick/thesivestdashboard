# Profile Page Redesign - Design & Data Guide

## Overview
The profile page has been completely redesigned with a modern, professional UI that focuses on performance metrics, community engagement, and content discovery.

## Design Improvements

### 1. **Visual Hierarchy**
- Clean, gradient-based design with glassmorphism effects
- Better spacing and visual separation between sections
- Modern card layouts with hover effects
- Gradient text and borders for emphasis

### 2. **Key Metrics Section**
Replaced "Trading Streaks" with more meaningful performance metrics:

#### **Alpha (vs S&P 500)**
- **What it shows**: Excess return over the market benchmark
- **Why it matters**: Indicates whether the investor is beating the market
- **Visual**: Green gradient card with trending up icon

#### **Beta (vs S&P 500)**
- **What it shows**: Volatility relative to the market
- **Why it matters**: Measures risk - Beta > 1 = more volatile, Beta < 1 = less volatile
- **Visual**: Blue gradient card with contextual description
- **Examples**:
  - Beta = 1.5: 50% more volatile than market
  - Beta = 0.8: 20% less volatile than market

#### **Win Rate** (Enhanced)
- Added progress bar visualization
- Better color coding
- Clear percentage display

#### **Total Return** (Enhanced)
- Dynamic color based on performance (green/red)
- Shows average return per trade
- Larger, more prominent display

### 3. **Additional Metrics Row**
Three new cards showing:
- **Best Trade**: Top performing investment
- **Worst Trade**: Learning opportunity identification
- **Max Drawdown**: Risk metric showing largest peak-to-trough decline

### 4. **Risk-Adjusted Performance Card**
A dedicated card showing sophisticated metrics:
- **Sharpe Ratio**: Risk-adjusted return measure
  - > 1.0 = Good risk-adjusted returns
  - 0.0 - 1.0 = Moderate
  - < 0.0 = Poor
- **Total Trades**: Track record size
- **Win/Loss Ratio**: Average win divided by average loss

### 5. **Recent Posts Section**
- **Grid layout**: 3 columns on large screens
- **Interactive cards**: Hover effects with shadow and lift
- **Rich post preview**: Shows type, symbol, performance, engagement
- **View all link**: Direct access to full trade history

### 6. **Community Engagement**
- **Total Views**: Reach and impact
- **Total Likes**: Content quality indicator
- **Total Comments**: Community involvement

---

## Data Acquisition Guide

### 1. **Alpha Calculation**
Alpha measures how much an investment outperformed (or underperformed) a benchmark (S&P 500).

**Formula**:
```
Alpha = Portfolio Return - (Risk-Free Rate + Beta × (Market Return - Risk-Free Rate))
```

**Simplified Version** (if you don't have risk-free rate):
```
Alpha = Portfolio Return - (Market Return × Beta)
```

**How to Get Market Data**:

#### Option A: Alpha Vantage API (Recommended)
```bash
# Get S&P 500 historical data
Endpoint: https://www.alphavantage.co/query
Parameters:
  - function: TIME_SERIES_DAILY
  - symbol: SPY (S&P 500 ETF)
  - outputsize: full
  - apikey: YOUR_KEY
```

#### Option B: Financial Modeling Prep (FMP)
```bash
Endpoint: https://financialmodelingprep.com/api/v3/historical-price-full/SPY
apikey: YOUR_KEY
```

#### Option C: Yahoo Finance (Free)
```typescript
import yahooFinance from 'yahoo-finance2';

// Get S&P 500 historical data
const data = await yahooFinance.historical('^GSPC', {
  period1: '2020-01-01',
  period2: new Date(),
});
```

**Implementation Example**:

```typescript
// src/server/data/performance.ts
import yahooFinance from 'yahoo-finance2';

export async function calculateAlpha(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  // Get user's portfolio returns
  const portfolioReturns = await getUserPortfolioReturns(userId, startDate, endDate);

  // Get S&P 500 returns for same period
  const sp500Data = await yahooFinance.historical('^GSPC', {
    period1: startDate,
    period2: endDate,
  });

  const marketReturns = calculateDailyReturns(sp500Data);

  // Calculate beta first
  const beta = calculateBeta(portfolioReturns, marketReturns);

  // Get risk-free rate (e.g., 3-month T-bill)
  const riskFreeRate = await getRiskFreeRate();

  // Calculate alpha
  const portfolioTotalReturn = portfolioReturns.reduce((a, b) => a + b, 0);
  const marketTotalReturn = marketReturns.reduce((a, b) => a + b, 0);

  const alpha = portfolioTotalReturn - (riskFreeRate + beta * (marketTotalReturn - riskFreeRate));

  return alpha;
}
```

---

### 2. **Beta Calculation**
Beta measures volatility relative to the market.

**Formula**:
```
Beta = Covariance(Portfolio Returns, Market Returns) / Variance(Market Returns)
```

**Implementation Example**:

```typescript
export function calculateBeta(
  portfolioReturns: number[],
  marketReturns: number[]
): number {
  if (portfolioReturns.length !== marketReturns.length) {
    throw new Error('Arrays must be same length');
  }

  // Calculate covariance
  const meanPortfolio = portfolioReturns.reduce((a, b) => a + b) / portfolioReturns.length;
  const meanMarket = marketReturns.reduce((a, b) => a + b) / marketReturns.length;

  let covariance = 0;
  for (let i = 0; i < portfolioReturns.length; i++) {
    covariance += (portfolioReturns[i] - meanPortfolio) * (marketReturns[i] - meanMarket);
  }
  covariance /= portfolioReturns.length;

  // Calculate variance of market
  let variance = 0;
  for (const return_ of marketReturns) {
    variance += Math.pow(return_ - meanMarket, 2);
  }
  variance /= marketReturns.length;

  return covariance / variance;
}
```

---

### 3. **Sharpe Ratio Calculation**
Measures risk-adjusted return.

**Formula**:
```
Sharpe Ratio = (Portfolio Return - Risk-Free Rate) / Portfolio Standard Deviation
```

**Implementation Example**:

```typescript
export function calculateSharpeRatio(
  portfolioReturns: number[],
  riskFreeRate: number
): number {
  // Annualize returns (assuming daily returns)
  const annualizedReturn = portfolioReturns.reduce((a, b) => a + b) * 252;

  // Calculate standard deviation
  const mean = portfolioReturns.reduce((a, b) => a + b) / portfolioReturns.length;
  const variance = portfolioReturns.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / portfolioReturns.length;
  const annualizedStdDev = Math.sqrt(variance * 252);

  // Calculate Sharpe Ratio
  return (annualizedReturn - riskFreeRate) / annualizedStdDev;
}
```

---

### 4. **Win/Loss Ratio**
Average win divided by average loss.

**Formula**:
```
Win/Loss Ratio = Average Win / |Average Loss|
```

**Implementation Example**:

```typescript
export function calculateWinLossRatio(trades: Trade[]): number {
  const wins = trades.filter(t => t.returnPercent > 0);
  const losses = trades.filter(t => t.returnPercent < 0);

  if (losses.length === 0) return wins.length > 0 ? Infinity : 0;

  const averageWin = wins.reduce((sum, t) => sum + t.returnPercent, 0) / wins.length;
  const averageLoss = Math.abs(losses.reduce((sum, t) => sum + t.returnPercent, 0) / losses.length);

  return averageWin / averageLoss;
}
```

---

## Recommended API Providers

### **Free Options**

1. **Alpha Vantage**
   - Free tier: 25 requests/day
   - Historical data
   - Technical indicators
   - Website: https://www.alphavantage.co/

2. **Financial Modeling Prep**
   - Free tier: 250 requests/day
   - Good documentation
   - S&P 500 data
   - Website: https://site.financialmodelingprep.com/

3. **Yahoo Finance (via yahoo-finance2)**
   - Completely free
   - No rate limiting
   - Comprehensive data
   - Package: `npm install yahoo-finance2`

4. **IEX Cloud**
   - Free tier: 100,000 requests/month
   - Real-time data
   - Good for US stocks
   - Website: https://iexcloud.io/

### **Paid Options** (for production)

1. **Polygon.io**
   - $99/month for basic plan
   - Real-time data
   - Excellent API
   - Website: https://polygon.io/

2. **Quandl** (now part of NASDAQ)
   - Pricing varies
   - Alternative data
   - Research-quality
   - Website: https://www.nasdaq.com/data/

---

## Implementation Roadmap

### Phase 1: Database Updates
```sql
-- Add new columns to user or create user_metrics table
ALTER TABLE user ADD COLUMN alpha DECIMAL(10, 4);
ALTER TABLE user ADD COLUMN beta DECIMAL(10, 4);
ALTER TABLE user ADD COLUMN sharpe_ratio DECIMAL(10, 4);
ALTER TABLE user ADD COLUMN max_drawdown DECIMAL(10, 4);
ALTER TABLE user ADD COLUMN best_trade DECIMAL(10, 4);
ALTER TABLE user ADD COLUMN worst_trade DECIMAL(10, 4);
ALTER TABLE user ADD COLUMN win_loss_ratio DECIMAL(10, 4);
```

### Phase 2: Data Fetching Service
Create `src/server/data/market-data.ts`:
```typescript
export async function fetchS&P500Data(startDate: Date, endDate: Date) {
  // Fetch market data
}

export async function calculateAllMetrics(userId: string) {
  // Calculate alpha, beta, sharpe ratio, etc.
  // Store in database
}
```

### Phase 3: Background Jobs
Run calculations periodically (daily/weekly):
```typescript
// Use cron or serverless jobs
export async function updateAllUserMetrics() {
  const users = await getAllUsers();
  for (const user of users) {
    await calculateAllMetrics(user.id);
  }
}
```

### Phase 4: Real-time Updates
For active trades, update prices periodically:
```typescript
// Every 15 minutes
setInterval(async () => {
  await updateActiveTradePrices();
}, 15 * 60 * 1000);
```

---

## Mock Data Updates

For development, update `src/server/fn/profile.ts` to include these new fields:

```typescript
export const getProfileFn = createServerFn({ method: "GET" })
  .inputValidator((z) =>
    z.object({
      id: z.string(),
    })
  )
  .handler(async ({ input: { id } }) => {
    const user = await getUserById(id);

    return {
      ...user,
      // New fields
      alpha: 12.5, // +12.5% over S&P 500
      beta: 1.2, // 20% more volatile than market
      sharpeRatio: 1.8,
      maxDrawdown: -15.3,
      bestTrade: 45.2,
      worstTrade: -12.8,
      winLossRatio: 2.1,
      recentPosts: await getRecentPosts(id, 6),
    };
  });
```

---

## Design System Notes

### Colors Used
- **Green**: Positive performance, success
- **Red**: Negative performance, losses
- **Blue**: Neutral metrics, informational
- **Purple**: Risk metrics, volatility
- **Primary**: Brand accent, CTAs

### Tailwind Classes
- `bg-gradient-to-br`: Background gradients
- `bg-card/50 backdrop-blur`: Glassmorphism effect
- `hover:-translate-y-1`: Subtle hover lift
- `shadow-lg`: Enhanced shadows
- `transition-all`: Smooth animations

---

## Next Steps

1. ✅ UI/UX redesign complete
2. ⏳ Update mock data with new metrics
3. ⏳ Integrate market data API
4. ⏳ Implement calculation functions
5. ⏳ Set up background jobs
6. ⏳ Add caching layer for performance
7. ⏳ Test with real data

---

## Questions?

Feel free to ask about:
- Specific API integrations
- Calculation details
- Performance optimization
- Real-time updates
- Edge cases handling


