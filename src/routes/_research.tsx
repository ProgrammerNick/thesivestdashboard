import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ResearchSidebar } from "@/components/ResearchSidebar";

export const Route = createFileRoute("/_research")({
    component: ResearchLayout,
});

function ResearchLayout() {
    return (
        <SidebarProvider>
            <ResearchSidebar />
            <SidebarInset>
                <div className="flex min-h-screen bg-background text-foreground font-sans w-full flex-col">
                    <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        <Outlet />
                    </main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
