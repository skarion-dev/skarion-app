import { SignUpForm } from "@/components/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <h1 className="text-2xl font-semibold tracking-tight text-center">
          Create an Account
        </h1>
        <SignUpForm />
      </div>
    </div>
  );
}
