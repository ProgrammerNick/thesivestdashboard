import { createFileRoute, Link } from "@tanstack/react-router";
import { useLoaderData } from "@tanstack/react-router";
import { getTradeHistoryFn } from "../server/fn/profile";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/profiles/$id/trades")({
  loader: async ({ params }) => {
    const trades = await getTradeHistoryFn({ data: { userId: params.id, limit: 50 } });
    return { trades };
  },
  component: ProfileTrades,
});

function ProfileTrades() {
  const { trades } = useLoaderData({ from: "/profiles/$id/trades" });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Trade History</h1>
          <Link to={`/profiles/${Route.useParams().id}`}>
            <Button variant="outline">Back to Profile</Button>
          </Link>
        </div>

        <div className="space-y-4">
          {trades.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No trades yet. Start documenting your investment journey!
              </CardContent>
            </Card>
          ) : (
            trades.map((trade) => (
              <Card key={trade.id} className="glassmorphism">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{trade.title}</CardTitle>
                        <Badge
                          variant={
                            trade.status === "win"
                              ? "default"
                              : trade.status === "loss"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {trade.status.toUpperCase()}
                        </Badge>
                        {trade.symbol && (
                          <Badge variant="outline">{trade.symbol}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(trade.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {trade.returnPercent !== undefined && (
                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold ${
                            trade.returnPercent >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {trade.returnPercent >= 0 ? "+" : ""}
                          {trade.returnPercent.toFixed(2)}%
                        </div>
                        {trade.returnAmount !== undefined && (
                          <div
                            className={`text-sm ${
                              trade.returnAmount >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {trade.returnAmount >= 0 ? "+" : ""}$
                            {trade.returnAmount.toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{trade.content}</p>

                  {/* Entry Details */}
                  {trade.type === "trade" && (
                    <div className="space-y-4">
                      {/* Entry Section */}
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-blue-500 mb-2">
                          Entry Details
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                          {trade.buyPrice && (
                            <div>
                              <div className="text-sm text-muted-foreground">
                                Entry Price
                              </div>
                              <div className="font-semibold">
                                ${trade.buyPrice.toLocaleString()}
                              </div>
                            </div>
                          )}
                          {trade.buyDate && (
                            <div>
                              <div className="text-sm text-muted-foreground">
                                Entry Date
                              </div>
                              <div className="font-semibold">
                                {new Date(trade.buyDate).toLocaleDateString()}
                              </div>
                            </div>
                          )}
                          {trade.targetPrice && (
                            <div>
                              <div className="text-sm text-muted-foreground">
                                Target Price
                              </div>
                              <div className="font-semibold text-green-500">
                                ${trade.targetPrice.toLocaleString()}
                              </div>
                            </div>
                          )}
                          {trade.stopLoss && (
                            <div>
                              <div className="text-sm text-muted-foreground">
                                Stop Loss
                              </div>
                              <div className="font-semibold text-red-500">
                                ${trade.stopLoss.toLocaleString()}
                              </div>
                            </div>
                          )}
                        </div>
                        {trade.entryThoughts && (
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">
                              Entry Thesis:
                            </div>
                            <p className="text-sm bg-blue-500/10 p-3 rounded">
                              {trade.entryThoughts}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Exit Section */}
                      {trade.sellDate && (
                        <div className="border-l-4 border-orange-500 pl-4">
                          <h4 className="font-semibold text-orange-500 mb-2">
                            Exit Details
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                            {trade.sellPrice && (
                              <div>
                                <div className="text-sm text-muted-foreground">
                                  Exit Price
                                </div>
                                <div className="font-semibold">
                                  ${trade.sellPrice.toLocaleString()}
                                </div>
                              </div>
                            )}
                            <div>
                              <div className="text-sm text-muted-foreground">
                                Exit Date
                              </div>
                              <div className="font-semibold">
                                {new Date(trade.sellDate).toLocaleDateString()}
                              </div>
                            </div>
                            {trade.currentPrice && !trade.sellPrice && (
                              <div>
                                <div className="text-sm text-muted-foreground">
                                  Current Price
                                </div>
                                <div className="font-semibold">
                                  ${trade.currentPrice.toLocaleString()}
                                </div>
                              </div>
                            )}
                          </div>
                          {trade.exitThoughts && (
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">
                                Exit Reasoning:
                              </div>
                              <p className="text-sm bg-orange-500/10 p-3 rounded">
                                {trade.exitThoughts}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Current Price for Active Trades */}
                      {!trade.sellDate && trade.currentPrice && (
                        <div className="border-l-4 border-purple-500 pl-4">
                          <h4 className="font-semibold text-purple-500 mb-2">
                            Current Position
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground">
                                Current Price
                              </div>
                              <div className="font-semibold">
                                ${trade.currentPrice.toLocaleString()}
                              </div>
                            </div>
                            {trade.buyPrice && (
                              <div>
                                <div className="text-sm text-muted-foreground">
                                  Unrealized Return
                                </div>
                                <div
                                  className={`font-semibold ${
                                    trade.currentPrice >= trade.buyPrice
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }`}
                                >
                                  {(
                                    ((trade.currentPrice - trade.buyPrice) /
                                      trade.buyPrice) *
                                    100
                                  ).toFixed(2)}
                                  %
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Engagement Metrics */}
                  <div className="flex gap-6 pt-4 border-t mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>👁️</span>
                      <span>{trade.views} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>❤️</span>
                      <span>{trade.likes} likes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>💬</span>
                      <span>{trade.comments} comments</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
