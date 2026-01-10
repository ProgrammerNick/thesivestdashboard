import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, TrendingUp, Users, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

export const Route = createFileRoute("/corporations/")({
  component: CorporationsLandingPage,
});

function CorporationsLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation / Header */}
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <TrendingUp className="w-5 h-5" />
            </div>
            Thesivest
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">For Investors</Link>
            <Link to="/corporations" className="text-foreground font-semibold">For Corporations</Link>
            <Link to="/login">Sign In</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link to="/_dashboard/talent">Find Talent</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/5 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Now in Beta for Institutional Partners
            </span>
            <h1 className="text-5xl md:text-7xl font-heading font-bold leading-tight mb-6 tracking-tight">
              Hire the Top 1% of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Retail Investors</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Forget resumes. Recruit analysts and traders based on verified portfolio performance, deep-dive research, and conviction.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-lg rounded-full" asChild>
                <Link to="/_dashboard/talent">
                  Start Scouting Talent <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full">
                Schedule Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10k+</div>
              <div className="text-muted-foreground text-sm uppercase tracking-wider">Active Analysts</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$50M+</div>
              <div className="text-muted-foreground text-sm uppercase tracking-wider">Assets Tracked</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="text-muted-foreground text-sm uppercase tracking-wider">Funds Hiring</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24h</div>
              <div className="text-muted-foreground text-sm uppercase tracking-wider">Avg. Time to Hire</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Stop Filtering Resumes. <br />Start Filtering Alpha.</h2>
            <p className="text-lg text-muted-foreground">Thesivest gives you a direct line to talent that actually understands the market.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6 text-primary" />}
              title="Verified Performance"
              description="Connect to brokerage accounts to verify actual P&L. No more paper trading heroes."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-primary" />}
              title="Quality Research"
              description="Read their investment theses and deep dives. Evaluate their thought process, not just their returns."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-primary" />}
              title="Talent Search"
              description="Filter by sector expertise, risk profile, and investment style to find the perfect fit for your fund."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 Mix-blend-overlay"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">Ready to find your next star analyst?</h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">Join top hedge funds and proprietary trading firms using Thesivest to recruit.</p>
          <Button size="lg" variant="secondary" className="h-14 px-10 text-lg rounded-full text-primary" asChild>
            <Link to="/_dashboard/talent">
              View the Talent Pool
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/20">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; 2024 Thesivest Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
