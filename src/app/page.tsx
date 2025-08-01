import { auth } from "@/lib/auth";
import { SignIn } from "@/components/auth/sign-in";
import { Dashboard } from "@/components/dashboard/dashboard";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Money Tracker
            </h1>
            <p className="text-gray-600">
              Track your finances with ease. Sign in to get started.
            </p>
          </div>
          <SignIn />
        </div>
      </div>
    );
  }

  return <Dashboard user={session.user} />;
}
