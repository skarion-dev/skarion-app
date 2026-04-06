import { SignInForm } from "@/components/sign-in-form";
export default function SignInPage() {
  return (
    <div className="h-[100vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <h1 className="text-2xl font-semibold tracking-tight text-center">
          Sign In
        </h1>
        <SignInForm />
      </div>
    </div>
  );
}
