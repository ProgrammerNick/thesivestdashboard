import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { authClient } from '../lib/auth-client';
import { useNavigate } from '@tanstack/react-router';
import { getTournaments, type Tournament } from '../server/features/tournaments';
import { useLoaderData } from '@tanstack/react-router';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Zap,
  FlaskConical,
  LineChart,
  Leaf,
  Coins,
  Calendar,
  Users,
  Trophy,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';

// Server Function
const getTournamentsFn = createServerFn({ method: 'GET' }).handler(async () => {
  return getTournaments();
});

export const Route = createFileRoute('/tournaments')({
  component: TournamentsPage,
  loader: async () => await getTournamentsFn(),
});

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp,
  Zap,
  FlaskConical,
  LineChart,
  Leaf,
  Coins,
};

function TournamentsPage() {
  const tournaments = useLoaderData({ from: '/tournaments' });
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();

  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'Upcoming':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Completed':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getCategoryColor = (category: Tournament['category']) => {
    switch (category) {
      case 'Value Investing':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'Growth Investing':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Sector Focus':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      case 'Options Trading':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'Crypto':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const IconComponent = ({ iconName }: { iconName: string }) => {
    const Icon = iconMap[iconName] || TrendingUp;
    return <Icon className="w-6 h-6" />;
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[1800px] mx-auto px-6 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Investment Tournaments
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Compete with the best investors. Showcase your analysis, prove your thesis, and win prizes.
          </p>
        </motion.div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tournaments.map((tournament, index) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col bg-card/50 backdrop-blur-xl border-border hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/10">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <IconComponent iconName={tournament.icon} />
                    </div>
                    <Badge className={cn('border', getStatusColor(tournament.status))}>
                      {tournament.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mb-2">{tournament.name}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {tournament.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <Badge variant="outline" className={cn('border', getCategoryColor(tournament.category))}>
                    {tournament.category}
                  </Badge>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(tournament.startDate).toLocaleDateString()} -{' '}
                        {new Date(tournament.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{tournament.participants} participants</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Trophy className="w-4 h-4" />
                      <span className="font-semibold text-foreground">Prize: {tournament.prizePool}</span>
                    </div>
                  </div>

                  {tournament.status === 'Active' && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <Clock className="w-4 h-4" />
                      <span>
                        Ends {(() => {
                          const daysRemaining = Math.ceil((new Date(tournament.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                          return daysRemaining > 0 ? `in ${daysRemaining} days` : 'soon';
                        })()}
                      </span>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full group"
                    variant={tournament.status === 'Active' ? 'default' : 'outline'}
                    disabled={tournament.status === 'Completed'}
                    onClick={() => {
                      if (!session) {
                        navigate({ to: '/login' });
                        return;
                      }
                      if (tournament.status === 'Active') {
                        // TODO: Implement join logic
                        alert("Successfully joined tournament!");
                      }
                    }}
                  >
                    {tournament.status === 'Active' ? 'Join Tournament' : tournament.status === 'Upcoming' ? 'Notify Me' : 'View Results'}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16"
        >
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">How Tournaments Work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                    1
                  </div>
                  <h3 className="font-semibold">Submit Your Thesis</h3>
                  <p className="text-sm text-muted-foreground">
                    Research and submit a detailed investment thesis following the tournament rules.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                    2
                  </div>
                  <h3 className="font-semibold">Track Performance</h3>
                  <p className="text-sm text-muted-foreground">
                    Your picks are tracked in real-time. Leaderboards show top performers.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                    3
                  </div>
                  <h3 className="font-semibold">Win Prizes</h3>
                  <p className="text-sm text-muted-foreground">
                    Top performers at the end of the tournament period win cash prizes and recognition.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

