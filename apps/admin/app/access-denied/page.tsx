import { SignOutButton } from '@clerk/nextjs';

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card max-w-md text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access the admin panel.
          <br />
          Admin role is required.
        </p>
        <SignOutButton>
          <button className="btn btn-primary">
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
