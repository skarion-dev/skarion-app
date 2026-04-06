import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AppRootPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full border rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Welcome back!</h1>
        <p className="mb-2 text-muted-foreground">Here are your permissions fetched from your JWT:</p>
        <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
          {JSON.stringify(session.user?.permissions, null, 2)}
        </pre>
      </div>
    </div>
  );
}
