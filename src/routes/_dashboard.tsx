import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { getSession } from "../server/auth-guard";

export const Route = createFileRoute("/_dashboard")({
    component: DashboardLayout,
    loader: async () => {
        // const session = await getSession();
        // if (!session) {
        //     throw redirect({
        //         to: "/login",
        //     });
        // }
        // return { session };
        return {};
    },
});

function DashboardLayout() {
    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans">
            {/* Sidebar - Fixed on desktop, hidden on mobile (todo: mobile menu) */}
            <aside className="hidden md:block transition-all duration-300">
                <DashboardSidebar />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <DashboardHeader />
                <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
