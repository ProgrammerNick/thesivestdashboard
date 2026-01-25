import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/_dashboard/tournaments")({
  component: TournamentsPage,
});

function TournamentsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">
            Tournaments
          </h1>
          <p className="text-muted-foreground mt-1">
            Compete against other analysts for prizes and reputation.
          </p>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active">
            Active & Upcoming
          </TabsTrigger>
          <TabsTrigger value="history">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Mock Tournament 1 */}
            <TournamentCard
              title="The Alpha Cup S1"
              description="Highest risk-adjusted returns over a 3-month period. L/S Equity focus."
              prize="$5,000"
              participants={124}
              endsIn="45 days"
              tags={["L/S Equity", "3 Months"]}
              status="Active"
            />
            {/* Mock Tournament 2 */}
            <TournamentCard
              title="Crypto Yield Hunt"
              description="Best yield farming strategies on EVM chains. Code audit required."
              prize="10 ETH"
              participants={56}
              endsIn="Starts in 2 days"
              tags={["Crypto", "DeFi"]}
              status="Upcoming"
            />
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="grid md:grid-cols-2 gap-6">
            <TournamentCard
              title="Q3 Macro Sprint"
              description="Best macro calls during the Fed pivot window."
              prize="$2,500"
              participants={89}
              endsIn="Ended Oct 2024"
              tags={["Macro", "Rates"]}
              status="Completed"
              winner="Sebastian Newberry"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TournamentCard({ title, description, prize, participants, endsIn, tags, status, winner }: any) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-all border-l-4 border-l-primary/50 hover:border-l-primary">
      <CardHeader>
        <div className="flex justify-between items-start">
          <Badge variant={status === 'Active' ? 'default' : status === 'Upcoming' ? 'secondary' : 'outline'}>
            {status}
          </Badge>
          <div className="flex items-center text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
            {prize} Pool
          </div>
        </div>
        <CardTitle className="text-xl mt-2">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((t: string) => (
            <Badge key={t} variant="outline" className="font-mono text-xs">{t}</Badge>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            {participants} Enrolled
          </div>
          <div>
            {endsIn}
          </div>
        </div>

        {winner && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
            <div>
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Winner</div>
              <div className="font-semibold text-foreground">{winner}</div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        {status !== 'Completed' ? (
          <Button className="w-full">
            Join Tournament
          </Button>
        ) : (
          <Button variant="outline" className="w-full">
            View Leaderboard
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
