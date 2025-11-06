import { UserProfile } from "@clerk/nextjs";

export default function AccountPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      <UserProfile
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "w-full shadow-none",
          },
        }}
      />
    </div>
  );
}
