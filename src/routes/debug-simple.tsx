import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

const helloFn = createServerFn({ method: "GET" }).handler(async () => {
    return { message: "Hello from server" };
});

export const Route = createFileRoute('/debug-simple')({
    component: DebugSimplePage,
    loader: () => helloFn(),
})

function DebugSimplePage() {
    const data = Route.useLoaderData();
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Debug Simple</h1>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    )
}
