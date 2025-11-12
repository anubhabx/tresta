import { auth } from '@clerk/nextjs/server';

export default async function DebugPage() {
  const { userId, sessionClaims } = await auth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
        
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-semibold text-gray-700">User ID:</p>
            <p className="font-mono bg-gray-100 p-2 rounded">{userId || 'Not authenticated'}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-700">Public Metadata:</p>
            <pre className="font-mono bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(sessionClaims?.publicMetadata, null, 2)}
            </pre>
          </div>

          <div>
            <p className="font-semibold text-gray-700">Role:</p>
            <p className="font-mono bg-gray-100 p-2 rounded">
              {(sessionClaims?.publicMetadata as any)?.role || 'No role set'}
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-700">Is Admin:</p>
            <p className="font-mono bg-gray-100 p-2 rounded">
              {(sessionClaims?.publicMetadata as any)?.role === 'admin' ? '✅ Yes' : '❌ No'}
            </p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500">
              To grant admin access, add this to your user's Public Metadata in Clerk Dashboard:
            </p>
            <pre className="font-mono bg-gray-100 p-2 rounded mt-2 text-xs">
{`{
  "role": "admin"
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
