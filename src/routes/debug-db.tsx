import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getAllUsers } from '../server/data-access/users'

const debugFn = createServerFn({ method: "GET" }).handler(async () => {
    try {
        const users = await getAllUsers();
        return { success: true, count: users.length, users: users.slice(0, 2) };
    } catch (e: any) {
        return { success: false, error: e.message, stack: e.stack };
    }
});

export const Route = createFileRoute('/debug-db')({
    component: DebugPage,
    loader: () => debugFn(),
})

function DebugPage() {
    const data = Route.useLoaderData();
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Debug Database</h1>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    )
}
