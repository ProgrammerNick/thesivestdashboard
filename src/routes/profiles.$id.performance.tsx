import { createFileRoute, Link } from "@tanstack/react-router";
import { useLoaderData } from "@tanstack/react-router";
import { getPerformanceMetricsFn } from "../server/fn/profile";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/profiles/$id/performance")({
  loader: async ({ params }) => {
    const metrics = await getPerformanceMetricsFn({ data: { userId: params.id } });
    return { metrics };
  },
  component: ProfilePerformance,
});

function ProfilePerformance() {
  const { metrics } = useLoaderData({ from: "/profiles/$id/performance" });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Performance Analytics</h1>
          <Link to={`/profiles/${Route.useParams().id}`}>
            <Button variant="outline">Back to Profile</Button>
          </Link>
        </div>

        <div className="space-y-6">
          {metrics.map((metric) => (
            <Card key={metric.period} className="glassmorphism">
              <CardHeader>
                <CardTitle>{metric.period}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Total Trades
                    </div>
                    <div className="text-3xl font-bold">
                      {metric.totalTrades}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Win Rate
                    </div>
                    <div
                      className={`text-3xl font-bold ${
                        metric.winRate >= 60
                          ? "text-green-500"
                          : metric.winRate >= 40
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}
                    >
                      {metric.winRate.toFixed(1)}%
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Total Return
                    </div>
                    <div
                      className={`text-3xl font-bold ${
                        metric.totalReturn >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {metric.totalReturn >= 0 ? "+" : ""}$
                      {metric.totalReturn.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Average Return
                    </div>
                    <div
                      className={`text-3xl font-bold ${
                        metric.averageReturn >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {metric.averageReturn >= 0 ? "+" : ""}{" "}
                      {metric.averageReturn.toFixed(2)}%
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Best Trade
                    </div>
                    <div className="text-3xl font-bold text-green-500">
                      +{metric.bestTrade.toFixed(2)}%
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Worst Trade
                    </div>
                    <div className="text-3xl font-bold text-red-500">
                      {metric.worstTrade.toFixed(2)}%
                    </div>
                  </div>

                  {metric.sharpeRatio !== undefined && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Sharpe Ratio
                      </div>
                      <div
                        className={`text-3xl font-bold ${
                          metric.sharpeRatio >= 1
                            ? "text-green-500"
                            : metric.sharpeRatio >= 0
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                      >
                        {metric.sharpeRatio.toFixed(2)}
                      </div>
                    </div>
                  )}

                  {metric.maxDrawdown !== undefined && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Max Drawdown
                      </div>
                      <div className="text-3xl font-bold text-red-500">
                        -{Math.abs(metric.maxDrawdown).toFixed(2)}%
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Insights */}
        <Card className="glassmorphism mt-8">
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.map((metric) => (
                <div key={metric.period} className="border-b pb-4 last:border-0">
                  <h3 className="font-semibold mb-2">{metric.period}</h3>
                  <ul className="space-y-2 text-sm">
                    {metric.winRate >= 60 && (
                      <li className="text-green-600">
                        ✓ Strong win rate of {metric.winRate.toFixed(1)}% indicates
                        good investment selection
                      </li>
                    )}
                    {metric.winRate < 40 && metric.totalTrades > 10 && (
                      <li className="text-yellow-600">
                        ⚠ Win rate of {metric.winRate.toFixed(1)}% suggests
                        reviewing investment criteria
                      </li>
                    )}
                    {metric.averageReturn >= 5 && (
                      <li className="text-green-600">
                        ✓ Average return of {metric.averageReturn.toFixed(2)}% is
                        above market
                      </li>
                    )}
                    {metric.totalReturn > 0 && (
                      <li className="text-green-600">
                        ✓ Total positive return of $
                        {metric.totalReturn.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </li>
                    )}
                    {metric.maxDrawdown &&
                      metric.maxDrawdown < -20 && (
                        <li className="text-yellow-600">
                          ⚠ Consider risk management to reduce drawdown
                        </li>
                      )}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
