"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { AtSign, CheckCircle2, Loader2 } from "lucide-react";

const schema = z.object({
  username: z
    .string()
    .min(3, "Must be at least 3 characters")
    .max(30, "Cannot exceed 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Only letters, numbers, and underscores allowed"
    ),
});

type FormData = z.infer<typeof schema>;

export default function SetUsernamePage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: "" },
  });

  const usernameValue = watch("username");

  const onSubmit = async (data: FormData) => {
    setIsPending(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/set-username`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(session as any)?.accessToken ?? ""}`,
          },
          body: JSON.stringify({ username: data.username }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        toast.error(json?.message || "Username is already taken");
        return;
      }

      // Update the session — clear needsUsername, store new username + fresh token
      await update({
        needsUsername: false,
        username: json.username ?? data.username,
        accessToken: json.accessToken,
      });

      toast.success("Username set! Welcome to Skarion 🎉");
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
      {/* Logo */}
      <Link href="/" className="mb-10">
        <Image
          src="/skarion.png"
          alt="Skarion Logo"
          width={64}
          height={64}
          className="w-16 h-16"
        />
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            <AtSign className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Choose a username
          </h1>
          <p className="text-sm text-muted-foreground">
            Pick a unique username to complete your account. You can&apos;t change
            it later without contacting support.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                @
              </span>
              <Input
                id="username"
                type="text"
                placeholder="yourhandle"
                className="pl-7 h-11 rounded-xl border-slate-300 focus:ring-1 focus:ring-primary/50 focus:border-primary/60"
                autoComplete="username"
                autoFocus
                {...register("username")}
              />
              {usernameValue.length >= 3 && !errors.username && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
              )}
            </div>
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              3–30 characters · letters, numbers, and underscores only
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-11 font-semibold text-base"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </div>

      <p className="mt-8 text-xs text-muted-foreground text-center">
        Signed in as{" "}
        <span className="font-medium text-slate-700">{session?.user?.email}</span>
      </p>
    </div>
  );
}
