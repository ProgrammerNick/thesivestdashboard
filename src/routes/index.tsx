import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "../lib/auth";
import { Button } from "../components/ui/button";

const checkAuth = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request!.headers });
  return session;
});

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => {
    try {
      const session = await checkAuth();
      if (session) {
        throw redirect({
          to: "/dashboard",
        });
      }
      return {};
    } catch (e) {
      if (e instanceof Response) throw e;
      return {};
    }
  },
});

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-8">
        <h1 className="text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-foreground">
          Thesivest.
        </h1>
        <p className="text-xl text-muted-foreground font-light">
          Where Research Becomes Conviction.
        </p>

        <div className="flex flex-col gap-4 w-full max-w-xs mx-auto pt-8">
          <Button size="lg" className="h-12 text-lg rounded-full" asChild>
            <Link to="/login">
              Login
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 text-lg rounded-full" asChild>
            <Link to="/signup">
              Create Account
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
